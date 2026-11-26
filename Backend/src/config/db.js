const mongoose = require('mongoose');

let lastError = null;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      bufferTimeoutMS: 30000,
    });

    lastError = null;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    lastError = error.message;
    console.error(`Error connecting to MongoDB: ${error.message}`);
  }
};

connectDB.getLastError = () => lastError;

module.exports = connectDB;