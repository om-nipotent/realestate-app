const express = require('express');
const router = express.Router();
const {
  getSellerAnalytics,
  getPriceSuggestion,
  getTrendingAreasController,
  getPopularPropertiesController,
  getMarketStatsController,
  getRecommendations,
} = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Public routes
router.get('/trending-areas', getTrendingAreasController);
router.get('/popular-properties', getPopularPropertiesController);
router.get('/market-stats', getMarketStatsController);

// Protected routes
router.get('/seller', protect, authorize('seller'), getSellerAnalytics);
router.post('/price-suggestion', protect, getPriceSuggestion);
router.get('/recommendations', protect, authorize('buyer'), getRecommendations);

module.exports = router;
