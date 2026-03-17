const mongoose = require('mongoose');
const { VISIT_STATUS } = require('../config/constants');

const VisitSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestedDate: {
      type: Date,
      required: [true, 'Requested visit date is required'],
    },
    requestedTime: {
      type: String,
      required: [true, 'Requested visit time is required'],
    },
    alternateDate: {
      type: Date,
    },
    alternateTime: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(VISIT_STATUS),
      default: VISIT_STATUS.PENDING,
    },
    sellerNotes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    buyerNotes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    confirmedDate: {
      type: Date,
    },
    confirmedTime: {
      type: String,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

VisitSchema.index({ property: 1, buyer: 1 });
VisitSchema.index({ seller: 1, status: 1 });
VisitSchema.index({ buyer: 1, status: 1 });
VisitSchema.index({ requestedDate: 1 });

module.exports = mongoose.model('Visit', VisitSchema);
