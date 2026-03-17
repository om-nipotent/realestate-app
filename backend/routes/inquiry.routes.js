const express = require('express');
const router = express.Router();
const {
  sendInquiry,
  getBuyerInquiries,
  getSellerInquiries,
  replyToInquiry,
  markInquiryRead,
} = require('../controllers/inquiry.controller');
const { protect } = require('../middleware/auth');
const { authorize, isVerified } = require('../middleware/roleCheck');
const { inquiryValidation } = require('../utils/validators');

router.post('/', protect, authorize('buyer'), isVerified, inquiryValidation, sendInquiry);
router.get('/buyer', protect, authorize('buyer'), getBuyerInquiries);
router.get('/seller', protect, authorize('seller'), getSellerInquiries);
router.put('/:id/reply', protect, authorize('seller'), replyToInquiry);
router.put('/:id/read', protect, authorize('seller'), markInquiryRead);

module.exports = router;
