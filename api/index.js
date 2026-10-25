/**
 * Vercel Serverless Function Entry Point
 * ─────────────────────────────────────────
 * Wraps the Express app from backend/server.js for Vercel's
 * serverless runtime. Vercel invokes this as a Node.js function
 * on every request that matches the rewrites in vercel.json.
 */
const app = require('../backend/server');

module.exports = app;
