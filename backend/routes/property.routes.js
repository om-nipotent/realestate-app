const express = require('express');
const router = express.Router();
const {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
  getSellerProperties,
  getNearbyProperties,
  toggleFeatured,
  deletePropertyImage,
} = require('../controllers/property.controller');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize, isVerified } = require('../middleware/roleCheck');
const { uploadImages } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

// Public routes
router.get('/featured', getFeaturedProperties);
router.get('/nearby', getNearbyProperties);
router.get('/', optionalAuth, getProperties);

// Seller routes
router.get('/seller/listings', protect, authorize('seller'), getSellerProperties);

// Protected: create property (no verification required)
router.post(
  '/',
  protect,
  authorize('seller'),
  uploadLimiter,
  uploadImages,
  createProperty
);

// Single property
router.get('/:id', optionalAuth, getProperty);

// Update property
router.put(
  '/:id',
  protect,
  authorize('seller', 'admin'),
  uploadImages,
  updateProperty
);

// Delete property
router.delete('/:id', protect, authorize('seller', 'admin'), deleteProperty);

// Toggle featured (admin)
router.put('/:id/featured', protect, authorize('admin'), toggleFeatured);

// Delete single image from property
router.delete('/:id/images/:imageId', protect, authorize('seller', 'admin'), deletePropertyImage);

module.exports = router;
