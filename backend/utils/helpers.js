/**
 * Generate a URL-friendly slug from text
 */
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Calculate distance between two coordinates using Haversine formula (in km)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Format a number as Indian currency (INR)
 */
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Extract pagination params from query
 */
const getPaginationParams = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Sanitize a filename by removing special characters
 */
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
};

/**
 * Generate a random OTP (6 digits)
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send token response with cookie
 */
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.getSignedJwtToken();

  const cookieExpireDays = parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 7;
  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: 'strict',
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  // Remove password from output
  user.password = undefined;

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      token,
      data: user,
    });
};

/**
 * Build a query filter object from request query params
 */
const buildPropertyFilter = (query) => {
  const filter = { status: 'active' };

  if (query.city) {
    filter['location.city'] = { $regex: new RegExp(query.city, 'i') };
  }

  if (query.state) {
    filter['location.state'] = { $regex: new RegExp(query.state, 'i') };
  }

  if (query.propertyType) {
    filter.propertyType = query.propertyType;
  }

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = parseInt(query.minPrice, 10);
    if (query.maxPrice) filter.price.$lte = parseInt(query.maxPrice, 10);
  }

  if (query.minArea || query.maxArea) {
    filter.area = {};
    if (query.minArea) filter.area.$gte = parseInt(query.minArea, 10);
    if (query.maxArea) filter.area.$lte = parseInt(query.maxArea, 10);
  }

  if (query.bedrooms) {
    filter.bedrooms = parseInt(query.bedrooms, 10);
  }

  if (query.furnishing) {
    filter.furnishing = query.furnishing;
  }

  if (query.amenities) {
    const amenitiesArr = Array.isArray(query.amenities)
      ? query.amenities
      : query.amenities.split(',');
    filter.amenities = { $all: amenitiesArr };
  }

  if (query.featured === 'true') {
    filter.featured = true;
  }

  return filter;
};

/**
 * Build sort object from sort param
 */
const buildSortObject = (sortParam) => {
  const sortOptions = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    popular: { views: -1 },
    area_asc: { area: 1 },
    area_desc: { area: -1 },
  };
  return sortOptions[sortParam] || { createdAt: -1 };
};

module.exports = {
  generateSlug,
  calculateDistance,
  formatPrice,
  getPaginationParams,
  sanitizeFilename,
  generateOTP,
  sendTokenResponse,
  buildPropertyFilter,
  buildSortObject,
};
