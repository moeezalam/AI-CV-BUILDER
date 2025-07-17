// File: backend/src/utils/helpers.js

const Joi = require('joi');

/**
 * Validate an object against a Joi schema.
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {object} payload - Data to validate
 * @returns {{ value: any, error: Joi.ValidationError }}
 */
function validate(schema, payload) {
  const options = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  };
  return schema.validate(payload, options);
}

/**
 * Capitalize the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
function capitalizeFirstLetter(str = '') {
  if (typeof str !== 'string' || !str.length) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Remove extra whitespace and trim the string.
 * @param {string} str
 * @returns {string}
 */
function cleanString(str = '') {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Format a Date or date string to YYYY-MM-DD format.
 * @param {Date|string|number} inputDate
 * @returns {string}
 */
function formatDate(inputDate) {
  const d = new Date(inputDate);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

module.exports = {
  validate,
  capitalizeFirstLetter,
  cleanString,
  formatDate,
};
