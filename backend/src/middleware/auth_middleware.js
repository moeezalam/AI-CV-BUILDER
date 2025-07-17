const jwt = require('jsonwebtoken');
const { AuthenticationError, AuthorizationError } = require('./error_handler_middleware');

/**
 * Basic authentication middleware (optional for this project)
 * Since this is a demo project, we'll make it optional
 */
const authenticate = (req, res, next) => {
  // For now, we'll skip authentication in development
  if (process.env.NODE_ENV === 'development') {
    req.user = { id: 'demo-user', email: 'demo@example.com' };
    return next();
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AuthenticationError('No token provided'));
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AuthenticationError('Token expired'));
    }
    return next(new AuthenticationError('Invalid token'));
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    req.user = decoded;
  } catch (error) {
    req.user = null;
  }
  
  next();
};

/**
 * Authorization middleware
 * @param {string[]} roles - Required roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return next(new AuthorizationError('Insufficient permissions'));
    }

    next();
  };
};

/**
 * Rate limiting per user
 */
const userRateLimit = new Map();

const rateLimitByUser = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!userRateLimit.has(userId)) {
      userRateLimit.set(userId, []);
    }

    const userRequests = userRateLimit.get(userId);
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        error: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    recentRequests.push(now);
    userRateLimit.set(userId, recentRequests);
    
    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  rateLimitByUser
};