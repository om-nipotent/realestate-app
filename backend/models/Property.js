const mongoose = require('mongoose');
const { PROPERTY_STATUS, PROPERTY_TYPES, FURNISHING_STATUS } = require('../config/constants');

const PropertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      minlength: [10, 'Title must be at least 10 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [30, 'Description must be at least 30 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be greater than 0'],
    },
    pricePerSqft: {
      type: Number,
      default: 0,
    },
    area: {
      type: Number,
      required: [true, 'Area is required'],
      min: [1, 'Area must be greater than 0'],
    },
    propertyType: {
      type: String,
      required: [true, 'Property type is required'],
      enum: {
        values: PROPERTY_TYPES,
        message: `Property type must be one of: ${PROPERTY_TYPES.join(', ')}`,
      },
    },
    status: {
      type: String,
      enum: Object.values(PROPERTY_STATUS),
      default: PROPERTY_STATUS.ACTIVE,
    },
    bedrooms: {
      type: Number,
      required: [true, 'Number of bedrooms is required'],
      min: [0, 'Bedrooms cannot be negative'],
      max: [50, 'Bedrooms cannot exceed 50'],
    },
    bathrooms: {
      type: Number,
      required: [true, 'Number of bathrooms is required'],
      min: [0, 'Bathrooms cannot be negative'],
      max: [50, 'Bathrooms cannot exceed 50'],
    },
    floors: {
      type: Number,
      default: 1,
      min: [1, 'Floors must be at least 1'],
    },
    furnishing: {
      type: String,
      enum: Object.values(FURNISHING_STATUS),
      default: FURNISHING_STATUS.UNFURNISHED,
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
      },
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller reference is required'],
    },
    location: {
      address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        lowercase: true,
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
      },
      country: {
        type: String,
        default: 'India',
        trim: true,
      },
      pincode: {
        type: String,
        required: [true, 'Pincode is required'],
        match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode'],
      },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [0, 0],
        },
      },
    },
    views: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    soldAt: {
      type: Date,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Geospatial index
PropertySchema.index({ 'location.coordinates': '2dsphere' });

// Text search index
PropertySchema.index({
  title: 'text',
  description: 'text',
  'location.address': 'text',
  'location.city': 'text',
  tags: 'text',
});

// Compound indexes for filtering
PropertySchema.index({ 'location.city': 1, propertyType: 1, status: 1, price: 1 });
PropertySchema.index({ seller: 1, status: 1 });
PropertySchema.index({ status: 1, featured: 1, views: -1 });
PropertySchema.index({ createdAt: -1 });

// Pre-save: calculate price per sqft
PropertySchema.pre('save', function (next) {
  if (this.price && this.area && this.area > 0) {
    this.pricePerSqft = Math.round(this.price / this.area);
  }
  next();
});

// Virtual: formatted price
PropertySchema.virtual('formattedPrice').get(function () {
  if (!this.price) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(this.price);
});

module.exports = mongoose.model('Property', PropertySchema);
