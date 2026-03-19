const User = require('../models/User');
const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');
const Visit = require('../models/Visit');
const Verification = require('../models/Verification');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { getPaginationParams } = require('../utils/helpers');

// @desc    Get admin dashboard stats
// @route   GET /api/v1/admin/dashboard
// @access  Private (admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalBuyers,
      totalSellers,
      totalProperties,
      activeProperties,
      featuredProperties,
      pendingVerifications,
      totalInquiries,
      totalVisits,
      newUsersThisMonth,
      newPropertiesThisMonth,
      verifiedUsers,
      recentUsers,
      recentProperties,
      recentVerifications,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ role: 'buyer' }),
      User.countDocuments({ role: 'seller' }),
      Property.countDocuments(),
      Property.countDocuments({ status: 'active' }),
      Property.countDocuments({ featured: true }),
      Verification.countDocuments({ status: 'pending' }),
      Inquiry.countDocuments(),
      Visit.countDocuments(),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo }, role: { $ne: 'admin' } }),
      Property.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ verificationStatus: 'verified', role: { $ne: 'admin' } }),
      User.find({ role: { $ne: 'admin' } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role verificationStatus createdAt avatar')
        .lean(),
      Property.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('seller', 'name')
        .select('title price status location.city propertyType createdAt featured images')
        .lean(),
      Verification.find({ status: 'pending' })
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate('seller', 'name email role avatar')
        .lean(),
    ]);

    return successResponse(res, 200, 'Dashboard stats fetched.', {
      stats: {
        totalUsers,
        totalBuyers,
        totalSellers,
        totalProperties,
        activeProperties,
        featuredProperties,
        pendingVerifications,
        totalInquiries,
        totalVisits,
        newUsersThisMonth,
        newPropertiesThisMonth,
        verifiedUsers,
      },
      recentActivity: {
        recentUsers,
        recentProperties,
        recentVerifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/v1/admin/users
// @access  Private (admin)
const getUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const filter = { role: { $ne: 'admin' } };

    if (req.query.role) filter.role = req.query.role;
    if (req.query.verificationStatus) filter.verificationStatus = req.query.verificationStatus;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    if (req.query.q) {
      const searchRegex = new RegExp(req.query.q, 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password -passwordResetToken -emailVerificationToken')
        .lean(),
      User.countDocuments(filter),
    ]);

    return paginatedResponse(res, users, page, limit, total);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user active status (activate/deactivate)
// @route   PUT /api/v1/admin/users/:id/status
// @access  Private (admin)
const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (isActive === undefined) {
      return errorResponse(res, 400, 'Please provide isActive field.');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, select: '-password' }
    );

    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    return successResponse(
      res,
      200,
      `User account ${isActive ? 'activated' : 'deactivated'} successfully.`,
      user
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get all properties (admin)
// @route   GET /api/v1/admin/properties
// @access  Private (admin)
const getAdminProperties = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.city) filter['location.city'] = { $regex: new RegExp(req.query.city, 'i') };
    if (req.query.propertyType) filter.propertyType = req.query.propertyType;
    if (req.query.featured !== undefined) filter.featured = req.query.featured === 'true';

    if (req.query.q) {
      filter.$text = { $search: req.query.q };
    }

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('seller', 'name email verificationStatus')
        .lean(),
      Property.countDocuments(filter),
    ]);

    return paginatedResponse(res, properties, page, limit, total);
  } catch (error) {
    next(error);
  }
};

// @desc    Update property status (admin)
// @route   PUT /api/v1/admin/properties/:id/status
// @access  Private (admin)
const updatePropertyStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'active', 'sold', 'inactive'];

    if (!status || !validStatuses.includes(status)) {
      return errorResponse(res, 400, `Status must be one of: ${validStatuses.join(', ')}`);
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('seller', 'name email');

    if (!property) {
      return errorResponse(res, 404, 'Property not found.');
    }

    return successResponse(res, 200, 'Property status updated.', property);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle property featured status (admin)
// @route   PUT /api/v1/admin/properties/:id/featured
// @access  Private (admin)
const togglePropertyFeatured = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return errorResponse(res, 404, 'Property not found.');
    }

    property.featured = !property.featured;
    await property.save();

    return successResponse(
      res,
      200,
      `Property ${property.featured ? 'marked as featured' : 'removed from featured'}.`,
      property
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get fraud alerts (suspicious listings)
// @route   GET /api/v1/admin/fraud-alerts
// @access  Private (admin)
const getFraudAlerts = async (req, res, next) => {
  try {
    // Find properties with suspiciously low prices (below 10% of area average)
    const areaAverages = await Property.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$location.address',
          avgPrice: { $avg: '$price' },
        },
      },
    ]);

    const avgMap = {};
    areaAverages.forEach((a) => { avgMap[a._id] = a.avgPrice; });

    // Properties priced at less than 20% of area average
    const suspiciousProperties = await Property.find({ status: 'active' })
      .populate('seller', 'name email verificationStatus createdAt')
      .lean();

    const fraudAlerts = suspiciousProperties
      .filter((p) => {
        const areaAvg = avgMap[p.location.address];
        return areaAvg && p.price < areaAvg * 0.2;
      })
      .map((p) => ({
        ...p,
        alertReason: 'Suspiciously low price compared to area average',
        areaAvgPrice: Math.round(avgMap[p.location.address]),
        priceRatio: Math.round((p.price / avgMap[p.location.address]) * 100),
      }));

    // Find sellers with multiple properties in the same address
    const duplicateAddresses = await Property.aggregate([
      {
        $group: {
          _id: { address: '$location.address', seller: '$seller' },
          count: { $sum: 1 },
          propertyIds: { $push: '$_id' },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    return successResponse(res, 200, 'Fraud alerts fetched.', {
      suspiciousListings: fraudAlerts,
      duplicateAddressCount: duplicateAddresses.length,
      duplicateAddresses: duplicateAddresses.slice(0, 10),
      totalAlerts: fraudAlerts.length + duplicateAddresses.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent platform activity
// @route   GET /api/v1/admin/activity
// @access  Private (admin)
const getPlatformActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;

    const [recentLogins, newListings, newVerifications, newInquiries] = await Promise.all([
      User.find({ lastLogin: { $exists: true } })
        .sort({ lastLogin: -1 })
        .limit(limit)
        .select('name email role lastLogin avatar verificationStatus')
        .lean(),
      Property.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('seller', 'name')
        .select('title price status location.city createdAt')
        .lean(),
      Verification.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('seller', 'name email role')
        .select('status createdAt submittedAt')
        .lean(),
      Inquiry.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('buyer', 'name')
        .populate('property', 'title')
        .select('message status createdAt')
        .lean(),
    ]);

    return successResponse(res, 200, 'Platform activity fetched.', {
      recentLogins,
      newListings,
      newVerifications,
      newInquiries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a property (admin)
// @route   DELETE /api/v1/admin/properties/:id
// @access  Private (admin)
const deletePropertyAdmin = async (req, res, next) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);

    if (!property) {
      return errorResponse(res, 404, 'Property not found.');
    }

    return successResponse(res, 200, 'Property deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getAdminProperties,
  updatePropertyStatus,
  togglePropertyFeatured,
  getFraudAlerts,
  getPlatformActivity,
  deletePropertyAdmin,
};
