const claudeService = require('./claudeService');
const logger = require('../utils/logger');
const JobDescription = require('../models/JobDescription');

class KeywordService {
  /**
   * Extract and analyze keywords from job description
   * @param {string} jobDescriptionText - Raw job description text
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Keyword analysis results
   */
  async extractJobKeywords(jobDescriptionText, options = {}) {
    try {
      logger.info('Starting keyword extraction', {
        textLength: jobDescriptionText.length
      });

      // Use Claude API for keyword extraction
      const claudeKeywords = await claudeService.extractKeywords(jobDescriptionText);
      
      // Combine with basic text analysis
      const basicKeywords = this.basicKeywordExtraction(jobDescriptionText);
      
      // Merge and deduplicate keywords
      const mergedKeywords = this.mergeKeywords(claudeKeywords, basicKeywords);
      
      // Score and rank keywords
      const rankedKeywords = this.rankKeywords(mergedKeywords, jobDescriptionText);

      const result = {
        keywords: rankedKeywords,
        totalCount: rankedKeywords.length,
        categories: this.categorizeKeywords(rankedKeywords),
        extractedAt: new Date(),
        method: 'claude_enhanced'
      };

      logger.info('Keyword extraction completed', {
        keywordCount: rankedKeywords.length,
        categories: Object.keys(result.categories).length
      });

      return result;

    } catch (error) {
      logger.error('Keyword extraction failed', { error: error.message });
      
      // Fallback to basic extraction
      const basicKeywords = this.basicKeywordExtraction(jobDescriptionText);
      
      return {
        keywords: basicKeywords,
        totalCount: basicKeywords.length,
        categories: this.categorizeKeywords(basicKeywords),
        extractedAt: new Date(),
        method: 'basic_fallback'
      };
    }
  }

  /**
   * Analyze CV content against job keywords
   * @param {Object} userProfile - User's profile data
   * @param {Array} jobKeywords - Keywords from job description
   * @returns {Object} Analysis results
   */
  analyzeCVKeywords(userProfile, jobKeywords) {
    try {
      const userKeywords = this.extractUserKeywords(userProfile);
      const matches = this.findKeywordMatches(userKeywords, jobKeywords);
      const score = this.calculateMatchScore(matches, jobKeywords);
      const suggestions = this.generateSuggestions(matches, jobKeywords);

      return {
        matchScore: score,
        totalMatches: matches.length,
        matchedKeywords: matches,
        missingKeywords: jobKeywords.filter(jk => 
          !matches.some(m => m.keyword.toLowerCase() === jk.keyword.toLowerCase())
        ),
        suggestions,
        userKeywordCount: userKeywords.length,
        jobKeywordCount: jobKeywords.length
      };

    } catch (error) {
      logger.error('CV keyword analysis failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get keyword suggestions for improvement
   * @param {string} industry - Industry context
   * @param {Array} currentKeywords - Current keywords in CV
   * @returns {Array} Suggested keywords
   */
  getKeywordSuggestions(industry = 'general', currentKeywords = []) {
    const industryKeywords = this.getIndustryKeywords(industry);
    const currentSet = new Set(currentKeywords.map(k => k.toLowerCase()));
    
    return industryKeywords
      .filter(keyword => !currentSet.has(keyword.keyword.toLowerCase()))
      .slice(0, 10);
  }

  /**
   * Basic keyword extraction using text analysis
   * @param {string} text - Text to analyze
   * @returns {Array} Extracted keywords
   */
  basicKeywordExtraction(text) {
    const keywords = [];
    const cleanText = text.toLowerCase();

    // Technical skills patterns
    const techPatterns = {
      programming: /\b(javascript|python|java|c\+\+|c#|php|ruby|go|rust|swift|kotlin|typescript)\b/g,
      frameworks: /\b(react|angular|vue|express|django|flask|spring|laravel|rails)\b/g,
      databases: /\b(mysql|postgresql|mongodb|redis|elasticsearch|oracle|sqlite)\b/g,
      cloud: /\b(aws|azure|gcp|docker|kubernetes|terraform|jenkins)\b/g,
      tools: /\b(git|jira|confluence|slack|figma|photoshop|excel)\b/g
    };

    // Extract technical keywords
    Object.entries(techPatterns).forEach(([category, pattern]) => {
      const matches = cleanText.match(pattern) || [];
      matches.forEach(match => {
        keywords.push({
          keyword: match,
          weight: 0.8,
          category: 'technical',
          subcategory: category
        });
      });
    });

    // Extract soft skills
    const softSkills = [
      'leadership', 'communication', 'teamwork', 'problem-solving',
      'analytical', 'creative', 'organized', 'detail-oriented',
      'collaborative', 'innovative', 'strategic', 'adaptable'
    ];

    softSkills.forEach(skill => {
      if (cleanText.includes(skill)) {
        keywords.push({
          keyword: skill,
          weight: 0.6,
          category: 'soft'
        });
      }
    });

    // Extract action verbs
    const actionVerbs = [
      'developed', 'implemented', 'designed', 'managed', 'led',
      'created', 'optimized', 'improved', 'analyzed', 'coordinated'
    ];

    actionVerbs.forEach(verb => {
      if (cleanText.includes(verb)) {
        keywords.push({
          keyword: verb,
          weight: 0.5,
          category: 'action'
        });
      }
    });

    return this.deduplicateKeywords(keywords);
  }

  /**
   * Extract keywords from user profile
   * @param {Object} userProfile - User's profile data
   * @returns {Array} User's keywords
   */
  extractUserKeywords(userProfile) {
    const keywords = new Set();

    // Extract from skills
    if (userProfile.skills) {
      userProfile.skills.forEach(skill => {
        const skillName = typeof skill === 'string' ? skill : skill.name;
        if (skillName) keywords.add(skillName.toLowerCase());
      });
    }

    // Extract from work experience
    if (userProfile.work_experience) {
      userProfile.work_experience.forEach(exp => {
        // Add job titles
        if (exp.role) keywords.add(exp.role.toLowerCase());
        
        // Extract from bullet points
        if (exp.bullets) {
          exp.bullets.forEach(bullet => {
            const text = typeof bullet === 'string' ? bullet : bullet.text;
            if (text) {
              const words = text.toLowerCase().match(/\b\w{3,}\b/g) || [];
              words.forEach(word => {
                if (word.length > 3 && !this.isCommonWord(word)) {
                  keywords.add(word);
                }
              });
            }
          });
        }
      });
    }

    // Extract from projects
    if (userProfile.projects) {
      userProfile.projects.forEach(project => {
        if (project.technologies) {
          project.technologies.forEach(tech => {
            keywords.add(tech.toLowerCase());
          });
        }
      });
    }

    return Array.from(keywords).map(keyword => ({
      keyword,
      weight: 1.0,
      source: 'user_profile'
    }));
  }

  /**
   * Find matches between user keywords and job keywords
   * @param {Array} userKeywords - User's keywords
   * @param {Array} jobKeywords - Job's keywords
   * @returns {Array} Matched keywords
   */
  findKeywordMatches(userKeywords, jobKeywords) {
    const matches = [];
    const userKeywordMap = new Map();
    
    userKeywords.forEach(uk => {
      userKeywordMap.set(uk.keyword.toLowerCase(), uk);
    });

    jobKeywords.forEach(jk => {
      const jobKeyword = typeof jk === 'string' ? jk : jk.keyword;
      const userMatch = userKeywordMap.get(jobKeyword.toLowerCase());
      
      if (userMatch) {
        matches.push({
          keyword: jobKeyword,
          jobWeight: typeof jk === 'object' ? jk.weight : 1.0,
          userWeight: userMatch.weight,
          matchStrength: this.calculateMatchStrength(userMatch, jk)
        });
      }
    });

    return matches.sort((a, b) => b.matchStrength - a.matchStrength);
  }

  /**
   * Calculate overall match score
   * @param {Array} matches - Matched keywords
   * @param {Array} jobKeywords - All job keywords
   * @returns {number} Match score (0-100)
   */
  calculateMatchScore(matches, jobKeywords) {
    if (jobKeywords.length === 0) return 0;

    const totalJobWeight = jobKeywords.reduce((sum, jk) => 
      sum + (typeof jk === 'object' ? jk.weight : 1.0), 0
    );

    const matchedWeight = matches.reduce((sum, match) => 
      sum + (match.jobWeight * match.matchStrength), 0
    );

    return Math.round((matchedWeight / totalJobWeight) * 100);
  }

  /**
   * Generate improvement suggestions
   * @param {Array} matches - Current matches
   * @param {Array} jobKeywords - Job keywords
   * @returns {Array} Suggestions
   */
  generateSuggestions(matches, jobKeywords) {
    const suggestions = [];
    const matchedKeywords = new Set(matches.map(m => m.keyword.toLowerCase()));

    // Find missing high-weight keywords
    const missingImportant = jobKeywords
      .filter(jk => {
        const keyword = typeof jk === 'string' ? jk : jk.keyword;
        const weight = typeof jk === 'object' ? jk.weight : 1.0;
        return weight > 0.7 && !matchedKeywords.has(keyword.toLowerCase());
      })
      .slice(0, 5);

    missingImportant.forEach(jk => {
      const keyword = typeof jk === 'string' ? jk : jk.keyword;
      suggestions.push({
        type: 'add_keyword',
        keyword,
        priority: 'high',
        reason: 'High-weight keyword missing from your profile'
      });
    });

    return suggestions;
  }

  /**
   * Merge keywords from different sources
   * @param {Array} claudeKeywords - Keywords from Claude
   * @param {Array} basicKeywords - Keywords from basic extraction
   * @returns {Array} Merged keywords
   */
  mergeKeywords(claudeKeywords, basicKeywords) {
    const keywordMap = new Map();

    // Add Claude keywords (higher priority)
    claudeKeywords.forEach(ck => {
      keywordMap.set(ck.keyword.toLowerCase(), {
        ...ck,
        sources: ['claude']
      });
    });

    // Add basic keywords (don't override Claude keywords)
    basicKeywords.forEach(bk => {
      const key = bk.keyword.toLowerCase();
      if (keywordMap.has(key)) {
        keywordMap.get(key).sources.push('basic');
      } else {
        keywordMap.set(key, {
          ...bk,
          sources: ['basic']
        });
      }
    });

    return Array.from(keywordMap.values());
  }

  /**
   * Rank keywords by relevance
   * @param {Array} keywords - Keywords to rank
   * @param {string} originalText - Original job description
   * @returns {Array} Ranked keywords
   */
  rankKeywords(keywords, originalText) {
    return keywords
      .map(keyword => ({
        ...keyword,
        frequency: this.calculateFrequency(keyword.keyword, originalText),
        finalScore: this.calculateFinalScore(keyword, originalText)
      }))
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 20); // Top 20 keywords
  }

  /**
   * Calculate keyword frequency in text
   * @param {string} keyword - Keyword to search for
   * @param {string} text - Text to search in
   * @returns {number} Frequency count
   */
  calculateFrequency(keyword, text) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }

  /**
   * Calculate final relevance score
   * @param {Object} keyword - Keyword object
   * @param {string} text - Original text
   * @returns {number} Final score
   */
  calculateFinalScore(keyword, text) {
    const baseWeight = keyword.weight || 1.0;
    const frequency = this.calculateFrequency(keyword.keyword, text);
    const sourceBonus = keyword.sources?.includes('claude') ? 0.2 : 0;
    
    return baseWeight + (frequency * 0.1) + sourceBonus;
  }

  /**
   * Categorize keywords
   * @param {Array} keywords - Keywords to categorize
   * @returns {Object} Categorized keywords
   */
  categorizeKeywords(keywords) {
    const categories = {};
    
    keywords.forEach(keyword => {
      const category = keyword.category || 'general';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(keyword);
    });

    return categories;
  }

  /**
   * Remove duplicate keywords
   * @param {Array} keywords - Keywords array
   * @returns {Array} Deduplicated keywords
   */
  deduplicateKeywords(keywords) {
    const seen = new Set();
    return keywords.filter(keyword => {
      const key = keyword.keyword.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Calculate match strength between user and job keyword
   * @param {Object} userKeyword - User's keyword
   * @param {Object} jobKeyword - Job's keyword
   * @returns {number} Match strength (0-1)
   */
  calculateMatchStrength(userKeyword, jobKeyword) {
    // Exact match gets full strength
    if (userKeyword.keyword.toLowerCase() === 
        (typeof jobKeyword === 'string' ? jobKeyword : jobKeyword.keyword).toLowerCase()) {
      return 1.0;
    }
    
    // Could add fuzzy matching logic here
    return 0.8; // Partial match
  }

  /**
   * Check if word is common/stop word
   * @param {string} word - Word to check
   * @returns {boolean} True if common word
   */
  isCommonWord(word) {
    const commonWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
      'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
      'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy',
      'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'will', 'work'
    ]);
    
    return commonWords.has(word.toLowerCase());
  }

  /**
   * Get industry-specific keywords
   * @param {string} industry - Industry name
   * @returns {Array} Industry keywords
   */
  getIndustryKeywords(industry) {
    const industryKeywords = {
      'software': [
        { keyword: 'agile', weight: 0.8, category: 'methodology' },
        { keyword: 'scrum', weight: 0.7, category: 'methodology' },
        { keyword: 'ci/cd', weight: 0.8, category: 'devops' },
        { keyword: 'microservices', weight: 0.7, category: 'architecture' },
        { keyword: 'api design', weight: 0.8, category: 'technical' }
      ],
      'marketing': [
        { keyword: 'seo', weight: 0.8, category: 'digital' },
        { keyword: 'google analytics', weight: 0.7, category: 'analytics' },
        { keyword: 'content marketing', weight: 0.8, category: 'strategy' },
        { keyword: 'social media', weight: 0.7, category: 'digital' },
        { keyword: 'campaign management', weight: 0.8, category: 'management' }
      ],
      'finance': [
        { keyword: 'financial modeling', weight: 0.9, category: 'analysis' },
        { keyword: 'excel', weight: 0.8, category: 'tools' },
        { keyword: 'risk management', weight: 0.8, category: 'management' },
        { keyword: 'compliance', weight: 0.7, category: 'regulatory' },
        { keyword: 'budgeting', weight: 0.8, category: 'planning' }
      ]
    };

    return industryKeywords[industry.toLowerCase()] || [];
  }
}

module.exports = new KeywordService();