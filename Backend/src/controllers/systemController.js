const User = require('../models/User');
const Shop = require('../models/Shop');
const Order = require('../models/Order');
const { sendResponse } = require('../utils/response');

exports.getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalShops = await Shop.countDocuments();
    const totalOrders = await Order.countDocuments();
    sendResponse(res, 200, true, 'Analytics fetched', { totalUsers, totalShops, totalOrders });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    sendResponse(res, 200, true, 'Settings updated', { settings: req.body });
  } catch (error) {
    next(error);
  }
};
