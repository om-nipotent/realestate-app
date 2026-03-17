const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getAdminProperties,
  updatePropertyStatus,
  togglePropertyFeatured,
  getFraudAlerts,
  getPlatformActivity,
  deletePropertyAdmin,
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// All admin routes require auth + admin role
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.get('/properties', getAdminProperties);
router.put('/properties/:id/status', updatePropertyStatus);
router.put('/properties/:id/featured', togglePropertyFeatured);
router.delete('/properties/:id', deletePropertyAdmin);
router.get('/fraud-alerts', getFraudAlerts);
router.get('/activity', getPlatformActivity);

module.exports = router;
