const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { syncDeadlineNotificationsForUser } = require('../utils/progressUtils');

// @desc    Get notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  await syncDeadlineNotificationsForUser(req.user._id);

  const filter = { recipient: req.user._id };
  if (req.query.unreadOnly === 'true') {
    filter.isRead = false;
  }

  const [notifications, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate('sender', 'name avatarColor')
      .populate('relatedProject', 'name')
      .populate('relatedTask', 'title status')
      .sort({ createdAt: -1 })
      .limit(50),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  res.status(200).json({
    success: true,
    unreadCount,
    notifications,
  });
});

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found.');
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    success: true,
    notification,
  });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found.');
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Notification deleted',
  });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
