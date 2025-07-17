const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Middleware
const { validateRequest } = require('../middleware/validation_middleware');
const { errorHandler } = require('../middleware/error_handler_middleware');

// Controllers
const keywordController = require('../controllers/keywordController');
const contentController = require('../controllers/contentController');
const pdfController = require('../controllers/pdfController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|json|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, JSON, and TXT files are allowed'));
    }
  }
});

// Keyword extraction routes
/**
 * @route   POST /api/extract-keywords
 * @desc    Extract keywords from job description
 * @access  Public
 */
router.post('/extract-keywords', 
  validateRequest('jobDescription'),
  keywordController.extractJobKeywords
);

/**
 * @route   POST /api/analyze-keywords
 * @desc    Analyze CV content against job keywords
 * @access  Public
 */
router.post('/analyze-keywords',
  validateRequest('keywordAnalysis'),
  keywordController.analyzeCVKeywords
);

/**
 * @route   GET /api/keyword-suggestions/:industry?
 * @desc    Get keyword suggestions for CV improvement
 * @access  Public
 */
router.get('/keyword-suggestions/:industry?',
  keywordController.getSuggestions
);

// Content generation routes
/**
 * @route   POST /api/tailor-content
 * @desc    Generate tailored CV content based on user profile and job description
 * @access  Public
 */
router.post('/tailor-content',
  validateRequest('tailorContent'),
  contentController.generateTailoredContent
);

/**
 * @route   POST /api/generate-summary
 * @desc    Generate professional summary
 * @access  Public
 */
router.post('/generate-summary',
  validateRequest('generateSummary'),
  contentController.generateSummary
);

/**
 * @route   POST /api/enhance-experience
 * @desc    Enhance work experience descriptions
 * @access  Public
 */
router.post('/enhance-experience',
  validateRequest('enhanceExperience'),
  contentController.enhanceExperience
);

/**
 * @route   POST /api/optimize-content
 * @desc    Optimize existing CV content for better alignment
 * @access  Public
 */
router.post('/optimize-content',
  validateRequest('optimizeContent'),
  contentController.optimizeContent
);

// PDF generation routes
/**
 * @route   POST /api/render-cv
 * @desc    Generate PDF from CV content using LaTeX
 * @access  Public
 */
router.post('/render-cv',
  validateRequest('renderCV'),
  pdfController.generatePDF
);

/**
 * @route   POST /api/preview-cv
 * @desc    Preview PDF generation without downloading
 * @access  Public
 */
router.post('/preview-cv',
  validateRequest('renderCV'),
  pdfController.previewPDF
);

/**
 * @route   GET /api/templates
 * @desc    Get available PDF templates
 * @access  Public
 */
router.get('/templates', pdfController.getTemplates);

/**
 * @route   GET /api/templates/:templateId/preview
 * @desc    Get template preview images
 * @access  Public
 */
router.get('/templates/:templateId/preview', pdfController.getTemplatePreview);

// File upload routes
/**
 * @route   POST /api/upload/profile
 * @desc    Upload user profile (JSON/PDF)
 * @access  Public
 */
router.post('/upload/profile',
  upload.single('profile'),
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Process uploaded file based on type
    if (req.file.mimetype === 'application/pdf') {
      // TODO: Implement PDF parsing
      res.json({
        success: true,
        message: 'PDF upload successful - parsing not yet implemented',
        file: req.file
      });
    } else {
      // Handle JSON file
      res.json({
        success: true,
        message: 'File uploaded successfully',
        file: req.file
      });
    }
  }
);

// Batch processing routes
/**
 * @route   POST /api/batch/extract-keywords
 * @desc    Batch process multiple job descriptions
 * @access  Public
 */
router.post('/batch/extract-keywords',
  validateRequest('batchKeywords'),
  keywordController.batchExtractKeywords
);

// Error handling for this router
router.use(errorHandler);

module.exports = router;