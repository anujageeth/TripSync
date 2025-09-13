const mongoose = require('mongoose');

async function connectDB(uri = process.env.MONGODB_URI) {
  try {
    await mongoose.connect(uri);
    const { name, host } = mongoose.connection;
    console.log(`MongoDB connected: db=${name} host=${host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

module.exports = connectDB;