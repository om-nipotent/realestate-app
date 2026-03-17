const { body, query, param, validationResult } = require('express-validator');
const { PROPERTY_TYPES } = require('../config/constants');

// Handle validation errors middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Register validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/).withMessage('Phone must be a 10-digit number'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),

  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['buyer', 'seller']).withMessage('Role must be buyer or seller'),

  handleValidationErrors,
];

// Login validation rules
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),

  body('password')
    .notEmpty().withMessage('Password is required'),

  handleValidationErrors,
];

// Property validation rules
const propertyValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 10, max: 200 }).withMessage('Title must be 10-200 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 30, max: 5000 }).withMessage('Description must be 30-5000 characters'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 1 }).withMessage('Price must be a positive number'),

  body('area')
    .notEmpty().withMessage('Area is required')
    .isFloat({ min: 1 }).withMessage('Area must be a positive number'),

  body('propertyType')
    .notEmpty().withMessage('Property type is required')
    .isIn(PROPERTY_TYPES).withMessage(`Property type must be one of: ${PROPERTY_TYPES.join(', ')}`),

  body('bedrooms')
    .notEmpty().withMessage('Number of bedrooms is required')
    .isInt({ min: 0, max: 50 }).withMessage('Bedrooms must be between 0 and 50'),

  body('bathrooms')
    .notEmpty().withMessage('Number of bathrooms is required')
    .isInt({ min: 0, max: 50 }).withMessage('Bathrooms must be between 0 and 50'),

  body('location.address')
    .trim()
    .notEmpty().withMessage('Address is required'),

  body('location.city')
    .trim()
    .notEmpty().withMessage('City is required'),

  body('location.state')
    .trim()
    .notEmpty().withMessage('State is required'),

  body('location.pincode')
    .trim()
    .notEmpty().withMessage('Pincode is required')
    .matches(/^[0-9]{6}$/).withMessage('Pincode must be a 6-digit number'),

  handleValidationErrors,
];

// Inquiry validation
const inquiryValidation = [
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Message must be 10-1000 characters'),

  body('contactPhone')
    .trim()
    .notEmpty().withMessage('Contact phone is required')
    .matches(/^[0-9]{10}$/).withMessage('Phone must be a 10-digit number'),

  handleValidationErrors,
];

// Visit validation
const visitValidation = [
  body('requestedDate')
    .notEmpty().withMessage('Requested date is required')
    .isISO8601().withMessage('Please provide a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Visit date must be in the future');
      }
      return true;
    }),

  body('requestedTime')
    .trim()
    .notEmpty().withMessage('Requested time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Please provide a valid time (HH:MM)'),

  handleValidationErrors,
];

// Password reset validation
const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),

  handleValidationErrors,
];

const resetPasswordValidation = [
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),

  handleValidationErrors,
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('New password must contain at least one number'),

  handleValidationErrors,
];

module.exports = {
  registerValidation,
  loginValidation,
  propertyValidation,
  inquiryValidation,
  visitValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
  handleValidationErrors,
};
