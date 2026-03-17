const express = require('express');
const router = express.Router();
const { submitVerification, getMyStatus, getAllVerifications, approveVerification, rejectVerification } = require('../controllers/verification.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { uploadVerificationDocs } = require('../middleware/upload');

router.post('/submit', protect, authorize('seller', 'buyer'), uploadVerificationDocs, submitVerification);
router.get('/my-status', protect, getMyStatus);
router.get('/', protect, authorize('admin'), getAllVerifications);
router.put('/:id/approve', protect, authorize('admin'), approveVerification);
router.put('/:id/reject', protect, authorize('admin'), rejectVerification);

module.exports = router;
