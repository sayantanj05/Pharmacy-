const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const CartItem = require('../models/CartItem');
const Medicine = require('../models/Medicine');
const Notification = require('../models/Notification');
const { sendResponse } = require('../utils/response');

const buildNotification = (userId, order) => ({
  userId,
  title: 'Order placed',
  message: `Your order #${order._id.toString().slice(-6)} has been placed successfully.`,
  type: 'order',
  relatedId: order._id,
  relatedModel: 'Order',
});

exports.createOrder = async (req, res, next) => {
  try {
    const { items, useCart, shippingAddress, paymentMethod } = req.body;

    let sourceItems = items;
    if (useCart) {
      const cartItems = await CartItem.find({ customerId: req.user._id });
      if (cartItems.length === 0) {
        res.status(400);
        throw new Error('Cart is empty');
      }
      sourceItems = cartItems.map((item) => ({
        cartItemId: item._id,
        medicineId: item.medicineId,
        quantity: item.quantity,
      }));
    }

    if (!sourceItems || sourceItems.length === 0) {
      res.status(400);
      throw new Error('Order must have at least one item');
    }

    const groups = new Map();
    const unavailable = [];

    const rejectItem = (item, details) =>
      unavailable.push({ cartItemId: item.cartItemId, medicineId: item.medicineId, ...details });

    for (const item of sourceItems) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        rejectItem(item, {
          reason: 'invalid-quantity',
          requested: item.quantity,
          message: 'Quantity must be a whole number of at least 1',
        });
        continue;
      }

      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine || !medicine.isActive) {
        rejectItem(item, {
          reason: 'unavailable',
          message: 'This medicine is no longer available',
        });
        continue;
      }
      if (!medicine.shopId) {
        rejectItem(item, {
          name: medicine.name,
          reason: 'no-shop',
          message: `${medicine.name} is not assigned to a shop`,
        });
        continue;
      }
      if (medicine.stock < quantity) {
        rejectItem(item, {
          name: medicine.name,
          reason: 'insufficient-stock',
          requested: quantity,
          available: medicine.stock,
          message:
            medicine.stock === 0
              ? `${medicine.name} is out of stock`
              : `Only ${medicine.stock} of ${medicine.name} left in stock`,
        });
        continue;
      }

      const key = medicine.shopId.toString();
      if (!groups.has(key)) {
        groups.set(key, { shopId: medicine.shopId, entries: [] });
      }
      groups.get(key).entries.push({ medicine, quantity });
    }

    if (unavailable.length > 0) {
      res.status(400);
      throw Object.assign(
        new Error(
          unavailable.length === 1
            ? unavailable[0].message
            : `Could not place the order for ${unavailable.length} item(s): ${unavailable
                .map((u) => u.message)
                .join('; ')}`
        ),
        { details: { unavailable } }
      );
    }

    const orders = [];

    for (const group of groups.values()) {
      const totalAmount = group.entries.reduce(
        (sum, entry) => sum + entry.medicine.price * entry.quantity,
        0
      );

      const order = await Order.create({
        customerId: req.user._id,
        shopId: group.shopId,
        totalAmount,
        shippingAddress,
        paymentMethod: paymentMethod || 'cod',
        customerName: req.user.name,
        customerPhone: req.user.phone,
      });

      await OrderItem.insertMany(
        group.entries.map(({ medicine, quantity }) => ({
          orderId: order._id,
          medicineId: medicine._id,
          medicineName: medicine.name,
          quantity,
          price: medicine.price,
          total: medicine.price * quantity,
        }))
      );

      await Promise.all(
        group.entries.map(async ({ medicine, quantity }) => {
          medicine.stock -= quantity;
          await medicine.save();
        })
      );

      await Notification.create(buildNotification(req.user._id, order));
      orders.push(order);
    }

    if (useCart) {
      await CartItem.deleteMany({ customerId: req.user._id });
    }

    sendResponse(
      res,
      201,
      true,
      orders.length > 1 ? `${orders.length} orders created` : 'Order created',
      { orders, order: orders[0], count: orders.length }
    );
  } catch (error) {
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customerId: req.user._id })
      .populate('shopId', 'name address phone')
      .sort({ createdAt: -1 });

    const withItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ orderId: order._id });
        return { ...order.toObject(), items };
      })
    );

    sendResponse(res, 200, true, 'Orders fetched', { orders: withItems });
  } catch (error) {
    next(error);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customerId: req.user._id }).populate(
      'shopId',
      'name address phone'
    );
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