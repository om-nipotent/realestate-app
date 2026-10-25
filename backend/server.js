const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const path = require('path');

const connectDB = require('./config/database');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const { initSocket } = require('./socket/socket');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const propertyRoutes = require('./routes/property.routes');
const verificationRoutes = require('./routes/verification.routes');
const inquiryRoutes = require('./routes/inquiry.routes');
const visitRoutes = require('./routes/visit.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const adminRoutes = require('./routes/admin.routes');
const predictionRoutes = require('./routes/prediction.routes');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = [
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(u => u.trim()) : []),
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// ─── General Middleware ───────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize()); // Prevent MongoDB injection
app.use(xssClean()); // Prevent XSS attacks

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use('/api/', generalLimiter);

// ─── Static Files (local dev only — Vercel filesystem is read-only) ─────────
if (!process.env.VERCEL) {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'RealState Platform API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/verifications', verificationRoutes);
app.use('/api/v1/inquiries', inquiryRoutes);
app.use('/api/v1/visits', visitRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1', predictionRoutes);

// ─── Serve Frontend & 404 Handler ───────────────────────────────────────────
if (!process.env.VERCEL) {
  // On Vercel, static files are served by the CDN (vercel.json outputDirectory).
  // Locally, serve the built frontend.
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        error: `Route not found: ${req.method} ${req.originalUrl}`,
      });
    }
    res.sendFile(path.resolve(frontendPath, 'index.html'));
  });
} else {
  // On Vercel: only handle API 404s (frontend is served by CDN)
  app.all('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });
}

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database (non-fatal — prediction route works without DB)
    await connectDB();
  } catch (error) {
    console.warn('⚠️  MongoDB unavailable — DB-dependent routes disabled. Prediction engine still active.');
  }

  // Initialize Socket.io (not supported on Vercel serverless)
  if (!process.env.VERCEL) {
    try { initSocket(server); } catch (_) {}
  }

  // Start HTTP server
  server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   🏠 RealState Platform API Server    ║
║   Mode: ${process.env.NODE_ENV?.padEnd(31)}║
║   Port: ${String(PORT).padEnd(31)}║
║   URL:  http://localhost:${PORT}         ║
╚════════════════════════════════════════╝
    `);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});

if (process.env.VERCEL) {
  // On Vercel, don't listen on a port. Just connect DB.
  connectDB().catch(err => console.error('MongoDB connection error on Vercel:', err));
} else {
  startServer();
}

module.exports = app;
