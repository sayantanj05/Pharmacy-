const mongoose = require('mongoose');

let lastError = null;
let connectionPromise = null;

const connectDB = async () => {
  // Skip if already connected (serverless warm starts)
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // Return existing promise if connection is in progress
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      // Hardcoded URI to bypass env var issues
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
      connectionPromise = null; // Allow retry on next request
    }
  })();

  return connectionPromise;
};

connectDB.getLastError = () => lastError;

module.exports = connectDB;