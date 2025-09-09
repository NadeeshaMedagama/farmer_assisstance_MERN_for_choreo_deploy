const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Security headers via helmet
const securityHeaders = helmet();

// CORS options
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
};

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth specific limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many auth attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Contact specific limiter
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

// Very small XSS mitigation by escaping angle brackets in string fields
function sanitizeStrings(obj) {
  if (!obj || typeof obj !== 'object') return;
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (typeof value === 'string') {
      obj[key] = value.replace(/[<>]/g, (m) => (m === '<' ? '&lt;' : '&gt;'));
    } else if (typeof value === 'object') {
      sanitizeStrings(value);
    }
  });
}

const xssProtection = (req, res, next) => {
  try {
    sanitizeStrings(req.body);
    sanitizeStrings(req.query);
    sanitizeStrings(req.params);
  } catch (_) {}
  next();
};

// Prevent HTTP Parameter Pollution by keeping only the first value of duplicates
const hppProtection = (req, res, next) => {
  ['query', 'body', 'params'].forEach((section) => {
    const src = req[section];
    if (!src || typeof src !== 'object') return;
    Object.keys(src).forEach((key) => {
      const val = src[key];
      if (Array.isArray(val)) {
        src[key] = val[0];
      }
    });
  });
  next();
};

// Basic Mongo injection mitigation: remove keys starting with $ or containing dots
function deepSanitize(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  Object.keys(obj).forEach((key) => {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
      return;
    }
    const val = obj[key];
    if (typeof val === 'object') deepSanitize(val);
  });
  return obj;
}

const mongoSanitization = (req, res, next) => {
  req.body = deepSanitize(req.body);
  req.query = deepSanitize(req.query);
  req.params = deepSanitize(req.params);
  next();
};

// Basic SQL injection protection for accidental SQL backends in future
const sqlInjectionPatterns = /(;|--|\/\*|\*\/|xp_)/i;
const sqlInjectionProtection = (req, res, next) => {
  const check = (val) => typeof val === 'string' && sqlInjectionPatterns.test(val);
  const scan = (obj) => {
    if (!obj || typeof obj !== 'object') return false;
    return Object.values(obj).some((v) => (typeof v === 'object' ? scan(v) : check(v)));
  };
  if (scan(req.body) || scan(req.query) || scan(req.params)) {
    return res.status(400).json({ success: false, message: 'Potentially malicious input detected' });
  }
  next();
};

// Content type validation for JSON APIs
const validateContentType = (req, res, next) => {
  const methodsNeedingJson = ['POST', 'PUT', 'PATCH'];
  if (methodsNeedingJson.includes(req.method)) {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      return res.status(415).json({ success: false, message: 'Content-Type must be application/json' });
    }
  }
  next();
};

// Request size limiting wrapper (Express body parser already enforces limits; this adds an extra guard)
const requestSizeLimit = (req, res, next) => {
  const contentLength = Number(req.headers['content-length'] || 0);
  const maxBytes = 10 * 1024 * 1024; // 10MB
  if (contentLength && contentLength > maxBytes) {
    return res.status(413).json({ success: false, message: 'Payload too large' });
  }
  next();
};

// Simple input validation example; extend as needed per route
const validateInput = [
  body('*').optional({ nullable: true }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

// Security logging
const securityLogging = (req, res, next) => {
  logger.info(`SECURITY: ${req.method} ${req.originalUrl} ip=${req.ip}`);
  next();
};

module.exports = {
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
};


