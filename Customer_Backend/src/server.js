require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const alternativeRoutes = require('./routes/alternativeRoutes');

const app = express();
connectDB();

const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
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
}));
app.use(express.json());

app.get('/', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    message: 'Pharmacy Customer API',
    Database: states[mongoose.connection.readyState] === 'connected' ? 'Connected' : states[mongoose.connection.readyState] || 'disconnected',
  });
});

const mongoose = require('mongoose');

app.get('/api/health', async (req, res) => {
  await connectDB(); // Ensure connection attempt completes
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    success: true,
    message: 'Customer API healthy',
    mongoState: states[mongoose.connection.readyState] || mongoose.connection.readyState,
    mongoHost: mongoose.connection.host || null,
    mongoUriSet: Boolean(process.env.MONGODB_URI),
    mongoDbName: process.env.MONGODB_DB_NAME || null,
    mongoUriHost: (process.env.MONGODB_URI || '').replace(/^mongodb(\+srv)?:\/\/[^@]*@/, '').split('/')[0] || null,
    mongoError: connectDB.getLastError ? connectDB.getLastError() : null,
    nodeEnv: process.env.NODE_ENV || null,
    envNames: Object.keys(process.env).filter((k) => /MONGO|JWT|CLIENT|VERCEL/i.test(k)),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/alternatives', alternativeRoutes);

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Customer API running on http://localhost:${PORT} (${process.env.NODE_ENV} mode)`);
});