const express = require('express');
const router = express.Router();
const {
  requestVisit,
  getBuyerVisits,
  getSellerVisits,
  respondToVisit,
  cancelVisit,
  completeVisit,
} = require('../controllers/visit.controller');
const { protect } = require('../middleware/auth');
const { authorize, isVerified } = require('../middleware/roleCheck');
const { visitValidation } = require('../utils/validators');

router.post('/', protect, authorize('buyer'), isVerified, visitValidation, requestVisit);
router.get('/buyer', protect, authorize('buyer'), getBuyerVisits);
router.get('/seller', protect, authorize('seller'), getSellerVisits);
router.put('/:id/respond', protect, authorize('seller'), respondToVisit);
router.put('/:id/cancel', protect, authorize('buyer'), cancelVisit);
router.put('/:id/complete', protect, authorize('seller'), completeVisit);

module.exports = router;
