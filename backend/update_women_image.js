const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Cat = require('./models/Category');
  await Cat.updateOne(
    { name: 'Women' },
    { $set: { image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=500&auto=format&fit=crop' } }
  );
  console.log('Updated Women image');
  process.exit(0);
});
