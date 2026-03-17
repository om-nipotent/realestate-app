const rateLimit = require('express-rate-limit');

// General API rate limiter — 500 requests per 10 minutes
const generalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 10 minutes.',
  },
  skip: (req) => req.method === 'OPTIONS',
});

// Auth rate limiter — 50 requests per 15 minutes (login/register protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

// Upload rate limiter — 50 requests per hour
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many file uploads. Please try again after 1 hour.',
  },
});

// Strict limiter for sensitive endpoints (forgot password) — 20 per hour
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please try again after 1 hour.',
  },
});

module.exports = { generalLimiter, authLimiter, uploadLimiter, strictLimiter };
