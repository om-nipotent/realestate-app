const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    userRole: {
      type: String,
      enum: ['seller', 'buyer'],
      default: 'seller',
    },
    aadharNumber: {
      type: String,
      required: true,
      trim: true,
    },
    documents: {
      aadharCard: {
        url: { type: String, required: true },
        filename: { type: String, default: '' },
      },
      selfieWithAadhar: {
        url: { type: String, required: true },
        filename: { type: String, default: '' },
      },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: { type: Date },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Verification', VerificationSchema);
