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

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : '*',
  credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Pharmacy Customer API' });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Customer API healthy' });
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