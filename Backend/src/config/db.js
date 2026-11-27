const mongoose = require('mongoose');

let lastError = null;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb+srv://goandstudyadmin:goandstudyadmin@goandstudycluster.4jz25t7.mongodb.net/?appName=goandstudycluster';
    const dbName = process.env.MONGODB_DB_NAME || 'Pharmacy';

    const conn = await mongoose.connect(uri, {
      dbName,
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