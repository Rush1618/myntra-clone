const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    discount: mongoose.Schema.Types.Mixed,
    description: String,
    sizes: [String],
    images: [String],
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", index: true },
    categoryName: { type: String, index: true },
    rating: { type: Number, default: 4.0, index: true },
    viewCount: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

// Compound index for fast recommendation queries
ProductSchema.index({ category: 1, rating: -1 });
ProductSchema.index({ categoryName: 1, rating: -1 });
ProductSchema.index({ viewCount: -1, discount: -1 });

module.exports = mongoose.model("Product", ProductSchema);
