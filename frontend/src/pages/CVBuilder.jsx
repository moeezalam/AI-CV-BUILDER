import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  FileText, 
  Briefcase,
  Download,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import useAppStore from '../store/useAppStore'
import { ProfileForm } from '../components/forms/ProfileForm'
import { JobDescriptionForm } from '../components/forms/JobDescriptionForm'
import { CVPreview } from '../components/forms/CVPreview'
import { LoadingButton, AIProcessingLoader } from '../components/common/Loading'
import { useExtractKeywords, useGenerateContent, useGeneratePDF } from '../hooks/useAPI'
import { cn } from '../utils/helpers'

const steps = [
  {
    id: 1,
    title: 'Personal Information',
    description: 'Enter your basic details and work experience',
    icon: User,
    component: ProfileForm
  },
  {
    id: 2,
    title: 'Job Description',
    description: 'Paste the job description you\'re applying for',
    icon: FileText,
    component: JobDescriptionForm
  },
  {
    id: 3,
    title: 'Generate & Preview',
    description: 'Review your AI-generated CV and download',
    icon: Briefcase,
    component: CVPreview
  }
]

export function CVBuilder() {
  const {
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    userProfile,
    jobDescription,
    generatedCV,
    setGeneratedCV,
    extractedKeywords,
    setExtractedKeywords,
    keywordAnalysis,
    setKeywordAnalysis,
    getCompletionStatus,
    getProgress
  } = useAppStore()

  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')

  const extractKeywordsMutation = useExtractKeywords()
  const generateContentMutation = useGenerateContent()
  const generatePDFMutation = useGeneratePDF()

  const completion = getCompletionStatus()
  const progress = getProgress()

  // Check if current step can proceed
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return completion.personal && completion.experience && completion.skills
      case 2:
        // Debug: Log job description validation
        console.log('Job Description Validation:', {
          jobDescription,
          completion: completion.jobDescription,
          hasTitle: !!jobDescription?.title,
          hasCompany: !!jobDescription?.company,
          hasDescription: !!jobDescription?.description,
          descriptionLength: jobDescription?.description?.length || 0
        })
        return completion.jobDescription
      case 3:
        return !!generatedCV
      default:
        return false
    }
  }

  // Handle step navigation
  const handleNext = async () => {
    if (currentStep === 2 && !generatedCV) {
      await generateCV()
    } else {
      nextStep()
    }
  }

  const handlePrev = () => {
    prevStep()
  }

  // Generate CV workflow
  const generateCV = async () => {
    if (!completion.personal || !completion.jobDescription) {
      return
    }

    setIsProcessing(true)
    
    try {
      // Step 1: Extract keywords
      setProcessingStep('Analyzing job description...')
      
      // Debug: Log the job description data being sent
      console.log('Job Description Data:', {
        title: jobDescription.title,
        company: jobDescription.company,
        description: jobDescription.description,
        fullJobDescription: jobDescription
      })
      
      const keywordResult = await extractKeywordsMutation.mutateAsync({
        title: jobDescription.title,
        company: jobDescription.company,
        description: jobDescription.description
      })

      setExtractedKeywords(keywordResult.data.analysis.keywords)

      // Step 2: Generate tailored content
      setProcessingStep('Generating tailored content...')
      const contentResult = await generateContentMutation.mutateAsync({
        userProfile,
        jobDescription: {
          ...jobDescription,
          keywords: keywordResult.data.analysis.keywords
        }
      })

      setGeneratedCV(contentResult.data.tailoredCV)
      setKeywordAnalysis(contentResult.data.analysis)

      // Move to next step
      nextStep()

    } catch (error) {
      console.error('CV generation failed:', error)
    } finally {
      setIsProcessing(false)
      setProcessingStep('')
    }
  }

  // Generate PDF
  const handleGeneratePDF = async (template = 'modern', options = {}) => {
    if (!generatedCV) return

    try {
      const result = await generatePDFMutation.mutateAsync({
        cvData: generatedCV,
        template,
        options
      })

      // Open PDF in new tab
      if (result.data.downloadUrl) {
        window.open(result.data.downloadUrl, '_blank')
      }
    } catch (error) {
      console.error('PDF generation failed:', error)
    }
  }

  const CurrentStepComponent = steps[currentStep - 1]?.component

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI CV Builder
          </h1>
          <p className="text-gray-600">
            Create a professional, ATS-optimized CV in minutes
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              Progress: {progress}% complete
            </span>
            <span className="text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill transition-all duration-500"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps Navigation */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              const isAccessible = index === 0 || currentStep > index

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => isAccessible && setCurrentStep(step.id)}
                    disabled={!isAccessible}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
                      isActive 
                        ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                        : isCompleted
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : isAccessible
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                    <span className="hidden sm:block font-medium">
                      {step.title}
                    </span>
                  </button>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-lg shadow-sm p-8"
              >
                <AIProcessingLoader 
                  type="content"
                  message={processingStep}
                />
              </motion.div>
            ) : (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-sm"
              >
                {/* Step Header */}
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      {React.createElement(steps[currentStep - 1].icon, {
                        className: "w-5 h-5 text-primary-600"
                      })}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {steps[currentStep - 1].title}
                      </h2>
                      <p className="text-gray-600">
                        {steps[currentStep - 1].description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step Content */}
                <div className="p-6">
                  {CurrentStepComponent && <CurrentStepComponent />}
                </div>

                {/* Step Navigation */}
                <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                  <button
                    onClick={handlePrev}
                    disabled={currentStep === 1}
                    className={cn(
                      'btn btn-outline flex items-center space-x-2',
                      currentStep === 1 && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center space-x-3">
                    {currentStep === 3 && generatedCV && (
                      <>
                        <LoadingButton
                          onClick={() => handleGeneratePDF('modern')}
                          isLoading={generatePDFMutation.isLoading}
                          loadingText="Generating PDF..."
                          className="btn btn-outline flex items-center space-x-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Preview PDF</span>
                        </LoadingButton>
                        
                        <LoadingButton
                          onClick={() => handleGeneratePDF('modern')}
                          isLoading={generatePDFMutation.isLoading}
                          loadingText="Generating PDF..."
                          className="btn btn-primary flex items-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download PDF</span>
                        </LoadingButton>
                      </>
                    )}

                    {currentStep < 3 && (
                      <LoadingButton
                        onClick={handleNext}
                        disabled={!canProceed()}
                        isLoading={currentStep === 2 && isProcessing}
                        loadingText={currentStep === 2 ? "Generating CV..." : "Loading..."}
                        className="btn btn-primary flex items-center space-x-2"
                      >
                        <span>
                          {currentStep === 2 ? 'Generate CV' : 'Next'}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </LoadingButton>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Help Section */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">
                  Tips for better results:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Fill out all sections completely for better AI analysis</li>
                  <li>• Use specific job descriptions with clear requirements</li>
                  <li>• Include metrics and achievements in your experience</li>
                  <li>• Review and edit the generated content before downloading</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}