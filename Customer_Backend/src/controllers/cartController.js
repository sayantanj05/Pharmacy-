const CartItem = require('../models/CartItem');
const { sendResponse } = require('../utils/response');

exports.getCart = async (req, res, next) => {
  try {
    const cartItems = await CartItem.find({ customerId: req.user._id }).populate('medicineId');
    sendResponse(res, 200, true, 'Cart fetched', { cartItems });
  } catch (error) {
    next(error);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { medicineId, quantity } = req.body;
    const qty = quantity || 1;
    const existing = await CartItem.findOne({ customerId: req.user._id, medicineId });
    if (existing) {
      existing.quantity += qty;
      await existing.save();
      const cartItem = await existing.populate('medicineId');
      sendResponse(res, 200, true, 'Cart updated', { cartItem });
    } else {
      const cartItem = await CartItem.create({ customerId: req.user._id, medicineId, quantity: qty });
      await cartItem.populate('medicineId');
      sendResponse(res, 201, true, 'Added to cart', { cartItem });
    }
  } catch (error) {
    next(error);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cartItem = await CartItem.findOneAndUpdate(
      { _id: req.params.id, customerId: req.user._id },
      { quantity },
      { new: true, runValidators: true }
    );
    if (!cartItem) {
      res.status(404);
      throw new Error('Cart item not found');
    }
    sendResponse(res, 200, true, 'Cart updated', { cartItem });
  } catch (error) {
    next(error);
  }
};

exports.deleteCartItem = async (req, res, next) => {
  try {
    const cartItem = await CartItem.findOneAndDelete({ _id: req.params.id, customerId: req.user._id });
    if (!cartItem) {
      res.status(404);
      throw new Error('Cart item not found');
    }
    sendResponse(res, 200, true, 'Cart item removed');
  } catch (error) {
    next(error);
  }
};