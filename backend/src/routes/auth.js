const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, optionalAuth } = require('../middleware/auth_middleware');
const { validateRequest } = require('../middleware/validation_middleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    success: false,
    message: 'Too many failed attempts, please try again later.',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes (no authentication required)

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', 
  authLimiter,
  validateRequest('userRegistration'),
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', 
  authLimiter,
  validateRequest('userLogin'),
  authController.login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify email address
 * @access  Public
 */
router.get('/verify-email/:token', authController.verifyEmail);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', 
  strictAuthLimiter,
  validateRequest('passwordResetRequest'),
  authController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', 
  strictAuthLimiter,
  validateRequest('passwordReset'),
  authController.resetPassword
);

/**
 * @route   POST /api/auth/check-email
 * @desc    Check if email exists
 * @access  Public
 */
router.post('/check-email', 
  validateRequest('emailCheck'),
  authController.checkEmail
);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 */
router.post('/resend-verification', 
  authLimiter,
  validateRequest('emailCheck'),
  authController.resendVerification
);

// Protected routes (authentication required)

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', optionalAuth, authController.logout);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post('/logout-all', authenticate, authController.logoutAll);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', 
  authenticate,
  validateRequest('profileUpdate'),
  authController.updateProfile
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password (for authenticated users)
 * @access  Private
 */
router.post('/change-password', 
  authenticate,
  strictAuthLimiter,
  validateRequest('passwordChange'),
  authController.changePassword
);

// Admin routes

/**
 * @route   GET /api/auth/stats
 * @desc    Get user statistics
 * @access  Private (Admin only)
 */
router.get('/stats', authenticate, authController.getUserStats);

/**
 * @route   GET /api/auth/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get('/users', authenticate, authController.getAllUsers);

// Development/Testing routes

/**
 * @route   GET /api/auth/test-email
 * @desc    Test email configuration
 * @access  Development only
 */
if (process.env.NODE_ENV !== 'production') {
  router.get('/test-email', authController.testEmail);
}

module.exports = router;