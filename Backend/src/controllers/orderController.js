const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const CartItem = require('../models/CartItem');
const Medicine = require('../models/Medicine');
const { sendResponse } = require('../utils/response');

exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('Order must have at least one item');
    }
    let totalAmount = 0;
    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine) {
        res.status(404);
        throw new Error(`Medicine ${item.medicineId} not found`);
      }
      totalAmount += medicine.price * item.quantity;
    }
    const order = await Order.create({
      customerId: req.user._id,
      shopId: items[0].shopId || req.user.shopId,
      totalAmount,
      shippingAddress,
      paymentMethod,
      customerName: req.user.name,
      customerPhone: req.user.phone,
    });
    const orderItems = await Promise.all(
      items.map(async (item) => {
        const medicine = await Medicine.findById(item.medicineId);
        return {
          orderId: order._id,
          medicineId: item.medicineId,
          medicineName: medicine ? medicine.name : item.medicineName,
          quantity: item.quantity,
          price: medicine ? medicine.price : 0,
          total: (medicine ? medicine.price : 0) * item.quantity,
        };
      })
    );
    await OrderItem.insertMany(orderItems);
    await CartItem.deleteMany({ userId: req.user._id });
    sendResponse(res, 201, true, 'Order created', { order });
  } catch (error) {
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    let orders;
    if (req.user.role === 'customer') {
      orders = await Order.find({ customerId: req.user._id });
    } else if (req.user.role === 'shop_owner') {
      orders = await Order.find({ shopId: req.user.shopId });
    } else {
      orders = await Order.find({});
    }
    sendResponse(res, 200, true, 'Orders fetched', { orders });
  } catch (error) {
    next(error);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    if (req.user.role === 'customer' && order.customerId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }
    if (req.user.role === 'shop_owner' && order.shopId.toString() !== req.user.shopId.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }
    sendResponse(res, 200, true, 'Order fetched', { order });
  } catch (error) {
    next(error);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    if (req.user.role === 'customer' && order.customerId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }
    if (req.user.role === 'shop_owner' && order.shopId.toString() !== req.user.shopId.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = req.body.reason || '';
    await order.save();
    sendResponse(res, 200, true, 'Order cancelled');
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      res.status(400);
      throw new Error('Status is required');
    }
    let filter = { _id: req.params.id };
    if (req.user.role === 'shop_owner') {
      filter.shopId = req.user.shopId;
    } else if (req.user.role === 'customer') {
      filter.customerId = req.user._id;
    }
    const order = await Order.findOneAndUpdate(filter, { status }, { new: true });
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    sendResponse(res, 200, true, 'Order status updated', { order });
  } catch (error) {
    next(error);
  }
};
