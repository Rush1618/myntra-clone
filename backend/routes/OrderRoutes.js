const express = require("express");
const Bag = require("../models/Bag");
const Order = require("../models/Order");
const AuditLog = require("../models/AuditLog");
const NotificationJob = require("../models/NotificationJob");
const crypto = require("crypto");
const { format } = require("fast-csv");
const PDFDocument = require("pdfkit");
const router = express.Router();

function genrateRandomTracking() {
  const carriers = ["Delhivery", "Bluedart", "Ecom Express", "XpressBees"];
  const statusOptions = [
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "In Transit",
  ];
  const locations = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune"];
  const randomcarrier = carriers[Math.floor(Math.random() * carriers.length)];
  const randomstatusOptions =
    statusOptions[Math.floor(Math.random() * statusOptions.length)];
  const randomlocations =
    locations[Math.floor(Math.random() * locations.length)];

  return {
    number: "TRK" + Math.floor(Math.random() * 10000000),
    carrier: randomcarrier,
    estimatedDelivery: new Date(
      Date.now() + 5 * 24 * 60 * 60 * 1000
    ).toISOString(),
    currentLocation: randomlocations,
    status: randomstatusOptions,
    timeline: [
      {
        status: "Order placed",
        location: "Warehouse",
        timestamp: new Date().toISOString(),
      },
      {
        status: randomstatusOptions,
        location: randomlocations,
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

/**
 * POST /Order/create/:userId
 * Creates a new order from the user's bag.
 * Idempotency: pass X-Idempotency-Key header to prevent duplicate orders (e.g., from double-tap).
 */
router.post("/create/:userId", async (req, res) => {
  try {
    const userid = req.params.userId;
    const bag = await Bag.find({ userId: userid, savedForLater: false }).populate("productId");

    if (bag.length === 0) {
      return res.status(400).json({ message: "No item in the bag" });
    }

    // Idempotency guard — prevents duplicate orders from network retries
    const idempotencyKey = req.headers["x-idempotency-key"] || crypto.randomUUID();
    const existingOrder = await Order.findOne({ idempotencyKey });
    if (existingOrder) {
      return res.status(200).json({ message: "Order already placed", orderId: existingOrder._id });
    }

    const orderitem = bag.map((item) => ({
      productId: item.productId._id,
      size: item.size,
      price: item.productId.price,
      quantity: item.quantity,
    }));

    const total = orderitem.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const newOrder = new Order({
      userId: userid,
      date: new Date().toISOString(),
      status: "Processing",
      items: orderitem,
      total: total,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      tracking: genrateRandomTracking(),
      idempotencyKey,
      invoiceId: "INV-" + Date.now() + "-" + Math.floor(Math.random() * 9999),
      paymentStatus: "paid",
    });

    await newOrder.save();
    await Bag.deleteMany({ userId: userid, savedForLater: false });

    // Audit log — append-only event record
    await AuditLog.create({
      entityType: "Order",
      entityId: newOrder._id,
      event: "created",
      metadata: {
        total: newOrder.total,
        itemCount: orderitem.length,
        paymentMethod: req.body.paymentMethod,
        invoiceId: newOrder.invoiceId,
      },
      performedBy: userid.toString(),
    });

    // Fire push notification asynchronously via job queue
    try {
      await NotificationJob.create({
        userId: userid,
        title: "Order Placed! 🎉",
        body: `Your order of Rs.${total.toFixed(2)} is being processed.`,
        data: { orderId: newOrder._id.toString(), screen: "orders" },
      });
    } catch (pushErr) {
      console.error("Failed to enqueue push notification:", pushErr.message);
    }

    res.status(200).json({ message: "Order placed successfully", orderId: newOrder._id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * GET /Order/user/:userid
 * Paginated, filterable, sortable order history.
 *
 * Query params:
 *   page       (default: 1)
 *   limit      (default: 20, max enforced by client)
 *   status     filter by order status string
 *   paymentMethod filter by payment method
 *   sortBy     field to sort by (default: createdAt)
 *   order      "asc" | "desc" (default: desc)
 */
router.get("/user/:userid", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentMethod,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const query = { userId: req.params.userid };
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    // Single round-trip: fetch page + total count in parallel
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit))
        .populate("items.productId", "name images brand"),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * GET /Order/export/csv/:userid
 * Streaming CSV export of all user transactions to prevent memory overload.
 */
router.get("/export/csv/:userid", async (req, res) => {
  try {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=transactions-${Date.now()}.csv`);

    const csvStream = format({ headers: true });
    csvStream.pipe(res);

    // Mongoose cursor allows streaming data instead of loading everything into memory
    const cursor = Order.find({ userId: req.params.userid })
      .sort({ createdAt: -1 })
      .populate("items.productId", "name brand")
      .cursor();

    cursor.on("data", (order) => {
      // Format each order
      const row = {
        InvoiceId: order.invoiceId,
        Date: new Date(order.date).toLocaleDateString(),
        Total: order.total,
        PaymentMethod: order.paymentMethod,
        PaymentStatus: order.paymentStatus,
        Status: order.status,
        TrackingNumber: order.tracking?.number || "",
        ItemsCount: order.items?.length || 0,
      };
      csvStream.write(row);
    });

    cursor.on("end", () => {
      csvStream.end();
    });

    cursor.on("error", (err) => {
      console.error("CSV Stream error:", err);
      res.status(500).end();
    });

  } catch (err) {
    console.error("Export error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to export CSV" });
    }
  }
});

/**
 * GET /Order/receipt/:orderId
 * Generates a secure PDF receipt.
 */
router.get("/receipt/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("items.productId", "name brand price");
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=receipt-${order.invoiceId}.pdf`);
    
    doc.pipe(res);
    
    // Header
    doc.fontSize(20).text("Transaction Receipt", { align: "center" });
    doc.moveDown();
    
    // Order Info
    doc.fontSize(12).text(`Invoice ID: ${order.invoiceId}`);
    doc.text(`Date: ${new Date(order.date).toLocaleString()}`);
    doc.text(`Payment Method: ${order.paymentMethod}`);
    doc.text(`Status: ${order.paymentStatus.toUpperCase()}`);
    doc.moveDown();
    
    // Items
    doc.fontSize(14).text("Items:");
    doc.moveDown(0.5);
    order.items.forEach((item) => {
      const name = item.productId?.name || "Unknown Item";
      doc.fontSize(12).text(`${name} (Qty: ${item.quantity}) - Rs. ${item.price}`);
    });
    
    doc.moveDown();
    doc.fontSize(16).text(`Total Amount: Rs. ${order.total}`, { align: "right" });
    
    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text("Thank you for shopping with us!", { align: "center" });
    
    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate receipt" });
    }
  }
});

module.exports = router;