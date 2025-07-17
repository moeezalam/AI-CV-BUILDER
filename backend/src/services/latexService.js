const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class LatexService {
  constructor() {
    this.templatesDir = path.join(__dirname, '../templates');
    this.outputDir = path.join(__dirname, '../../output');
    this.tempDir = path.join(__dirname, '../../temp');
    this.timeout = parseInt(process.env.LATEX_TIMEOUT) || 30000;
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB default
  }

  /**
   * Generate PDF from CV data
   * @param {Object} cvData - CV content data
   * @param {string} templateName - Template to use ('modern' or 'classic')
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Generated PDF info
   */
  async generatePDF(cvData, templateName = 'modern', options = {}) {
    // Input validation
    if (!cvData || typeof cvData !== 'object') {
      throw new Error('Invalid CV data provided');
    }

    // Sanitize template name to prevent path traversal
    const sanitizedTemplateName = this.sanitizeTemplateName(templateName);
    
    const jobId = uuidv4();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `cv-${jobId}-${timestamp}`;

    try {
      logger.info('Starting PDF generation', {
        jobId,
        template: sanitizedTemplateName,
        filename
      });

      // Ensure directories exist
      await this.ensureDirectories();

      // Load and populate template
      const latexContent = await this.populateTemplate(cvData, sanitizedTemplateName, options);

      // Write LaTeX file
      const texFilePath = path.join(this.tempDir, `${filename}.tex`);
      await fs.writeFile(texFilePath, latexContent, 'utf8');

      // Compile to PDF
      const pdfPath = await this.compileToPDF(texFilePath, filename);

      // Verify PDF was created and check size
      const fileSize = await this.getFileSize(pdfPath);
      if (fileSize === 0) {
        throw new Error('Generated PDF is empty');
      }

      if (fileSize > this.maxFileSize) {
        throw new Error(`Generated PDF exceeds maximum size limit (${this.maxFileSize} bytes)`);
      }

      // Clean up temporary files
      await this.cleanupTempFiles(filename);

      const result = {
        jobId,
        filename: `${filename}.pdf`,
        path: pdfPath,
        size: fileSize,
        generatedAt: new Date(),
        template: sanitizedTemplateName
      };

      logger.info('PDF generation completed', result);
      return result;

    } catch (error) {
      logger.error('PDF generation failed', {
        jobId,
        error: error.message,
        template: sanitizedTemplateName,
        stack: error.stack
      });
      
      // Clean up on error
      await this.cleanupTempFiles(filename).catch((cleanupError) => {
        logger.warn('Failed to cleanup temp files', { error: cleanupError.message });
      });
      throw error;
    }
  }

  /**
   * Sanitize template name to prevent path traversal attacks
   * @param {string} templateName - Template name to sanitize
   * @returns {string} Sanitized template name
   */
  sanitizeTemplateName(templateName) {
    if (!templateName || typeof templateName !== 'string') {
      return 'modern';
    }

    // Remove any path traversal attempts and special characters
    const sanitized = templateName
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .toLowerCase();

    // Return default if sanitization resulted in empty string
    return sanitized || 'modern';
  }

  /**
   * Load and populate LaTeX template with CV data
   * @param {Object} cvData - CV data
   * @param {string} templateName - Template name
   * @param {Object} options - Template options
   * @returns {Promise<string>} Populated LaTeX content
   */
  async populateTemplate(cvData, templateName, options) {
    try {
      const templatePath = path.join(this.templatesDir, `${templateName}-cv.tex`);
      
      // Check if template exists
      try {
        await fs.access(templatePath);
      } catch {
        throw new Error(`Template '${templateName}' not found`);
      }

      let template = await fs.readFile(templatePath, 'utf8');

      // Replace placeholders with actual data
      const replacements = this.createReplacements(cvData, options);

      for (const [placeholder, value] of Object.entries(replacements)) {
        const regex = new RegExp(`<<${placeholder}>>`, 'g');
        template = template.replace(regex, this.escapeLatex(value));
      }

      // Check for any remaining placeholders
      const remainingPlaceholders = template.match(/<<[^>]+>>/g);
      if (remainingPlaceholders) {
        logger.warn('Unresolved placeholders found', { placeholders: remainingPlaceholders });
      }

      return template;

    } catch (error) {
      logger.error('Template population failed', {
        template: templateName,
        error: error.message
      });
      throw new Error(`Failed to populate template: ${error.message}`);
    }
  }

  /**
   * Create replacement mappings for template placeholders
   * @param {Object} cvData - CV data
   * @param {Object} options - Template options
   * @returns {Object} Replacement mappings
   */
  createReplacements(cvData, options) {
    const replacements = {
      // Personal information with safe defaults
      NAME: this.getNestedValue(cvData, 'personal.name', 'Your Name'),
      EMAIL: this.getNestedValue(cvData, 'personal.email', 'your.email@example.com'),
      PHONE: this.getNestedValue(cvData, 'personal.phone', ''),
      LINKEDIN: this.getNestedValue(cvData, 'personal.linkedIn', ''),
      LOCATION: this.getNestedValue(cvData, 'personal.location', ''),
      WEBSITE: this.getNestedValue(cvData, 'personal.website', ''),

      // Professional summary
      SUMMARY: cvData.summary || '',

      // Skills section
      SKILLS: this.formatSkills(cvData.skills || []),

      // Work experience
      EXPERIENCE: this.formatExperience(cvData.experience || []),

      // Projects
      PROJECTS: this.formatProjects(cvData.projects || []),

      // Education
      EDUCATION: this.formatEducation(cvData.education || []),

      // Template options with validation
      FONT_SIZE: this.validateFontSize(options.fontSize) || '11pt',
      COLOR_SCHEME: this.validateColorScheme(options.colorScheme) || 'blue',
      MARGIN_SIZE: this.getMarginSize(options.margins || 'normal')
    };

    return replacements;
  }

  /**
   * Safely get nested object value
   * @param {Object} obj - Object to search
   * @param {string} path - Dot notation path
   * @param {*} defaultValue - Default value if path not found
   * @returns {*} Value or default
   */
  getNestedValue(obj, path, defaultValue) {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }
    
    return current !== null && current !== undefined ? current : defaultValue;
  }

  /**
   * Validate font size
   * @param {string} fontSize - Font size to validate
   * @returns {string|null} Valid font size or null
   */
  validateFontSize(fontSize) {
    const validSizes = ['10pt', '11pt', '12pt', '14pt', '16pt', '18pt'];
    return validSizes.includes(fontSize) ? fontSize : null;
  }

  /**
   * Validate color scheme
   * @param {string} colorScheme - Color scheme to validate
   * @returns {string|null} Valid color scheme or null
   */
  validateColorScheme(colorScheme) {
    const validSchemes = ['blue', 'red', 'green', 'purple', 'orange', 'teal', 'black'];
    return validSchemes.includes(colorScheme) ? colorScheme : null;
  }

  /**
   * Format skills for LaTeX
   * @param {Array} skills - Skills array
   * @returns {string} Formatted skills
   */
  formatSkills(skills) {
    if (!Array.isArray(skills) || skills.length === 0) return '';

    try {
      // Group skills by category if they have categories
      const hasCategories = skills.some(skill => 
        skill && typeof skill === 'object' && skill.category
      );

      if (hasCategories) {
        const categories = {};
        skills.forEach(skill => {
          if (!skill) return;
          
          const category = skill.category || 'Technical';
          const skillName = typeof skill === 'string' ? skill : (skill.name || String(skill));
          
          if (!categories[category]) categories[category] = [];
          if (skillName) categories[category].push(skillName);
        });

        return Object.entries(categories)
          .filter(([, skillList]) => skillList.length > 0)
          .map(([category, skillList]) => 
            `\\textbf{${category}:} ${skillList.join(', ')}`
          )
          .join(' \\\\ ');
      } else {
        // Simple comma-separated list
        const skillNames = skills
          .filter(skill => skill) // Remove null/undefined
          .map(skill => typeof skill === 'string' ? skill : (skill.name || String(skill)))
          .filter(name => name); // Remove empty strings
        
        return skillNames.join(', ');
      }
    } catch (error) {
      logger.error('Error formatting skills', { error: error.message });
      return '';
    }
  }

  /**
   * Format work experience for LaTeX
   * @param {Array} experiences - Work experiences
   * @returns {string} Formatted experience
   */
  formatExperience(experiences) {
    if (!Array.isArray(experiences) || experiences.length === 0) return '';

    try {
      return experiences
        .filter(exp => exp && typeof exp === 'object')
        .map(exp => {
          const bullets = Array.isArray(exp.bullets) ? 
            exp.bullets
              .filter(bullet => bullet && typeof bullet === 'string')
              .map(bullet => `\\item ${bullet}`)
              .join('\n') : '';

          return `
\\cventry{${exp.dates || ''}}{${exp.role || ''}}{${exp.company || ''}}{}{}{${
  bullets ? `\n\\begin{itemize}\n${bullets}\n\\end{itemize}` : ''
}}`;
        }).join('\n');
    } catch (error) {
      logger.error('Error formatting experience', { error: error.message });
      return '';
    }
  }

  /**
   * Format projects for LaTeX
   * @param {Array} projects - Projects array
   * @returns {string} Formatted projects
   */
  formatProjects(projects) {
    if (!Array.isArray(projects) || projects.length === 0) return '';

    try {
      return projects
        .filter(project => project && typeof project === 'object')
        .map(project => {
          const technologies = Array.isArray(project.technologies) && project.technologies.length > 0 ? 
            ` \\textit{Technologies: ${project.technologies.join(', ')}}` : '';
          
          const url = project.url && typeof project.url === 'string' ? 
            ` \\href{${project.url}}{[Link]}` : '';

          return `
\\cventry{${project.start_date || ''} - ${project.end_date || ''}}{${project.name || ''}}{}{}{}{
${project.description || ''}${technologies}${url}
}`;
        }).join('\n');
    } catch (error) {
      logger.error('Error formatting projects', { error: error.message });
      return '';
    }
  }

  /**
   * Format education for LaTeX
   * @param {Array} education - Education array
   * @returns {string} Formatted education
   */
  formatEducation(education) {
    if (!Array.isArray(education) || education.length === 0) return '';

    try {
      return education
        .filter(edu => edu && typeof edu === 'object')
        .map(edu => {
          const gpa = edu.gpa ? ` (GPA: ${edu.gpa})` : '';
          const courses = Array.isArray(edu.relevant_courses) && edu.relevant_courses.length > 0 ? 
            ` \\textit{Relevant Courses: ${edu.relevant_courses.join(', ')}}` : '';

          return `
\\cventry{${edu.dates || ''}}{${edu.degree || ''}}{${edu.institution || ''}}{}{}{${gpa}${courses}}`;
        }).join('\n');
    } catch (error) {
      logger.error('Error formatting education', { error: error.message });
      return '';
    }
  }

  /**
   * Get margin size for LaTeX
   * @param {string} marginType - Margin type ('narrow', 'normal', 'wide')
   * @returns {string} LaTeX margin specification
   */
  getMarginSize(marginType) {
    const margins = {
      narrow: '0.5in',
      normal: '0.75in',
      wide: '1in'
    };
    return margins[marginType] || margins.normal;
  }

  /**
   * Escape special LaTeX characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeLatex(text) {
    if (text === null || text === undefined) return '';
    if (typeof text !== 'string') text = String(text);

    return text
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\$/g, '\\$')
      .replace(/&/g, '\\&')
      .replace(/%/g, '\\%')
      .replace(/#/g, '\\#')
      .replace(/\^/g, '\\textasciicircum{}')
      .replace(/_/g, '\\_')
      .replace(/~/g, '\\textasciitilde{}');
  }

  /**
   * Compile LaTeX to PDF
   * @param {string} texFilePath - Path to .tex file
   * @param {string} filename - Base filename
   * @returns {Promise<string>} Path to generated PDF
   */
  async compileToPDF(texFilePath, filename) {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(this.outputDir, `${filename}.pdf`);
      
      // Use pdflatex to compile
      const pdflatex = spawn('pdflatex', [
        '-interaction=nonstopmode',
        '-halt-on-error',
        '-output-directory', this.tempDir,
        texFilePath
      ], {
        cwd: this.tempDir,
        timeout: this.timeout,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const timeoutId = setTimeout(() => {
        timedOut = true;
        pdflatex.kill('SIGTERM');
        reject(new Error(`LaTeX compilation timed out after ${this.timeout}ms`));
      }, this.timeout);

      pdflatex.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pdflatex.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pdflatex.on('close', async (code) => {
        clearTimeout(timeoutId);
        
        if (timedOut) return;

        if (code === 0) {
          try {
            // Check if PDF was created
            const tempPdfPath = path.join(this.tempDir, `${filename}.pdf`);
            await fs.access(tempPdfPath);
            
            // Move PDF to output directory
            await fs.copyFile(tempPdfPath, outputPath);
            resolve(outputPath);
          } catch (error) {
            reject(new Error(`Failed to move PDF: ${error.message}`));
          }
        } else {
          logger.error('LaTeX compilation failed', {
            code,
            stdout: stdout.substring(0, 1000), // Limit log size
            stderr: stderr.substring(0, 1000),
            filename
          });
          reject(new Error(`LaTeX compilation failed with code ${code}: ${stderr.substring(0, 500)}`));
        }
      });

      pdflatex.on('error', (error) => {
        clearTimeout(timeoutId);
        if (!timedOut) {
          reject(new Error(`Failed to start pdflatex: ${error.message}`));
        }
      });
    });
  }

  /**
   * Get available templates
   * @returns {Promise<Array>} Available templates
   */
  async getAvailableTemplates() {
    try {
      const files = await fs.readdir(this.templatesDir);
      const templates = files
        .filter(file => file.endsWith('-cv.tex'))
        .map(file => {
          const name = file.replace('-cv.tex', '');
          return {
            name,
            displayName: this.capitalizeFirst(name),
            filename: file,
            description: this.getTemplateDescription(name)
          };
        });

      return templates;
    } catch (error) {
      logger.error('Failed to get available templates', { error: error.message });
      return [];
    }
  }

  /**
   * Get template description
   * @param {string} templateName - Template name
   * @returns {string} Template description
   */
  getTemplateDescription(templateName) {
    const descriptions = {
      modern: 'Clean, modern design with color accents',
      classic: 'Traditional, professional layout',
      minimal: 'Simple, minimalist design',
      creative: 'Creative layout with unique styling'
    };
    return descriptions[templateName] || 'Professional CV template';
  }

  /**
   * Ensure required directories exist
   */
  async ensureDirectories() {
    const dirs = [this.outputDir, this.tempDir];
    
    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
        logger.info(`Created directory: ${dir}`);
      }
    }
  }

  /**
   * Clean up temporary files
   * @param {string} filename - Base filename
   */
  async cleanupTempFiles(filename) {
    const extensions = ['.tex', '.aux', '.log', '.out', '.pdf'];
    
    for (const ext of extensions) {
      try {
        await fs.unlink(path.join(this.tempDir, `${filename}${ext}`));
      } catch {
        // Ignore errors - file might not exist
      }
    }
  }

  /**
   * Get file size
   * @param {string} filePath - Path to file
   * @returns {Promise<number>} File size in bytes
   */
  async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  /**
   * Capitalize first letter
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalizeFirst(str) {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Check if LaTeX is available
   * @returns {Promise<boolean>} True if LaTeX is available
   */
  async checkLatexAvailability() {
    return new Promise((resolve) => {
      const pdflatex = spawn('pdflatex', ['--version'], { stdio: 'pipe' });
      
      const timeout = setTimeout(() => {
        pdflatex.kill();
        resolve(false);
      }, 5000);

      pdflatex.on('close', (code) => {
        clearTimeout(timeout);
        resolve(code === 0);
      });

      pdflatex.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }
}

module.exports = new LatexService();