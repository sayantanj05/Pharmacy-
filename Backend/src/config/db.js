const mongoose = require('mongoose');

let lastError = null;

const connectDB = async () => {
  try {
    // Temporarily hardcoded to bypass env var issues - direct test passed
    const uri = 'mongodb+srv://goandstudyadmin:goandstudyadmin@goandstudycluster.4jz25t7.mongodb.net/Pharmacy?appName=goandstudycluster';

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      bufferTimeoutMS: 30000,
    });

    lastError = null;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    lastError = `${error.name}: ${error.message} (code: ${error.code || 'unknown'})`;
    console.error(`Error connecting to MongoDB: ${error.message}`);
  }
};

connectDB.getLastError = () => lastError;

module.exports = connectDB;