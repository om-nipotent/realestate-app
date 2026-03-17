const User = require('../models/User');
const Property = require('../models/Property');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { getUserNotifications, markAsRead, markAllAsRead } = require('../services/notification.service');

// @desc    Get current user profile
// @route   GET /api/v1/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('viewedProperties', 'title price images location.city propertyType status')
      .lean();

    return successResponse(res, 200, 'Profile fetched.', user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    if (req.file) {
      updateData.avatar = {
        url: `/uploads/avatars/${req.file.filename}`,
        publicId: req.file.filename,
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true, select: '-password' }
    );

    return successResponse(res, 200, 'Profile updated successfully.', user);
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete account
// @route   DELETE /api/v1/users/account
// @access  Private
const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { isActive: false });

    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    return successResponse(res, 200, 'Account deactivated. Contact support to reactivate.');
  } catch (error) {
    next(error);
  }
};

// @desc    Get user notifications
// @route   GET /api/v1/users/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const result = await getUserNotifications(req.user.id, page, limit);

    return successResponse(res, 200, 'Notifications fetched.', result);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/v1/users/notifications/:id/read
// @access  Private
const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await markAsRead(req.params.id, req.user.id);

    if (!notification) {
      return errorResponse(res, 404, 'Notification not found.');
    }

    return successResponse(res, 200, 'Notification marked as read.', notification);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/v1/users/notifications/read-all
// @access  Private
const markAllNotificationsRead = async (req, res, next) => {
  try {
    await markAllAsRead(req.user.id);
    return successResponse(res, 200, 'All notifications marked as read.');
  } catch (error) {
    next(error);
  }
};

// @desc    Get recently viewed properties
// @route   GET /api/v1/users/viewed-properties
// @access  Private
const getViewedProperties = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'viewedProperties',
        select: 'title price images location.city propertyType bedrooms bathrooms area status',
        options: { limit: 20 },
      })
      .lean();

    return successResponse(res, 200, 'Viewed properties fetched.', user.viewedProperties || []);
  } catch (error) {
    next(error);
  }
};

// @desc    Get search history
// @route   GET /api/v1/users/search-history
// @access  Private
const getSearchHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('searchHistory').lean();
    return successResponse(res, 200, 'Search history fetched.', user.searchHistory || []);
  } catch (error) {
    next(error);
  }
};

// @desc    Clear search history
// @route   DELETE /api/v1/users/search-history
// @access  Private
const clearSearchHistory = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { searchHistory: [] });
    return successResponse(res, 200, 'Search history cleared.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getViewedProperties,
  getSearchHistory,
  clearSearchHistory,
};
