const { errorResponse } = require('../utils/apiResponse');
const { VERIFICATION_STATUS } = require('../config/constants');

/**
 * Authorize specific roles
 * Usage: authorize('admin', 'seller')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
      );
    }

    next();
  };
};

/**
 * Require verified identity status
 * Only allows users with verificationStatus === 'verified'
 */
const isVerified = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 401, 'Authentication required.');
  }

  if (req.user.verificationStatus !== VERIFICATION_STATUS.VERIFIED) {
    const statusMessages = {
      pending: 'Your identity verification is pending review. Please wait for admin approval.',
      rejected: 'Your identity verification was rejected. Please re-submit your documents.',
    };

    const message =
      statusMessages[req.user.verificationStatus] ||
      'Identity verification required. Please upload your documents.';

    return errorResponse(res, 403, message);
  }

  next();
};

/**
 * Check ownership of a resource
 * Requires the resource to be loaded and attached to req as req.resource
 * Compares req.resource.seller or req.resource.user with req.user._id
 */
const isOwner = (field = 'seller') => {
  return (req, res, next) => {
    if (!req.resource) {
      return errorResponse(res, 404, 'Resource not found.');
    }

    const ownerId = req.resource[field]?._id || req.resource[field];

    if (!ownerId || ownerId.toString() !== req.user._id.toString()) {
      // Admins can bypass ownership check
      if (req.user.role === 'admin') {
        return next();
      }
      return errorResponse(res, 403, 'You do not have permission to perform this action.');
    }

    next();
  };
};

module.exports = { authorize, isVerified, isOwner };
