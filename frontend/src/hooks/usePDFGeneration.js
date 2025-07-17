import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { useGeneratePDF, usePreviewPDF } from './useAPI'
import useAppStore from '../store/useAppStore'

export function usePDFGeneration() {
  const [pdfState, setPdfState] = useState({
    isGenerating: false,
    isPreviewing: false,
    previewUrl: null,
    downloadUrl: null,
    error: null,
    progress: 0,
  })

  const generatePDFMutation = useGeneratePDF()
  const previewPDFMutation = usePreviewPDF()
  
  const { generatedCV, cvOptions } = useAppStore()

  const generatePDF = useCallback(async (cvData, options = {}) => {
    if (!cvData) {
      toast.error('No CV data available. Please generate content first.')
      return null
    }

    setPdfState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      error: null, 
      progress: 0 
    }))

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setPdfState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }))
      }, 200)

      const result = await generatePDFMutation.mutateAsync({
        cvData,
        template: options.template || cvOptions.template,
        options: {
          fontSize: options.fontSize || cvOptions.fontSize,
          colorScheme: options.colorScheme || cvOptions.colorScheme,
          margins: options.margins || cvOptions.margins,
          ...options
        }
      })

      clearInterval(progressInterval)

      setPdfState(prev => ({
        ...prev,
        isGenerating: false,
        downloadUrl: result.data.downloadUrl,
        progress: 100,
      }))

      return result.data

    } catch (error) {
      setPdfState(prev => ({
        ...prev,
        isGenerating: false,
        error: error.message,
        progress: 0,
      }))
      throw error
    }
  }, [generatePDFMutation, cvOptions])

  const previewPDF = useCallback(async (cvData, options = {}) => {
    if (!cvData) {
      toast.error('No CV data available. Please generate content first.')
      return null
    }

    setPdfState(prev => ({ 
      ...prev, 
      isPreviewing: true, 
      error: null 
    }))

    try {
      const result = await previewPDFMutation.mutateAsync({
        cvData,
        template: options.template || cvOptions.template,
        options: {
          fontSize: options.fontSize || cvOptions.fontSize,
          colorScheme: options.colorScheme || cvOptions.colorScheme,
          margins: options.margins || cvOptions.margins,
          ...options
        }
      })

      setPdfState(prev => ({
        ...prev,
        isPreviewing: false,
        previewUrl: result.data.previewUrl,
      }))

      return result.data

    } catch (error) {
      setPdfState(prev => ({
        ...prev,
        isPreviewing: false,
        error: error.message,
      }))
      throw error
    }
  }, [previewPDFMutation, cvOptions])

  const downloadPDF = useCallback((url, filename = 'my-cv.pdf') => {
    if (!url) {
      toast.error('No PDF available for download')
      return
    }

    // Create download link
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('PDF download started')
  }, [])

  const openPDFInNewTab = useCallback((url) => {
    if (!url) {
      toast.error('No PDF available to open')
      return
    }

    window.open(url, '_blank')
  }, [])

  const resetPDFState = useCallback(() => {
    setPdfState({
      isGenerating: false,
      isPreviewing: false,
      previewUrl: null,
      downloadUrl: null,
      error: null,
      progress: 0,
    })
  }, [])

  // Generate PDF with current CV data
  const generateCurrentCV = useCallback(async (options = {}) => {
    if (!generatedCV) {
      toast.error('No CV generated yet. Please generate content first.')
      return null
    }

    return await generatePDF(generatedCV, options)
  }, [generatePDF, generatedCV])

  // Preview PDF with current CV data
  const previewCurrentCV = useCallback(async (options = {}) => {
    if (!generatedCV) {
      toast.error('No CV generated yet. Please generate content first.')
      return null
    }

    return await previewPDF(generatedCV, options)
  }, [previewPDF, generatedCV])

  return {
    // State
    ...pdfState,
    
    // Actions
    generatePDF,
    previewPDF,
    downloadPDF,
    openPDFInNewTab,
    resetPDFState,
    
    // Convenience methods for current CV
    generateCurrentCV,
    previewCurrentCV,
    
    // Computed values
    canGenerate: !!generatedCV,
    isLoading: pdfState.isGenerating || pdfState.isPreviewing,
    hasPreview: !!pdfState.previewUrl,
    hasDownload: !!pdfState.downloadUrl,
  }
}

// Hook for batch PDF generation
export function useBatchPDFGeneration() {
  const [batchState, setBatchState] = useState({
    isProcessing: false,
    progress: 0,
    completed: 0,
    total: 0,
    results: [],
    errors: [],
  })

  const generatePDFMutation = useGeneratePDF()

  const generateBatchPDFs = useCallback(async (cvDataList, options = {}) => {
    if (!cvDataList || cvDataList.length === 0) {
      toast.error('No CV data provided for batch generation')
      return []
    }

    setBatchState({
      isProcessing: true,
      progress: 0,
      completed: 0,
      total: cvDataList.length,
      results: [],
      errors: [],
    })

    const results = []
    const errors = []

    for (let i = 0; i < cvDataList.length; i++) {
      try {
        const cvData = cvDataList[i]
        const result = await generatePDFMutation.mutateAsync({
          cvData: cvData.content,
          template: options.template || 'modern',
          options: {
            fontSize: options.fontSize || '11pt',
            colorScheme: options.colorScheme || 'blue',
            margins: options.margins || 'normal',
            ...options
          }
        })

        results.push({
          id: cvData.id,
          name: cvData.name || `CV ${i + 1}`,
          result: result.data,
          status: 'success'
        })

        setBatchState(prev => ({
          ...prev,
          completed: i + 1,
          progress: Math.round(((i + 1) / cvDataList.length) * 100),
          results: [...prev.results, results[results.length - 1]]
        }))

      } catch (error) {
        const errorInfo = {
          id: cvDataList[i].id,
          name: cvDataList[i].name || `CV ${i + 1}`,
          error: error.message,
          status: 'failed'
        }

        errors.push(errorInfo)

        setBatchState(prev => ({
          ...prev,
          completed: i + 1,
          progress: Math.round(((i + 1) / cvDataList.length) * 100),
          errors: [...prev.errors, errorInfo]
        }))
      }
    }

    setBatchState(prev => ({
      ...prev,
      isProcessing: false,
    }))

    const successCount = results.length
    const errorCount = errors.length

    if (successCount > 0) {
      toast.success(`Generated ${successCount} PDFs successfully`)
    }
    
    if (errorCount > 0) {
      toast.error(`Failed to generate ${errorCount} PDFs`)
    }

    return { results, errors }
  }, [generatePDFMutation])

  const resetBatchState = useCallback(() => {
    setBatchState({
      isProcessing: false,
      progress: 0,
      completed: 0,
      total: 0,
      results: [],
      errors: [],
    })
  }, [])

  const downloadAllPDFs = useCallback((results) => {
    if (!results || results.length === 0) {
      toast.error('No PDFs available for download')
      return
    }

    // Download each PDF
    results.forEach((result, index) => {
      if (result.result?.downloadUrl) {
        setTimeout(() => {
          const link = document.createElement('a')
          link.href = result.result.downloadUrl
          link.download = `${result.name}.pdf`
          link.target = '_blank'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }, index * 500) // Stagger downloads
      }
    })

    toast.success(`Started download of ${results.length} PDFs`)
  }, [])

  return {
    // State
    ...batchState,
    
    // Actions
    generateBatchPDFs,
    resetBatchState,
    downloadAllPDFs,
    
    // Computed values
    isComplete: batchState.completed === batchState.total && batchState.total > 0,
    successRate: batchState.total > 0 ? 
      Math.round((batchState.results.length / batchState.total) * 100) : 0,
  }
}