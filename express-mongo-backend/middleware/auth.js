const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const auditLogger = require('../utils/auditLogger');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        auditLogger.authFailure(req, 'user_not_found');
        return res.status(401).json({
          success: false,
          message: 'No user found with this token'
        });
      }

      auditLogger.authSuccess(req, { userId: req.user.id || req.user._id });
      next();
    } catch (error) {
      logger.error('Token verification failed:', error);
      auditLogger.authFailure(req, 'token_invalid');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    if (!roles.includes(req.user.role)) {
      auditLogger.accessDenied(req, `role=${req.user.role}`);
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
