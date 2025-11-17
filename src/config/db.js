const mongoose = require('mongoose');

module.exports = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI missing in .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || 'agc_content'
    });
    console.log('MongoDB connected');
  } catch (e) {
    console.error('MongoDB error', e);
    process.exit(1);
  }
};