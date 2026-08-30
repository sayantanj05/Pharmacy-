const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendResponse } = require('../utils/response');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const user = await User.create({ name, email, password, phone, role: 'customer' });
    const token = generateToken(user._id);
    sendResponse(res, 201, true, 'User registered successfully', { user: { _id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      sendResponse(res, 200, true, 'Login successful', { user: { _id: user._id, name: user.name, email: user.email, role: user.role, shopId: user.shopId }, token });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    sendResponse(res, 200, true, 'Profile fetched', { user: req.user });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true }).select('-password');
    sendResponse(res, 200, true, 'Profile updated', { user });
  } catch (error) {
    next(error);
  }
};
