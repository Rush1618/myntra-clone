const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const axios = require("axios");

dotenv.config();

async function checkImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const products = await Product.find({});
    console.log(`Total products: ${products.length}`);
    
    let brokenCount = 0;

    for (const prod of products) {
      if (!prod.images || prod.images.length === 0) {
        console.log(`[EMPTY] Product ${prod._id} (${prod.name}) has no images.`);
      } else {
        for (const img of prod.images) {
          try {
            const res = await axios.head(img, { timeout: 5000 });
            if (res.status >= 400) {
               console.log(`[BROKEN ${res.status}] Product ${prod._id} (${prod.name}): ${img}`);
               brokenCount++;
            }
          } catch (e) {
             console.log(`[ERROR ${e.response?.status || e.code}] Product ${prod._id} (${prod.name}): ${img}`);
             brokenCount++;
          }
        }
      }
    }

    console.log(`Total broken images: ${brokenCount}`);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkImages();
