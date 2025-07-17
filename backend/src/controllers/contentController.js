const contentService = require('../services/contentService');
const UserProfile = require('../models/UserProfile');
const JobDescription = require('../models/JobDescription');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/error_handler_middleware');

class ContentController {
  /**
   * Generate tailored CV content based on user profile and job description
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  generateTailoredContent = asyncHandler(async (req, res) => {
    const { userProfile, jobDescription } = req.body;

    logger.info('Starting tailored content generation', {
      userProfileId: userProfile.id,
      jobTitle: jobDescription.title
    });

    // Create model instances
    const userProfileInstance = UserProfile.fromJSON(userProfile);
    const jobDescInstance = JobDescription.fromJSON(jobDescription);

    // Validate inputs
    const userValidation = userProfileInstance.validate();
    const jobValidation = jobDescInstance.validate();

    if (userValidation.error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user profile data',
        errors: userValidation.error.details
      });
    }

    if (jobValidation.error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job description data',
        errors: jobValidation.error.details
      });
    }

    // Generate tailored content
    const result = await contentService.generateTailoredContent(
      userProfileInstance,
      jobDescInstance
    );

    res.json({
      success: true,
      data: result,
      message: `Tailored CV generated with ${result.tailoredCV.relevanceScore}% relevance score`
    });
  });

  /**
   * Optimize existing CV content for better alignment with job requirements
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  optimizeContent = asyncHandler(async (req, res) => {
    const { content, jobKeywords, targetScore = 80 } = req.body;

    logger.info('Starting content optimization', {
      targetScore,
      keywordCount: jobKeywords.length
    });

    const result = await contentService.optimizeContent(content, jobKeywords, targetScore);

    res.json({
      success: true,
      data: result,
      message: result.optimized ? 
        `Content optimized: ${result.message}` : 
        result.message
    });
  });

  /**
   * Generate professional summary based on user profile and job requirements
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  generateSummary = asyncHandler(async (req, res) => {
    const { userProfile, jobDescription, keywords } = req.body;

    logger.info('Generating professional summary', {
      userProfileId: userProfile.id,
      keywordCount: keywords.length
    });

    const summary = await contentService.generateTailoredSummary(
      userProfile,
      jobDescription,
      keywords
    );

    res.json({
      success: true,
      data: {
        summary,
        keywordsUsed: keywords.slice(0, 5),
        generatedAt: new Date()
      },
      message: 'Professional summary generated successfully'
    });
  });

  /**
   * Enhance work experience descriptions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  enhanceExperience = asyncHandler(async (req, res) => {
    const { experiences, keywords } = req.body;

    logger.info('Enhancing work experience', {
      experienceCount: experiences.length,
      keywordCount: keywords.length
    });

    const enhancedExperiences = [];
    
    for (const exp of experiences) {
      const enhanced = await contentService.enhanceExperienceBullets(exp, keywords);
      enhancedExperiences.push(enhanced);
    }

    res.json({
      success: true,
      data: {
        originalExperiences: experiences,
        enhancedExperiences,
        keywordsUsed: keywords
      },
      message: `Enhanced ${experiences.length} work experiences`
    });
  });

  /**
   * Generate skill recommendations based on job requirements
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  generateSkillRecommendations = asyncHandler(async (req, res) => {
    const { userSkills, jobKeywords } = req.body;

    logger.info('Generating skill recommendations', {
      currentSkillCount: userSkills.length,
      jobKeywordCount: jobKeywords.length
    });

    const tailoredSkills = await contentService.generateTailoredSkills(userSkills, jobKeywords);

    // Identify new skill recommendations
    const currentSkillNames = userSkills.map(s => 
      typeof s === 'string' ? s.toLowerCase() : s.name.toLowerCase()
    );
    
    const newSkills = tailoredSkills.filter(skill => 
      !currentSkillNames.includes(skill.toLowerCase())
    );

    res.json({
      success: true,
      data: {
        currentSkills: userSkills,
        recommendedSkills: tailoredSkills,
        newSkillSuggestions: newSkills,
        priorityOrder: tailoredSkills.slice(0, 10)
      },
      message: `Generated ${newSkills.length} new skill recommendations`
    });
  });

  /**
   * Analyze content quality and provide improvement suggestions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  analyzeContentQuality = asyncHandler(async (req, res) => {
    const { cvContent, jobKeywords } = req.body;

    logger.info('Analyzing content quality', {
      contentSections: Object.keys(cvContent).length,
      keywordCount: jobKeywords.length
    });

    // Create a mock user profile from CV content for analysis
    const mockProfile = {
      personal: cvContent.personal || {},
      summary: cvContent.summary || '',
      work_experience: cvContent.experience || [],
      skills: cvContent.skills?.map(s => ({ name: s })) || [],
      projects: cvContent.projects || [],
      education: cvContent.education || []
    };

    const userProfile = UserProfile.fromJSON(mockProfile);
    
    // Calculate completeness score
    const completenessScore = userProfile.getCompletenessScore();
    
    // Analyze keyword alignment
    const keywordService = require('../services/keywordService');
    const keywordAnalysis = keywordService.analyzeCVKeywords(userProfile, jobKeywords);

    // Generate recommendations
    const recommendations = [];
    
    if (completenessScore < 80) {
      recommendations.push({
        type: 'completeness',
        priority: 'high',
        message: 'Your CV profile is incomplete. Consider adding more details.',
        score: completenessScore
      });
    }

    if (keywordAnalysis.matchScore < 60) {
      recommendations.push({
        type: 'keyword_optimization',
        priority: 'high',
        message: 'Low keyword match with job requirements.',
        score: keywordAnalysis.matchScore
      });
    }

    const overallScore = Math.round((completenessScore + keywordAnalysis.matchScore) / 2);

    res.json({
      success: true,
      data: {
        overallScore,
        completenessScore,
        keywordMatchScore: keywordAnalysis.matchScore,
        recommendations,
        analysis: {
          strengths: keywordAnalysis.matchedKeywords.slice(0, 5),
          improvements: keywordAnalysis.missingKeywords.slice(0, 5)
        }
      },
      message: `Content analysis completed with ${overallScore}% overall score`
    });
  });

  /**
   * Generate multiple CV versions for A/B testing
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  generateVersions = asyncHandler(async (req, res) => {
    const { userProfile, jobDescription, versionCount = 3 } = req.body;

    if (versionCount > 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 versions allowed'
      });
    }

    logger.info('Generating multiple CV versions', {
      userProfileId: userProfile.id,
      versionCount
    });

    const versions = [];
    const variations = ['conservative', 'moderate', 'aggressive'];

    for (let i = 0; i < versionCount; i++) {
      const variation = variations[i % variations.length];
      
      // Generate content with different approaches
      const result = await contentService.generateTailoredContent(
        UserProfile.fromJSON(userProfile),
        JobDescription.fromJSON(jobDescription)
      );

      versions.push({
        id: `version_${i + 1}`,
        variation,
        content: result.tailoredCV,
        relevanceScore: result.tailoredCV.relevanceScore,
        analysis: result.analysis
      });
    }

    // Sort by relevance score
    versions.sort((a, b) => b.relevanceScore - a.relevanceScore);

    res.json({
      success: true,
      data: {
        versions,
        recommended: versions[0],
        versionCount: versions.length
      },
      message: `Generated ${versions.length} CV versions`
    });
  });
}

module.exports = new ContentController();