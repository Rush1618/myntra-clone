const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  await User.updateMany({}, { $set: { recentlyViewed: [] } });
  console.log('Cleaned recently viewed arrays');
  process.exit(0);
}

fix().catch(err => {
  console.error(err);
  process.exit(1);
});
