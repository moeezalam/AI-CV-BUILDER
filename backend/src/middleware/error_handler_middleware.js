// middleware/errorHandler.js
const logger = require('../utils/logger');

/**
 * Custom error classes
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

class ExternalServiceError extends AppError {
  constructor(message = 'External service error', service = 'unknown') {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR');
    this.service = service;
  }
}

/**
 * Error handler middleware
 * Centralized error handling for all routes
 */
const errorHandler = (err, req, res, next) => {
  // Don't log client errors (4xx) in production
  const shouldLog = err.statusCode >= 500 || process.env.NODE_ENV !== 'production';
  
  if (shouldLog) {
    logger.error('Error occurred', {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
      errorCode: err.errorCode,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      body: req.body,
      query: req.query,
      params: req.params
    });
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return handleValidationError(err, req, res);
  }

  if (err.name === 'CastError') {
    return handleCastError(err, req, res);
  }

  if (err.code === 11000) {
    return handleDuplicateError(err, req, res);
  }

  if (err.name === 'JsonWebTokenError') {
    return handleJWTError(err, req, res);
  }

  if (err.name === 'TokenExpiredError') {
    return handleJWTExpiredError(err, req, res);
  }

  if (err.name === 'MulterError') {
    return handleMulterError(err, req, res);
  }

  if (err.type === 'entity.parse.failed') {
    return handleJSONParseError(err, req, res);
  }

  // Handle operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.errorCode,
      details: err.details,
      ...(err.service && { service: err.service })
    });
  }

  // Handle unknown errors
  return handleUnknownError(err, req, res);
};

/**
 * Specific error handlers
 */
const handleValidationError = (err, req, res) => {
  const errors = Object.values(err.errors).map(error => ({
    field: error.path,
    message: error.message
  }));

  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    error: 'VALIDATION_ERROR',
    details: errors
  });
};

const handleCastError = (err, req, res) => {
  return res.status(400).json({
    success: false,
    message: `Invalid ${err.path}: ${err.value}`,
    error: 'INVALID_DATA'
  });
};

const handleDuplicateError = (err, req, res) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];

  return res.status(409).json({
    success: false,
    message: `${field} '${value}' already exists`,
    error: 'DUPLICATE_ENTRY'
  });
};

const handleJWTError = (err, req, res) => {
  return res.status(401).json({
    success: false,
    message: 'Invalid token',
    error: 'INVALID_TOKEN'
  });
};

const handleJWTExpiredError = (err, req, res) => {
  return res.status(401).json({
    success: false,
    message: 'Token expired',
    error: 'TOKEN_EXPIRED'
  });
};

const handleMulterError = (err, req, res) => {
  const errorMessages = {
    'LIMIT_FILE_SIZE': 'File size too large',
    'LIMIT_FILE_COUNT': 'Too many files',
    'LIMIT_FIELD_KEY': 'Field name too long',
    'LIMIT_FIELD_VALUE': 'Field value too long',
    'LIMIT_FIELD_COUNT': 'Too many fields',
    'LIMIT_UNEXPECTED_FILE': 'Unexpected file field'
  };

  const message = errorMessages[err.code] || 'File upload error';

  return res.status(400).json({
    success: false,
    message,
    error: 'FILE_UPLOAD_ERROR',
    details: { code: err.code }
  });
};

const handleJSONParseError = (err, req, res) => {
  return res.status(400).json({
    success: false,
    message: 'Invalid JSON format',
    error: 'INVALID_JSON'
  });
};

const handleUnknownError = (err, req, res) => {
  // Log unknown errors with full details
  logger.error('Unknown error occurred', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id
  });

  // In production, don't leak error details
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    });
  }

  // In development, provide detailed error information
  return res.status(500).json({
    success: false,
    message: err.message,
    error: 'INTERNAL_ERROR',
    stack: err.stack
  });
};

/**
 * 404 Error Handler
 * Handles routes that don't exist
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

/**
 * Async error wrapper
 * Catches errors in async route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Error response helper
 * Creates standardized error responses
 */
const createErrorResponse = (statusCode, message, errorCode, details = null) => {
  return {
    success: false,
    message,
    error: errorCode,
    timestamp: new Date().toISOString(),
    ...(details && { details })
  };
};

/**
 * Health check error handler
 * Specific error handling for health checks
 */
const healthCheckErrorHandler = (err, req, res, next) => {
  logger.error('Health check failed', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });

  return res.status(503).json({
    success: false,
    message: 'Service unavailable',
    error: 'SERVICE_UNAVAILABLE',
    timestamp: new Date().toISOString()
  });
};

/**
 * Global uncaught exception handler
 * Last resort error handling
 */
const handleUncaughtException = () => {
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    
    // Gracefully shut down the server
    process.exit(1);
  });
};

/**
 * Global unhandled promise rejection handler
 */
const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', {
      reason: reason.message || reason,
      stack: reason.stack,
      promise: promise.toString(),
      timestamp: new Date().toISOString()
    });
    
    // Gracefully shut down the server
    process.exit(1);
  });
};

/**
 * Error monitoring and alerting
 * Integrates with external monitoring services
 */
const monitorError = (err, req = null) => {
  // Here you could integrate with services like:
  // - Sentry
  // - Rollbar
  // - Bugsnag
  // - DataDog
  // - New Relic
  
  const errorData = {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    errorCode: err.errorCode,
    timestamp: new Date().toISOString(),
    ...(req && {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    })
  };

  // Example integration with external monitoring
  if (process.env.SENTRY_DSN) {
    // Sentry.captureException(err, errorData);
  }

  // Example Slack notification for critical errors
  if (err.statusCode >= 500 && process.env.SLACK_WEBHOOK_URL) {
    // sendSlackNotification(errorData);
  }

  return errorData;
};

/**
 * Error rate limiting
 * Prevents error spam
 */
const errorRateLimit = new Map();

const shouldLogError = (err, req) => {
  const key = `${err.message}-${req.ip}`;
  const now = Date.now();
  const lastLogged = errorRateLimit.get(key);

  // Log at most once per minute for the same error from the same IP
  if (lastLogged && now - lastLogged < 60000) {
    return false;
  }

  errorRateLimit.set(key, now);
  return true;
};

/**
 * Error metrics collection
 * Collects error statistics
 */
const errorMetrics = {
  totalErrors: 0,
  errorsByType: new Map(),
  errorsByStatusCode: new Map(),
  errorsByEndpoint: new Map()
};

const updateErrorMetrics = (err, req) => {
  errorMetrics.totalErrors++;
  
  // Track by error type
  const errorType = err.constructor.name;
  errorMetrics.errorsByType.set(errorType, (errorMetrics.errorsByType.get(errorType) || 0) + 1);
  
  // Track by status code
  const statusCode = err.statusCode || 500;
  errorMetrics.errorsByStatusCode.set(statusCode, (errorMetrics.errorsByStatusCode.get(statusCode) || 0) + 1);
  
  // Track by endpoint
  const endpoint = req.originalUrl;
  errorMetrics.errorsByEndpoint.set(endpoint, (errorMetrics.errorsByEndpoint.get(endpoint) || 0) + 1);
};

/**
 * Get error metrics
 */
const getErrorMetrics = () => {
  return {
    totalErrors: errorMetrics.totalErrors,
    errorsByType: Object.fromEntries(errorMetrics.errorsByType),
    errorsByStatusCode: Object.fromEntries(errorMetrics.errorsByStatusCode),
    errorsByEndpoint: Object.fromEntries(errorMetrics.errorsByEndpoint)
  };
};

/**
 * Enhanced error handler with monitoring
 */
const enhancedErrorHandler = (err, req, res, next) => {
  // Update error metrics
  updateErrorMetrics(err, req);
  
  // Monitor error
  monitorError(err, req);
  
  // Check if we should log this error
  if (shouldLogError(err, req)) {
    // Use the original error handler
    return errorHandler(err, req, res, next);
  }
  
  // Still respond to the client even if we don't log
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.errorCode,
      details: err.details
    });
  }
  
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: 'INTERNAL_ERROR'
  });
};

module.exports = {
  // Error classes
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  
  // Error handlers
  errorHandler,
  enhancedErrorHandler,
  notFoundHandler,
  healthCheckErrorHandler,
  
  // Utilities
  asyncHandler,
  createErrorResponse,
  handleUncaughtException,
  handleUnhandledRejection,
  getErrorMetrics,
  monitorError
};
  