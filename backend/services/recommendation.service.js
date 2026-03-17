const Property = require('../models/Property');
const User = require('../models/User');

/**
 * Track a property view for a user
 */
const trackPropertyView = async (userId, propertyId) => {
  if (!userId) return;

  try {
    await Promise.all([
      // Add to user's viewedProperties (keep last 20, avoid duplicates)
      User.findByIdAndUpdate(userId, {
        $pull: { viewedProperties: propertyId }, // Remove if exists (to re-add at end)
      }),
      // Increment property view count
      Property.findByIdAndUpdate(propertyId, { $inc: { views: 1 } }),
    ]);

    // Add back at the end (most recent first)
    await User.findByIdAndUpdate(userId, {
      $push: {
        viewedProperties: {
          $each: [propertyId],
          $position: 0,
          $slice: 20, // Keep only last 20
        },
      },
    });
  } catch (error) {
    console.error('Failed to track property view:', error.message);
  }
};

/**
 * Update search history for a user
 */
const updateSearchHistory = async (userId, searchQuery) => {
  if (!userId || !searchQuery || searchQuery.trim().length < 2) return;

  try {
    const trimmed = searchQuery.trim().toLowerCase();

    await User.findByIdAndUpdate(userId, {
      $pull: { searchHistory: trimmed }, // Remove duplicates
    });

    await User.findByIdAndUpdate(userId, {
      $push: {
        searchHistory: {
          $each: [trimmed],
          $position: 0,
          $slice: 20, // Keep last 20 searches
        },
      },
    });
  } catch (error) {
    console.error('Failed to update search history:', error.message);
  }
};

/**
 * Get property recommendations for a buyer based on their history
 */
const getRecommendationsForBuyer = async (userId, limit = 8) => {
  try {
    const user = await User.findById(userId)
      .select('searchHistory viewedProperties')
      .lean();

    if (!user) return [];

    const viewedIds = user.viewedProperties || [];
    const searchHistory = user.searchHistory || [];

    // Build query based on search history (extract cities and property types)
    const cityTerms = searchHistory.filter((s) =>
      s.length > 2 && !['apartment', 'house', 'villa', 'land', 'commercial', 'office'].includes(s)
    );
    const typeTerms = searchHistory.filter((s) =>
      ['apartment', 'house', 'villa', 'land', 'commercial', 'office'].includes(s)
    );

    // Get properties viewed by user to find similar ones
    const viewedProperties = viewedIds.length > 0
      ? await Property.find({ _id: { $in: viewedIds.slice(0, 5) } })
          .select('location.city propertyType price bedrooms')
          .lean()
      : [];

    // Build recommendation query
    const orConditions = [];

    // Based on cities from search and view history
    const cities = [
      ...cityTerms,
      ...viewedProperties.map((p) => p.location.city),
    ].filter(Boolean).slice(0, 3);

    if (cities.length > 0) {
      orConditions.push({
        'location.city': { $in: cities.map((c) => new RegExp(c, 'i')) },
      });
    }

    // Based on property types from history
    const types = [...typeTerms].filter(Boolean);
    if (viewedProperties.length > 0) {
      const viewedTypes = [...new Set(viewedProperties.map((p) => p.propertyType))];
      types.push(...viewedTypes);
    }

    if (types.length > 0) {
      orConditions.push({ propertyType: { $in: types } });
    }

    // Based on price range from viewed properties
    if (viewedProperties.length > 0) {
      const avgPrice =
        viewedProperties.reduce((sum, p) => sum + p.price, 0) / viewedProperties.length;
      orConditions.push({
        price: { $gte: avgPrice * 0.7, $lte: avgPrice * 1.3 },
      });
    }

    if (orConditions.length === 0) {
      // No history — return popular properties
      return await Property.find({ status: 'active', _id: { $nin: viewedIds } })
        .sort({ views: -1, createdAt: -1 })
        .limit(limit)
        .populate('seller', 'name verificationStatus avatar')
        .lean();
    }

    const recommendations = await Property.find({
      status: 'active',
      _id: { $nin: viewedIds },
      $or: orConditions,
    })
      .sort({ views: -1, createdAt: -1 })
      .limit(limit)
      .populate('seller', 'name verificationStatus avatar')
      .lean();

    // If not enough recommendations, fill with popular properties
    if (recommendations.length < limit) {
      const excludeIds = [...viewedIds, ...recommendations.map((p) => p._id)];
      const fillCount = limit - recommendations.length;

      const popular = await Property.find({
        status: 'active',
        _id: { $nin: excludeIds },
      })
        .sort({ views: -1 })
        .limit(fillCount)
        .populate('seller', 'name verificationStatus avatar')
        .lean();

      recommendations.push(...popular);
    }

    return recommendations;
  } catch (error) {
    console.error('Failed to get recommendations:', error.message);
    return [];
  }
};

module.exports = {
  trackPropertyView,
  updateSearchHistory,
  getRecommendationsForBuyer,
};
