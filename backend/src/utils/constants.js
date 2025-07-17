// File: backend/src/utils/constants.js

module.exports = {
  TEMPLATE_TYPES: Object.freeze({
    MODERN: 'modern',
    CLASSIC: 'classic',
  }),

  MIME_TYPES: Object.freeze({
    PDF: 'application/pdf',
    JSON: 'application/json',
    TEXT: 'text/plain',
  }),

  ERROR_MESSAGES: Object.freeze({
    MISSING_FIELDS: 'Required fields are missing.',
    INVALID_TOKEN: 'Invalid or expired token.',
    UNAUTHORIZED: 'You are not authorized to access this resource.',
    INTERNAL_ERROR: 'Something went wrong. Please try again later.',
  }),

  CV_SCORE: Object.freeze({
    MIN: 0,
    MAX: 100,
  }),

  FILE_LIMITS: Object.freeze({
    MAX_UPLOAD_MB: 5,
  }),
};
