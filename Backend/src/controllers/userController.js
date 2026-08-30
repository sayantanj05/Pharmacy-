const User = require('../models/User');
const { sendResponse } = require('../utils/response');

exports.createUser = async (req, res, next) => {
  try {
    console.log('Creating user with data:', req.body);
    const user = await User.create(req.body);
    console.log('User created successfully:', user);
    sendResponse(res, 201, true, 'User created', { user: { _id: user._id, name: user.name, email: user.email, role: user.role, shopId: user.shopId } });
  } catch (error) {
    console.error('Error creating user:', error);
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    console.log('Fetching all users...');
    const users = await User.find({});
    console.log('Users found:', users.length, users);
    sendResponse(res, 200, true, 'Users fetched', { users });
  } catch (error) {
    console.error('Error fetching users:', error);
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    sendResponse(res, 200, true, 'User fetched', { user });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    sendResponse(res, 200, true, 'User updated', { user });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    sendResponse(res, 200, true, 'User deleted');
  } catch (error) {
    next(error);
  }
};
