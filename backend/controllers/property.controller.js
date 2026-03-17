const Property = require('../models/Property');
const User = require('../models/User');
const { deleteFromCloudinary } = require('../config/cloudinary');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { buildPropertyFilter, buildSortObject, getPaginationParams } = require('../utils/helpers');
const { trackPropertyView, updateSearchHistory } = require('../services/recommendation.service');
const { suggestPrice } = require('../services/priceEngine.service');
const { createNotification } = require('../services/notification.service');
const { NOTIFICATION_TYPES } = require('../config/constants');

// Helper: map multer-saved files to { url, publicId } objects
const processImages = async (files) => {
  if (!files || files.length === 0) return [];
  return files.map((file) => ({
    url: `/uploads/properties/${file.filename}`,
    publicId: file.filename,
  }));
};

// @desc    Create a property listing
// @route   POST /api/v1/properties
// @access  Private (seller, verified)
const createProperty = async (req, res, next) => {
  try {
    const images = await processImages(req.files || []);

    const propertyData = {
      ...req.body,
      seller: req.user.id,
      images,
    };

    // Parse location if sent as JSON string
    if (typeof propertyData.location === 'string') {
      propertyData.location = JSON.parse(propertyData.location);
    }

    // Parse amenities if sent as JSON string or comma-separated
    if (typeof propertyData.amenities === 'string') {
      try {
        propertyData.amenities = JSON.parse(propertyData.amenities);
      } catch {
        propertyData.amenities = propertyData.amenities.split(',').map((a) => a.trim());
      }
    }

    const property = await Property.create(propertyData);
    await property.populate('seller', 'name email verificationStatus');

    // Notify admin
    const admins = await User.find({ role: 'admin' }).select('_id');
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'New Property Listed',
        `${req.user.name} listed a new property: "${property.title}"`,
        NOTIFICATION_TYPES.PROPERTY,
        property._id,
        'Property',
        `/admin/properties`
      );
    }

    return successResponse(res, 201, 'Property listed successfully!', property);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all properties (public, with filtering)
// @route   GET /api/v1/properties
// @access  Public
const getProperties = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { q, sort } = req.query;

    // Build base filter
    const filter = buildPropertyFilter(req.query);

    let query;
    const hasTextQuery = q && q.trim().length > 0;

    if (hasTextQuery) {
      const searchTerm = q.trim();

      // Try MongoDB full-text search first (covers title, description, tags)
      const textFilter = { ...filter, $text: { $search: searchTerm } };

      // Also build a regex-based fallback for fields not in text index
      // (address, city partial match, pincode)
      const regexTerm = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const regexFilter = {
        ...filter,
        $or: [
          { title: regexTerm },
          { description: regexTerm },
          { 'location.city': regexTerm },
          { 'location.address': regexTerm },
          { 'location.state': regexTerm },
          { 'location.pincode': regexTerm },
          { tags: regexTerm },
          { propertyType: regexTerm },
          { furnishing: regexTerm },
        ],
      };

      // Run both searches in parallel, merge and deduplicate
      const [textResults, regexResults] = await Promise.all([
        Property.find(textFilter, { score: { $meta: 'textScore' } })
          .sort({ score: { $meta: 'textScore' }, featured: -1, views: -1 })
          .limit(limit * 3)
          .populate('seller', 'name verificationStatus avatar')
          .lean(),
        Property.find(regexFilter)
          .sort({ featured: -1, views: -1, createdAt: -1 })
          .limit(limit * 3)
          .populate('seller', 'name verificationStatus avatar')
          .lean(),
      ]);

      // Merge: text results first (higher relevance), then fill with regex-only results
      const seen = new Set(textResults.map((p) => p._id.toString()));
      const merged = [
        ...textResults,
        ...regexResults.filter((p) => !seen.has(p._id.toString())),
      ];

      const total = merged.length;
      const paginated = merged.slice(skip, skip + limit);

      // Track search history
      if (req.user) {
        updateSearchHistory(req.user.id, searchTerm).catch(console.error);
      }

      return paginatedResponse(res, paginated, page, limit, total);
    }

    // No text query — standard filtered listing
    query = Property.find(filter);
    const sortObj = buildSortObject(sort);
    // Always surface featured properties first when no specific sort requested
    if (!sort || sort === 'newest') {
      sortObj.featured = -1;
    }

    const [properties, total] = await Promise.all([
      query
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate('seller', 'name verificationStatus avatar')
        .lean(),
      Property.countDocuments(filter),
    ]);

    return paginatedResponse(res, properties, page, limit, total);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single property
// @route   GET /api/v1/properties/:id
// @access  Public
const getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('seller', 'name email phone verificationStatus avatar createdAt')
      .lean();

    if (!property) {
      return errorResponse(res, 404, 'Property not found.');
    }

    // Track view and update count
    if (req.user) {
      trackPropertyView(req.user.id, property._id).catch(console.error);
    } else {
      Property.findByIdAndUpdate(property._id, { $inc: { views: 1 } }).exec();
    }

    // Attach price suggestion
    let priceSuggestion = null;
    try {
      priceSuggestion = await suggestPrice(
        property.location.city,
        property.propertyType,
        property.area,
        property.bedrooms
      );
    } catch {}

    return successResponse(res, 200, 'Property fetched successfully.', {
      ...property,
      priceSuggestion,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a property
// @route   PUT /api/v1/properties/:id
// @access  Private (seller, own)
const updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return errorResponse(res, 404, 'Property not found.');
    }

    if (property.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'You can only edit your own properties.');
    }

    const updateData = { ...req.body };

    // Parse location and amenities if needed
    if (typeof updateData.location === 'string') {
      updateData.location = JSON.parse(updateData.location);
    }
    if (typeof updateData.amenities === 'string') {
      try {
        updateData.amenities = JSON.parse(updateData.amenities);
      } catch {
        updateData.amenities = updateData.amenities.split(',').map((a) => a.trim());
      }
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = await processImages(req.files);
      updateData.images = [...(property.images || []), ...newImages];
    }

    property = await Property.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('seller', 'name verificationStatus');

    return successResponse(res, 200, 'Property updated successfully.', property);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a property
// @route   DELETE /api/v1/properties/:id
// @access  Private (seller, own)
const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return errorResponse(res, 404, 'Property not found.');
    }

    if (property.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'You can only delete your own properties.');
    }

    // Delete local image files
    for (const image of property.images) {
      if (image.publicId) {
        await deleteFromCloudinary(image.publicId).catch(console.error);
      }
    }

    await property.deleteOne();

    return successResponse(res, 200, 'Property deleted successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured properties (falls back to most-viewed if none are marked featured)
// @route   GET /api/v1/properties/featured
// @access  Public
const getFeaturedProperties = async (req, res, next) => {
  try {
    let properties = await Property.find({ status: 'active', featured: true })
      .sort({ views: -1, createdAt: -1 })
      .limit(9)
      .populate('seller', 'name verificationStatus avatar')
      .lean();

    // Fallback: if no admin-featured properties exist, surface the most-viewed active listings
    if (properties.length === 0) {
      properties = await Property.find({ status: 'active' })
        .sort({ views: -1, createdAt: -1 })
        .limit(9)
        .populate('seller', 'name verificationStatus avatar')
        .lean();
    }

    return successResponse(res, 200, 'Featured properties fetched.', properties);
  } catch (error) {
    next(error);
  }
};

// @desc    Get seller's own properties
// @route   GET /api/v1/properties/seller/listings
// @access  Private (seller)
const getSellerProperties = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    const filter = { seller: req.user.id };
    if (req.query.status) filter.status = req.query.status;

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Property.countDocuments(filter),
    ]);

    return paginatedResponse(res, properties, page, limit, total);
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby properties
// @route   GET /api/v1/properties/nearby
// @access  Public
const getNearbyProperties = async (req, res, next) => {
  try {
    const { lat, lng, distance = 10, limit = 10 } = req.query;

    if (!lat || !lng) {
      return errorResponse(res, 400, 'Please provide latitude and longitude.');
    }

    const distanceInMeters = parseFloat(distance) * 1000;

    const properties = await Property.find({
      status: 'active',
      'location.coordinates': {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: distanceInMeters,
        },
      },
    })
      .limit(parseInt(limit, 10))
      .populate('seller', 'name verificationStatus avatar')
      .lean();

    return successResponse(res, 200, 'Nearby properties fetched.', properties);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle featured status (admin)
// @route   PUT /api/v1/properties/:id/featured
// @access  Private (admin)
const toggleFeatured = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return errorResponse(res, 404, 'Property not found.');
    }

    property.featured = !property.featured;
    await property.save();

    return successResponse(
      res,
      200,
      `Property ${property.featured ? 'marked as featured' : 'removed from featured'}.`,
      property
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a specific image from a property
// @route   DELETE /api/v1/properties/:id/images/:imageId
// @access  Private (seller, own)
const deletePropertyImage = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return errorResponse(res, 404, 'Property not found.');
    }

    if (property.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'You can only edit your own properties.');
    }

    const imageIndex = property.images.findIndex(
      (img) => img._id.toString() === req.params.imageId
    );

    if (imageIndex === -1) {
      return errorResponse(res, 404, 'Image not found.');
    }

    const image = property.images[imageIndex];

    // Delete local file
    if (image.publicId) {
      await deleteFromCloudinary(image.publicId).catch(console.error);
    }

    property.images.splice(imageIndex, 1);
    await property.save();

    return successResponse(res, 200, 'Image deleted successfully.', property);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
  getSellerProperties,
  getNearbyProperties,
  toggleFeatured,
  deletePropertyImage,
};
