const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const shopRoutes = require('./routes/shopRoutes');
const userRoutes = require('./routes/userRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const supplyRoutes = require('./routes/supplyRoutes');
const expiryRoutes = require('./routes/expiryRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const systemRoutes = require('./routes/systemRoutes');
const alternativeRoutes = require('./routes/alternativeRoutes');
const procurementRoutes = require('./routes/procurementRoutes');

const app = express();
connectDB();

const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      }
    : '*',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
  const mongoose = require('mongoose');
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    message: 'Pharmacy Stock & Expiry Tracker API',
    Database: states[mongoose.connection.readyState] === 'connected' ? 'Connected' : states[mongoose.connection.readyState] || 'disconnected',
    mongoUriSet: Boolean(process.env.MONGODB_URI),
    mongoDbName: process.env.MONGODB_DB_NAME || null,
    mongoUriHost: (process.env.MONGODB_URI || '').replace(/^mongodb(\+srv)?:\/\/[^@]*@/, '').split('/')[0] || null,
    mongoError: connectDB.getLastError ? connectDB.getLastError() : null,
  });
});

app.get('/test-direct-connect', async (req, res) => {
  const mongoose = require('mongoose');
  const directUri = 'mongodb+srv://goandstudyadmin:goandstudyadmin@goandstudycluster.4jz25t7.mongodb.net/Pharmacy?appName=goandstudycluster';
  try {
    const conn = await mongoose.createConnection(directUri, {
      serverSelectionTimeoutMS: 10000,
    }).asPromise();
    await conn.close();
    res.json({ success: true, message: 'Direct connection test passed' });
  } catch (error) {
    res.json({ success: false, message: 'Direct connection test failed', error: error.message, code: error.code, name: error.name });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/supplies', supplyRoutes);
app.use('/api/expiry-logs', expiryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/alternatives', alternativeRoutes);
app.use('/api/procurement', procurementRoutes);

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT} - ${process.env.NODE_ENV} mode`);
});
