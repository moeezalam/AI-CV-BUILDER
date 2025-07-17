const claudeService = require('./claudeService');
const keywordService = require('./keywordService');
const logger = require('../utils/logger');
const TailoredCV = require('../models/TailoredCV');

class ContentService {
  /**
   * Generate tailored CV content based on user profile and job description
   * @param {Object} userProfile - User's profile data
   * @param {Object} jobDescription - Job description data
   * @returns {Promise<Object>} Tailored CV content
   */
  async generateTailoredContent(userProfile, jobDescription) {
    try {
      logger.info('Starting content tailoring process', {
        userId: userProfile.id,
        jobTitle: jobDescription.title
      });

      // Extract keywords from job description
      const keywordAnalysis = await keywordService.extractJobKeywords(jobDescription.description);
      const topKeywords = keywordAnalysis.keywords.slice(0, 10);

      // Analyze current CV against job requirements
      const cvAnalysis = keywordService.analyzeCVKeywords(userProfile, topKeywords);

      // Generate tailored content
      const tailoredContent = await this.createTailoredSections(
        userProfile, 
        jobDescription, 
        topKeywords,
        cvAnalysis
      );

      // Create TailoredCV instance
      const tailoredCV = new TailoredCV({
        userProfileId: userProfile.id,
        jobDescriptionId: jobDescription.id,
        ...tailoredContent,
        matchedKeywords: cvAnalysis.matchedKeywords.map(m => m.keyword),
        relevanceScore: cvAnalysis.matchScore
      });

      logger.info('Content tailoring completed', {
        relevanceScore: tailoredCV.relevanceScore,
        matchedKeywords: tailoredCV.matchedKeywords.length
      });

      return {
        tailoredCV: tailoredCV.toJSON(),
        analysis: {
          keywordAnalysis,
          cvAnalysis,
          recommendations: this.generateRecommendations(cvAnalysis, topKeywords)
        }
      };

    } catch (error) {
      logger.error('Content tailoring failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Create tailored sections for the CV
   * @param {Object} userProfile - User profile
   * @param {Object} jobDescription - Job description
   * @param {Array} keywords - Top keywords
   * @param {Object} cvAnalysis - CV analysis results
   * @returns {Promise<Object>} Tailored sections
   */
  async createTailoredSections(userProfile, jobDescription, keywords, cvAnalysis) {
    const sections = {};

    // Generate professional summary
    sections.summary = await this.generateTailoredSummary(
      userProfile, 
      jobDescription, 
      keywords
    );

    // Select and enhance work experience
    sections.experience = await this.selectAndEnhanceExperience(
      userProfile.work_experience || [],
      keywords,
      cvAnalysis
    );

    // Generate skills section
    sections.skills = await this.generateTailoredSkills(
      userProfile.skills || [],
      keywords
    );

    // Select relevant projects
    sections.projects = this.selectRelevantProjects(
      userProfile.projects || [],
      keywords
    );

    // Format education (usually doesn't need tailoring)
    sections.education = this.formatEducation(userProfile.education || []);

    return sections;
  }

  /**
   * Generate tailored professional summary
   * @param {Object} userProfile - User profile
   * @param {Object} jobDescription - Job description
   * @param {Array} keywords - Keywords to emphasize
   * @returns {Promise<string>} Tailored summary
   */
  async generateTailoredSummary(userProfile, jobDescription, keywords) {
    try {
      const summary = await claudeService.generateSummary(
        userProfile,
        jobDescription.description,
        keywords
      );

      return summary;

    } catch (error) {
      logger.error('Failed to generate tailored summary', { error: error.message });
      
      // Fallback to basic summary
      return this.generateFallbackSummary(userProfile, keywords);
    }
  }

  /**
   * Select and enhance work experience based on relevance
   * @param {Array} experiences - User's work experiences
   * @param {Array} keywords - Job keywords
   * @param {Object} cvAnalysis - CV analysis
   * @returns {Promise<Array>} Enhanced experiences
   */
  async selectAndEnhanceExperience(experiences, keywords, cvAnalysis) {
    if (!experiences || experiences.length === 0) return [];

    // Score experiences by relevance
    const scoredExperiences = experiences.map(exp => ({
      ...exp,
      relevanceScore: this.calculateExperienceRelevance(exp, keywords)
    }));

    // Sort by relevance and take top experiences
    const topExperiences = scoredExperiences
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 4); // Top 4 most relevant experiences

    // Enhance bullet points for selected experiences
    const enhancedExperiences = [];
    
    for (const exp of topExperiences) {
      const enhancedExp = await this.enhanceExperienceBullets(exp, keywords);
      enhancedExperiences.push({
        company: exp.company,
        role: exp.role,
        dates: `${exp.start_date} - ${exp.end_date || 'Present'}`,
        bullets: enhancedExp.bullets,
        relevanceScore: exp.relevanceScore
      });
    }

    return enhancedExperiences;
  }

  /**
   * Calculate experience relevance score
   * @param {Object} experience - Work experience
   * @param {Array} keywords - Job keywords
   * @returns {number} Relevance score
   */
  calculateExperienceRelevance(experience, keywords) {
    let score = 0;
    const keywordSet = new Set(keywords.map(k => 
      (typeof k === 'string' ? k : k.keyword).toLowerCase()
    ));

    // Check role title
    const roleWords = experience.role.toLowerCase().split(/\s+/);
    roleWords.forEach(word => {
      if (keywordSet.has(word)) score += 2;
    });

    // Check bullet points
    if (experience.bullets) {
      experience.bullets.forEach(bullet => {
        const bulletText = typeof bullet === 'string' ? bullet : bullet.text;
        const bulletWords = bulletText.toLowerCase().match(/\b\w+\b/g) || [];
        
        bulletWords.forEach(word => {
          if (keywordSet.has(word)) score += 1;
        });
      });
    }

    return score;
  }

  /**
   * Enhance experience bullet points
   * @param {Object} experience - Work experience
   * @param {Array} keywords - Keywords to emphasize
   * @returns {Promise<Object>} Enhanced experience
   */
  async enhanceExperienceBullets(experience, keywords) {
    if (!experience.bullets || experience.bullets.length === 0) {
      return { ...experience, bullets: [] };
    }

    const enhancedBullets = [];
    const topKeywords = keywords.slice(0, 5);

    // Select top 3-4 bullets per experience
    const selectedBullets = experience.bullets.slice(0, 4);

    for (const bullet of selectedBullets) {
      try {
        const bulletText = typeof bullet === 'string' ? bullet : bullet.text;
        const enhancedBullet = await claudeService.rewriteBullet(bulletText, topKeywords);
        enhancedBullets.push(enhancedBullet);
      } catch (error) {
        logger.error('Failed to enhance bullet', { error: error.message });
        // Keep original bullet if enhancement fails
        enhancedBullets.push(typeof bullet === 'string' ? bullet : bullet.text);
      }
    }

    return { ...experience, bullets: enhancedBullets };
  }

  /**
   * Generate tailored skills section
   * @param {Array} userSkills - User's current skills
   * @param {Array} jobKeywords - Job keywords
   * @returns {Promise<Array>} Tailored skills list
   */
  async generateTailoredSkills(userSkills, jobKeywords) {
    try {
      // Get skills from Claude
      const claudeSkills = await claudeService.generateSkillsList(jobKeywords);
      
      // Merge with user's existing skills
      const userSkillNames = userSkills.map(s => 
        typeof s === 'string' ? s : s.name
      );

      // Prioritize skills that appear in job keywords
      const prioritizedSkills = [];
      const jobKeywordSet = new Set(jobKeywords.map(k => 
        (typeof k === 'string' ? k : k.keyword).toLowerCase()
      ));

      // Add matching user skills first
      userSkillNames.forEach(skill => {
        if (jobKeywordSet.has(skill.toLowerCase())) {
          prioritizedSkills.push(skill);
        }
      });

      // Add Claude-suggested skills that aren't already included
      claudeSkills.forEach(skill => {
        if (!prioritizedSkills.some(ps => ps.toLowerCase() === skill.toLowerCase())) {
          prioritizedSkills.push(skill);
        }
      });

      // Add remaining user skills
      userSkillNames.forEach(skill => {
        if (!prioritizedSkills.some(ps => ps.toLowerCase() === skill.toLowerCase())) {
          prioritizedSkills.push(skill);
        }
      });

      return prioritizedSkills.slice(0, 15); // Limit to 15 skills

    } catch (error) {
      logger.error('Failed to generate tailored skills', { error: error.message });
      
      // Fallback to user skills
      return userSkills.map(s => typeof s === 'string' ? s : s.name).slice(0, 12);
    }
  }

  /**
   * Select relevant projects based on keywords
   * @param {Array} projects - User's projects
   * @param {Array} keywords - Job keywords
   * @returns {Array} Selected projects
   */
  selectRelevantProjects(projects, keywords) {
    if (!projects || projects.length === 0) return [];

    const keywordSet = new Set(keywords.map(k => 
      (typeof k === 'string' ? k : k.keyword).toLowerCase()
    ));

    // Score projects by relevance
    const scoredProjects = projects.map(project => {
      let score = 0;
      
      // Check project name
      const nameWords = project.name.toLowerCase().split(/\s+/);
      nameWords.forEach(word => {
        if (keywordSet.has(word)) score += 2;
      });

      // Check description
      if (project.description) {
        const descWords = project.description.toLowerCase().match(/\b\w+\b/g) || [];
        descWords.forEach(word => {
          if (keywordSet.has(word)) score += 1;
        });
      }

      // Check technologies
      if (project.technologies) {
        project.technologies.forEach(tech => {
          if (keywordSet.has(tech.toLowerCase())) score += 3;
        });
      }

      return { ...project, relevanceScore: score };
    });

    // Return top 3 most relevant projects
    return scoredProjects
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3)
      .map(({ relevanceScore, ...project }) => project);
  }

  /**
   * Format education section
   * @param {Array} education - User's education
   * @returns {Array} Formatted education
   */
  formatEducation(education) {
    return education.map(edu => ({
      degree: edu.degree,
      institution: edu.institution,
      dates: edu.end_date ? 
        `${edu.start_date} - ${edu.end_date}` : 
        `${edu.start_date} - Present`,
      gpa: edu.gpa,
      relevant_courses: edu.relevant_courses
    }));
  }

  /**
   * Generate improvement recommendations
   * @param {Object} cvAnalysis - CV analysis results
   * @param {Array} keywords - Job keywords
   * @returns {Array} Recommendations
   */
  generateRecommendations(cvAnalysis, keywords) {
    const recommendations = [];

    // Score-based recommendations
    if (cvAnalysis.matchScore < 60) {
      recommendations.push({
        type: 'low_match_score',
        priority: 'high',
        message: 'Your CV has a low keyword match score. Consider adding more relevant skills and experience.',
        action: 'Add missing keywords to your skills and experience sections'
      });
    }

    // Missing keywords recommendations
    if (cvAnalysis.missingKeywords.length > 0) {
      const topMissing = cvAnalysis.missingKeywords.slice(0, 5);
      recommendations.push({
        type: 'missing_keywords',
        priority: 'medium',
        message: `Consider adding these relevant keywords: ${topMissing.map(k => k.keyword || k).join(', ')}`,
        action: 'Incorporate these keywords naturally into your experience descriptions'
      });
    }

    // Experience recommendations
    if (cvAnalysis.matchedKeywords.length < 3) {
      recommendations.push({
        type: 'enhance_experience',
        priority: 'high',
        message: 'Your work experience could better highlight relevant skills.',
        action: 'Rewrite bullet points to emphasize job-relevant achievements and technologies'
      });
    }

    return recommendations;
  }

  /**
   * Generate fallback summary when Claude API fails
   * @param {Object} userProfile - User profile
   * @param {Array} keywords - Keywords to include
   * @returns {string} Fallback summary
   */
  generateFallbackSummary(userProfile, keywords) {
    const name = userProfile.personal?.name || 'Professional';
    const experienceCount = userProfile.work_experience?.length || 0;
    const topSkills = keywords.slice(0, 3).map(k => 
      typeof k === 'string' ? k : k.keyword
    ).join(', ');

    return `Experienced ${name.split(' ')[0]} with ${experienceCount}+ years of professional experience. Skilled in ${topSkills} with a proven track record of delivering results. Seeking to leverage expertise in a challenging new role.`;
  }

  /**
   * Optimize existing CV content for better keyword alignment
   * @param {Object} cvContent - Existing CV content
   * @param {Array} jobKeywords - Target job keywords
   * @param {number} targetScore - Target match score
   * @returns {Promise<Object>} Optimized content
   */
  async optimizeContent(cvContent, jobKeywords, targetScore = 80) {
    try {
      logger.info('Starting content optimization', {
        targetScore,
        keywordCount: jobKeywords.length
      });

      const optimizedContent = { ...cvContent };
      
      // Analyze current content
      const currentAnalysis = keywordService.analyzeCVKeywords(cvContent, jobKeywords);
      
      if (currentAnalysis.matchScore >= targetScore) {
        return {
          content: optimizedContent,
          analysis: currentAnalysis,
          optimized: false,
          message: 'Content already meets target score'
        };
      }

      // Optimize different sections
      if (cvContent.experience) {
        optimizedContent.experience = await this.optimizeExperienceSection(
          cvContent.experience,
          jobKeywords,
          currentAnalysis.missingKeywords
        );
      }

      if (cvContent.skills) {
        optimizedContent.skills = this.optimizeSkillsSection(
          cvContent.skills,
          jobKeywords
        );
      }

      if (cvContent.summary) {
        optimizedContent.summary = await this.optimizeSummary(
          cvContent.summary,
          jobKeywords,
          currentAnalysis.missingKeywords.slice(0, 5)
        );
      }

      // Re-analyze optimized content
      const newAnalysis = keywordService.analyzeCVKeywords(optimizedContent, jobKeywords);

      return {
        content: optimizedContent,
        analysis: newAnalysis,
        optimized: true,
        improvement: newAnalysis.matchScore - currentAnalysis.matchScore,
        message: `Match score improved from ${currentAnalysis.matchScore}% to ${newAnalysis.matchScore}%`
      };

    } catch (error) {
      logger.error('Content optimization failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Optimize experience section
   * @param {Array} experiences - Current experiences
   * @param {Array} jobKeywords - Job keywords
   * @param {Array} missingKeywords - Keywords to incorporate
   * @returns {Promise<Array>} Optimized experiences
   */
  async optimizeExperienceSection(experiences, jobKeywords, missingKeywords) {
    const optimizedExperiences = [];

    for (const exp of experiences) {
      const relevantKeywords = missingKeywords.slice(0, 3);
      const optimizedBullets = [];

      for (const bullet of exp.bullets || []) {
        try {
          const optimizedBullet = await claudeService.rewriteBullet(bullet, relevantKeywords);
          optimizedBullets.push(optimizedBullet);
        } catch (error) {
          optimizedBullets.push(bullet); // Keep original if optimization fails
        }
      }

      optimizedExperiences.push({
        ...exp,
        bullets: optimizedBullets
      });
    }

    return optimizedExperiences;
  }

  /**
   * Optimize skills section
   * @param {Array} currentSkills - Current skills
   * @param {Array} jobKeywords - Job keywords
   * @returns {Array} Optimized skills
   */
  optimizeSkillsSection(currentSkills, jobKeywords) {
    const skillSet = new Set(currentSkills.map(s => s.toLowerCase()));
    const optimizedSkills = [...currentSkills];

    // Add missing high-priority keywords as skills
    jobKeywords.forEach(jk => {
      const keyword = typeof jk === 'string' ? jk : jk.keyword;
      const weight = typeof jk === 'object' ? jk.weight : 1.0;
      
      if (weight > 0.7 && !skillSet.has(keyword.toLowerCase())) {
        optimizedSkills.push(keyword);
        skillSet.add(keyword.toLowerCase());
      }
    });

    return optimizedSkills.slice(0, 15); // Limit to 15 skills
  }

  /**
   * Optimize summary section
   * @param {string} currentSummary - Current summary
   * @param {Array} jobKeywords - Job keywords
   * @param {Array} missingKeywords - Keywords to incorporate
   * @returns {Promise<string>} Optimized summary
   */
  async optimizeSummary(currentSummary, jobKeywords, missingKeywords) {
    try {
      const keywordsToAdd = missingKeywords.slice(0, 3).map(k => 
        typeof k === 'string' ? k : k.keyword
      );

      const prompt = `Rewrite this professional summary to naturally incorporate these keywords: ${keywordsToAdd.join(', ')}. Keep it professional and under 60 words.

Current summary:
"${currentSummary}"`;

      const optimizedSummary = await claudeService.makeRequest(prompt, {
        maxTokens: 200,
        temperature: 0.6
      });

      return optimizedSummary.trim().replace(/^["']|["']$/g, '');

    } catch (error) {
      logger.error('Failed to optimize summary', { error: error.message });
      return currentSummary; // Return original if optimization fails
    }
  }
}

module.exports = new ContentService();