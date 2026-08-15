const axios = require("axios");

const replacements = [
  "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop", // Formal Blue Shirt
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop", // Sports Activewear Shorts
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop", // Cotton Kurti Ethnic
  "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=500&auto=format&fit=crop", // Boys Graphic T-Shirt
  "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop", // Men Leather Biker Jacket
  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop", // Women Ethnic Anarkali Suit
];

async function checkReplacements() {
  for (const img of replacements) {
    try {
      const res = await axios.head(img, { timeout: 5000 });
      console.log(`[OK] ${img}`);
    } catch (e) {
      console.log(`[ERROR ${e.response?.status || e.code}] ${img}`);
    }
  }
}

checkReplacements();
