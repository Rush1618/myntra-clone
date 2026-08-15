const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("./models/Category");
const Product = require("./models/Product");

dotenv.config();

const categories = [
  {
    name: "Men",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500&auto=format&fit=crop",
    subcategory: ["T-Shirts", "Shirts", "Jeans", "Trousers", "Suits", "Activewear"]
  },
  {
    name: "Women",
    image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=500&auto=format&fit=crop",
    subcategory: ["Dresses", "Tops", "Ethnic Wear", "Western Wear", "Activewear"]
  },
  {
    name: "Kids",
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500&auto=format&fit=crop",
    subcategory: ["Boys Clothing", "Girls Clothing", "Infants", "Toys", "School Essentials"]
  },
  {
    name: "Beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop",
    subcategory: ["Makeup", "Skincare", "Haircare", "Fragrances", "Personal Care"]
  },
  {
    name: "Accessories",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop",
    subcategory: ["Watches", "Bags", "Jewellery", "Sunglasses", "Belts"]
  }
];

const products = [
  // MEN
  { name: "Casual White T-Shirt", brand: "Roadster", price: 499, discount: 60, images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop"], categoryName: "Men", description: "A comfortable and stylish casual white t-shirt for everyday wear.", rating: 4.2 },
  { name: "Denim Jacket", brand: "Levis", price: 2499, discount: 45, images: ["https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500&auto=format&fit=crop"], categoryName: "Men", description: "Classic blue denim jacket with a comfortable fit.", rating: 4.5 },
  { name: "Formal Blue Shirt", brand: "Peter England", price: 899, discount: 20, images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop"], categoryName: "Men", description: "Perfect formal shirt for office wear.", rating: 4.1 },
  { name: "Slim Fit Black Jeans", brand: "Wrangler", price: 1599, discount: 50, images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop"], categoryName: "Men", description: "Stretchable slim fit black jeans.", rating: 4.3 },
  { name: "Sports Activewear Shorts", brand: "Puma", price: 499, discount: 65, images: ["https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop"], categoryName: "Men", description: "Breathable shorts for workout.", rating: 4.6 },
  
  // WOMEN
  { name: "Summer Floral Dress", brand: "ONLY", price: 1299, discount: 50, images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop"], categoryName: "Women", description: "Light and breezy floral dress perfect for summer.", rating: 4.7 },
  { name: "Cotton Kurti Ethnic", brand: "Biba", price: 999, discount: 40, images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop"], categoryName: "Women", description: "Elegant cotton kurti for daily ethnic wear.", rating: 4.4 },
  { name: "Crop Top Western Wear", brand: "H&M", price: 499, discount: 20, images: ["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop"], categoryName: "Women", description: "Stylish western crop top.", rating: 4.5 },
  { name: "Women Activewear Leggings", brand: "Nike", price: 1899, discount: 30, images: ["https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&auto=format&fit=crop"], categoryName: "Women", description: "Stretchable yoga and activewear leggings.", rating: 4.8 },

  // KIDS
  { name: "Boys Graphic T-Shirt", brand: "Gini & Jony", price: 399, discount: 25, images: ["https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=500&auto=format&fit=crop"], categoryName: "Kids", description: "Bright and colorful t-shirt for kids.", rating: 4.1 },
  { name: "Girls Pink Frock", brand: "Mothercare", price: 899, discount: 45, images: ["https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500&auto=format&fit=crop"], categoryName: "Kids", description: "Cute pink party dress for girls.", rating: 4.6 },
  { name: "Infant Romper", brand: "Carter's", price: 499, discount: 15, images: ["https://images.unsplash.com/photo-1522771930-78848d9293e8?w=500&auto=format&fit=crop"], categoryName: "Kids", description: "Soft cotton baby romper.", rating: 4.9 },
  
  // BEAUTY
  { name: "Matte Lipstick Ruby", brand: "MAC", price: 1500, discount: 10, images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&auto=format&fit=crop"], categoryName: "Beauty", description: "Long-lasting matte lipstick in ruby red.", rating: 4.6 },
  { name: "Hydrating Skincare Lotion", brand: "Cetaphil", price: 599, discount: 5, images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop"], categoryName: "Beauty", description: "Dermatologist recommended daily moisturizer.", rating: 4.8 },
  { name: "Luxury Fragrance Perfume", brand: "Chanel", price: 5499, discount: 15, images: ["https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&auto=format&fit=crop"], categoryName: "Beauty", description: "Signature eau de parfum.", rating: 4.9 },

  // ACCESSORIES
  { name: "Classic Men's Watch", brand: "Fossil", price: 4999, discount: 40, images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&auto=format&fit=crop"], categoryName: "Accessories", description: "Elegant leather strap analog watch.", rating: 4.7 },
  { name: "Aviator Sunglasses", brand: "Ray-Ban", price: 3499, discount: 20, images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop"], categoryName: "Accessories", description: "Classic aviator style sunglasses.", rating: 4.5 },
  { name: "Leather Sling Bag", brand: "Caprese", price: 1299, discount: 60, images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&auto=format&fit=crop"], categoryName: "Accessories", description: "Stylish women's sling bag.", rating: 4.3 },
  { name: "Basic Black Belt", brand: "Tommy Hilfiger", price: 599, discount: 50, images: ["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=500&auto=format&fit=crop"], categoryName: "Accessories", description: "Genuine leather belt.", rating: 4.2 },

  // MORE MEN
  { name: "Men Slim Fit Chinos", brand: "Highlander", price: 899, discount: 45, images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&auto=format&fit=crop"], categoryName: "Men", description: "Comfortable slim fit chino trousers for casual or formal wear.", rating: 4.4 },
  { name: "Men Leather Biker Jacket", brand: "US Polo Assn", price: 3999, discount: 30, images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop"], categoryName: "Men", description: "Premium genuine leather biker jacket.", rating: 4.8 },

  // MORE WOMEN
  { name: "Women Ethnic Anarkali Suit", brand: "W", price: 2499, discount: 40, images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop"], categoryName: "Women", description: "Beautiful Anarkali suit set for festive occasions.", rating: 4.6 },
  { name: "Women Formal Trousers", brand: "Allen Solly", price: 1199, discount: 25, images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&auto=format&fit=crop"], categoryName: "Women", description: "Classic formal trousers for office.", rating: 4.3 },

  // MORE KIDS
  { name: "Kids Denim Dungarees", brand: "Lilliput", price: 799, discount: 30, images: ["https://images.unsplash.com/photo-1621452773781-0f992fd1f5cb?w=500&auto=format&fit=crop"], categoryName: "Kids", description: "Cute and sturdy denim dungarees for kids.", rating: 4.5 },
  { name: "Kids Winter Hoodie", brand: "United Colors of Benetton", price: 1099, discount: 20, images: ["https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&auto=format&fit=crop"], categoryName: "Kids", description: "Warm and cozy hoodie for the winter season.", rating: 4.7 },

  // MORE BEAUTY
  { name: "Vitamin C Face Serum", brand: "Plum", price: 450, discount: 15, images: ["https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=500&auto=format&fit=crop"], categoryName: "Beauty", description: "Brightening Vitamin C face serum for glowing skin.", rating: 4.4 },
  { name: "Volumizing Mascara", brand: "Maybelline", price: 350, discount: 10, images: ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop"], categoryName: "Beauty", description: "Waterproof volumizing mascara for thicker lashes.", rating: 4.5 },

  // MORE ACCESSORIES
  { name: "Women Rose Gold Watch", brand: "Titan Raga", price: 3599, discount: 20, images: ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&auto=format&fit=crop"], categoryName: "Accessories", description: "Elegant rose gold watch for women.", rating: 4.8 },
  { name: "Men Stylish Backpack", brand: "Wildcraft", price: 1499, discount: 40, images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop"], categoryName: "Accessories", description: "Durable and spacious backpack for travel or college.", rating: 4.6 }
];

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("Cleared old demo data.");

    const createdCategories = await Category.insertMany(categories);
    console.log(`Inserted ${createdCategories.length} categories.`);

    // Map category names to their new object IDs
    const categoryMap = {};
    const categoryDocs = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
      categoryDocs[cat.name] = cat;
    });

    // Insert products with valid category references
    const productsToInsert = products.map((p) => ({
      ...p,
      category: categoryMap[p.categoryName],
    }));

    const createdProducts = await Product.insertMany(productsToInsert);
    console.log(`Inserted ${createdProducts.length} products.`);

    // Link products to categories
    for (let i = 0; i < createdProducts.length; i++) {
      const prod = createdProducts[i];
      const categoryId = productsToInsert[i].category;
      if (categoryId) {
         await Category.findByIdAndUpdate(categoryId, { $push: { productId: prod._id } });
      }
    }
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seedData();
