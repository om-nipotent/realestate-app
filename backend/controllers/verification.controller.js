const Verification = require('../models/Verification');
const User = require('../models/User');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

// POST /api/v1/verifications/submit  (seller only)
const submitVerification = async (req, res, next) => {
  try {
    const { aadharNumber } = req.body;
    const cleanAadhar = (aadharNumber || '').replace(/\s/g, '');

    if (!cleanAadhar || !/^\d{12}$/.test(cleanAadhar)) {
      return errorResponse(res, 400, 'Please enter a valid 12-digit Aadhar number.');
    }

    const aadharFile = req.files?.aadharCard?.[0];
    const selfieFile = req.files?.selfieWithAadhar?.[0];

    if (!aadharFile) {
      return errorResponse(res, 400, 'Please upload your Aadhar Card.');
    }
    if (!selfieFile) {
      return errorResponse(res, 400, 'Please upload a selfie with your Aadhar Card.');
    }

    const documents = {
      aadharCard: {
        url: `/uploads/documents/${aadharFile.filename}`,
        filename: aadharFile.originalname,
      },
      selfieWithAadhar: {
        url: `/uploads/documents/${selfieFile.filename}`,
        filename: selfieFile.originalname,
      },
    };

    const existing = await Verification.findOne({ seller: req.user.id });

    if (existing) {
      if (existing.status === 'pending') {
        return errorResponse(res, 400, 'Your verification is already under review. Please wait for admin response.');
      }
      if (existing.status === 'approved') {
        return errorResponse(res, 400, 'Your identity is already verified.');
      }
      // Rejected — allow resubmission
      existing.aadharNumber = cleanAadhar;
      existing.documents = documents;
      existing.status = 'pending';
      existing.userRole = req.user.role;
      existing.rejectionReason = '';
      existing.reviewedBy = undefined;
      existing.reviewedAt = undefined;
      existing.submittedAt = new Date();
      await existing.save();
    } else {
      await Verification.create({
        seller: req.user.id,
        userRole: req.user.role,
        aadharNumber: cleanAadhar,
        documents,
      });
    }

    await User.findByIdAndUpdate(req.user.id, { verificationStatus: 'pending' });

    return successResponse(res, 201, 'Verification submitted successfully. Admin will review within 24 hours.', {});
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/verifications/my-status  (seller)
const getMyStatus = async (req, res, next) => {
  try {
    const v = await Verification.findOne({ seller: req.user.id })
      .populate('reviewedBy', 'name')
      .lean();
    return successResponse(res, 200, 'Status fetched.', v);
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/verifications  (admin)
const getAllVerifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [list, total] = await Promise.all([
      Verification.find(filter)
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('seller', 'name email phone createdAt verificationStatus')
        .populate('reviewedBy', 'name')
        .lean(),
      Verification.countDocuments(filter),
    ]);

    return paginatedResponse(res, list, page, limit, total);
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/verifications/:id/approve  (admin)
const approveVerification = async (req, res, next) => {
  try {
    const v = await Verification.findById(req.params.id).populate('seller');
    if (!v) return errorResponse(res, 404, 'Verification request not found.');
    if (v.status === 'approved') return errorResponse(res, 400, 'Already approved.');

    v.status = 'approved';
    v.rejectionReason = '';
    v.reviewedBy = req.user.id;
    v.reviewedAt = new Date();
    await v.save();

    await User.findByIdAndUpdate(v.seller._id, { verificationStatus: 'verified' });

    return successResponse(res, 200, 'Seller verification approved.', v);
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/verifications/:id/reject  (admin)
const rejectVerification = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason?.trim()) {
      return errorResponse(res, 400, 'Rejection reason is required.');
    }

    const v = await Verification.findById(req.params.id).populate('seller');
    if (!v) return errorResponse(res, 404, 'Verification request not found.');

    v.status = 'rejected';
    v.rejectionReason = rejectionReason.trim();
    v.reviewedBy = req.user.id;
    v.reviewedAt = new Date();
    await v.save();

    await User.findByIdAndUpdate(v.seller._id, { verificationStatus: 'rejected' });

    return successResponse(res, 200, 'Seller verification rejected.', v);
  } catch (error) {
    next(error);
  }
};

module.exports = { submitVerification, getMyStatus, getAllVerifications, approveVerification, rejectVerification };
