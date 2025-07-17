import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import apiService from '../services/api'
import { QUERY_KEYS } from '../utils/constants'

// Health Check Hook
export function useHealth() {
  return useQuery(
    QUERY_KEYS.HEALTH,
    apiService.checkHealth,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    }
  )
}

// Templates Hook
export function useTemplates() {
  return useQuery(
    QUERY_KEYS.TEMPLATES,
    apiService.getTemplates,
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
      retry: 1,
    }
  )
}

// Keyword Extraction Hook
export function useExtractKeywords() {
  const queryClient = useQueryClient()
  
  return useMutation(
    apiService.extractKeywords,
    {
      onSuccess: (data) => {
        toast.success(`Extracted ${data.data.analysis.keywords.length} keywords`)
        // Invalidate related queries
        queryClient.invalidateQueries(QUERY_KEYS.KEYWORDS)
      },
      onError: (error) => {
        console.error('Keyword extraction failed:', error)
        toast.error('Failed to extract keywords')
      },
    }
  )
}

// Keyword Analysis Hook
export function useAnalyzeKeywords() {
  return useMutation(
    apiService.analyzeKeywords,
    {
      onSuccess: (data) => {
        toast.success(`CV analysis completed with ${data.data.matchScore}% match score`)
      },
      onError: (error) => {
        console.error('Keyword analysis failed:', error)
        toast.error('Failed to analyze keywords')
      },
    }
  )
}

// Keyword Suggestions Hook
export function useKeywordSuggestions(industry, currentKeywords) {
  return useQuery(
    [QUERY_KEYS.KEYWORDS, 'suggestions', industry, currentKeywords],
    () => apiService.getKeywordSuggestions(industry, currentKeywords),
    {
      enabled: !!industry,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  )
}

// Content Generation Hook
export function useGenerateContent() {
  return useMutation(
    ({ userProfile, jobDescription }) => 
      apiService.generateTailoredContent(userProfile, jobDescription),
    {
      onSuccess: (data) => {
        toast.success(`CV generated with ${data.data.tailoredCV.relevanceScore}% relevance score`)
      },
      onError: (error) => {
        console.error('Content generation failed:', error)
        toast.error('Failed to generate tailored content')
      },
    }
  )
}

// Summary Generation Hook
export function useGenerateSummary() {
  return useMutation(
    ({ userProfile, jobDescription, keywords }) =>
      apiService.generateSummary(userProfile, jobDescription, keywords),
    {
      onSuccess: () => {
        toast.success('Professional summary generated')
      },
      onError: (error) => {
        console.error('Summary generation failed:', error)
        toast.error('Failed to generate summary')
      },
    }
  )
}

// Experience Enhancement Hook
export function useEnhanceExperience() {
  return useMutation(
    ({ experiences, keywords }) =>
      apiService.enhanceExperience(experiences, keywords),
    {
      onSuccess: (data) => {
        toast.success(`Enhanced ${data.data.enhancedExperiences.length} work experiences`)
      },
      onError: (error) => {
        console.error('Experience enhancement failed:', error)
        toast.error('Failed to enhance experience')
      },
    }
  )
}

// Content Optimization Hook
export function useOptimizeContent() {
  return useMutation(
    ({ content, jobKeywords, targetScore }) =>
      apiService.optimizeContent(content, jobKeywords, targetScore),
    {
      onSuccess: (data) => {
        if (data.data.optimized) {
          toast.success(data.data.message)
        } else {
          toast.info(data.data.message)
        }
      },
      onError: (error) => {
        console.error('Content optimization failed:', error)
        toast.error('Failed to optimize content')
      },
    }
  )
}

// PDF Generation Hook
export function useGeneratePDF() {
  return useMutation(
    ({ cvData, template, options }) =>
      apiService.generatePDF(cvData, template, options),
    {
      onSuccess: (data) => {
        toast.success('PDF generated successfully')
        // Auto-download if URL is provided
        if (data.data.downloadUrl) {
          window.open(data.data.downloadUrl, '_blank')
        }
      },
      onError: (error) => {
        console.error('PDF generation failed:', error)
        toast.error('Failed to generate PDF')
      },
    }
  )
}

// PDF Preview Hook
export function usePreviewPDF() {
  return useMutation(
    ({ cvData, template, options }) =>
      apiService.previewPDF(cvData, template, options),
    {
      onSuccess: () => {
        toast.success('PDF preview generated')
      },
      onError: (error) => {
        console.error('PDF preview failed:', error)
        toast.error('Failed to generate PDF preview')
      },
    }
  )
}

// File Upload Hook
export function useUploadProfile() {
  return useMutation(
    apiService.uploadProfile,
    {
      onSuccess: (data) => {
        toast.success('Profile uploaded successfully')
      },
      onError: (error) => {
        console.error('File upload failed:', error)
        toast.error('Failed to upload profile')
      },
    }
  )
}

// Batch Keywords Hook
export function useBatchExtractKeywords() {
  return useMutation(
    apiService.batchExtractKeywords,
    {
      onSuccess: (data) => {
        const { successful, total } = data.data.summary
        toast.success(`Processed ${successful}/${total} job descriptions`)
      },
      onError: (error) => {
        console.error('Batch processing failed:', error)
        toast.error('Failed to process job descriptions')
      },
    }
  )
}

// Template Preview Hook
export function useTemplatePreview(templateId) {
  return useQuery(
    [QUERY_KEYS.TEMPLATES, 'preview', templateId],
    () => apiService.getTemplatePreview(templateId),
    {
      enabled: !!templateId,
      staleTime: 60 * 60 * 1000, // 1 hour
    }
  )
}

// Combined CV Generation Hook (Extract Keywords + Generate Content + Create PDF)
export function useFullCVGeneration() {
  const extractKeywords = useExtractKeywords()
  const generateContent = useGenerateContent()
  const generatePDF = useGeneratePDF()

  const generateFullCV = async ({ userProfile, jobDescription, cvOptions }) => {
    try {
      // Step 1: Extract keywords
      const keywordResult = await extractKeywords.mutateAsync(jobDescription)
      
      // Step 2: Generate tailored content
      const contentResult = await generateContent.mutateAsync({
        userProfile,
        jobDescription: {
          ...jobDescription,
          keywords: keywordResult.data.analysis.keywords
        }
      })
      
      // Step 3: Generate PDF
      const pdfResult = await generatePDF.mutateAsync({
        cvData: contentResult.data.tailoredCV,
        template: cvOptions.template,
        options: cvOptions
      })

      return {
        keywords: keywordResult.data,
        content: contentResult.data,
        pdf: pdfResult.data
      }
    } catch (error) {
      throw error
    }
  }

  return {
    generateFullCV,
    isLoading: extractKeywords.isLoading || generateContent.isLoading || generatePDF.isLoading,
    error: extractKeywords.error || generateContent.error || generatePDF.error,
  }
}

// Custom hook for managing API loading states
export function useAPILoadingStates() {
  const queryClient = useQueryClient()
  
  const getLoadingStates = () => {
    const queries = queryClient.getQueriesData()
    const mutations = queryClient.getMutationCache().getAll()
    
    return {
      isAnyLoading: queries.some(([, query]) => query?.isFetching) || 
                   mutations.some(mutation => mutation.state.status === 'loading'),
      loadingQueries: queries.filter(([, query]) => query?.isFetching).map(([key]) => key),
      loadingMutations: mutations.filter(mutation => mutation.state.status === 'loading'),
    }
  }

  return getLoadingStates()
}