const express = require('express');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const cropRoutes = require('./routes/crop');
const forumRoutes = require('./routes/forum');
const weatherRoutes = require('./routes/weather');
const marketRoutes = require('./routes/market');
const notificationRoutes = require('./routes/notification');
const purchaseRoutes = require('./routes/purchase');
const oidcRoutes = require('./routes/oidc');
// Additional/new routes
const contactRoutes = require('./routes/contact');
const subscribeRouter = require('./routes/subscribe');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orderRoutes');
const demoRoutes = require('./routes/demo');
const registrationRoutes = require('./routes/registration');
const trialRoutes = require('./routes/trial');
const consultationRoutes = require('./routes/consultation');
const communityRoutes = require('./routes/community');
// Subscription and Payment routes
const subscriptionPlanRoutes = require('./routes/subscriptionPlan');
const subscriptionRoutes = require('./routes/subscription');
const paymentRoutes = require('./routes/payment');
// Admin routes
const adminRoutes = require('./routes/admin');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const auditLogger = require('./utils/auditLogger');
const {
  generalLimiter,
  authLimiter,
  contactLimiter,
  securityHeaders,
  xssProtection,
  hppProtection,
  mongoSanitization,
  corsOptions,
  validateInput,
  sqlInjectionProtection,
  validateContentType,
  requestSizeLimit,
  securityLogging,
} = require('./middleware/securityMiddleware');

const fs = require('fs');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 5000;
const httpsFlag = (process.env.HTTPS_ENABLE || process.env.HTTPS_ENABLED || 'false');
const HTTPS_ENABLE = (httpsFlag || 'false').toLowerCase() === 'true';
const SSL_KEY_PATH = process.env.SSL_KEY_PATH;
const SSL_CERT_PATH = process.env.SSL_CERT_PATH;

// Connect to MongoDB (optional during local boot)
if (process.env.SKIP_DB === 'true') {
  logger.warn('Skipping MongoDB connection (SKIP_DB=true)');
} else {
  connectDB();
}

// Security middleware
app.use(securityHeaders);
app.use(compression());
app.use(xssProtection);
app.use(hppProtection);
app.use(mongoSanitization);
app.use(validateInput);
app.use(sqlInjectionProtection);
app.use(requestSizeLimit);
app.use(securityLogging);

// Rate limiting (general)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);
// Optional extra general limiter
app.use(generalLimiter);

// CORS configuration
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: (process.env.NODE_ENV || 'development') === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Farmer Assistance API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not Configured'
  });
});

// API routes
// Minimal audit middleware wrapper for auth routes
app.use('/api/auth', (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      auditLogger.authSuccess(req, { route: '/api/auth' });
    } else if (res.statusCode === 401 || res.statusCode === 403) {
      auditLogger.authFailure(req, `status=${res.statusCode}`);
    }
  });
  next();
}, authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/weather', validateContentType, weatherRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/oidc', oidcRoutes);
// Sensitive write operations audit wrappers (examples; expand as needed)
app.use('/api/orders', (req, res, next) => {
  res.on('finish', () => {
    if (req.method !== 'GET') {
      auditLogger.sensitiveAction(req, 'orders.modify', { method: req.method, status: res.statusCode });
    }
  });
  next();
}, validateContentType, orderRoutes);
// Newly added routes with specific protections
app.use('/api/contact', contactLimiter, contactRoutes);
app.use('/api/subscribe', validateContentType, subscribeRouter);
app.use('/api/products', validateContentType, productRoutes);
app.use('/api/cart', validateContentType, cartRoutes);
app.use('/api/demo', validateContentType, demoRoutes);
app.use('/api/register', validateContentType, registrationRoutes);
app.use('/api/trial', validateContentType, trialRoutes);
app.use('/api/consultations', validateContentType, consultationRoutes);
app.use('/api/community', validateContentType, communityRoutes);
// Subscription and Payment routes
app.use('/api/subscription-plans', validateContentType, subscriptionPlanRoutes);
app.use('/api/subscriptions', validateContentType, subscriptionRoutes);
app.use('/api/payments', validateContentType, paymentRoutes);
// Admin routes (with enhanced security and audit logging)
app.use('/api/admin', (req, res, next) => {
  res.on('finish', () => {
    if (req.method !== 'GET') {
      auditLogger.sensitiveAction(req, 'admin.action', { 
        method: req.method, 
        route: req.route?.path || req.path,
        status: res.statusCode 
      });
    } else {
      auditLogger.sensitiveAction(req, 'admin.view', { 
        route: req.route?.path || req.path,
        status: res.statusCode 
      });
    }
  });
  next();
}, validateContentType, adminRoutes);

// Static assets in production
if ((process.env.NODE_ENV || 'development') === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'))
  );
}

// 404 handler (Express 5 compatible)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use(errorHandler);

// Start server (HTTP or HTTPS) with captured server instance
let server;
if (HTTPS_ENABLE && SSL_KEY_PATH && SSL_CERT_PATH && fs.existsSync(SSL_KEY_PATH) && fs.existsSync(SSL_CERT_PATH)) {
  const key = fs.readFileSync(SSL_KEY_PATH);
  const cert = fs.readFileSync(SSL_CERT_PATH);
  server = https.createServer({ key, cert }, app).listen(PORT, () => {
    logger.info(`🔐 HTTPS server running on port ${PORT}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🌐 Health check: https://localhost:${PORT}/health`);
  });
} else {
  if (HTTPS_ENABLE) {
    logger.warn('HTTPS requested but SSL_KEY_PATH/SSL_CERT_PATH not found. Falling back to HTTP.');
  }
  server = app.listen(PORT, () => {
    logger.info(`🚀 HTTP server running on port ${PORT}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🌐 Health check: http://localhost:${PORT}/health`);
  });
}

// Server error handling
server.on('error', (error) => {
  if (error && error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Please free the port and retry.`);
    process.exit(1);
  }
  logger.error('Server error', error);
  process.exit(1);
});

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  if (server && server.close) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;
