const Visit = require('../models/Visit');
const Property = require('../models/Property');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { getPaginationParams } = require('../utils/helpers');
const { createNotification } = require('../services/notification.service');
const { sendVisitConfirmation, sendVisitRequestEmail } = require('../services/email.service');
const { NOTIFICATION_TYPES, VISIT_STATUS } = require('../config/constants');

// @desc    Request a property visit
// @route   POST /api/v1/visits
// @access  Private (buyer, verified)
const requestVisit = async (req, res, next) => {
  try {
    const { propertyId, requestedDate, requestedTime, buyerNotes, alternateDate, alternateTime } = req.body;

    const property = await Property.findById(propertyId).populate('seller', 'name email _id');

    if (!property) {
      return errorResponse(res, 404, 'Property not found.');
    }

    if (property.status !== 'active') {
      return errorResponse(res, 400, 'This property is no longer available.');
    }

    if (property.seller._id.toString() === req.user.id) {
      return errorResponse(res, 400, 'You cannot schedule a visit to your own property.');
    }

    // Check for existing pending/approved visit for this property+buyer
    const existingVisit = await Visit.findOne({
      property: propertyId,
      buyer: req.user.id,
      status: { $in: [VISIT_STATUS.PENDING, VISIT_STATUS.APPROVED] },
    });

    if (existingVisit) {
      return errorResponse(res, 400, 'You already have an active visit request for this property.');
    }

    const visit = await Visit.create({
      property: propertyId,
      buyer: req.user.id,
      seller: property.seller._id,
      requestedDate: new Date(requestedDate),
      requestedTime,
      alternateDate: alternateDate ? new Date(alternateDate) : undefined,
      alternateTime,
      buyerNotes: buyerNotes || '',
    });

    await visit.populate([
      { path: 'property', select: 'title location.city images' },
      { path: 'buyer', select: 'name email phone' },
    ]);

    // Notify seller
    await createNotification(
      property.seller._id,
      '📅 New Visit Request',
      `${req.user.name} wants to visit "${property.title}" on ${new Date(requestedDate).toLocaleDateString()}`,
      NOTIFICATION_TYPES.VISIT,
      visit._id,
      'Visit',
      '/seller/dashboard'
    );

    // Send email to seller
    sendVisitRequestEmail(property.seller, req.user, property, visit).catch(console.error);

    return successResponse(res, 201, 'Visit request sent! The seller will respond soon.', visit);
  } catch (error) {
    next(error);
  }
};

// @desc    Get buyer's visits
// @route   GET /api/v1/visits/buyer
// @access  Private (buyer)
const getBuyerVisits = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const filter = { buyer: req.user.id };
    if (req.query.status) filter.status = req.query.status;

    const [visits, total] = await Promise.all([
      Visit.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('property', 'title price images location.city location.address status')
        .populate('seller', 'name email phone avatar verificationStatus')
        .lean(),
      Visit.countDocuments(filter),
    ]);

    return paginatedResponse(res, visits, page, limit, total);
  } catch (error) {
    next(error);
  }
};

// @desc    Get seller's visits
// @route   GET /api/v1/visits/seller
// @access  Private (seller)
const getSellerVisits = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const filter = { seller: req.user.id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.propertyId) filter.property = req.query.propertyId;

    const [visits, total] = await Promise.all([
      Visit.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('property', 'title price images location.city location.address')
        .populate('buyer', 'name email phone avatar verificationStatus')
        .lean(),
      Visit.countDocuments(filter),
    ]);

    return paginatedResponse(res, visits, page, limit, total);
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to visit request (seller)
// @route   PUT /api/v1/visits/:id/respond
// @access  Private (seller)
const respondToVisit = async (req, res, next) => {
  try {
    const { status, sellerNotes, confirmedDate, confirmedTime } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return errorResponse(res, 400, 'Status must be "approved" or "rejected".');
    }

    const visit = await Visit.findById(req.params.id)
      .populate('buyer', 'name email _id')
      .populate('property', 'title');

    if (!visit) {
      return errorResponse(res, 404, 'Visit request not found.');
    }

    if (visit.seller.toString() !== req.user.id) {
      return errorResponse(res, 403, 'You can only respond to visits on your properties.');
    }

    if (visit.status !== VISIT_STATUS.PENDING) {
      return errorResponse(res, 400, `Cannot respond to a visit with status: ${visit.status}`);
    }

    visit.status = status;
    visit.sellerNotes = sellerNotes || '';
    if (status === VISIT_STATUS.APPROVED) {
      visit.confirmedDate = confirmedDate ? new Date(confirmedDate) : visit.requestedDate;
      visit.confirmedTime = confirmedTime || visit.requestedTime;
    }
    await visit.save();

    // Notify buyer
    await createNotification(
      visit.buyer._id,
      status === 'approved' ? '✅ Visit Request Approved!' : '❌ Visit Request Rejected',
      status === 'approved'
        ? `Your visit to "${visit.property.title}" has been approved for ${new Date(visit.confirmedDate).toLocaleDateString()}`
        : `Your visit request for "${visit.property.title}" was rejected. ${sellerNotes || ''}`,
      NOTIFICATION_TYPES.VISIT,
      visit._id,
      'Visit',
      '/buyer/dashboard'
    );

    // Send email
    sendVisitConfirmation(visit.buyer, req.user, visit.property, visit, status).catch(console.error);

    return successResponse(res, 200, `Visit ${status} successfully.`, visit);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a visit (buyer)
// @route   PUT /api/v1/visits/:id/cancel
// @access  Private (buyer)
const cancelVisit = async (req, res, next) => {
  try {
    const visit = await Visit.findById(req.params.id)
      .populate('seller', 'name _id')
      .populate('property', 'title');

    if (!visit) {
      return errorResponse(res, 404, 'Visit request not found.');
    }

    if (visit.buyer.toString() !== req.user.id) {
      return errorResponse(res, 403, 'You can only cancel your own visit requests.');
    }

    if (![VISIT_STATUS.PENDING, VISIT_STATUS.APPROVED].includes(visit.status)) {
      return errorResponse(res, 400, 'Cannot cancel a visit that is already completed or rejected.');
    }

    visit.status = VISIT_STATUS.CANCELLED;
    visit.cancelledAt = new Date();
    visit.cancelledBy = req.user.id;
    await visit.save();

    // Notify seller
    await createNotification(
      visit.seller._id,
      '🚫 Visit Request Cancelled',
      `${req.user.name} cancelled their visit request for "${visit.property.title}"`,
      NOTIFICATION_TYPES.VISIT,
      visit._id,
      'Visit',
      '/seller/dashboard'
    );

    return successResponse(res, 200, 'Visit cancelled successfully.', visit);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark visit as completed (seller)
// @route   PUT /api/v1/visits/:id/complete
// @access  Private (seller)
const completeVisit = async (req, res, next) => {
  try {
    const visit = await Visit.findById(req.params.id);

    if (!visit) {
      return errorResponse(res, 404, 'Visit not found.');
    }

    if (visit.seller.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Access denied.');
    }

    if (visit.status !== VISIT_STATUS.APPROVED) {
      return errorResponse(res, 400, 'Only approved visits can be marked as completed.');
    }

    visit.status = VISIT_STATUS.COMPLETED;
    visit.completedAt = new Date();
    await visit.save();

    return successResponse(res, 200, 'Visit marked as completed.', visit);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestVisit,
  getBuyerVisits,
  getSellerVisits,
  respondToVisit,
  cancelVisit,
  completeVisit,
};
