const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

class UserProfile {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.personal = data.personal || {};
    this.summary = data.summary || '';
    this.work_experience = data.work_experience || [];
    this.projects = data.projects || [];
    this.education = data.education || [];
    this.skills = data.skills || [];
    this.certifications = data.certifications || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static getValidationSchema() {
    return Joi.object({
      personal: Joi.object({
        name: Joi.string().required().max(100),
        email: Joi.string().email().required(),
        phone: Joi.string().max(20),
        linkedIn: Joi.string().uri(),
        location: Joi.string().max(100),
        website: Joi.string().uri()
      }).required(),
      summary: Joi.string().max(500),
      work_experience: Joi.array().items(
        Joi.object({
          id: Joi.string(),
          company: Joi.string().required().max(100),
          role: Joi.string().required().max(100),
          start_date: Joi.string().required(),
          end_date: Joi.string().allow('', null),
          current: Joi.boolean().default(false),
          bullets: Joi.array().items(
            Joi.object({
              id: Joi.string(),
              text: Joi.string().required().max(300),
              metrics: Joi.string().max(100)
            })
          )
        })
      ),
      projects: Joi.array().items(
        Joi.object({
          id: Joi.string(),
          name: Joi.string().required().max(100),
          description: Joi.string().required().max(300),
          technologies: Joi.array().items(Joi.string()),
          url: Joi.string().uri(),
          start_date: Joi.string(),
          end_date: Joi.string()
        })
      ),
      education: Joi.array().items(
        Joi.object({
          id: Joi.string(),
          degree: Joi.string().required().max(100),
          institution: Joi.string().required().max(100),
          start_date: Joi.string().required(),
          end_date: Joi.string(),
          gpa: Joi.string().max(10),
          relevant_courses: Joi.array().items(Joi.string())
        })
      ),
      skills: Joi.array().items(
        Joi.object({
          id: Joi.string(),
          name: Joi.string().required().max(50),
          category: Joi.string().valid('technical', 'soft', 'language', 'other').default('technical'),
          proficiency: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').default('intermediate')
        })
      ),
      certifications: Joi.array().items(
        Joi.object({
          id: Joi.string(),
          name: Joi.string().required().max(100),
          issuer: Joi.string().required().max(100),
          date: Joi.string().required(),
          expiry_date: Joi.string(),
          credential_id: Joi.string()
        })
      )
    });
  }

  validate() {
    const schema = UserProfile.getValidationSchema();
    return schema.validate(this.toJSON());
  }

  addExperience(experienceData) {
    const experience = {
      id: uuidv4(),
      ...experienceData,
      bullets: experienceData.bullets?.map(bullet => ({
        id: uuidv4(),
        ...bullet
      })) || []
    };
    this.work_experience.push(experience);
    this.updateTimestamp();
    return experience;
  }

  updateExperience(experienceId, updates) {
    const index = this.work_experience.findIndex(exp => exp.id === experienceId);
    if (index === -1) return null;
    
    this.work_experience[index] = { ...this.work_experience[index], ...updates };
    this.updateTimestamp();
    return this.work_experience[index];
  }

  removeExperience(experienceId) {
    const index = this.work_experience.findIndex(exp => exp.id === experienceId);
    if (index === -1) return false;
    
    this.work_experience.splice(index, 1);
    this.updateTimestamp();
    return true;
  }

  addEducation(educationData) {
    const education = {
      id: uuidv4(),
      ...educationData
    };
    this.education.push(education);
    this.updateTimestamp();
    return education;
  }

  addSkill(skillData) {
    const skill = {
      id: uuidv4(),
      ...skillData
    };
    this.skills.push(skill);
    this.updateTimestamp();
    return skill;
  }

  getSkillsByCategory(category) {
    return this.skills.filter(skill => skill.category === category);
  }

  getAllKeywords() {
    const keywords = new Set();
    
    // Extract from skills
    this.skills.forEach(skill => keywords.add(skill.name.toLowerCase()));
    
    // Extract from work experience
    this.work_experience.forEach(exp => {
      keywords.add(exp.role.toLowerCase());
      exp.bullets?.forEach(bullet => {
        const words = bullet.text.toLowerCase().match(/\b\w+\b/g) || [];
        words.forEach(word => {
          if (word.length > 3) keywords.add(word);
        });
      });
    });
    
    // Extract from projects
    this.projects.forEach(project => {
      project.technologies?.forEach(tech => keywords.add(tech.toLowerCase()));
    });
    
    return Array.from(keywords);
  }

  getCompletenessScore() {
    let score = 0;
    const weights = {
      personal: 20,
      summary: 15,
      work_experience: 25,
      education: 15,
      skills: 15,
      projects: 10
    };

    // Personal info
    if (this.personal.name && this.personal.email) score += weights.personal;
    
    // Summary
    if (this.summary && this.summary.length > 50) score += weights.summary;
    
    // Work experience
    if (this.work_experience.length > 0) score += weights.work_experience;
    
    // Education
    if (this.education.length > 0) score += weights.education;
    
    // Skills
    if (this.skills.length >= 5) score += weights.skills;
    
    // Projects
    if (this.projects.length > 0) score += weights.projects;

    return Math.min(score, 100);
  }

  updateTimestamp() {
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      personal: this.personal,
      summary: this.summary,
      work_experience: this.work_experience,
      projects: this.projects,
      education: this.education,
      skills: this.skills,
      certifications: this.certifications,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(data) {
    return new UserProfile(data);
  }

  getSummary() {
    return {
      name: this.personal.name,
      email: this.personal.email,
      experienceCount: this.work_experience.length,
      skillsCount: this.skills.length,
      completeness: this.getCompletenessScore()
    };
  }
}

module.exports = UserProfile;