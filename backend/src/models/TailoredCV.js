const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

class TailoredCV {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.userProfileId = data.userProfileId || '';
    this.jobDescriptionId = data.jobDescriptionId || '';
    this.summary = data.summary || '';
    this.skills = data.skills || [];
    this.experience = data.experience || [];
    this.projects = data.projects || [];
    this.education = data.education || [];
    this.matchedKeywords = data.matchedKeywords || [];
    this.relevanceScore = data.relevanceScore || 0;
    this.templateUsed = data.templateUsed || 'modern';
    this.pdfPath = data.pdfPath || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static getValidationSchema() {
    return Joi.object({
      userProfileId: Joi.string().required(),
      jobDescriptionId: Joi.string().required(),
      summary: Joi.string().max(500),
      skills: Joi.array().items(Joi.string()),
      experience: Joi.array().items(
        Joi.object({
          company: Joi.string().required(),
          role: Joi.string().required(),
          dates: Joi.string().required(),
          bullets: Joi.array().items(Joi.string())
        })
      ),
      projects: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          description: Joi.string().required(),
          technologies: Joi.array().items(Joi.string())
        })
      ),
      education: Joi.array().items(
        Joi.object({
          degree: Joi.string().required(),
          institution: Joi.string().required(),
          dates: Joi.string().required()
        })
      ),
      templateUsed: Joi.string().valid('modern', 'classic').default('modern'),
      relevanceScore: Joi.number().min(0).max(100).default(0)
    });
  }

  validate() {
    const schema = TailoredCV.getValidationSchema();
    return schema.validate(this.toJSON());
  }

  calculateRelevanceScore(jobKeywords, userProfile) {
    if (!jobKeywords || !userProfile) return 0;

    const userKeywords = userProfile.getAllKeywords();
    const jobKeywordSet = new Set(jobKeywords.map(k => 
      typeof k === 'string' ? k.toLowerCase() : k.keyword.toLowerCase()
    ));

    let matchCount = 0;
    let totalWeight = 0;

    userKeywords.forEach(keyword => {
      if (jobKeywordSet.has(keyword.toLowerCase())) {
        matchCount++;
        // Find the weight from job keywords
        const jobKeyword = jobKeywords.find(jk => 
          (typeof jk === 'string' ? jk : jk.keyword).toLowerCase() === keyword.toLowerCase()
        );
        totalWeight += typeof jobKeyword === 'object' ? jobKeyword.weight : 1;
      }
    });

    // Calculate score based on matches and weights
    const maxPossibleWeight = jobKeywords.reduce((sum, k) => 
      sum + (typeof k === 'object' ? k.weight : 1), 0
    );

    this.relevanceScore = Math.round((totalWeight / maxPossibleWeight) * 100);
    return this.relevanceScore;
  }

  setMatchedKeywords(keywords) {
    this.matchedKeywords = keywords;
    this.updateTimestamp();
  }

  setPdfPath(path) {
    this.pdfPath = path;
    this.updateTimestamp();
  }

  updateTimestamp() {
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      userProfileId: this.userProfileId,
      jobDescriptionId: this.jobDescriptionId,
      summary: this.summary,
      skills: this.skills,
      experience: this.experience,
      projects: this.projects,
      education: this.education,
      matchedKeywords: this.matchedKeywords,
      relevanceScore: this.relevanceScore,
      templateUsed: this.templateUsed,
      pdfPath: this.pdfPath,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(data) {
    return new TailoredCV(data);
  }

  getSummary() {
    return {
      id: this.id,
      relevanceScore: this.relevanceScore,
      matchedKeywords: this.matchedKeywords.length,
      templateUsed: this.templateUsed,
      hasPdf: !!this.pdfPath,
      createdAt: this.createdAt
    };
  }

  // Generate LaTeX content structure
  generateLatexData(userProfile) {
    return {
      personal: userProfile.personal,
      summary: this.summary || userProfile.summary,
      skills: this.skills.length > 0 ? this.skills : userProfile.skills.map(s => s.name),
      experience: this.experience.length > 0 ? this.experience : userProfile.work_experience.map(exp => ({
        company: exp.company,
        role: exp.role,
        dates: `${exp.start_date} - ${exp.end_date || 'Present'}`,
        bullets: exp.bullets?.map(b => b.text) || []
      })),
      projects: this.projects.length > 0 ? this.projects : userProfile.projects,
      education: this.education.length > 0 ? this.education : userProfile.education.map(edu => ({
        degree: edu.degree,
        institution: edu.institution,
        dates: `${edu.start_date} - ${edu.end_date || 'Present'}`
      }))
    };
  }
}

module.exports = TailoredCV;