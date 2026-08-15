const express = require("express");
const Order = require("../models/Order");
const PDFDocument = require("pdfkit");
const router = express.Router();

/**
 * GET /export/orders/:userId/csv
 *
 * Streams a CSV file of all orders for a user.
 * Uses Mongoose cursor + async iteration to handle 10k+ records
 * without loading everything into memory at once.
 */
router.get("/orders/:userId/csv", async (req, res) => {
  try {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="transactions-${req.params.userId}.csv"`
    );

    // Write CSV header
    res.write("Invoice ID,Date,Status,Payment Method,Payment Status,Total (Rs.)\n");

    // Stream records using cursor — memory-safe for large datasets
    const cursor = Order.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .cursor();

    for await (const order of cursor) {
      const row = [
        order.invoiceId ?? order._id.toString(),
        new Date(order.createdAt).toISOString(),
        order.status ?? "-",
        order.paymentMethod ?? "-",
        order.paymentStatus ?? "-",
        order.total ?? 0,
      ]
        .map((val) => `"${String(val).replace(/"/g, '""')}"`) // CSV-escape values
        .join(",");

      res.write(row + "\n");
    }

    res.end();
  } catch (err) {
    console.error("CSV export error:", err);
    // If headers not sent yet, send error JSON
    if (!res.headersSent) {
      res.status(500).json({ message: "CSV export failed" });
    } else {
      res.end();
    }
  }
});

/**
 * GET /export/orders/:orderId/receipt
 *
 * Generates a PDF receipt for a single order with:
 *  - Unique invoice ID
 *  - Timestamped
 *  - Itemized product list
 *  - Total amount
 */
router.get("/orders/:orderId/receipt", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate(
      "items.productId",
      "name brand"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const filename = order.invoiceId ?? order._id.toString();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}.pdf"`);

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    doc.pipe(res);

    // ── Header ──────────────────────────────────────────────────────────────
    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .text("MYNTRA", { align: "center" })
      .moveDown(0.3)
      .font("Helvetica")
      .fontSize(12)
      .fillColor("#666666")
      .text("Tax Invoice / Receipt", { align: "center" })
      .moveDown(1);

    // ── Invoice Details ──────────────────────────────────────────────────────
    doc.fillColor("#000000").fontSize(11);
    doc.text(`Invoice ID:       ${order.invoiceId ?? "N/A"}`);
    doc.text(`Order ID:         ${order._id}`);
    doc.text(`Date:             ${new Date(order.createdAt).toLocaleString("en-IN")}`);
    doc.text(`Status:           ${order.status}`);
    doc.text(`Payment Method:   ${order.paymentMethod}`);
    doc.text(`Payment Status:   ${order.paymentStatus}`);
    doc.moveDown(0.8);

    // ── Divider ──────────────────────────────────────────────────────────────
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#CCCCCC")
      .stroke()
      .moveDown(0.6);

    // ── Items ────────────────────────────────────────────────────────────────
    doc.font("Helvetica-Bold").text("Items Purchased").moveDown(0.4);
    doc.font("Helvetica");

    const items = order.items ?? [];
    items.forEach((item, idx) => {
      const name = item.productId?.name ?? "Product";
      const brand = item.productId?.brand ?? "";
      doc.text(
        `${idx + 1}. ${brand ? brand + " - " : ""}${name}  ×${item.quantity}  @  Rs.${item.price}`
      );
    });

    doc.moveDown(0.8);

    // ── Totals ───────────────────────────────────────────────────────────────
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#CCCCCC")
      .stroke()
      .moveDown(0.6);

    doc.font("Helvetica-Bold").fontSize(14).text(`Total Amount: Rs.${order.total}`, {
      align: "right",
    });

    // ── Footer ───────────────────────────────────────────────────────────────
    doc
      .moveDown(2)
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#888888")
      .text("Thank you for shopping with Myntra! For support, contact care@myntra.com", {
        align: "center",
      });

    doc.end();
  } catch (err) {
    console.error("PDF receipt error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "PDF generation failed" });
    } else {
      res.end();
    }
  }
});

module.exports = router;
