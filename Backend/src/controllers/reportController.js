const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { sendResponse } = require('../utils/response');

exports.getFinancialReport = async (req, res, next) => {
  try {
    let filter = { paymentStatus: 'paid' };
    if (req.user.role === 'shop_owner') {
      filter.shopId = req.user.shopId;
    } else if (req.user.role === 'super_admin') {
      const { shopId } = req.query;
      if (shopId) filter.shopId = shopId;
    }
    const { startDate, endDate } = req.query;
    if (startDate) filter.createdAt = { $gte: new Date(startDate) };
    if (endDate) filter.createdAt = { ...filter.createdAt, $lte: new Date(endDate) };
    const orders = await Order.find(filter);
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    res.status(200).json({ totalRevenue, orders });
  } catch (error) {
    next(error);
  }
};

exports.getFinancialPDF = async (req, res, next) => {
  try {
    let filter = { paymentStatus: 'paid' };
    if (req.user.role === 'shop_owner') {
      filter.shopId = req.user.shopId;
    } else if (req.user.role === 'super_admin') {
      const { shopId } = req.query;
      if (shopId) filter.shopId = shopId;
    }
    const { startDate, endDate } = req.query;
    if (startDate) filter.createdAt = { $gte: new Date(startDate) };
    if (endDate) filter.createdAt = { ...filter.createdAt, $lte: new Date(endDate) };
    const orders = await Order.find(filter);
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=financial-report.pdf');
    res.send(Buffer.from(`Financial Report\nTotal Revenue: ${totalRevenue}\nOrders Count: ${orders.length}`));
  } catch (error) {
    next(error);
  }
};
