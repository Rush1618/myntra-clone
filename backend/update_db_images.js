const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");

dotenv.config();

const updates = [
  {
    name: "Formal Blue Shirt",
    newUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop"
  },
  {
    name: "Sports Activewear Shorts",
    newUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop"
  },
  {
    name: "Cotton Kurti Ethnic",
    newUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop"
  },
  {
    name: "Boys Graphic T-Shirt",
    newUrl: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=500&auto=format&fit=crop"
  },
  {
    name: "Men Leather Biker Jacket",
    newUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop"
  },
  {
    name: "Women Ethnic Anarkali Suit",
    newUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop"
  }
];

async function updateImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for update.");

    for (const update of updates) {
      const result = await Product.updateOne(
        { name: update.name },
        { $set: { "images.0": update.newUrl } }
      );
      if (result.modifiedCount > 0) {
        console.log(`Updated images for ${update.name}`);
      } else {
        console.log(`No updates made for ${update.name}`);
      }
    }

    console.log("Done updating products in DB.");
    process.exit(0);
  } catch (error) {
    console.error("Error updating DB:", error);
    process.exit(1);
  }
}

updateImages();
