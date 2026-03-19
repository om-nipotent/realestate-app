const Property = require('../models/Property');

/**
 * Analyze average prices for properties in a city+type combination
 */
const analyzeAreaPrices = async (city, propertyType, bedrooms = null) => {
  const matchQuery = {
    'location.city': { $regex: new RegExp(city, 'i') },
    status: 'active',
  };

  if (propertyType) {
    matchQuery.propertyType = propertyType;
  }

  if (bedrooms !== null) {
    matchQuery.bedrooms = parseInt(bedrooms, 10);
  }

  const stats = await Property.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        avgPrice: { $avg: '$price' },
        avgPricePerSqft: { $avg: '$pricePerSqft' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        avgArea: { $avg: '$area' },
        count: { $sum: 1 },
        totalViews: { $sum: '$views' },
      },
    },
  ]);

  return stats[0] || {
    avgPrice: 0,
    avgPricePerSqft: 0,
    minPrice: 0,
    maxPrice: 0,
    avgArea: 0,
    count: 0,
  };
};

/**
 * Get market trend by comparing last 30 days vs previous 30 days
 */
const getMarketTrend = async (city, propertyType) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);

  const baseMatch = {
    'location.city': { $regex: new RegExp(city, 'i') },
    status: 'active',
  };

  if (propertyType) {
    baseMatch.propertyType = propertyType;
  }

  const [recentStats, olderStats] = await Promise.all([
    Property.aggregate([
      { $match: { ...baseMatch, createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, avgPrice: { $avg: '$price' }, count: { $sum: 1 } } },
    ]),
    Property.aggregate([
      { $match: { ...baseMatch, createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
      { $group: { _id: null, avgPrice: { $avg: '$price' }, count: { $sum: 1 } } },
    ]),
  ]);

  const recentAvg = recentStats[0]?.avgPrice || 0;
  const olderAvg = olderStats[0]?.avgPrice || 0;

  if (olderAvg === 0 || recentStats[0]?.count < 3) {
    return { trend: 'stable', percentChange: 0, recentCount: recentStats[0]?.count || 0 };
  }

  const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;

  let trend = 'stable';
  if (percentChange > 5) trend = 'increasing';
  else if (percentChange < -5) trend = 'decreasing';

  return {
    trend,
    percentChange: Math.round(percentChange * 100) / 100,
    recentAvgPrice: Math.round(recentAvg),
    olderAvgPrice: Math.round(olderAvg),
    recentCount: recentStats[0]?.count || 0,
  };
};

/**
 * Get comparable listings similar to the given property
 */
const getComparableListings = async (city, propertyType, price, bedrooms, limit = 5) => {
  const matchQuery = {
    'location.city': { $regex: new RegExp(city, 'i') },
    status: 'active',
  };

  if (propertyType) matchQuery.propertyType = propertyType;
  if (bedrooms) matchQuery.bedrooms = parseInt(bedrooms, 10);

  // Properties within ±50% price range
  if (price) {
    matchQuery.price = {
      $gte: price * 0.5,
      $lte: price * 1.5,
    };
  }

  const comparables = await Property.find(matchQuery)
    .select('title price pricePerSqft area bedrooms location.city location.address images status')
    .sort({ views: -1 })
    .limit(limit)
    .lean();

  return comparables;
};

/**
 * Main price suggestion function
 */
const suggestPrice = async (city, propertyType, areaSqft, bedrooms) => {
  const area = parseFloat(areaSqft) || 0;

  const [areaStats, trendData] = await Promise.all([
    analyzeAreaPrices(city, propertyType, bedrooms),
    getMarketTrend(city, propertyType),
  ]);

  // Calculate suggested price based on area × avg price per sqft
  let suggestedPrice = 0;
  let confidence = 'low';

  if (areaStats.count >= 10) {
    confidence = 'high';
  } else if (areaStats.count >= 3) {
    confidence = 'medium';
  }

  if (areaStats.avgPricePerSqft > 0 && area > 0) {
    suggestedPrice = Math.round(areaStats.avgPricePerSqft * area);
  } else if (areaStats.avgPrice > 0) {
    suggestedPrice = Math.round(areaStats.avgPrice);
  }

  // Adjust for market trend
  let adjustedPrice = suggestedPrice;
  if (trendData.trend === 'increasing' && suggestedPrice > 0) {
    adjustedPrice = Math.round(suggestedPrice * 1.03); // +3% for rising market
  } else if (trendData.trend === 'decreasing' && suggestedPrice > 0) {
    adjustedPrice = Math.round(suggestedPrice * 0.97); // -3% for falling market
  }

  const comparables = await getComparableListings(
    city,
    propertyType,
    suggestedPrice,
    bedrooms
  );

  return {
    suggestedPrice: adjustedPrice,
    basePrice: suggestedPrice,
    avgPricePerSqft: Math.round(areaStats.avgPricePerSqft),
    avgPrice: Math.round(areaStats.avgPrice),
    minPrice: Math.round(areaStats.minPrice),
    maxPrice: Math.round(areaStats.maxPrice),
    comparableCount: areaStats.count,
    marketTrend: trendData.trend,
    trendPercentChange: trendData.percentChange,
    confidence,
    comparableListings: comparables,
    city,
    propertyType,
    area: areaSqft,
  };
};

/**
 * Get trending areas (localities with high demand)
 */
const getTrendingAreas = async (limit = 10) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const areas = await Property.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$location.address',
        city: { $first: '$location.city' },
        totalListings: { $sum: 1 },
        totalViews: { $sum: '$views' },
        avgPrice: { $avg: '$price' },
        recentListings: {
          $sum: {
            $cond: [{ $gte: ['$createdAt', thirtyDaysAgo] }, 1, 0],
          },
        },
      },
    },
    {
      $addFields: {
        demandScore: {
          $add: [
            { $multiply: ['$totalViews', 0.4] },
            { $multiply: ['$totalListings', 0.3] },
            { $multiply: ['$recentListings', 30] },
          ],
        },
      },
    },
    { $sort: { demandScore: -1 } },
    { $limit: limit },
    {
      $project: {
        area: '$_id',
        city: 1,
        totalListings: 1,
        totalViews: 1,
        avgPrice: { $round: ['$avgPrice', 0] },
        recentListings: 1,
        demandScore: { $round: ['$demandScore', 0] },
        _id: 0,
      },
    },
  ]);

  return areas;
};

/**
 * Get popular properties (high views)
 */
const getPopularProperties = async (limit = 10) => {
  return await Property.find({ status: 'active' })
    .sort({ views: -1 })
    .limit(limit)
    .populate('seller', 'name verificationStatus avatar')
    .lean();
};

/**
 * Get overall market stats for the platform
 */
const getMarketStats = async () => {
  const [stats, cityStats] = await Promise.all([
    Property.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalProperties: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalViews: { $sum: '$views' },
        },
      },
    ]),
    Property.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$location.address',
          city: { $first: '$location.city' },
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  return {
    totalProperties: stats[0]?.totalProperties || 0,
    avgPrice: Math.round(stats[0]?.avgPrice || 0),
    totalViews: stats[0]?.totalViews || 0,
    topAreas: cityStats.map((c) => ({
      area: c._id,
      city: c.city,
      count: c.count,
      avgPrice: Math.round(c.avgPrice),
    })),
  };
};

module.exports = {
  analyzeAreaPrices,
  getMarketTrend,
  getComparableListings,
  suggestPrice,
  getTrendingAreas,
  getPopularProperties,
  getMarketStats,
};
