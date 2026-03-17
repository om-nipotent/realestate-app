const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');
const Visit = require('../models/Visit');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const {
  suggestPrice,
  getTrendingAreas,
  getPopularProperties,
  getMarketStats,
} = require('../services/priceEngine.service');
const { getRecommendationsForBuyer } = require('../services/recommendation.service');

// @desc    Get seller analytics dashboard data
// @route   GET /api/v1/analytics/seller
// @access  Private (seller)
const getSellerAnalytics = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalListings,
      activeListings,
      totalInquiries,
      unreadInquiries,
      totalVisits,
      pendingVisits,
      recentInquiries,
      recentVisits,
      propertyStats,
    ] = await Promise.all([
      Property.countDocuments({ seller: sellerId }),
      Property.countDocuments({ seller: sellerId, status: 'active' }),
      Inquiry.countDocuments({ seller: sellerId }),
      Inquiry.countDocuments({ seller: sellerId, status: 'unread' }),
      Visit.countDocuments({ seller: sellerId }),
      Visit.countDocuments({ seller: sellerId, status: 'pending' }),
      Inquiry.find({ seller: sellerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('buyer', 'name avatar')
        .populate('property', 'title')
        .lean(),
      Visit.find({ seller: sellerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('buyer', 'name avatar')
        .populate('property', 'title')
        .lean(),
      Property.find({ seller: sellerId })
        .select('title price views status featured createdAt location.city propertyType area')
        .sort({ views: -1 })
        .lean(),
    ]);

    // Monthly views chart data (last 6 months)
    const monthlyViews = await Property.aggregate([
      { $match: { seller: require('mongoose').Types.ObjectId.createFromHexString(sellerId) } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalViews: { $sum: '$views' },
          listingsCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 },
    ]);

    const totalViews = propertyStats.reduce((sum, p) => sum + (p.views || 0), 0);

    return successResponse(res, 200, 'Analytics fetched successfully.', {
      overview: {
        totalListings,
        activeListings,
        totalInquiries,
        unreadInquiries,
        totalVisits,
        pendingVisits,
        totalViews,
      },
      recentInquiries,
      recentVisits,
      propertyStats,
      monthlyViews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get price suggestion for a property
// @route   POST /api/v1/analytics/price-suggestion
// @access  Private
const getPriceSuggestion = async (req, res, next) => {
  try {
    const { city, propertyType, area, bedrooms } = req.body;

    if (!city || !propertyType || !area) {
      return errorResponse(res, 400, 'City, property type, and area are required.');
    }

    const suggestion = await suggestPrice(city, propertyType, parseFloat(area), bedrooms);

    return successResponse(res, 200, 'Price suggestion generated.', suggestion);
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending areas
// @route   GET /api/v1/analytics/trending-areas
// @access  Public
const getTrendingAreasController = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const areas = await getTrendingAreas(limit);
    return successResponse(res, 200, 'Trending areas fetched.', areas);
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular properties
// @route   GET /api/v1/analytics/popular-properties
// @access  Public
const getPopularPropertiesController = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const properties = await getPopularProperties(limit);
    return successResponse(res, 200, 'Popular properties fetched.', properties);
  } catch (error) {
    next(error);
  }
};

// @desc    Get overall market stats
// @route   GET /api/v1/analytics/market-stats
// @access  Public
const getMarketStatsController = async (req, res, next) => {
  try {
    const stats = await getMarketStats();
    return successResponse(res, 200, 'Market stats fetched.', stats);
  } catch (error) {
    next(error);
  }
};

// @desc    Get property recommendations for buyer
// @route   GET /api/v1/analytics/recommendations
// @access  Private (buyer)
const getRecommendations = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 8;
    const recommendations = await getRecommendationsForBuyer(req.user.id, limit);
    return successResponse(res, 200, 'Recommendations fetched.', recommendations);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSellerAnalytics,
  getPriceSuggestion,
  getTrendingAreasController,
  getPopularPropertiesController,
  getMarketStatsController,
  getRecommendations,
};
