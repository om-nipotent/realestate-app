const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  deleteAccount,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getViewedProperties,
  getSearchHistory,
  clearSearchHistory,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', uploadSingle, updateProfile);
router.delete('/account', deleteAccount);
router.get('/notifications', getNotifications);
router.put('/notifications/read-all', markAllNotificationsRead);
router.put('/notifications/:id/read', markNotificationRead);
router.get('/viewed-properties', getViewedProperties);
router.get('/search-history', getSearchHistory);
router.delete('/search-history', clearSearchHistory);

module.exports = router;
