const mongoose = require('mongoose');
const dns = require('dns');

// Atlas IP Access List only supports IPv4 CIDR (0.0.0.0/0); prefer IPv4
// so serverless IPv6 egress doesn't get rejected.
dns.setDefaultResultOrder('ipv4first');

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
    lastError = `${error.name}: ${error.message} (code: ${error.code || 'unknown'})`;
    console.error(`Error connecting to MongoDB: ${error.message}`);
  }
};

connectDB.getLastError = () => lastError;

module.exports = connectDB;