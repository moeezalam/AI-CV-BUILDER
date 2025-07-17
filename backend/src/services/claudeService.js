const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../utils/logger');
const { ExternalServiceError } = require('../middleware/error_handler_middleware');

class ClaudeService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });
    this.model = 'claude-3-sonnet-20240229';
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Make a request to Claude API with retry logic
   * @param {string} prompt - The prompt to send
   * @param {Object} options - Additional options
   * @returns {Promise<string>} Claude's response
   */
  async makeRequest(prompt, options = {}) {
    const {
      maxTokens = 1000,
      temperature = 0.7,
      systemPrompt = 'You are a professional CV writing assistant.'
    } = options;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        logger.info(`Claude API request attempt ${attempt}`, {
          promptLength: prompt.length,
          maxTokens,
          temperature
        });

        const response = await this.client.messages.create({
          model: this.model,
          max_tokens: maxTokens,
          temperature,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        });

        const content = response.content[0]?.text;
        
        if (!content) {
          throw new Error('Empty response from Claude API');
        }

        logger.info('Claude API request successful', {
          responseLength: content.length,
          tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens
        });

        return content;

      } catch (error) {
        logger.error(`Claude API request failed (attempt ${attempt})`, {
          error: error.message,
          status: error.status,
          type: error.type
        });

        // Don't retry on client errors (4xx)
        if (error.status >= 400 && error.status < 500 && error.status !== 429) {
          throw new ExternalServiceError(
            `Claude API error: ${error.message}`,
            'claude'
          );
        }

        // If this was the last attempt, throw the error
        if (attempt === this.maxRetries) {
          throw new ExternalServiceError(
            `Claude API failed after ${this.maxRetries} attempts: ${error.message}`,
            'claude'
          );
        }

        // Wait before retrying (exponential backoff)
        await this.sleep(this.retryDelay * Math.pow(2, attempt - 1));
      }
    }
  }

  /**
   * Extract keywords from job description
   * @param {string} jobDescription - The job description text
   * @returns {Promise<Array>} Array of keywords with weights
   */
  async extractKeywords(jobDescription) {
    const prompt = `Given the following job description, extract the top 15 keywords (skills, technologies, action nouns) and assign each a relevance weight between 0 and 1. Respond in JSON array format only, no additional text.

Job Description:
"${jobDescription}"

Expected format:
[
  {"keyword": "JavaScript", "weight": 0.9, "category": "technical"},
  {"keyword": "React", "weight": 0.8, "category": "technical"},
  {"keyword": "leadership", "weight": 0.7, "category": "soft"}
]`;

    try {
      const response = await this.makeRequest(prompt, {
        maxTokens: 800,
        temperature: 0.3,
        systemPrompt: 'You are an expert at analyzing job descriptions and extracting relevant keywords. Always respond with valid JSON only.'
      });

      // Parse JSON response
      const keywords = JSON.parse(response.trim());
      
      // Validate the response structure
      if (!Array.isArray(keywords)) {
        throw new Error('Response is not an array');
      }

      return keywords.map(k => ({
        keyword: k.keyword || k,
        weight: k.weight || 1.0,
        category: k.category || 'general'
      }));

    } catch (error) {
      logger.error('Failed to extract keywords', { error: error.message });
      
      // Fallback to basic keyword extraction
      return this.fallbackKeywordExtraction(jobDescription);
    }
  }

  /**
   * Rewrite bullet points to emphasize keywords
   * @param {string} bullet - Original bullet point
   * @param {Array} keywords - Keywords to emphasize
   * @returns {Promise<string>} Rewritten bullet point
   */
  async rewriteBullet(bullet, keywords) {
    const keywordList = keywords.slice(0, 5).map(k => 
      typeof k === 'string' ? k : k.keyword
    ).join(', ');

    const prompt = `Rewrite the following resume bullet to align with job requirements. Emphasize these keywords: ${keywordList}. Use active voice, start with a strong verb, and include any available metrics. Output only the rewritten bullet point.

Original:
"${bullet}"`;

    try {
      const response = await this.makeRequest(prompt, {
        maxTokens: 200,
        temperature: 0.5,
        systemPrompt: 'You are an expert resume writer. Create compelling, ATS-friendly bullet points.'
      });

      return response.trim().replace(/^["']|["']$/g, ''); // Remove quotes if present

    } catch (error) {
      logger.error('Failed to rewrite bullet', { error: error.message, bullet });
      return bullet; // Return original if rewrite fails
    }
  }

  /**
   * Generate professional summary
   * @param {Object} userProfile - User's profile data
   * @param {string} jobDescription - Job description
   * @param {Array} keywords - Relevant keywords
   * @returns {Promise<string>} Professional summary
   */
  async generateSummary(userProfile, jobDescription, keywords) {
    const keywordList = keywords.slice(0, 8).map(k => 
      typeof k === 'string' ? k : k.keyword
    ).join(', ');

    const prompt = `Generate a 3-line professional summary for a candidate applying to this job. Use the following keywords naturally: ${keywordList}. Maximum 60 words. Make it compelling and specific.

Job Description:
"${jobDescription}"

Candidate Background:
- Name: ${userProfile.personal?.name || 'Candidate'}
- Experience: ${userProfile.work_experience?.length || 0} roles
- Key Skills: ${userProfile.skills?.slice(0, 5).map(s => s.name || s).join(', ') || 'Various skills'}

Output only the summary, no additional text.`;

    try {
      const response = await this.makeRequest(prompt, {
        maxTokens: 300,
        temperature: 0.6,
        systemPrompt: 'You are an expert resume writer specializing in compelling professional summaries.'
      });

      return response.trim().replace(/^["']|["']$/g, '');

    } catch (error) {
      logger.error('Failed to generate summary', { error: error.message });
      
      // Fallback summary
      return `Experienced professional with expertise in ${keywordList.split(', ').slice(0, 3).join(', ')}. Proven track record of delivering results in dynamic environments. Seeking to leverage skills and experience in a challenging new role.`;
    }
  }

  /**
   * Generate skills list from keywords
   * @param {Array} keywords - Extracted keywords
   * @returns {Promise<Array>} Sorted skills array
   */
  async generateSkillsList(keywords) {
    const keywordText = keywords.map(k => 
      typeof k === 'object' ? `${k.keyword} (${k.weight})` : k
    ).join('\n');

    const prompt = `From the following keywords list, create a clean skills list sorted by relevance. Output as a JSON array of strings, no additional text.

Keywords:
${keywordText}

Output format: ["Skill 1", "Skill 2", "Skill 3", ...]`;

    try {
      const response = await this.makeRequest(prompt, {
        maxTokens: 400,
        temperature: 0.3,
        systemPrompt: 'You are an expert at organizing skills for resumes. Always respond with valid JSON only.'
      });

      const skills = JSON.parse(response.trim());
      return Array.isArray(skills) ? skills : [];

    } catch (error) {
      logger.error('Failed to generate skills list', { error: error.message });
      
      // Fallback: extract skills from keywords
      return keywords
        .filter(k => (typeof k === 'object' ? k.weight : 1) > 0.5)
        .map(k => typeof k === 'object' ? k.keyword : k)
        .slice(0, 12);
    }
  }

  /**
   * Fallback keyword extraction using simple text analysis
   * @param {string} text - Text to analyze
   * @returns {Array} Basic keywords array
   */
  fallbackKeywordExtraction(text) {
    const commonTechTerms = [
      'javascript', 'python', 'java', 'react', 'node', 'angular', 'vue',
      'typescript', 'html', 'css', 'sql', 'mongodb', 'postgresql', 'mysql',
      'aws', 'azure', 'docker', 'kubernetes', 'git', 'linux', 'windows',
      'api', 'rest', 'graphql', 'microservices', 'agile', 'scrum'
    ];

    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const keywords = [];

    commonTechTerms.forEach(term => {
      if (words.includes(term)) {
        keywords.push({
          keyword: term,
          weight: 0.8,
          category: 'technical'
        });
      }
    });

    // Add some general keywords
    const generalTerms = ['experience', 'management', 'development', 'design', 'analysis'];
    generalTerms.forEach(term => {
      if (words.includes(term)) {
        keywords.push({
          keyword: term,
          weight: 0.6,
          category: 'general'
        });
      }
    });

    return keywords.slice(0, 10);
  }

  /**
   * Sleep utility for retry delays
   * @param {number} ms - Milliseconds to sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new ClaudeService();