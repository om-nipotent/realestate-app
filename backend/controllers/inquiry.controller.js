const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { getPaginationParams } = require('../utils/helpers');
const { createNotification } = require('../services/notification.service');
const { sendInquiryNotification } = require('../services/email.service');
const { NOTIFICATION_TYPES, INQUIRY_STATUS } = require('../config/constants');

// @desc    Send an inquiry to a seller
// @route   POST /api/v1/inquiries
// @access  Private (buyer, verified)
const sendInquiry = async (req, res, next) => {
  try {
    const { propertyId, message, contactPhone, preferredVisitDate } = req.body;

    const property = await Property.findById(propertyId).populate('seller', 'name email _id');

    if (!property) {
      return errorResponse(res, 404, 'Property not found.');
    }

    if (property.status !== 'active') {
      return errorResponse(res, 400, 'This property is no longer available.');
    }

    if (property.seller._id.toString() === req.user.id) {
      return errorResponse(res, 400, 'You cannot send an inquiry to yourself.');
    }

    // Check for existing recent inquiry
    const recentInquiry = await Inquiry.findOne({
      property: propertyId,
      buyer: req.user.id,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (recentInquiry) {
      return errorResponse(res, 400, 'You already sent an inquiry for this property in the last 24 hours.');
    }

    const inquiry = await Inquiry.create({
      property: propertyId,
      buyer: req.user.id,
      seller: property.seller._id,
      message,
      contactPhone,
      preferredVisitDate: preferredVisitDate ? new Date(preferredVisitDate) : null,
    });

    await inquiry.populate([
      { path: 'property', select: 'title location.city images' },
      { path: 'buyer', select: 'name email phone' },
    ]);

    // Notify seller
    await createNotification(
      property.seller._id,
      '📩 New Inquiry Received',
      `${req.user.name} sent an inquiry about "${property.title}"`,
      NOTIFICATION_TYPES.INQUIRY,
      inquiry._id,
      'Inquiry',
      '/seller/dashboard'
    );

    // Send email to seller
    sendInquiryNotification(property.seller, req.user, property, message).catch(console.error);

    return successResponse(res, 201, 'Inquiry sent successfully. The seller will respond soon.', inquiry);
  } catch (error) {
    next(error);
  }
};

// @desc    Get buyer's sent inquiries
// @route   GET /api/v1/inquiries/buyer
// @access  Private (buyer)
const getBuyerInquiries = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    const filter = { buyer: req.user.id };
    if (req.query.status) filter.status = req.query.status;

    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('property', 'title price images location.city location.address status')
        .populate('seller', 'name email phone avatar verificationStatus')
        .lean(),
      Inquiry.countDocuments(filter),
    ]);

    return paginatedResponse(res, inquiries, page, limit, total);
  } catch (error) {
    next(error);
  }
};

// @desc    Get seller's received inquiries
// @route   GET /api/v1/inquiries/seller
// @access  Private (seller)
const getSellerInquiries = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    const filter = { seller: req.user.id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.propertyId) filter.property = req.query.propertyId;

    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('property', 'title price images location.city location.address')
        .populate('buyer', 'name email phone avatar verificationStatus')
        .lean(),
      Inquiry.countDocuments(filter),
    ]);

    return paginatedResponse(res, inquiries, page, limit, total);
  } catch (error) {
    next(error);
  }
};

// @desc    Reply to an inquiry
// @route   PUT /api/v1/inquiries/:id/reply
// @access  Private (seller)
const replyToInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('buyer', 'name email _id')
      .populate('property', 'title');

    if (!inquiry) {
      return errorResponse(res, 404, 'Inquiry not found.');
    }

    if (inquiry.seller.toString() !== req.user.id) {
      return errorResponse(res, 403, 'You can only reply to inquiries on your properties.');
    }

    inquiry.reply = req.body.reply;
    inquiry.status = INQUIRY_STATUS.REPLIED;
    inquiry.repliedAt = new Date();
    await inquiry.save();

    // Notify buyer
    await createNotification(
      inquiry.buyer._id,
      '💬 Seller Replied to Your Inquiry',
      `${req.user.name} replied to your inquiry about "${inquiry.property.title}"`,
      NOTIFICATION_TYPES.INQUIRY,
      inquiry._id,
      'Inquiry',
      '/buyer/dashboard'
    );

    return successResponse(res, 200, 'Reply sent successfully.', inquiry);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark inquiry as read
// @route   PUT /api/v1/inquiries/:id/read
// @access  Private (seller)
const markInquiryRead = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return errorResponse(res, 404, 'Inquiry not found.');
    }

    if (inquiry.seller.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Access denied.');
    }

    if (inquiry.status === INQUIRY_STATUS.UNREAD) {
      inquiry.status = INQUIRY_STATUS.READ;
      await inquiry.save();
    }

    return successResponse(res, 200, 'Inquiry marked as read.', inquiry);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendInquiry,
  getBuyerInquiries,
  getSellerInquiries,
  replyToInquiry,
  markInquiryRead,
};
