'use strict';

const express = require('express');
const router = express.Router();
const { predictProperty } = require('../controllers/prediction.controller');

// POST /api/v1/predict-property — public, no auth required
router.post('/predict-property', predictProperty);

module.exports = router;
