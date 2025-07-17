const User = require('../models/User');
const emailService = require('./emailService');
const logger = require('../utils/logger');
const { 
  ValidationError, 
  AuthenticationError, 
  ConflictError,
  NotFoundError 
} = require('../middleware/error_handler_middleware');

class AuthService {
  constructor() {
    // In-memory user storage (replace with database in production)
    this.users = new Map();
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User data with tokens
   */
  async register(userData) {
    try {
      // Validate input data
      const { error, value } = User.getRegistrationSchema().validate(userData);
      if (error) {
        throw new ValidationError('Registration validation failed', error.details);
      }

      const { email, password, firstName, lastName } = value;

      // Check if user already exists
      const existingUser = this.findUserByEmail(email);
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Create new user
      const user = new User({
        email: email.toLowerCase(),
        firstName,
        lastName
      });

      // Hash password
      await user.hashPassword(password);

      // Generate email verification token
      const verificationToken = user.generateEmailVerificationToken();

      // Store user
      this.users.set(user.id, user);

      logger.info('User registered successfully', {
        userId: user.id,
        email: user.email
      });

      // Send verification email (if email service is configured)
      try {
        await emailService.sendVerificationEmail(user.email, verificationToken);
      } catch (emailError) {
        logger.warn('Failed to send verification email', {
          userId: user.id,
          error: emailError.message
        });
      }

      // Return user data with tokens
      return user.toAuthJSON();

    } catch (error) {
      logger.error('User registration failed', {
        email: userData.email,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Login user
   * @param {Object} loginData - Login credentials
   * @returns {Promise<Object>} User data with tokens
   */
  async login(loginData) {
    try {
      // Validate input data
      const { error, value } = User.getLoginSchema().validate(loginData);
      if (error) {
        throw new ValidationError('Login validation failed', error.details);
      }

      const { email, password } = value;

      // Find user by email
      const user = this.findUserByEmail(email);
      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check if account is locked
      if (user.isAccountLocked()) {
        const lockTimeRemaining = Math.ceil((user.lockUntil - new Date()) / (1000 * 60));
        throw new AuthenticationError(
          `Account is locked due to too many failed login attempts. Try again in ${lockTimeRemaining} minutes.`
        );
      }

      // Check if account is active
      if (!user.isActive) {
        throw new AuthenticationError('Account is deactivated. Please contact support.');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        user.handleFailedLogin();
        this.users.set(user.id, user);
        
        throw new AuthenticationError('Invalid email or password');
      }

      // Handle successful login
      user.handleSuccessfulLogin();
      this.users.set(user.id, user);

      logger.info('User logged in successfully', {
        userId: user.id,
        email: user.email
      });

      // Return user data with tokens
      return user.toAuthJSON();

    } catch (error) {
      logger.error('User login failed', {
        email: loginData.email,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New tokens
   */
  async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new AuthenticationError('Refresh token is required');
      }

      // Find user by refresh token
      const user = this.findUserByRefreshToken(refreshToken);
      if (!user) {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Verify refresh token
      const decoded = user.verifyRefreshToken(refreshToken);
      if (!decoded) {
        throw new AuthenticationError('Invalid or expired refresh token');
      }

      // Check if user is still active
      if (!user.isActive) {
        throw new AuthenticationError('Account is deactivated');
      }

      // Generate new tokens
      const tokens = user.generateTokens();
      this.users.set(user.id, user);

      logger.info('Token refreshed successfully', {
        userId: user.id,
        email: user.email
      });

      return {
        user: user.toJSON(),
        ...tokens
      };

    } catch (error) {
      logger.error('Token refresh failed', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Logout user (revoke refresh token)
   * @param {string} refreshToken - Refresh token to revoke
   * @returns {Promise<boolean>} Success status
   */
  async logout(refreshToken) {
    try {
      if (!refreshToken) {
        return true; // Already logged out
      }

      const user = this.findUserByRefreshToken(refreshToken);
      if (user) {
        // Decode token to get tokenId
        const decoded = user.verifyRefreshToken(refreshToken);
        if (decoded) {
          user.revokeRefreshToken(decoded.tokenId);
          this.users.set(user.id, user);
        }

        logger.info('User logged out successfully', {
          userId: user.id,
          email: user.email
        });
      }

      return true;

    } catch (error) {
      logger.error('Logout failed', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Logout from all devices (revoke all refresh tokens)
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async logoutAll(userId) {
    try {
      const user = this.findUserById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      user.revokeAllRefreshTokens();
      this.users.set(user.id, user);

      logger.info('User logged out from all devices', {
        userId: user.id,
        email: user.email
      });

      return true;

    } catch (error) {
      logger.error('Logout all failed', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Verify email address
   * @param {string} token - Email verification token
   * @returns {Promise<Object>} User data
   */
  async verifyEmail(token) {
    try {
      if (!token) {
        throw new ValidationError('Verification token is required');
      }

      // Find user by verification token
      const user = this.findUserByVerificationToken(token);
      if (!user) {
        throw new NotFoundError('Invalid verification token');
      }

      // Verify email
      const verified = user.verifyEmail(token);
      if (!verified) {
        throw new AuthenticationError('Invalid verification token');
      }

      this.users.set(user.id, user);

      logger.info('Email verified successfully', {
        userId: user.id,
        email: user.email
      });

      return user.toJSON();

    } catch (error) {
      logger.error('Email verification failed', {
        token,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<boolean>} Success status
   */
  async requestPasswordReset(email) {
    try {
      // Validate email
      const { error } = User.getPasswordResetRequestSchema().validate({ email });
      if (error) {
        throw new ValidationError('Invalid email address');
      }

      const user = this.findUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not
        logger.warn('Password reset requested for non-existent email', { email });
        return true;
      }

      // Generate reset token
      const resetToken = user.generatePasswordResetToken();
      this.users.set(user.id, user);

      // Send reset email
      try {
        await emailService.sendPasswordResetEmail(user.email, resetToken);
      } catch (emailError) {
        logger.error('Failed to send password reset email', {
          userId: user.id,
          error: emailError.message
        });
        throw new Error('Failed to send password reset email');
      }

      logger.info('Password reset requested', {
        userId: user.id,
        email: user.email
      });

      return true;

    } catch (error) {
      logger.error('Password reset request failed', {
        email,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Reset password
   * @param {Object} resetData - Password reset data
   * @returns {Promise<Object>} User data
   */
  async resetPassword(resetData) {
    try {
      // Validate input data
      const { error, value } = User.getPasswordResetSchema().validate(resetData);
      if (error) {
        throw new ValidationError('Password reset validation failed', error.details);
      }

      const { token, password } = value;

      // Find user by reset token
      const user = this.findUserByResetToken(token);
      if (!user) {
        throw new NotFoundError('Invalid or expired reset token');
      }

      // Verify reset token
      if (!user.verifyPasswordResetToken(token)) {
        throw new AuthenticationError('Invalid or expired reset token');
      }

      // Reset password
      await user.resetPassword(password);
      this.users.set(user.id, user);

      logger.info('Password reset successfully', {
        userId: user.id,
        email: user.email
      });

      return user.toJSON();

    } catch (error) {
      logger.error('Password reset failed', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Change password (for authenticated users)
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} Success status
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = this.findUserById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new AuthenticationError('Current password is incorrect');
      }

      // Validate new password
      const { error } = Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
        .validate(newPassword);

      if (error) {
        throw new ValidationError('New password does not meet requirements');
      }

      // Hash and save new password
      await user.hashPassword(newPassword);
      
      // Revoke all refresh tokens to force re-login
      user.revokeAllRefreshTokens();
      
      this.users.set(user.id, user);

      logger.info('Password changed successfully', {
        userId: user.id,
        email: user.email
      });

      return true;

    } catch (error) {
      logger.error('Password change failed', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User data
   */
  async getUserProfile(userId) {
    try {
      const user = this.findUserById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user.toJSON();

    } catch (error) {
      logger.error('Get user profile failed', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated user data
   */
  async updateUserProfile(userId, updateData) {
    try {
      const user = this.findUserById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Validate update data
      const allowedFields = ['firstName', 'lastName'];
      const updates = {};
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      });

      // Apply updates
      Object.assign(user, updates);
      user.updateTimestamp();
      
      this.users.set(user.id, user);

      logger.info('User profile updated', {
        userId: user.id,
        email: user.email,
        updatedFields: Object.keys(updates)
      });

      return user.toJSON();

    } catch (error) {
      logger.error('Update user profile failed', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  // Helper methods for finding users (replace with database queries in production)

  findUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  findUserById(id) {
    return this.users.get(id) || null;
  }

  findUserByRefreshToken(refreshToken) {
    for (const user of this.users.values()) {
      if (user.verifyRefreshToken(refreshToken)) {
        return user;
      }
    }
    return null;
  }

  findUserByVerificationToken(token) {
    for (const user of this.users.values()) {
      if (user.emailVerificationToken === token) {
        return user;
      }
    }
    return null;
  }

  findUserByResetToken(token) {
    for (const user of this.users.values()) {
      if (user.passwordResetToken === token) {
        return user;
      }
    }
    return null;
  }

  /**
   * Get all users (admin only)
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Users list
   */
  async getAllUsers(filters = {}) {
    try {
      let users = Array.from(this.users.values());

      // Apply filters
      if (filters.isActive !== undefined) {
        users = users.filter(user => user.isActive === filters.isActive);
      }

      if (filters.role) {
        users = users.filter(user => user.role === filters.role);
      }

      if (filters.isEmailVerified !== undefined) {
        users = users.filter(user => user.isEmailVerified === filters.isEmailVerified);
      }

      // Sort by creation date (newest first)
      users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return users.map(user => user.toJSON());

    } catch (error) {
      logger.error('Get all users failed', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} User statistics
   */
  async getUserStats() {
    try {
      const users = Array.from(this.users.values());
      
      return {
        total: users.length,
        active: users.filter(u => u.isActive).length,
        verified: users.filter(u => u.isEmailVerified).length,
        admins: users.filter(u => u.role === 'admin').length,
        locked: users.filter(u => u.isAccountLocked()).length,
        recentLogins: users.filter(u => 
          u.lastLogin && u.lastLogin > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length
      };

    } catch (error) {
      logger.error('Get user stats failed', {
        error: error.message
      });
      throw error;
    }
  }
}

// Create and export service instance
const authService = new AuthService();

module.exports = authService;