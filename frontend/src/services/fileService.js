import { UPLOAD_CONFIG } from '../utils/constants'
import { formatFileSize, isValidFileType, isValidFileSize } from '../utils/helpers'

class FileService {
  /**
   * Validate uploaded file
   * @param {File} file - File to validate
   * @returns {Object} Validation result
   */
  validateFile(file) {
    const errors = []
    
    // Check file size
    if (!isValidFileSize(file, UPLOAD_CONFIG.MAX_FILE_SIZE)) {
      errors.push(`File size must be less than ${formatFileSize(UPLOAD_CONFIG.MAX_FILE_SIZE)}`)
    }
    
    // Check file type
    const allowedTypes = Object.values(UPLOAD_CONFIG.ACCEPTED_TYPES)
    if (!isValidFileType(file, allowedTypes)) {
      errors.push(`File type not supported. Allowed types: ${UPLOAD_CONFIG.ACCEPTED_EXTENSIONS.join(', ')}`)
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      }
    }
  }

  /**
   * Read file content as text
   * @param {File} file - File to read
   * @returns {Promise<string>} File content
   */
  async readAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        resolve(event.target.result)
      }
      
      reader.onerror = (error) => {
        reject(new Error('Failed to read file: ' + error.message))
      }
      
      reader.readAsText(file)
    })
  }

  /**
   * Read file content as data URL
   * @param {File} file - File to read
   * @returns {Promise<string>} Data URL
   */
  async readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        resolve(event.target.result)
      }
      
      reader.onerror = (error) => {
        reject(new Error('Failed to read file: ' + error.message))
      }
      
      reader.readAsDataURL(file)
    })
  }

  /**
   * Parse JSON file
   * @param {File} file - JSON file to parse
   * @returns {Promise<Object>} Parsed JSON object
   */
  async parseJSON(file) {
    try {
      const text = await this.readAsText(file)
      return JSON.parse(text)
    } catch (error) {
      throw new Error('Invalid JSON file: ' + error.message)
    }
  }

  /**
   * Parse CSV file
   * @param {File} file - CSV file to parse
   * @returns {Promise<Array>} Array of objects
   */
  async parseCSV(file) {
    try {
      const text = await this.readAsText(file)
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        throw new Error('CSV file must have at least a header and one data row')
      }
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const data = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
        const row = {}
        
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        
        data.push(row)
      }
      
      return data
    } catch (error) {
      throw new Error('Failed to parse CSV: ' + error.message)
    }
  }

  /**
   * Extract text from PDF (basic implementation)
   * Note: This is a placeholder. For full PDF parsing, you'd need a library like pdf-parse
   * @param {File} file - PDF file
   * @returns {Promise<string>} Extracted text
   */
  async extractPDFText(file) {
    // This is a placeholder implementation
    // In a real app, you'd use a PDF parsing library or send to backend
    throw new Error('PDF text extraction not implemented. Please upload JSON or use the form.')
  }

  /**
   * Convert user profile to downloadable JSON
   * @param {Object} userProfile - User profile data
   * @returns {Blob} JSON blob
   */
  createProfileJSON(userProfile) {
    const jsonString = JSON.stringify(userProfile, null, 2)
    return new Blob([jsonString], { type: 'application/json' })
  }

  /**
   * Download user profile as JSON file
   * @param {Object} userProfile - User profile data
   * @param {string} filename - Download filename
   */
  downloadProfile(userProfile, filename = 'my-profile.json') {
    const blob = this.createProfileJSON(userProfile)
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  /**
   * Create sample profile data
   * @returns {Object} Sample user profile
   */
  createSampleProfile() {
    return {
      personal: {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1-555-0123",
        linkedIn: "linkedin.com/in/johndoe",
        location: "New York, NY",
        website: "johndoe.dev"
      },
      summary: "Experienced software developer with 5+ years in full-stack web development. Passionate about creating scalable applications and leading development teams.",
      work_experience: [
        {
          id: "exp1",
          company: "Tech Solutions Inc",
          role: "Senior Software Developer",
          start_date: "2021-03",
          end_date: "Present",
          current: true,
          bullets: [
            {
              id: "bullet1",
              text: "Led development of React-based dashboard serving 10,000+ users",
              metrics: "10,000+ users"
            },
            {
              id: "bullet2",
              text: "Improved application performance by 40% through code optimization",
              metrics: "40% improvement"
            },
            {
              id: "bullet3",
              text: "Mentored 3 junior developers and conducted code reviews"
            }
          ]
        },
        {
          id: "exp2",
          company: "StartupXYZ",
          role: "Full Stack Developer",
          start_date: "2019-06",
          end_date: "2021-02",
          current: false,
          bullets: [
            {
              id: "bullet4",
              text: "Built RESTful APIs using Node.js and Express serving 1M+ requests/day",
              metrics: "1M+ requests/day"
            },
            {
              id: "bullet5",
              text: "Implemented CI/CD pipeline reducing deployment time by 60%",
              metrics: "60% reduction"
            }
          ]
        }
      ],
      skills: [
        { id: "skill1", name: "JavaScript", category: "technical", proficiency: "expert" },
        { id: "skill2", name: "React", category: "technical", proficiency: "expert" },
        { id: "skill3", name: "Node.js", category: "technical", proficiency: "advanced" },
        { id: "skill4", name: "Python", category: "technical", proficiency: "intermediate" },
        { id: "skill5", name: "AWS", category: "technical", proficiency: "intermediate" },
        { id: "skill6", name: "Leadership", category: "soft", proficiency: "advanced" },
        { id: "skill7", name: "Communication", category: "soft", proficiency: "expert" }
      ],
      projects: [
        {
          id: "proj1",
          name: "E-commerce Platform",
          description: "Full-stack e-commerce solution with React frontend and Node.js backend",
          technologies: ["React", "Node.js", "MongoDB", "Stripe API"],
          url: "https://github.com/johndoe/ecommerce",
          start_date: "2022-01",
          end_date: "2022-06"
        },
        {
          id: "proj2",
          name: "Task Management App",
          description: "Collaborative task management application with real-time updates",
          technologies: ["Vue.js", "Socket.io", "PostgreSQL"],
          url: "https://taskapp.johndoe.dev",
          start_date: "2021-08",
          end_date: "2021-12"
        }
      ],
      education: [
        {
          id: "edu1",
          degree: "Bachelor of Science in Computer Science",
          institution: "University of Technology",
          start_date: "2015-09",
          end_date: "2019-05",
          gpa: "3.8",
          relevant_courses: ["Data Structures", "Algorithms", "Web Development", "Database Systems"]
        }
      ],
      certifications: [
        {
          id: "cert1",
          name: "AWS Certified Developer",
          issuer: "Amazon Web Services",
          date: "2022-03",
          expiry_date: "2025-03",
          credential_id: "AWS-DEV-123456"
        }
      ]
    }
  }

  /**
   * Validate user profile structure
   * @param {Object} profile - Profile to validate
   * @returns {Object} Validation result
   */
  validateProfile(profile) {
    const errors = []
    const warnings = []

    // Check required fields
    if (!profile.personal?.name) {
      errors.push('Name is required')
    }
    
    if (!profile.personal?.email) {
      errors.push('Email is required')
    }

    // Check email format
    if (profile.personal?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.personal.email)) {
      errors.push('Invalid email format')
    }

    // Check work experience
    if (!profile.work_experience || profile.work_experience.length === 0) {
      warnings.push('No work experience provided')
    }

    // Check skills
    if (!profile.skills || profile.skills.length === 0) {
      warnings.push('No skills provided')
    }

    // Check education
    if (!profile.education || profile.education.length === 0) {
      warnings.push('No education provided')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completeness: this.calculateCompleteness(profile)
    }
  }

  /**
   * Calculate profile completeness percentage
   * @param {Object} profile - User profile
   * @returns {number} Completeness percentage
   */
  calculateCompleteness(profile) {
    let score = 0
    const maxScore = 100

    // Personal information (30 points)
    if (profile.personal?.name) score += 10
    if (profile.personal?.email) score += 10
    if (profile.personal?.phone) score += 5
    if (profile.personal?.location) score += 5

    // Summary (15 points)
    if (profile.summary && profile.summary.length > 50) score += 15

    // Work experience (25 points)
    if (profile.work_experience?.length > 0) {
      score += 15
      if (profile.work_experience.some(exp => exp.bullets?.length > 0)) {
        score += 10
      }
    }

    // Skills (15 points)
    if (profile.skills?.length >= 5) score += 15

    // Education (10 points)
    if (profile.education?.length > 0) score += 10

    // Projects (5 points)
    if (profile.projects?.length > 0) score += 5

    return Math.min(score, maxScore)
  }

  /**
   * Get file icon based on file type
   * @param {string} fileType - MIME type
   * @returns {string} Icon name
   */
  getFileIcon(fileType) {
    const iconMap = {
      'application/pdf': 'file-text',
      'application/json': 'code',
      'text/plain': 'file-text',
      'text/csv': 'table',
      'application/vnd.ms-excel': 'table',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'table',
    }

    return iconMap[fileType] || 'file'
  }

  /**
   * Format file info for display
   * @param {File} file - File object
   * @returns {Object} Formatted file info
   */
  formatFileInfo(file) {
    return {
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      icon: this.getFileIcon(file.type),
      lastModified: new Date(file.lastModified).toLocaleDateString(),
    }
  }
}

// Create and export service instance
const fileService = new FileService()

export default fileService