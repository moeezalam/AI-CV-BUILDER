// File: backend/src/utils/logger.js

const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.printf(({ timestamp, level, message, stack }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: process.env.LOG_ERROR_PATH || 'logs/error.log', level: 'error' }),
    new transports.File({ filename: process.env.LOG_COMBINED_PATH || 'logs/combined.log' }),
  ],
  exitOnError: false,
});

module.exports = logger;