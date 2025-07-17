const keywordService = require('../services/keywordService');
const JobDescription = require('../models/JobDescription');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/error_handler_middleware');

class KeywordController {
  /**
   * Extract keywords from job description
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  extractJobKeywords = asyncHandler(async (req, res) => {
    const { title, company, description } = req.body;

    logger.info('Extracting keywords from job description', {
      title,
      company,
      descriptionLength: description.length
    });

    // Create JobDescription instance
    const jobDesc = new JobDescription({
      title,
      company,
      description
    });

    // Validate job description
    const { error } = jobDesc.validate();
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job description data',
        errors: error.details
      });
    }

    // Extract keywords
    const keywordAnalysis = await keywordService.extractJobKeywords(description);

    // Update job description with extracted keywords
    jobDesc.setKeywords(keywordAnalysis.keywords);

    res.json({
      success: true,
      data: {
        jobDescription: jobDesc.toJSON(),
        analysis: keywordAnalysis
      },
      message: `Extracted ${keywordAnalysis.keywords.length} keywords successfully`
    });
  });

  /**
   * Analyze CV content against job keywords
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  analyzeCVKeywords = asyncHandler(async (req, res) => {
    const { userProfile, jobKeywords } = req.body;

    logger.info('Analyzing CV keywords', {
      userProfileId: userProfile.id,
      keywordCount: jobKeywords.length
    });

    const analysis = keywordService.analyzeCVKeywords(userProfile, jobKeywords);

    res.json({
      success: true,
      data: analysis,
      message: `CV analysis completed with ${analysis.matchScore}% match score`
    });
  });

  /**
   * Get keyword suggestions for CV improvement
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getSuggestions = asyncHandler(async (req, res) => {
    const { industry = 'general' } = req.params;
    const { currentKeywords = [] } = req.query;

    logger.info('Getting keyword suggestions', {
      industry,
      currentKeywordCount: currentKeywords.length
    });

    const suggestions = keywordService.getKeywordSuggestions(
      industry,
      Array.isArray(currentKeywords) ? currentKeywords : currentKeywords.split(',')
    );

    res.json({
      success: true,
      data: {
        industry,
        suggestions,
        count: suggestions.length
      },
      message: `Found ${suggestions.length} keyword suggestions for ${industry} industry`
    });
  });

  /**
   * Get keyword trends for specific industry
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getIndustryTrends = asyncHandler(async (req, res) => {
    const { industry } = req.params;

    logger.info('Getting industry keyword trends', { industry });

    // This would typically connect to a database or external API
    // For now, return mock trending keywords
    const trends = {
      software: [
        { keyword: 'AI/ML', trend: 'rising', growth: '+25%' },
        { keyword: 'Cloud Native', trend: 'rising', growth: '+18%' },
        { keyword: 'DevOps', trend: 'stable', growth: '+5%' },
        { keyword: 'React', trend: 'stable', growth: '+3%' },
        { keyword: 'Kubernetes', trend: 'rising', growth: '+22%' }
      ],
      marketing: [
        { keyword: 'Growth Hacking', trend: 'rising', growth: '+30%' },
        { keyword: 'Marketing Automation', trend: 'rising', growth: '+15%' },
        { keyword: 'Content Strategy', trend: 'stable', growth: '+8%' },
        { keyword: 'SEO', trend: 'stable', growth: '+2%' },
        { keyword: 'Social Media', trend: 'declining', growth: '-5%' }
      ]
    };

    const industryTrends = trends[industry.toLowerCase()] || [];

    res.json({
      success: true,
      data: {
        industry,
        trends: industryTrends,
        lastUpdated: new Date(),
        period: 'Last 6 months'
      },
      message: `Retrieved keyword trends for ${industry} industry`
    });
  });

  /**
   * Batch process multiple job descriptions for keyword extraction
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  batchExtractKeywords = asyncHandler(async (req, res) => {
    const { jobDescriptions } = req.body;

    logger.info('Starting batch keyword extraction', {
      jobCount: jobDescriptions.length
    });

    const results = [];
    const errors = [];

    for (const jobDesc of jobDescriptions) {
      try {
        const keywordAnalysis = await keywordService.extractJobKeywords(jobDesc.description);
        
        results.push({
          id: jobDesc.id,
          title: jobDesc.title,
          keywords: keywordAnalysis.keywords,
          keywordCount: keywordAnalysis.keywords.length,
          status: 'success'
        });
      } catch (error) {
        logger.error('Batch extraction failed for job', {
          jobId: jobDesc.id,
          error: error.message
        });
        
        errors.push({
          id: jobDesc.id,
          title: jobDesc.title,
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
          total: jobDescriptions.length,
          successful: results.length,
          failed: errors.length,
          totalKeywords: results.reduce((sum, r) => sum + r.keywordCount, 0)
        }
      },
      message: `Batch processing completed: ${results.length}/${jobDescriptions.length} successful`
    });
  });
}

module.exports = new KeywordController();