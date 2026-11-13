const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const CartItem = require('../models/CartItem');
const Medicine = require('../models/Medicine');
const Notification = require('../models/Notification');
const { sendResponse } = require('../utils/response');

exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('Order must have at least one item');
    }

    let totalAmount = 0;
    const prepared = [];

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine || !medicine.isActive) {
        res.status(404);
        throw new Error(`Medicine ${item.medicineId} not found`);
      }
      if (medicine.stock < item.quantity) {
        res.status(400);
        throw new Error(`Insufficient stock for ${medicine.name}`);
      }
      totalAmount += medicine.price * item.quantity;
      prepared.push({ medicine, quantity: item.quantity });
    }

    const shopId = prepared[0].medicine.shopId;

    const order = await Order.create({
      customerId: req.user._id,
      shopId,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      customerName: req.user.name,
      customerPhone: req.user.phone,
    });

    await OrderItem.insertMany(
      prepared.map(({ medicine, quantity }) => ({
        orderId: order._id,
        medicineId: medicine._id,
        medicineName: medicine.name,
        quantity,
        price: medicine.price,
        total: medicine.price * quantity,
      }))
    );

    await Promise.all(
      prepared.map(async ({ medicine, quantity }) => {
        medicine.stock -= quantity;
        await medicine.save();
      })
    );

    await CartItem.deleteMany({ customerId: req.user._id });

    await Notification.create({
      userId: req.user._id,
      title: 'Order placed',
      message: `Your order #${order._id.toString().slice(-6)} has been placed successfully.`,
      type: 'order',
      relatedId: order._id,
      relatedModel: 'Order',
    });

    sendResponse(res, 201, true, 'Order created', { order });
  } catch (error) {
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customerId: req.user._id }).sort({ createdAt: -1 });
    sendResponse(res, 200, true, 'Orders fetched', { orders });
  } catch (error) {
    next(error);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customerId: req.user._id });
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    const items = await OrderItem.find({ orderId: order._id });
    sendResponse(res, 200, true, 'Order fetched', { order, items });
  } catch (error) {
    next(error);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customerId: req.user._id });
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    if (order.status === 'cancelled') {
      res.status(400);
      throw new Error('Order is already cancelled');
    }
    if (order.status === 'delivered') {
      res.status(400);
      throw new Error('Delivered orders cannot be cancelled');
    }

    const items = await OrderItem.find({ orderId: order._id });
    await Promise.all(
      items.map(async (item) => {
        const medicine = await Medicine.findById(item.medicineId);
        if (medicine) {
          medicine.stock += item.quantity;
          await medicine.save();
        }
      })
    );

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = req.body.reason || '';
    await order.save();

    sendResponse(res, 200, true, 'Order cancelled', { order });
  } catch (error) {
    next(error);
  }
};