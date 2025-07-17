const authService = require('../services/authService');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/error_handler_middleware');

class AuthController {
  /**
   * Register a new user
   * @route POST /api/auth/register
   */
  register = asyncHandler(async (req, res) => {
    const { email, password, confirmPassword, firstName, lastName } = req.body;

    logger.info('User registration attempt', { email });

    const result = await authService.register({
      email,
      password,
      confirmPassword,
      firstName,
      lastName
    });

    // Send welcome email after successful registration
    try {
      await emailService.sendWelcomeEmail(result.user.email, result.user.firstName);
    } catch (emailError) {
      logger.warn('Failed to send welcome email', {
        userId: result.user.id,
        error: emailError.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: result
    });
  });

  /**
   * Login user
   * @route POST /api/auth/login
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    logger.info('User login attempt', { email });

    const result = await authService.login({ email, password });

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    });
  });

  /**
   * Refresh access token
   * @route POST /api/auth/refresh
   */
  refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    const result = await authService.refreshToken(refreshToken);

    // Update refresh token cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    });
  });

  /**
   * Logout user
   * @route POST /api/auth/logout
   */
  logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    await authService.logout(refreshToken);

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logout successful'
    });
  });

  /**
   * Logout from all devices
   * @route POST /api/auth/logout-all
   */
  logoutAll = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    await authService.logoutAll(userId);

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out from all devices successfully'
    });
  });

  /**
   * Verify email address
   * @route GET /api/auth/verify-email/:token
   */
  verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;

    const user = await authService.verifyEmail(token);

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: { user }
    });
  });

  /**
   * Request password reset
   * @route POST /api/auth/forgot-password
   */
  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    logger.info('Password reset requested', { email });

    await authService.requestPasswordReset(email);

    res.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.'
    });
  });

  /**
   * Reset password
   * @route POST /api/auth/reset-password
   */
  resetPassword = asyncHandler(async (req, res) => {
    const { token, password, confirmPassword } = req.body;

    const user = await authService.resetPassword({
      token,
      password,
      confirmPassword
    });

    // Send password changed notification
    try {
      await emailService.sendPasswordChangedEmail(user.email, user.firstName);
    } catch (emailError) {
      logger.warn('Failed to send password changed email', {
        userId: user.id,
        error: emailError.message
      });
    }

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.',
      data: { user }
    });
  });

  /**
   * Change password (for authenticated users)
   * @route POST /api/auth/change-password
   */
  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    // Validate confirm password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    await authService.changePassword(userId, currentPassword, newPassword);

    // Send password changed notification
    try {
      await emailService.sendPasswordChangedEmail(req.user.email, req.user.firstName);
    } catch (emailError) {
      logger.warn('Failed to send password changed email', {
        userId: req.user.id,
        error: emailError.message
      });
    }

    // Clear refresh token cookie to force re-login
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again with your new password.'
    });
  });

  /**
   * Get current user profile
   * @route GET /api/auth/me
   */
  getProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await authService.getUserProfile(userId);

    res.json({
      success: true,
      data: { user }
    });
  });

  /**
   * Update user profile
   * @route PUT /api/auth/profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { firstName, lastName } = req.body;

    const user = await authService.updateUserProfile(userId, {
      firstName,
      lastName
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  });

  /**
   * Resend email verification
   * @route POST /api/auth/resend-verification
   */
  resendVerification = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Find user by email (this would be a method in authService)
    const user = authService.findUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    
    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationToken);

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  });

  /**
   * Check if email exists
   * @route POST /api/auth/check-email
   */
  checkEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = authService.findUserByEmail(email);

    res.json({
      success: true,
      data: {
        exists: !!user,
        verified: user ? user.isEmailVerified : false
      }
    });
  });

  /**
   * Get user statistics (admin only)
   * @route GET /api/auth/stats
   */
  getUserStats = asyncHandler(async (req, res) => {
    // Check if user is admin
    if (!req.user.isAdmin()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const stats = await authService.getUserStats();

    res.json({
      success: true,
      data: stats
    });
  });

  /**
   * Get all users (admin only)
   * @route GET /api/auth/users
   */
  getAllUsers = asyncHandler(async (req, res) => {
    // Check if user is admin
    if (!req.user.isAdmin()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { isActive, role, isEmailVerified } = req.query;
    
    const filters = {};
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (role) filters.role = role;
    if (isEmailVerified !== undefined) filters.isEmailVerified = isEmailVerified === 'true';

    const users = await authService.getAllUsers(filters);

    res.json({
      success: true,
      data: {
        users,
        count: users.length
      }
    });
  });

  /**
   * Test email configuration
   * @route GET /api/auth/test-email
   */
  testEmail = asyncHandler(async (req, res) => {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Email testing not available in production'
      });
    }

    const isConfigured = await emailService.testConfiguration();

    res.json({
      success: true,
      data: {
        emailConfigured: isConfigured,
        message: isConfigured ? 'Email service is working' : 'Email service is not configured'
      }
    });
  });
}

module.exports = new AuthController();