import React, { useState } from 'react'
import { 
  Download, 
  Eye, 
  RefreshCw, 
  Settings,
  FileText,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react'
import useAppStore from '../../store/useAppStore'
import { usePDFGeneration } from '../../hooks/usePDFGeneration'
import { useOptimizeContent } from '../../hooks/useAPI'
import { LoadingButton, AIProcessingLoader } from '../common/Loading'
import { CV_TEMPLATES, COLOR_SCHEMES, FONT_SIZES, MARGINS } from '../../utils/constants'
import { cn } from '../../utils/helpers'

export function CVPreview() {
  const {
    generatedCV,
    keywordAnalysis,
    extractedKeywords,
    cvOptions,
    updateCvOptions,
    userProfile
  } = useAppStore()

  const [activeTab, setActiveTab] = useState('preview')
  const [showSettings, setShowSettings] = useState(false)

  const pdfGeneration = usePDFGeneration()
  const optimizeContentMutation = useOptimizeContent()

  if (!generatedCV) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No CV Generated Yet
        </h3>
        <p className="text-gray-600">
          Complete the previous steps to generate your tailored CV.
        </p>
      </div>
    )
  }

  const handleOptimizeContent = async () => {
    if (!generatedCV || !extractedKeywords) return

    try {
      await optimizeContentMutation.mutateAsync({
        content: generatedCV,
        jobKeywords: extractedKeywords,
        targetScore: 85
      })
    } catch (error) {
      console.error('Content optimization failed:', error)
    }
  }

  const tabs = [
    { id: 'preview', label: 'CV Preview', icon: Eye },
    { id: 'analysis', label: 'Analysis', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-900">
              CV Generated Successfully
            </span>
          </div>
          {keywordAnalysis?.cvAnalysis?.matchScore && (
            <div className="badge badge-primary">
              {keywordAnalysis.cvAnalysis.matchScore}% Match Score
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <LoadingButton
            onClick={handleOptimizeContent}
            isLoading={optimizeContentMutation.isLoading}
            loadingText="Optimizing..."
            className="btn btn-outline btn-sm flex items-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Optimize</span>
          </LoadingButton>

          <LoadingButton
            onClick={() => pdfGeneration.previewCurrentCV()}
            isLoading={pdfGeneration.isPreviewing}
            loadingText="Generating..."
            className="btn btn-outline btn-sm flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Preview PDF</span>
          </LoadingButton>

          <LoadingButton
            onClick={() => pdfGeneration.generateCurrentCV()}
            isLoading={pdfGeneration.isGenerating}
            loadingText="Generating PDF..."
            className="btn btn-primary btn-sm flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </LoadingButton>
        </div>
      </div>

      {/* Progress Indicator */}
      {pdfGeneration.isGenerating && pdfGeneration.progress > 0 && (
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Generating PDF...
            </span>
            <span className="text-sm text-gray-500">
              {pdfGeneration.progress}%
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${pdfGeneration.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'preview' && (
          <CVPreviewContent cv={generatedCV} />
        )}

        {activeTab === 'analysis' && (
          <CVAnalysisContent 
            analysis={keywordAnalysis}
            keywords={extractedKeywords}
            cv={generatedCV}
          />
        )}

        {activeTab === 'settings' && (
          <CVSettingsContent 
            options={cvOptions}
            onOptionsChange={updateCvOptions}
          />
        )}
      </div>
    </div>
  )
}

// CV Preview Content Component
function CVPreviewContent({ cv }) {
  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center border-b pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {cv.personal?.name || 'Your Name'}
            </h1>
            <div className="flex flex-wrap justify-center items-center gap-4 text-gray-600">
              {cv.personal?.email && (
                <span>{cv.personal.email}</span>
              )}
              {cv.personal?.phone && (
                <span>{cv.personal.phone}</span>
              )}
              {cv.personal?.location && (
                <span>{cv.personal.location}</span>
              )}
            </div>
            {cv.personal?.linkedIn && (
              <div className="mt-2">
                <span className="text-primary-600">{cv.personal.linkedIn}</span>
              </div>
            )}
          </div>

          {/* Summary */}
          {cv.summary && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {cv.summary}
              </p>
            </div>
          )}

          {/* Skills */}
          {cv.skills && cv.skills.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Technical Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {cv.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="badge badge-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {cv.experience && cv.experience.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-1">
                Work Experience
              </h2>
              <div className="space-y-6">
                {cv.experience.map((exp, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {exp.role}
                        </h3>
                        <p className="text-primary-600 font-medium">
                          {exp.company}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {exp.dates}
                      </span>
                    </div>
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {exp.bullets.map((bullet, bulletIndex) => (
                          <li key={bulletIndex}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {cv.projects && cv.projects.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-1">
                Projects
              </h2>
              <div className="space-y-4">
                {cv.projects.map((project, index) => (
                  <div key={index}>
                    <h3 className="text-lg font-medium text-gray-900">
                      {project.name}
                    </h3>
                    <p className="text-gray-700 mb-2">
                      {project.description}
                    </p>
                    {project.technologies && (
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="badge badge-secondary text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {cv.education && cv.education.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-1">
                Education
              </h2>
              <div className="space-y-3">
                {cv.education.map((edu, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {edu.degree}
                      </h3>
                      <p className="text-gray-600">
                        {edu.institution}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {edu.dates}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// CV Analysis Content Component
function CVAnalysisContent({ analysis, keywords, cv }) {
  if (!analysis) {
    return (
      <div className="text-center py-12">
        <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Analysis Available
        </h3>
        <p className="text-gray-600">
          Analysis data will appear here after CV generation.
        </p>
      </div>
    )
  }

  const matchScore = analysis.cvAnalysis?.matchScore || 0
  const matchedKeywords = analysis.cvAnalysis?.matchedKeywords || []
  const missingKeywords = analysis.cvAnalysis?.missingKeywords || []

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-primary-600" />
          </div>
          <div className="text-3xl font-bold text-primary-600 mb-2">
            {matchScore}%
          </div>
          <p className="text-gray-600">Match Score</p>
        </div>

        <div className="card p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {matchedKeywords.length}
          </div>
          <p className="text-gray-600">Matched Keywords</p>
        </div>

        <div className="card p-6 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {missingKeywords.length}
          </div>
          <p className="text-gray-600">Missing Keywords</p>
        </div>
      </div>

      {/* Matched Keywords */}
      {matchedKeywords.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Matched Keywords</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {matchedKeywords.map((keyword, index) => (
              <span
                key={index}
                className="badge badge-success"
              >
                {typeof keyword === 'string' ? keyword : keyword.keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Keywords */}
      {missingKeywords.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <span>Missing Keywords</span>
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {missingKeywords.slice(0, 10).map((keyword, index) => (
              <span
                key={index}
                className="badge badge-warning"
              >
                {typeof keyword === 'string' ? keyword : keyword.keyword}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Consider incorporating these keywords into your experience descriptions 
            to improve your match score.
          </p>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recommendations
          </h3>
          <div className="space-y-3">
            {analysis.recommendations.map((rec, index) => (
              <div
                key={index}
                className={cn(
                  'p-3 rounded-lg border-l-4',
                  rec.priority === 'high' 
                    ? 'bg-red-50 border-red-400'
                    : rec.priority === 'medium'
                      ? 'bg-yellow-50 border-yellow-400'
                      : 'bg-blue-50 border-blue-400'
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className={cn(
                    'w-2 h-2 rounded-full mt-2',
                    rec.priority === 'high' 
                      ? 'bg-red-400'
                      : rec.priority === 'medium'
                        ? 'bg-yellow-400'
                        : 'bg-blue-400'
                  )} />
                  <div>
                    <p className="font-medium text-gray-900">
                      {rec.message}
                    </p>
                    {rec.action && (
                      <p className="text-sm text-gray-600 mt-1">
                        {rec.action}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// CV Settings Content Component
function CVSettingsContent({ options, onOptionsChange }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">PDF Generation Settings</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Template Selection */}
        <div className="form-group">
          <label className="form-label">Template</label>
          <div className="space-y-3">
            {Object.values(CV_TEMPLATES).map((template) => (
              <label
                key={template.id}
                className={cn(
                  'flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors',
                  options.template === template.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <input
                  type="radio"
                  name="template"
                  value={template.id}
                  checked={options.template === template.id}
                  onChange={(e) => onOptionsChange({ template: e.target.value })}
                  className="text-primary-600"
                />
                <div>
                  <div className="font-medium text-gray-900">{template.name}</div>
                  <div className="text-sm text-gray-600">{template.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="form-group">
          <label className="form-label">Font Size</label>
          <select
            value={options.fontSize}
            onChange={(e) => onOptionsChange({ fontSize: e.target.value })}
            className="select"
          >
            {FONT_SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </div>

        {/* Color Scheme */}
        <div className="form-group">
          <label className="form-label">Color Scheme</label>
          <div className="grid grid-cols-4 gap-2">
            {Object.values(COLOR_SCHEMES).map((color) => (
              <button
                key={color.value}
                onClick={() => onOptionsChange({ colorScheme: color.value })}
                className={cn(
                  'p-3 rounded-lg border-2 transition-colors',
                  options.colorScheme === color.value
                    ? 'border-gray-900'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div
                  className="w-6 h-6 rounded mx-auto mb-1"
                  style={{ backgroundColor: color.color }}
                />
                <div className="text-xs text-gray-600">{color.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Margins */}
        <div className="form-group">
          <label className="form-label">Margins</label>
          <select
            value={options.margins}
            onChange={(e) => onOptionsChange({ margins: e.target.value })}
            className="select"
          >
            {MARGINS.map((margin) => (
              <option key={margin.value} value={margin.value}>
                {margin.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preview Settings */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Current Settings</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Template:</span>
            <span className="ml-2 font-medium">{CV_TEMPLATES[options.template.toUpperCase()]?.name}</span>
          </div>
          <div>
            <span className="text-gray-600">Font Size:</span>
            <span className="ml-2 font-medium">{options.fontSize}</span>
          </div>
          <div>
            <span className="text-gray-600">Color:</span>
            <span className="ml-2 font-medium">{COLOR_SCHEMES[options.colorScheme.toUpperCase()]?.name}</span>
          </div>
          <div>
            <span className="text-gray-600">Margins:</span>
            <span className="ml-2 font-medium">{options.margins}</span>
          </div>
        </div>
      </div>
    </div>
  )
}