const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    try {
      // Check if email configuration is provided
      if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        logger.warn('Email service not configured - email features will be disabled');
        return;
      }

      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== 'false'
        }
      });

      this.isConfigured = true;
      logger.info('Email service initialized successfully');

    } catch (error) {
      logger.error('Failed to initialize email service', {
        error: error.message
      });
    }
  }

  /**
   * Send email
   * @param {Object} mailOptions - Email options
   * @returns {Promise<Object>} Send result
   */
  async sendEmail(mailOptions) {
    if (!this.isConfigured) {
      logger.warn('Email service not configured - skipping email send');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const defaultOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      };

      const options = { ...defaultOptions, ...mailOptions };
      const result = await this.transporter.sendMail(options);

      logger.info('Email sent successfully', {
        to: options.to,
        subject: options.subject,
        messageId: result.messageId
      });

      return { success: true, messageId: result.messageId };

    } catch (error) {
      logger.error('Failed to send email', {
        to: mailOptions.to,
        subject: mailOptions.subject,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Send email verification email
   * @param {string} email - User email
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Send result
   */
  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    const mailOptions = {
      to: email,
      subject: 'Verify Your Email - AI CV Builder',
      html: this.getVerificationEmailTemplate(verificationUrl),
      text: `Please verify your email by clicking this link: ${verificationUrl}`
    };

    return await this.sendEmail(mailOptions);
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @param {string} token - Reset token
   * @returns {Promise<Object>} Send result
   */
  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    const mailOptions = {
      to: email,
      subject: 'Reset Your Password - AI CV Builder',
      html: this.getPasswordResetEmailTemplate(resetUrl),
      text: `Reset your password by clicking this link: ${resetUrl}`
    };

    return await this.sendEmail(mailOptions);
  }

  /**
   * Send welcome email
   * @param {string} email - User email
   * @param {string} firstName - User first name
   * @returns {Promise<Object>} Send result
   */
  async sendWelcomeEmail(email, firstName) {
    const mailOptions = {
      to: email,
      subject: 'Welcome to AI CV Builder!',
      html: this.getWelcomeEmailTemplate(firstName),
      text: `Welcome to AI CV Builder, ${firstName}! Start creating professional CVs today.`
    };

    return await this.sendEmail(mailOptions);
  }

  /**
   * Send password changed notification
   * @param {string} email - User email
   * @param {string} firstName - User first name
   * @returns {Promise<Object>} Send result
   */
  async sendPasswordChangedEmail(email, firstName) {
    const mailOptions = {
      to: email,
      subject: 'Password Changed - AI CV Builder',
      html: this.getPasswordChangedEmailTemplate(firstName),
      text: `Hi ${firstName}, your password has been successfully changed.`
    };

    return await this.sendEmail(mailOptions);
  }

  /**
   * Send account locked notification
   * @param {string} email - User email
   * @param {string} firstName - User first name
   * @param {Date} unlockTime - When account will be unlocked
   * @returns {Promise<Object>} Send result
   */
  async sendAccountLockedEmail(email, firstName, unlockTime) {
    const unlockTimeString = unlockTime.toLocaleString();
    
    const mailOptions = {
      to: email,
      subject: 'Account Temporarily Locked - AI CV Builder',
      html: this.getAccountLockedEmailTemplate(firstName, unlockTimeString),
      text: `Hi ${firstName}, your account has been temporarily locked due to multiple failed login attempts. It will be unlocked at ${unlockTimeString}.`
    };

    return await this.sendEmail(mailOptions);
  }

  /**
   * Email verification template
   */
  getVerificationEmailTemplate(verificationUrl) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>AI CV Builder</h1>
            </div>
            <div class="content">
                <h2>Verify Your Email Address</h2>
                <p>Thank you for signing up with AI CV Builder! To complete your registration, please verify your email address by clicking the button below:</p>
                <p style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </p>
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #3b82f6;">${verificationUrl}</p>
                <p>This verification link will expire in 24 hours for security reasons.</p>
                <p>If you didn't create an account with AI CV Builder, you can safely ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 AI CV Builder. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Password reset email template
   */
  getPasswordResetEmailTemplate(resetUrl) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .warning { background: #fef3cd; border: 1px solid #fecaca; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>AI CV Builder</h1>
            </div>
            <div class="content">
                <h2>Reset Your Password</h2>
                <p>We received a request to reset your password for your AI CV Builder account. Click the button below to create a new password:</p>
                <p style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                </p>
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
                <div class="warning">
                    <strong>Security Notice:</strong>
                    <ul>
                        <li>This reset link will expire in 1 hour</li>
                        <li>If you didn't request this reset, please ignore this email</li>
                        <li>Your password will remain unchanged until you create a new one</li>
                    </ul>
                </div>
            </div>
            <div class="footer">
                <p>&copy; 2024 AI CV Builder. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Welcome email template
   */
  getWelcomeEmailTemplate(firstName) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to AI CV Builder</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .feature { margin: 15px 0; padding: 15px; background: white; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to AI CV Builder!</h1>
            </div>
            <div class="content">
                <h2>Hi ${firstName},</h2>
                <p>Welcome to AI CV Builder! We're excited to help you create professional, ATS-optimized CVs that get results.</p>
                
                <h3>What you can do with AI CV Builder:</h3>
                <div class="feature">
                    <strong>🤖 AI-Powered Content:</strong> Generate tailored CV content using advanced AI
                </div>
                <div class="feature">
                    <strong>🎯 Keyword Optimization:</strong> Match your CV to specific job descriptions
                </div>
                <div class="feature">
                    <strong>📄 Professional Templates:</strong> Choose from ATS-friendly designs
                </div>
                <div class="feature">
                    <strong>⚡ Instant Generation:</strong> Create complete CVs in minutes
                </div>

                <p style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/builder" class="button">Start Building Your CV</a>
                </p>

                <p>If you have any questions, feel free to reach out to our support team.</p>
                <p>Happy job hunting!</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 AI CV Builder. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Password changed email template
   */
  getPasswordChangedEmailTemplate(firstName) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #22c55e; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .success { background: #d1fae5; border: 1px solid #22c55e; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Password Changed Successfully</h1>
            </div>
            <div class="content">
                <h2>Hi ${firstName},</h2>
                <div class="success">
                    <strong>✅ Your password has been successfully changed.</strong>
                </div>
                <p>This email confirms that your AI CV Builder account password was changed on ${new Date().toLocaleString()}.</p>
                <p>If you made this change, no further action is required.</p>
                <p><strong>If you didn't change your password:</strong></p>
                <ul>
                    <li>Your account may have been compromised</li>
                    <li>Please contact our support team immediately</li>
                    <li>Consider enabling two-factor authentication</li>
                </ul>
            </div>
            <div class="footer">
                <p>&copy; 2024 AI CV Builder. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Account locked email template
   */
  getAccountLockedEmailTemplate(firstName, unlockTime) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Temporarily Locked</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .warning { background: #fef3cd; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Account Temporarily Locked</h1>
            </div>
            <div class="content">
                <h2>Hi ${firstName},</h2>
                <div class="warning">
                    <strong>⚠️ Your account has been temporarily locked due to multiple failed login attempts.</strong>
                </div>
                <p>For security reasons, your AI CV Builder account has been locked until <strong>${unlockTime}</strong>.</p>
                <p><strong>What happened:</strong></p>
                <ul>
                    <li>Multiple unsuccessful login attempts were detected</li>
                    <li>This is an automatic security measure to protect your account</li>
                    <li>Your account will be automatically unlocked at the time shown above</li>
                </ul>
                <p><strong>What you can do:</strong></p>
                <ul>
                    <li>Wait for the automatic unlock</li>
                    <li>If you forgot your password, use the password reset feature</li>
                    <li>Contact support if you believe this was an error</li>
                </ul>
            </div>
            <div class="footer">
                <p>&copy; 2024 AI CV Builder. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Test email configuration
   * @returns {Promise<boolean>} Configuration test result
   */
  async testConfiguration() {
    if (!this.isConfigured) {
      return false;
    }

    try {
      await this.transporter.verify();
      logger.info('Email configuration test successful');
      return true;
    } catch (error) {
      logger.error('Email configuration test failed', {
        error: error.message
      });
      return false;
    }
  }
}

// Create and export service instance
const emailService = new EmailService();

module.exports = emailService;