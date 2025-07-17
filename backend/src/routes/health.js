const express = require('express');
const router = express.Router();

/**
 * @route   GET /health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * @route   GET /health/detailed
 * @desc    Detailed health check with system info
 * @access  Public
 */
router.get('/detailed', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
    },
    cpu: process.cpuUsage()
  });
});

module.exports = router;