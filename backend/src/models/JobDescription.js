const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

class JobDescription {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.title = data.title || '';
    this.company = data.company || '';
    this.description = data.description || '';
    this.requirements = data.requirements || [];
    this.keywords = data.keywords || [];
    this.location = data.location || '';
    this.salary_range = data.salary_range || '';
    this.job_type = data.job_type || 'full-time';
    this.experience_level = data.experience_level || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static getValidationSchema() {
    return Joi.object({
      title: Joi.string().required().max(150).trim(),
      company: Joi.string().required().max(100).trim(),
      description: Joi.string().required().min(50),
      requirements: Joi.array().items(Joi.string()),
      location: Joi.string().max(100),
      salary_range: Joi.string().max(50),
      job_type: Joi.string().valid('full-time', 'part-time', 'contract', 'internship', 'remote').default('full-time'),
      experience_level: Joi.string().valid('entry', 'mid', 'senior', 'lead', 'executive')
    });
  }

  validate() {
    const schema = JobDescription.getValidationSchema();
    return schema.validate(this.toJSON());
  }

  extractKeywords() {
    const text = `${this.title} ${this.description} ${this.requirements.join(' ')}`.toLowerCase();
    
    // Common technical keywords patterns
    const techPatterns = [
      /\b(javascript|python|java|react|node\.?js|angular|vue|typescript|html|css|sql|mongodb|postgresql|aws|docker|kubernetes|git)\b/gi,
      /\b(machine learning|artificial intelligence|data science|backend|frontend|full.?stack|devops|cloud)\b/gi,
      /\b(\w+\.js|\w+\.py|\w+\+\+)\b/gi
    ];

    const keywords = new Set();
    
    // Extract technical terms
    techPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => keywords.add(match.toLowerCase()));
    });

    // Extract common job-related terms
    const jobTerms = text.match(/\b[a-z]{3,}\b/g) || [];
    const commonWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use']);
    
    jobTerms.forEach(term => {
      if (!commonWords.has(term) && term.length > 3) {
        keywords.add(term);
      }
    });

    return Array.from(keywords).slice(0, 20); // Return top 20 keywords
  }

  setKeywords(keywords) {
    this.keywords = keywords.map(k => ({
      keyword: typeof k === 'string' ? k : k.keyword,
      weight: typeof k === 'object' ? k.weight : 1.0,
      category: typeof k === 'object' ? k.category : 'general'
    }));
    this.updateTimestamp();
  }

  getTopKeywords(limit = 10) {
    return this.keywords
      .sort((a, b) => (b.weight || 1) - (a.weight || 1))
      .slice(0, limit);
  }

  updateTimestamp() {
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      company: this.company,
      description: this.description,
      requirements: this.requirements,
      keywords: this.keywords,
      location: this.location,
      salary_range: this.salary_range,
      job_type: this.job_type,
      experience_level: this.experience_level,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(data) {
    return new JobDescription(data);
  }

  getSummary() {
    return {
      title: this.title,
      company: this.company,
      location: this.location,
      keywordCount: this.keywords.length,
      descriptionLength: this.description.length
    };
  }
}

module.exports = JobDescription;