const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class User {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.email = data.email || '';
    this.password = data.password || '';
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.role = data.role || 'user';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.isEmailVerified = data.isEmailVerified || false;
    this.emailVerificationToken = data.emailVerificationToken || null;
    this.passwordResetToken = data.passwordResetToken || null;
    this.passwordResetExpires = data.passwordResetExpires || null;
    this.refreshTokens = data.refreshTokens || [];
    this.lastLogin = data.lastLogin || null;
    this.loginAttempts = data.loginAttempts || 0;
    this.lockUntil = data.lockUntil || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Validation schema for user registration
   */
  static getRegistrationSchema() {
    return Joi.object({
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        }),
      password: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
        .required()
        .messages({
          'string.min': 'Password must be at least 8 characters long',
          'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
          'any.required': 'Password is required'
        }),
      confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
          'any.only': 'Passwords do not match',
          'any.required': 'Password confirmation is required'
        }),
      firstName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.min': 'First name must be at least 2 characters long',
          'string.max': 'First name cannot exceed 50 characters',
          'any.required': 'First name is required'
        }),
      lastName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.min': 'Last name must be at least 2 characters long',
          'string.max': 'Last name cannot exceed 50 characters',
          'any.required': 'Last name is required'
        })
    });
  }

  /**
   * Validation schema for user login
   */
  static getLoginSchema() {
    return Joi.object({
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        }),
      password: Joi.string()
        .required()
        .messages({
          'any.required': 'Password is required'
        })
    });
  }

  /**
   * Validation schema for password reset request
   */
  static getPasswordResetRequestSchema() {
    return Joi.object({
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        })
    });
  }

  /**
   * Validation schema for password reset
   */
  static getPasswordResetSchema() {
    return Joi.object({
      token: Joi.string()
        .required()
        .messages({
          'any.required': 'Reset token is required'
        }),
      password: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
        .required()
        .messages({
          'string.min': 'Password must be at least 8 characters long',
          'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
          'any.required': 'Password is required'
        }),
      confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
          'any.only': 'Passwords do not match',
          'any.required': 'Password confirmation is required'
        })
    });
  }

  /**
   * Hash password before saving
   */
  async hashPassword(password) {
    const saltRounds = 12;
    this.password = await bcrypt.hash(password, saltRounds);
    this.updateTimestamp();
  }

  /**
   * Compare password with hashed password
   */
  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  /**
   * Generate JWT access token
   */
  generateAccessToken() {
    const payload = {
      id: this.id,
      email: this.email,
      role: this.role,
      type: 'access'
    };

    return jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET || 'access-secret-key',
      {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
        issuer: 'ai-cv-builder',
        audience: 'ai-cv-builder-users'
      }
    );
  }

  /**
   * Generate JWT refresh token
   */
  generateRefreshToken() {
    const payload = {
      id: this.id,
      email: this.email,
      type: 'refresh',
      tokenId: uuidv4()
    };

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        issuer: 'ai-cv-builder',
        audience: 'ai-cv-builder-users'
      }
    );

    // Store refresh token
    this.refreshTokens.push({
      token: refreshToken,
      tokenId: payload.tokenId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // Keep only last 5 refresh tokens
    if (this.refreshTokens.length > 5) {
      this.refreshTokens = this.refreshTokens.slice(-5);
    }

    this.updateTimestamp();
    return refreshToken;
  }

  /**
   * Generate both access and refresh tokens
   */
  generateTokens() {
    return {
      accessToken: this.generateAccessToken(),
      refreshToken: this.generateRefreshToken()
    };
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET || 'refresh-secret-key'
      );

      // Check if token exists in user's refresh tokens
      const tokenExists = this.refreshTokens.some(
        rt => rt.tokenId === decoded.tokenId && rt.expiresAt > new Date()
      );

      if (!tokenExists) {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Revoke refresh token
   */
  revokeRefreshToken(tokenId) {
    this.refreshTokens = this.refreshTokens.filter(rt => rt.tokenId !== tokenId);
    this.updateTimestamp();
  }

  /**
   * Revoke all refresh tokens
   */
  revokeAllRefreshTokens() {
    this.refreshTokens = [];
    this.updateTimestamp();
  }

  /**
   * Generate email verification token
   */
  generateEmailVerificationToken() {
    this.emailVerificationToken = uuidv4();
    this.updateTimestamp();
    return this.emailVerificationToken;
  }

  /**
   * Verify email
   */
  verifyEmail(token) {
    if (this.emailVerificationToken === token) {
      this.isEmailVerified = true;
      this.emailVerificationToken = null;
      this.updateTimestamp();
      return true;
    }
    return false;
  }

  /**
   * Generate password reset token
   */
  generatePasswordResetToken() {
    this.passwordResetToken = uuidv4();
    this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    this.updateTimestamp();
    return this.passwordResetToken;
  }

  /**
   * Verify password reset token
   */
  verifyPasswordResetToken(token) {
    return this.passwordResetToken === token && 
           this.passwordResetExpires && 
           this.passwordResetExpires > new Date();
  }

  /**
   * Reset password
   */
  async resetPassword(newPassword) {
    await this.hashPassword(newPassword);
    this.passwordResetToken = null;
    this.passwordResetExpires = null;
    this.loginAttempts = 0;
    this.lockUntil = null;
    this.revokeAllRefreshTokens(); // Revoke all existing sessions
    this.updateTimestamp();
  }

  /**
   * Handle failed login attempt
   */
  handleFailedLogin() {
    this.loginAttempts += 1;
    
    // Lock account after 5 failed attempts
    if (this.loginAttempts >= 5) {
      this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }
    
    this.updateTimestamp();
  }

  /**
   * Handle successful login
   */
  handleSuccessfulLogin() {
    this.loginAttempts = 0;
    this.lockUntil = null;
    this.lastLogin = new Date();
    this.updateTimestamp();
  }

  /**
   * Check if account is locked
   */
  isAccountLocked() {
    return this.lockUntil && this.lockUntil > new Date();
  }

  /**
   * Update timestamp
   */
  updateTimestamp() {
    this.updatedAt = new Date();
  }

  /**
   * Get user's full name
   */
  getFullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * Check if user has role
   */
  hasRole(role) {
    return this.role === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin() {
    return this.role === 'admin';
  }

  /**
   * Convert to JSON (exclude sensitive data)
   */
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.getFullName(),
      role: this.role,
      isActive: this.isActive,
      isEmailVerified: this.isEmailVerified,
      lastLogin: this.lastLogin,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Convert to JSON with auth info (for login response)
   */
  toAuthJSON() {
    return {
      user: this.toJSON(),
      ...this.generateTokens()
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data) {
    return new User(data);
  }

  /**
   * Validate user data
   */
  validate(schema) {
    return schema.validate(this.toJSON());
  }
}

module.exports = User;