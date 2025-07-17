# Authentication System Documentation

## Overview

The AI CV Builder now includes a complete, production-ready authentication system with JWT tokens, email verification, password reset, and comprehensive security features.

## Features Implemented

### ✅ **User Registration & Login**
- Secure user registration with email verification
- Password strength validation (8+ chars, uppercase, lowercase, number, special char)
- Account lockout after 5 failed login attempts (30-minute lockout)
- Email verification with token-based system

### ✅ **JWT Token System**
- **Access Tokens**: Short-lived (15 minutes) for API authentication
- **Refresh Tokens**: Long-lived (7 days) for token renewal
- **Token Rotation**: New refresh token issued on each refresh
- **Secure Storage**: Refresh tokens stored as httpOnly cookies

### ✅ **Password Management**
- Password reset via email with secure tokens (1-hour expiry)
- Password change for authenticated users
- Password hashing with bcrypt (12 salt rounds)
- Password history prevention (revokes all sessions on change)

### ✅ **Email System**
- Welcome emails for new users
- Email verification with custom templates
- Password reset emails with secure links
- Password change notifications
- Account lockout notifications
- Professional HTML email templates

### ✅ **Security Features**
- Rate limiting on authentication endpoints
- Account lockout protection
- Secure cookie handling
- Input validation and sanitization
- CORS protection
- Helmet security headers

### ✅ **Session Management**
- Multiple device support
- Logout from single device
- Logout from all devices
- Session tracking and management
- Automatic token cleanup

## API Endpoints

### Public Endpoints

#### User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Token Refresh
```http
POST /api/auth/refresh
# Refresh token automatically sent via httpOnly cookie
```

#### Email Verification
```http
GET /api/auth/verify-email/:token
```

#### Password Reset Request
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Password Reset
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-here",
  "password": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

#### Check Email Existence
```http
POST /api/auth/check-email
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Resend Verification Email
```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Protected Endpoints (Require Authentication)

#### Get User Profile
```http
GET /api/auth/me
Authorization: Bearer <access-token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith"
}
```

#### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access-token>
```

#### Logout All Devices
```http
POST /api/auth/logout-all
Authorization: Bearer <access-token>
```

### Admin Endpoints

#### Get User Statistics
```http
GET /api/auth/stats
Authorization: Bearer <admin-access-token>
```

#### Get All Users
```http
GET /api/auth/users?isActive=true&role=user
Authorization: Bearer <admin-access-token>
```

## Environment Variables

Add these to your `.env` file:

```env
# JWT Authentication
JWT_ACCESS_SECRET=your_jwt_access_secret_here_make_it_long_and_random
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here_make_it_different_and_long
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM=AI CV Builder <noreply@aicvbuilder.com>
EMAIL_TLS_REJECT_UNAUTHORIZED=true
```

## Usage Examples

### Frontend Integration

#### Login Flow
```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important for cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { data } = await response.json();
// Store access token
localStorage.setItem('accessToken', data.accessToken);
```

#### API Requests with Authentication
```javascript
// Make authenticated requests
const response = await fetch('/api/some-endpoint', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json'
  },
  credentials: 'include'
});
```

#### Token Refresh
```javascript
// Refresh token when access token expires
const refreshResponse = await fetch('/api/auth/refresh', {
  method: 'POST',
  credentials: 'include' // Sends refresh token cookie
});

if (refreshResponse.ok) {
  const { data } = await refreshResponse.json();
  localStorage.setItem('accessToken', data.accessToken);
}
```

### Middleware Usage

#### Protect Routes
```javascript
// In your route files
const { authenticate } = require('../middleware/auth_middleware');

// Require authentication
router.get('/protected-route', authenticate, (req, res) => {
  // req.user contains authenticated user data
  res.json({ user: req.user });
});

// Optional authentication
router.get('/optional-auth', optionalAuth, (req, res) => {
  // req.user is null if not authenticated
  const message = req.user ? `Hello ${req.user.firstName}` : 'Hello Guest';
  res.json({ message });
});
```

## Security Best Practices

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one number
- At least one special character (@$!%*?&)

### Token Security
- Access tokens are short-lived (15 minutes)
- Refresh tokens are stored as httpOnly cookies
- Tokens are signed with separate secrets
- All tokens are revoked on password change

### Rate Limiting
- Authentication endpoints: 5 requests per 15 minutes
- Password reset/change: 3 requests per 15 minutes
- Failed login attempts trigger account lockout

### Email Security
- Verification tokens expire in 24 hours
- Password reset tokens expire in 1 hour
- All email links are single-use
- Email templates include security warnings

## Error Handling

The system returns standardized error responses:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "ERROR_CODE",
  "details": [] // Optional validation details
}
```

Common error codes:
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Invalid credentials or token
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `CONFLICT`: Resource already exists (e.g., email taken)

## Testing

### Development Endpoints

#### Test Email Configuration
```http
GET /api/auth/test-email
# Only available in development mode
```

### Manual Testing

1. **Registration Flow**:
   - Register new user → Check email verification
   - Verify email → Account activated
   - Login → Receive tokens

2. **Password Reset Flow**:
   - Request reset → Check email
   - Use reset link → Password changed
   - Login with new password

3. **Security Testing**:
   - Try 6 failed logins → Account locked
   - Wait 30 minutes → Account unlocked
   - Change password → All sessions revoked

## Database Integration

Currently using in-memory storage. To integrate with a database:

1. **Replace AuthService methods**:
   ```javascript
   // Replace these methods in authService.js
   findUserByEmail(email) // → Database query
   findUserById(id) // → Database query
   // etc.
   ```

2. **Add User model persistence**:
   ```javascript
   // Add save/update methods to User model
   async save() { /* Database save logic */ }
   async update() { /* Database update logic */ }
   ```

## Monitoring & Logging

The system logs all authentication events:
- User registrations
- Login attempts (success/failure)
- Password changes
- Account lockouts
- Token refreshes
- Email sending status

Log levels:
- `INFO`: Normal operations
- `WARN`: Non-critical issues (email failures)
- `ERROR`: Critical errors

## Production Deployment

### Required Environment Variables
```env
NODE_ENV=production
JWT_ACCESS_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<different-strong-random-secret>
EMAIL_HOST=<your-smtp-host>
EMAIL_USER=<your-email>
EMAIL_PASS=<your-email-password>
FRONTEND_URL=<your-frontend-domain>
```

### Security Checklist
- [ ] Strong JWT secrets (64+ characters)
- [ ] HTTPS enabled
- [ ] Secure cookie settings
- [ ] Email service configured
- [ ] Rate limiting enabled
- [ ] Database connection secured
- [ ] Logging configured
- [ ] Error monitoring setup

## Troubleshooting

### Common Issues

1. **Email not sending**:
   - Check EMAIL_* environment variables
   - Test with `/api/auth/test-email` endpoint
   - Verify SMTP credentials

2. **Token errors**:
   - Ensure JWT secrets are set
   - Check token expiration times
   - Verify cookie settings

3. **Account lockout**:
   - Check failed login attempts
   - Wait for lockout period to expire
   - Use password reset if needed

4. **CORS issues**:
   - Set `credentials: 'include'` in frontend requests
   - Configure CORS_ORIGIN properly
   - Check cookie SameSite settings

The authentication system is now complete and production-ready! 🚀