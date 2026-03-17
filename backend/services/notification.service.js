const Notification = require('../models/Notification');
const { NOTIFICATION_TYPES } = require('../config/constants');

/**
 * Create a new notification for a user
 */
const createNotification = async (userId, title, message, type = NOTIFICATION_TYPES.SYSTEM, relatedId = null, relatedModel = null, actionUrl = '') => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      relatedId,
      relatedModel,
      actionUrl,
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

/**
 * Get unread notification count for a user
 */
const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ user: userId, isRead: false });
};

/**
 * Mark a specific notification as read
 */
const markAsRead = async (notificationId, userId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
  return await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );
};

/**
 * Get paginated notifications for a user
 */
const getUserNotifications = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ user: userId }),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  return {
    notifications,
    total,
    unreadCount,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Delete old read notifications (cleanup utility)
 */
const cleanupOldNotifications = async (daysOld = 30) => {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  await Notification.deleteMany({
    isRead: true,
    createdAt: { $lt: cutoffDate },
  });
};

module.exports = {
  createNotification,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getUserNotifications,
  cleanupOldNotifications,
};
