const latexService = require('../services/latexService');
const TailoredCV = require('../models/TailoredCV');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/error_handler_middleware');

class PDFController {
  /**
   * Generate PDF from CV content using LaTeX
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  generatePDF = asyncHandler(async (req, res) => {
    const { cvData, template = 'modern', options = {} } = req.body;

    logger.info('Starting PDF generation', {
      template,
      options,
      hasCvData: !!cvData
    });

    // Validate CV data structure
    if (!cvData || !cvData.personal) {
      return res.status(400).json({
        success: false,
        message: 'Valid CV data with personal information is required'
      });
    }

    // Generate PDF
    const pdfResult = await latexService.generatePDF(cvData, template, options);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfResult.size);
    res.setHeader('Content-Disposition', `attachment; filename="${pdfResult.filename}"`);

    // Send the PDF file
    const fs = require('fs');
    const pdfBuffer = fs.readFileSync(pdfResult.path);
    
    res.json({
      success: true,
      data: {
        jobId: pdfResult.jobId,
        filename: pdfResult.filename,
        size: pdfResult.size,
        downloadUrl: `/output/${pdfResult.filename}`,
        generatedAt: pdfResult.generatedAt
      },
      message: 'PDF generated successfully'
    });
  });

  /**
   * Preview PDF generation without downloading
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  previewPDF = asyncHandler(async (req, res) => {
    const { cvData, template = 'modern', options = {} } = req.body;

    logger.info('Starting PDF preview generation', {
      template,
      hasCvData: !!cvData
    });

    // Validate CV data
    if (!cvData || !cvData.personal) {
      return res.status(400).json({
        success: false,
        message: 'Valid CV data with personal information is required'
      });
    }

    // Generate PDF for preview
    const pdfResult = await latexService.generatePDF(cvData, template, options);

    res.json({
      success: true,
      data: {
        previewUrl: `/output/${pdfResult.filename}`,
        jobId: pdfResult.jobId,
        size: pdfResult.size,
        template: pdfResult.template
      },
      message: 'PDF preview generated successfully'
    });
  });

  /**
   * Generate multiple PDF versions with different templates
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  generateMultiplePDFs = asyncHandler(async (req, res) => {
    const { cvData, templates = ['modern', 'classic'], options = {} } = req.body;

    if (templates.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 templates allowed'
      });
    }

    logger.info('Starting multiple PDF generation', {
      templates,
      templateCount: templates.length
    });

    const results = [];
    const errors = [];

    for (const template of templates) {
      try {
        const pdfResult = await latexService.generatePDF(cvData, template, options);
        results.push({
          template,
          jobId: pdfResult.jobId,
          filename: pdfResult.filename,
          size: pdfResult.size,
          downloadUrl: `/output/${pdfResult.filename}`,
          status: 'success'
        });
      } catch (error) {
        logger.error('PDF generation failed for template', {
          template,
          error: error.message
        });
        
        errors.push({
          template,
          error: error.message,
          status: 'failed'
        });
      }
    }

    res.json({
      success: true,
      data: {
        results,
        errors,
        summary: {
          total: templates.length,
          successful: results.length,
          failed: errors.length
        }
      },
      message: `Generated ${results.length}/${templates.length} PDFs successfully`
    });
  });

  /**
   * Get available PDF templates
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getTemplates = asyncHandler(async (req, res) => {
    logger.info('Fetching available PDF templates');

    const templates = await latexService.getAvailableTemplates();

    res.json({
      success: true,
      data: {
        templates,
        count: templates.length
      },
      message: `Found ${templates.length} available templates`
    });
  });

  /**
   * Get template preview images
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getTemplatePreview = asyncHandler(async (req, res) => {
    const { templateId } = req.params;

    logger.info('Fetching template preview', { templateId });

    // For now, return mock preview data
    // In a real implementation, you'd serve actual preview images
    const previewData = {
      templateId,
      previewUrl: `/templates/${templateId}-preview.png`,
      description: latexService.getTemplateDescription(templateId),
      features: [
        'Professional layout',
        'ATS-friendly',
        'Customizable colors',
        'Multiple sections'
      ]
    };

    res.json({
      success: true,
      data: previewData,
      message: `Preview data for ${templateId} template`
    });
  });

  /**
   * Validate PDF generation parameters
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  validatePDFParams = asyncHandler(async (req, res) => {
    const { cvData, template, options } = req.body;

    logger.info('Validating PDF generation parameters', {
      template,
      hasCvData: !!cvData
    });

    const validation = {
      cvData: {
        valid: !!(cvData && cvData.personal),
        issues: []
      },
      template: {
        valid: ['modern', 'classic'].includes(template),
        issues: []
      },
      options: {
        valid: true,
        issues: []
      }
    };

    // Validate CV data structure
    if (!cvData) {
      validation.cvData.issues.push('CV data is required');
    } else {
      if (!cvData.personal) validation.cvData.issues.push('Personal information is required');
      if (!cvData.personal?.name) validation.cvData.issues.push('Name is required');
      if (!cvData.personal?.email) validation.cvData.issues.push('Email is required');
    }

    // Validate template
    if (!['modern', 'classic'].includes(template)) {
      validation.template.valid = false;
      validation.template.issues.push('Invalid template. Use "modern" or "classic"');
    }

    // Validate options
    if (options.fontSize && !['10pt', '11pt', '12pt'].includes(options.fontSize)) {
      validation.options.valid = false;
      validation.options.issues.push('Invalid font size. Use 10pt, 11pt, or 12pt');
    }

    const overallValid = validation.cvData.valid && validation.template.valid && validation.options.valid;

    res.json({
      success: true,
      data: {
        valid: overallValid,
        validation,
        checkedAt: new Date()
      },
      message: overallValid ? 'All parameters are valid' : 'Validation issues found'
    });
  });

  /**
   * Get PDF generation status for async operations
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getPDFStatus = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    logger.info('Checking PDF generation status', { jobId });

    // For now, return mock status
    // In a real implementation, you'd check actual job status
    const status = {
      jobId,
      status: 'completed',
      progress: 100,
      message: 'PDF generation completed successfully',
      downloadUrl: `/output/cv-${jobId}.pdf`,
      createdAt: new Date(),
      completedAt: new Date()
    };

    res.json({
      success: true,
      data: status,
      message: `Job ${jobId} status retrieved`
    });
  });

  /**
   * Generate PDF asynchronously for large documents
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  generatePDFAsync = asyncHandler(async (req, res) => {
    const { cvData, template = 'modern', options = {} } = req.body;

    logger.info('Starting async PDF generation', {
      template,
      hasCvData: !!cvData
    });

    // For now, generate synchronously but return async response format
    const pdfResult = await latexService.generatePDF(cvData, template, options);

    res.status(202).json({
      success: true,
      data: {
        jobId: pdfResult.jobId,
        status: 'completed',
        statusUrl: `/api/pdf/status/${pdfResult.jobId}`,
        downloadUrl: `/output/${pdfResult.filename}`,
        estimatedTime: '30 seconds'
      },
      message: 'PDF generation job created'
    });
  });

  /**
   * Download generated PDF by job ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  downloadPDF = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    logger.info('Downloading PDF by job ID', { jobId });

    // For now, redirect to static file
    // In a real implementation, you'd serve the actual file
    res.json({
      success: true,
      data: {
        jobId,
        downloadUrl: `/output/cv-${jobId}.pdf`,
        filename: `cv-${jobId}.pdf`,
        message: 'Use the downloadUrl to access the PDF'
      },
      message: 'PDF download information retrieved'
    });
  });

  /**
   * Check LaTeX availability
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  checkLatexAvailability = asyncHandler(async (req, res) => {
    logger.info('Checking LaTeX availability');

    const isAvailable = await latexService.checkLatexAvailability();

    res.json({
      success: true,
      data: {
        latexAvailable: isAvailable,
        message: isAvailable ? 
          'LaTeX is available and ready for PDF generation' : 
          'LaTeX is not available. PDF generation will not work.',
        checkedAt: new Date()
      },
      message: `LaTeX availability: ${isAvailable ? 'Available' : 'Not Available'}`
    });
  });
}

module.exports = new PDFController();