import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'
import fileService from '../services/fileService'
import { UPLOAD_CONFIG } from '../utils/constants'

export function useFileUpload({
  onFileSelect,
  onFileProcess,
  acceptedTypes = Object.values(UPLOAD_CONFIG.ACCEPTED_TYPES),
  maxSize = UPLOAD_CONFIG.MAX_FILE_SIZE,
  multiple = false,
} = {}) {
  const [uploadState, setUploadState] = useState({
    isUploading: false,
    progress: 0,
    error: null,
    files: [],
  })

  const processFile = useCallback(async (file) => {
    setUploadState(prev => ({ ...prev, isUploading: true, error: null }))

    try {
      // Validate file
      const validation = fileService.validateFile(file)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      // Process based on file type
      let processedData = null
      
      if (file.type === 'application/json') {
        processedData = await fileService.parseJSON(file)
        toast.success('JSON file processed successfully')
      } else if (file.type === 'text/csv') {
        processedData = await fileService.parseCSV(file)
        toast.success('CSV file processed successfully')
      } else if (file.type === 'application/pdf') {
        // For PDF, we'll just store file info since text extraction is complex
        processedData = {
          type: 'pdf',
          name: file.name,
          size: file.size,
          message: 'PDF uploaded. Text extraction not implemented - please use the form or upload JSON.'
        }
        toast.info('PDF uploaded. Please use the form to enter your information.')
      } else {
        // Plain text
        processedData = await fileService.readAsText(file)
        toast.success('Text file processed successfully')
      }

      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        files: [...prev.files, { file, data: processedData }]
      }))

      // Call callbacks
      if (onFileSelect) onFileSelect(file)
      if (onFileProcess) onFileProcess(processedData, file)

      return processedData

    } catch (error) {
      console.error('File processing error:', error)
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: error.message
      }))
      toast.error(error.message)
      throw error
    }
  }, [onFileSelect, onFileProcess])

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ file, errors }) => 
        `${file.name}: ${errors.map(e => e.message).join(', ')}`
      )
      toast.error(`File(s) rejected: ${errors.join('; ')}`)
      return
    }

    // Process accepted files
    for (const file of acceptedFiles) {
      try {
        await processFile(file)
      } catch (error) {
        // Error already handled in processFile
        break
      }
    }
  }, [processFile])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {}),
    maxSize,
    multiple,
    disabled: uploadState.isUploading,
  })

  const removeFile = useCallback((index) => {
    setUploadState(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }))
  }, [])

  const clearFiles = useCallback(() => {
    setUploadState(prev => ({
      ...prev,
      files: [],
      error: null,
      progress: 0
    }))
  }, [])

  const reset = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      files: [],
    })
  }, [])

  return {
    // Dropzone props
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    
    // Upload state
    ...uploadState,
    
    // Actions
    processFile,
    removeFile,
    clearFiles,
    reset,
    
    // Computed values
    hasFiles: uploadState.files.length > 0,
    fileCount: uploadState.files.length,
  }
}

// Hook for profile-specific file upload
export function useProfileUpload({ onProfileLoad } = {}) {
  const fileUpload = useFileUpload({
    acceptedTypes: ['application/json', 'text/plain'],
    multiple: false,
    onFileProcess: (data, file) => {
      if (file.type === 'application/json') {
        // Validate profile structure
        const validation = fileService.validateProfile(data)
        
        if (validation.isValid) {
          if (onProfileLoad) onProfileLoad(data)
          toast.success('Profile loaded successfully')
        } else {
          toast.error(`Invalid profile format: ${validation.errors.join(', ')}`)
        }
      }
    }
  })

  const loadSampleProfile = useCallback(() => {
    const sampleProfile = fileService.createSampleProfile()
    if (onProfileLoad) onProfileLoad(sampleProfile)
    toast.success('Sample profile loaded')
  }, [onProfileLoad])

  const downloadProfile = useCallback((profile, filename) => {
    fileService.downloadProfile(profile, filename)
    toast.success('Profile downloaded')
  }, [])

  return {
    ...fileUpload,
    loadSampleProfile,
    downloadProfile,
  }
}

// Hook for batch job description upload
export function useBatchJobUpload({ onJobsLoad } = {}) {
  const fileUpload = useFileUpload({
    acceptedTypes: ['application/json', 'text/csv'],
    multiple: false,
    onFileProcess: (data, file) => {
      let jobs = []
      
      if (file.type === 'application/json') {
        // Expect array of job descriptions
        if (Array.isArray(data)) {
          jobs = data.map((job, index) => ({
            id: job.id || `job_${index + 1}`,
            title: job.title || 'Untitled Job',
            company: job.company || 'Unknown Company',
            description: job.description || '',
            ...job
          }))
        } else {
          toast.error('JSON file should contain an array of job descriptions')
          return
        }
      } else if (file.type === 'text/csv') {
        // Convert CSV to job objects
        jobs = data.map((row, index) => ({
          id: row.id || `job_${index + 1}`,
          title: row.title || row.Title || 'Untitled Job',
          company: row.company || row.Company || 'Unknown Company',
          description: row.description || row.Description || '',
          location: row.location || row.Location || '',
          job_type: row.job_type || row['Job Type'] || 'full-time',
        }))
      }

      if (jobs.length > 0) {
        if (onJobsLoad) onJobsLoad(jobs)
        toast.success(`Loaded ${jobs.length} job descriptions`)
      }
    }
  })

  const downloadTemplate = useCallback(() => {
    const template = [
      {
        id: 'job_1',
        title: 'Software Engineer',
        company: 'Tech Corp',
        description: 'We are looking for a software engineer with experience in...',
        location: 'New York, NY',
        job_type: 'full-time'
      },
      {
        id: 'job_2',
        title: 'Frontend Developer',
        company: 'Startup Inc',
        description: 'Join our team as a frontend developer working with React...',
        location: 'San Francisco, CA',
        job_type: 'remote'
      }
    ]

    const blob = new Blob([JSON.stringify(template, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'job-descriptions-template.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
    toast.success('Template downloaded')
  }, [])

  return {
    ...fileUpload,
    downloadTemplate,
  }
}

// Hook for image upload (for future use with profile pictures, etc.)
export function useImageUpload({ onImageLoad, maxSize = 2 * 1024 * 1024 } = {}) {
  const fileUpload = useFileUpload({
    acceptedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize,
    multiple: false,
    onFileProcess: async (data, file) => {
      // Convert to data URL for preview
      const dataUrl = await fileService.readAsDataURL(file)
      if (onImageLoad) onImageLoad(dataUrl, file)
    }
  })

  return fileUpload
}