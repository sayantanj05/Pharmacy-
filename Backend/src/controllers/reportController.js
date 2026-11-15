const Order = require('../models/Order');
const { sendResponse } = require('../utils/response');
const { resolveShopFilter } = require('../utils/shopScope');

const buildFilter = async (req, baseFilter) => {
  const filter = { ...baseFilter };

  if (req.user.role === 'shop_owner') {
    if (!req.shopId) return null;
    filter.shopId = req.shopId;
  } else if (req.user.role === 'super_admin') {
    const requested = req.query.shopId || req.shopFilter;
    if (requested) filter.shopId = await resolveShopFilter(requested);
  }

  const { startDate, endDate } = req.query;
  if (startDate) filter.createdAt = { ...(filter.createdAt || {}), $gte: new Date(startDate) };
  if (endDate) filter.createdAt = { ...(filter.createdAt || {}), $lte: new Date(endDate) };

  return filter;
};

exports.getFinancialReport = async (req, res, next) => {
  try {
    const filter = await buildFilter(req, { paymentStatus: 'paid' });
    if (!filter) {
      res.status(200).json({ totalRevenue: 0, orders: [] });
      return;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    res.status(200).json({ totalRevenue, orders });
  } catch (error) {
    next(error);
  }
};

exports.getFinancialPDF = async (req, res, next) => {
  try {
    const filter = await buildFilter(req, { paymentStatus: 'paid' });
    const orders = filter ? await Order.find(filter) : [];
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=financial-report.pdf');
    res.send(Buffer.from(`Financial Report\nTotal Revenue: ${totalRevenue}\nOrders Count: ${orders.length}`));
  } catch (error) {
    next(error);
  }
};