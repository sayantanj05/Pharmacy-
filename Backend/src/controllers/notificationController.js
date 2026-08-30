const Notification = require('../models/Notification');
const { sendResponse } = require('../utils/response');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    sendResponse(res, 200, true, 'Notifications fetched', { notifications });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }
    notification.isRead = true;
    await notification.save();
    sendResponse(res, 200, true, 'Notification marked as read', { notification });
  } catch (error) {
    next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }
    sendResponse(res, 200, true, 'Notification deleted');
  } catch (error) {
    next(error);
  }
};
