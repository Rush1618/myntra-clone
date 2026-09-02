const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userrouter = require("./routes/Userroutes");
const categoryrouter = require("./routes/Categoryroutes");
const productrouter = require("./routes/Productroutes");
const Bagroutes = require("./routes/Bagroutes");
const Wishlistroutes = require("./routes/Wishlistroutes");
const OrderRoutes = require("./routes/OrderRoutes");
const RecentlyViewedRoutes = require("./routes/RecentlyViewedRoutes");
const NotificationRoutes = require("./routes/NotificationRoutes");
const ExportRoutes = require("./routes/ExportRoutes");
const RecommendationRoutes = require("./routes/RecommendationRoutes");
const cors = require('cors');
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://myntra-clone-brown-ten.vercel.app',
    'https://myntra-clone-frontend.vercel.app',
    'http://localhost:8081',
    'http://localhost:3000',
    'http://localhost:19006',
  ],
  credentials: true,
}));
// Connect to MongoDB using cached connection for serverless
let isConnected = false;
async function connectDB() {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }
  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI environment variable is not set in Vercel settings.");
    return;
  }
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  isConnected = true;
  console.log("Mongodb connected successfully");
}

// DB middleware runs BEFORE routes so every request has a connection
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("DB connection error:", err);
  }
  next();
});

app.get("/", (req, res) => {
  res.send("✅ Myntra backend in working");
});
app.use("/user", userrouter);
app.use("/category", categoryrouter);
app.use("/product", productrouter);
app.use("/bag", Bagroutes);
app.use("/wishlist", Wishlistroutes);
app.use("/Order", OrderRoutes);
app.use("/order", OrderRoutes);
app.use("/recently-viewed", RecentlyViewedRoutes);
app.use("/notifications", NotificationRoutes);
app.use("/export", ExportRoutes);
app.use("/recommendations", RecommendationRoutes);

const PORT = process.env.PORT || 5000;

// Start Background Workers only in long-running node environments
if (process.env.VERCEL !== "1") {
  require("./jobs/NotificationWorker");
  require("./jobs/CartAbandonmentWorker");
}

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

module.exports = app;
