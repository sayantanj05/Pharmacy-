const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const CartItem = require('../models/CartItem');
const Medicine = require('../models/Medicine');
const { sendResponse } = require('../utils/response');

const sameId = (a, b) => String(a) === String(b);

const canAccessOrder = (req, order) => {
  if (req.user.role === 'super_admin') return true;
  if (req.user.role === 'customer') return sameId(order.customerId, req.user._id);
  if (req.user.role === 'shop_owner') return req.shopId && sameId(order.shopId, req.shopId);
  return false;
};

exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('Order must have at least one item');
    }

    // A shop owner ordering for their own shop must never be able to target another shop.
    let shopId = items[0].shopId || (req.user.shopId || '');
    if (req.user.role === 'shop_owner') {
      if (!req.shopId) {
        res.status(400);
        throw new Error('Your account is not linked to a valid shop');
      }
      shopId = req.shopId;
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
      shopId,
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
    let filter = {};
    if (req.user.role === 'customer') {
      filter.customerId = req.user._id;
    } else if (req.user.role === 'shop_owner') {
      if (!req.shopId) {
        sendResponse(res, 200, true, 'Orders fetched', { orders: [] });
        return;
      }
      filter.shopId = req.shopId;
    } else if (req.user.role === 'super_admin' && req.shopFilter) {
      filter.shopId = req.shopFilter;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
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
    if (!canAccessOrder(req, order)) {
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
    if (!canAccessOrder(req, order)) {
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
    const filter = { _id: req.params.id };
    if (req.user.role === 'shop_owner') {
      if (!req.shopId) {
        res.status(400);
        throw new Error('Your account is not linked to a valid shop');
      }
      filter.shopId = req.shopId;
    } else if (req.user.role === 'customer') {
      filter.customerId = req.user._id;
    } else if (req.user.role === 'super_admin' && req.shopFilter) {
      filter.shopId = req.shopFilter;
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