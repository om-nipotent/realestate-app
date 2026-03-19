'use strict';

const { predict } = require('../services/predictionEngine');

/**
 * POST /api/v1/predict-property
 * Body: { city, propertyType, price, area, bedrooms?, amenities?[] }
 */
const predictProperty = async (req, res) => {
  try {
    const { city, propertyType, price, area, bedrooms, amenities } = req.body;

    // ── Input Validation ──────────────────────────────────────────────────
    const errors = [];
    if (!city || typeof city !== 'string' || city.trim().length < 2)
      errors.push('city is required (min 2 characters)');
    if (!propertyType || typeof propertyType !== 'string')
      errors.push('propertyType is required');
    if (!price || isNaN(Number(price)) || Number(price) <= 0)
      errors.push('price must be a positive number');
    if (!area || isNaN(Number(area)) || Number(area) <= 0)
      errors.push('area must be a positive number (sqft)');

    if (errors.length) {
      return res.status(400).json({ success: false, errors });
    }

    // ── Normalize Inputs ──────────────────────────────────────────────────
    const normalized = {
      city:         city.trim().toLowerCase(),
      propertyType: propertyType.trim().toLowerCase(),
      price:        Number(price),
      area:         Number(area),
      bedrooms:     bedrooms ? Number(bedrooms) : 2,
      amenities:    Array.isArray(amenities)
                      ? amenities.filter(Boolean).map(a => String(a).toLowerCase().trim())
                      : [],
    };

    // ── Run Prediction Engine ─────────────────────────────────────────────
    const result = predict(normalized);

    return res.status(200).json(result);
  } catch (err) {
    console.error('[PredictionController] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Prediction engine error. Please try again.',
    });
  }
};

module.exports = { predictProperty };
