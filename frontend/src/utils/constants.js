// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export const API_ENDPOINTS = {
  // Health
  HEALTH: '/health',
  
  // Keywords
  EXTRACT_KEYWORDS: '/api/extract-keywords',
  ANALYZE_KEYWORDS: '/api/analyze-keywords',
  KEYWORD_SUGGESTIONS: '/api/keyword-suggestions',
  
  // Content
  TAILOR_CONTENT: '/api/tailor-content',
  GENERATE_SUMMARY: '/api/generate-summary',
  ENHANCE_EXPERIENCE: '/api/enhance-experience',
  OPTIMIZE_CONTENT: '/api/optimize-content',
  
  // PDF
  RENDER_CV: '/api/render-cv',
  PREVIEW_CV: '/api/preview-cv',
  TEMPLATES: '/api/templates',
  
  // Upload
  UPLOAD_PROFILE: '/api/upload/profile',
  
  // Batch
  BATCH_KEYWORDS: '/api/batch/extract-keywords',
}

// CV Templates
export const CV_TEMPLATES = {
  MODERN: {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, modern design with color accents',
    preview: '/templates/modern-preview.png',
    features: ['Color-coded sections', 'Modern typography', 'ATS-friendly'],
    colors: ['blue', 'green', 'red', 'purple', 'orange'],
  },
  CLASSIC: {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional, professional layout',
    preview: '/templates/classic-preview.png',
    features: ['Traditional design', 'Conservative layout', 'Highly compatible'],
    colors: ['black', 'blue', 'gray'],
  },
}

// Form Validation
export const VALIDATION_RULES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  PHONE: 'Please enter a valid phone number',
  URL: 'Please enter a valid URL',
  MIN_LENGTH: (min) => `Minimum ${min} characters required`,
  MAX_LENGTH: (max) => `Maximum ${max} characters allowed`,
  FILE_SIZE: 'File size must be less than 5MB',
  FILE_TYPE: 'Invalid file type',
}

// File Upload
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_TYPES: {
    PDF: 'application/pdf',
    JSON: 'application/json',
    TXT: 'text/plain',
  },
  ACCEPTED_EXTENSIONS: ['.pdf', '.json', '.txt'],
}

// CV Sections
export const CV_SECTIONS = {
  PERSONAL: 'personal',
  SUMMARY: 'summary',
  EXPERIENCE: 'experience',
  SKILLS: 'skills',
  EDUCATION: 'education',
  PROJECTS: 'projects',
  CERTIFICATIONS: 'certifications',
}

// Skill Categories
export const SKILL_CATEGORIES = {
  TECHNICAL: 'technical',
  SOFT: 'soft',
  LANGUAGE: 'language',
  OTHER: 'other',
}

// Experience Levels
export const EXPERIENCE_LEVELS = {
  ENTRY: 'entry',
  MID: 'mid',
  SENIOR: 'senior',
  LEAD: 'lead',
  EXECUTIVE: 'executive',
}

// Job Types
export const JOB_TYPES = {
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  CONTRACT: 'contract',
  INTERNSHIP: 'internship',
  REMOTE: 'remote',
}

// Industries
export const INDUSTRIES = [
  'software',
  'marketing',
  'finance',
  'healthcare',
  'education',
  'retail',
  'manufacturing',
  'consulting',
  'media',
  'nonprofit',
  'government',
  'other',
]

// Color Schemes
export const COLOR_SCHEMES = {
  BLUE: { name: 'Blue', value: 'blue', color: '#3b82f6' },
  GREEN: { name: 'Green', value: 'green', color: '#22c55e' },
  RED: { name: 'Red', value: 'red', color: '#ef4444' },
  PURPLE: { name: 'Purple', value: 'purple', color: '#8b5cf6' },
  ORANGE: { name: 'Orange', value: 'orange', color: '#f97316' },
  BLACK: { name: 'Black', value: 'black', color: '#000000' },
  GRAY: { name: 'Gray', value: 'gray', color: '#6b7280' },
}

// Font Sizes
export const FONT_SIZES = [
  { label: '10pt', value: '10pt' },
  { label: '11pt', value: '11pt' },
  { label: '12pt', value: '12pt' },
]

// Margins
export const MARGINS = [
  { label: 'Narrow', value: 'narrow' },
  { label: 'Normal', value: 'normal' },
  { label: 'Wide', value: 'wide' },
]

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PROFILE: 'ai_cv_builder_user_profile',
  JOB_DESCRIPTION: 'ai_cv_builder_job_description',
  CV_DRAFTS: 'ai_cv_builder_cv_drafts',
  PREFERENCES: 'ai_cv_builder_preferences',
  RECENT_JOBS: 'ai_cv_builder_recent_jobs',
}

// Query Keys for React Query
export const QUERY_KEYS = {
  HEALTH: ['health'],
  TEMPLATES: ['templates'],
  KEYWORDS: ['keywords'],
  CV_ANALYSIS: ['cv-analysis'],
  USER_PROFILE: ['user-profile'],
  JOB_DESCRIPTION: ['job-description'],
}

// Default Values
export const DEFAULT_VALUES = {
  USER_PROFILE: {
    personal: {
      name: '',
      email: '',
      phone: '',
      linkedIn: '',
      location: '',
      website: '',
    },
    summary: '',
    work_experience: [],
    skills: [],
    education: [],
    projects: [],
    certifications: [],
  },
  JOB_DESCRIPTION: {
    title: '',
    company: '',
    description: '',
    location: '',
    job_type: JOB_TYPES.FULL_TIME,
    experience_level: '',
  },
  CV_OPTIONS: {
    template: 'modern',
    fontSize: '11pt',
    colorScheme: 'blue',
    margins: 'normal',
  },
}

// Status Messages
export const STATUS_MESSAGES = {
  LOADING: 'Loading...',
  GENERATING: 'Generating CV...',
  ANALYZING: 'Analyzing keywords...',
  OPTIMIZING: 'Optimizing content...',
  UPLOADING: 'Uploading file...',
  DOWNLOADING: 'Preparing download...',
  SUCCESS: 'Operation completed successfully',
  ERROR: 'An error occurred. Please try again.',
}

// Feature Flags
export const FEATURES = {
  BATCH_PROCESSING: true,
  MULTIPLE_TEMPLATES: true,
  KEYWORD_SUGGESTIONS: true,
  CONTENT_OPTIMIZATION: true,
  FILE_UPLOAD: true,
  PDF_PREVIEW: true,
}

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
}

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
}

// Debounce Delays
export const DEBOUNCE_DELAY = {
  SEARCH: 300,
  INPUT: 500,
  RESIZE: 100,
}