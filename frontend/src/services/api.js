import axios from 'axios'
import toast from 'react-hot-toast'
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      })
    }
    
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      })
    }
    
    return response
  },
  (error) => {
    console.error('API Error:', error)
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          toast.error(data.message || 'Invalid request')
          break
        case 401:
          toast.error('Authentication required')
          // Redirect to login if needed
          break
        case 403:
          toast.error('Access denied')
          break
        case 404:
          toast.error('Resource not found')
          break
        case 429:
          toast.error('Too many requests. Please try again later.')
          break
        case 500:
          toast.error('Server error. Please try again.')
          break
        default:
          toast.error(data.message || 'An error occurred')
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.')
    } else {
      // Other error
      toast.error('An unexpected error occurred')
    }
    
    return Promise.reject(error)
  }
)

// API Service Class
class ApiService {
  // Health Check
  async checkHealth() {
    const response = await api.get(API_ENDPOINTS.HEALTH)
    return response.data
  }

  // Keyword Services
  async extractKeywords(jobDescription) {
    const response = await api.post(API_ENDPOINTS.EXTRACT_KEYWORDS, jobDescription)
    return response.data
  }

  async analyzeKeywords(data) {
    const response = await api.post(API_ENDPOINTS.ANALYZE_KEYWORDS, data)
    return response.data
  }

  async getKeywordSuggestions(industry = 'general', currentKeywords = []) {
    const params = new URLSearchParams()
    if (currentKeywords.length > 0) {
      params.append('currentKeywords', currentKeywords.join(','))
    }
    
    const response = await api.get(
      `${API_ENDPOINTS.KEYWORD_SUGGESTIONS}/${industry}?${params}`
    )
    return response.data
  }

  async batchExtractKeywords(jobDescriptions) {
    const response = await api.post(API_ENDPOINTS.BATCH_KEYWORDS, {
      jobDescriptions
    })
    return response.data
  }

  // Content Services
  async generateTailoredContent(userProfile, jobDescription) {
    const response = await api.post(API_ENDPOINTS.TAILOR_CONTENT, {
      userProfile,
      jobDescription
    })
    return response.data
  }

  async generateSummary(userProfile, jobDescription, keywords) {
    const response = await api.post(API_ENDPOINTS.GENERATE_SUMMARY, {
      userProfile,
      jobDescription,
      keywords
    })
    return response.data
  }

  async enhanceExperience(experiences, keywords) {
    const response = await api.post(API_ENDPOINTS.ENHANCE_EXPERIENCE, {
      experiences,
      keywords
    })
    return response.data
  }

  async optimizeContent(content, jobKeywords, targetScore = 80) {
    const response = await api.post(API_ENDPOINTS.OPTIMIZE_CONTENT, {
      content,
      jobKeywords,
      targetScore
    })
    return response.data
  }

  // PDF Services
  async generatePDF(cvData, template = 'modern', options = {}) {
    const response = await api.post(API_ENDPOINTS.RENDER_CV, {
      cvData,
      template,
      options
    })
    return response.data
  }

  async previewPDF(cvData, template = 'modern', options = {}) {
    const response = await api.post(API_ENDPOINTS.PREVIEW_CV, {
      cvData,
      template,
      options
    })
    return response.data
  }

  async getTemplates() {
    const response = await api.get(API_ENDPOINTS.TEMPLATES)
    return response.data
  }

  async getTemplatePreview(templateId) {
    const response = await api.get(`${API_ENDPOINTS.TEMPLATES}/${templateId}/preview`)
    return response.data
  }

  // File Upload Services
  async uploadProfile(file) {
    const formData = new FormData()
    formData.append('profile', file)
    
    const response = await api.post(API_ENDPOINTS.UPLOAD_PROFILE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        // You can use this for progress bars
        console.log(`Upload Progress: ${percentCompleted}%`)
      },
    })
    return response.data
  }

  // Download Services
  async downloadPDF(url, filename) {
    const response = await api.get(url, {
      responseType: 'blob',
    })
    
    // Create blob link to download
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const downloadUrl = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up
    window.URL.revokeObjectURL(downloadUrl)
    
    return true
  }

  // Utility Methods
  async request(method, url, data = null, config = {}) {
    const response = await api.request({
      method,
      url,
      data,
      ...config,
    })
    return response.data
  }

  // Cancel request
  createCancelToken() {
    return axios.CancelToken.source()
  }

  isCancel(error) {
    return axios.isCancel(error)
  }
}

// Create and export service instance
const apiService = new ApiService()

// Export individual methods for convenience
export const {
  checkHealth,
  extractKeywords,
  analyzeKeywords,
  getKeywordSuggestions,
  batchExtractKeywords,
  generateTailoredContent,
  generateSummary,
  enhanceExperience,
  optimizeContent,
  generatePDF,
  previewPDF,
  getTemplates,
  getTemplatePreview,
  uploadProfile,
  downloadPDF,
  request,
  createCancelToken,
  isCancel,
} = apiService

export default apiService