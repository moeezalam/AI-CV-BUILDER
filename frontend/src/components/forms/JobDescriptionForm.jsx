import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { 
  FileText, 
  Building, 
  MapPin, 
  Clock,
  Briefcase,
  Zap,
  Eye,
  Copy,
  Check
} from 'lucide-react'
import useAppStore from '../../store/useAppStore'
import { useBatchJobUpload } from '../../hooks/useFileUpload'
import { JOB_TYPES, EXPERIENCE_LEVELS } from '../../utils/constants'
import { copyToClipboard } from '../../utils/helpers'

const sampleJobs = [
  {
    title: "Full Stack Developer",
    company: "Tech Startup Inc",
    description: `We are seeking a talented Full Stack Developer to join our growing team. The ideal candidate will have experience with modern web technologies and a passion for creating exceptional user experiences.

Key Responsibilities:
• Develop and maintain web applications using React, Node.js, and MongoDB
• Collaborate with cross-functional teams to define and implement new features
• Write clean, maintainable, and well-documented code
• Participate in code reviews and contribute to technical discussions
• Optimize applications for maximum speed and scalability

Required Skills:
• 3+ years of experience in full-stack development
• Proficiency in JavaScript, HTML, CSS
• Experience with React, Node.js, Express.js
• Knowledge of database design and management (MongoDB, PostgreSQL)
• Familiarity with version control systems (Git)
• Understanding of RESTful APIs and microservices architecture
• Experience with cloud platforms (AWS, Azure, or GCP)

Preferred Qualifications:
• Experience with TypeScript
• Knowledge of containerization (Docker, Kubernetes)
• Familiarity with CI/CD pipelines
• Understanding of agile development methodologies
• Bachelor's degree in Computer Science or related field`,
    location: "San Francisco, CA",
    job_type: "full-time",
    experience_level: "mid"
  },
  {
    title: "Senior Software Engineer",
    company: "Enterprise Solutions Corp",
    description: `Join our engineering team as a Senior Software Engineer and help build scalable enterprise solutions that serve millions of users worldwide.

What You'll Do:
• Lead the design and development of complex software systems
• Mentor junior developers and provide technical guidance
• Architect scalable solutions using microservices and cloud technologies
• Collaborate with product managers and designers to deliver high-quality features
• Drive technical decisions and establish best practices

Requirements:
• 5+ years of software development experience
• Strong proficiency in Java, Python, or C#
• Experience with distributed systems and microservices architecture
• Knowledge of cloud platforms (AWS, Azure, GCP)
• Experience with containerization and orchestration (Docker, Kubernetes)
• Understanding of database design and optimization
• Excellent problem-solving and communication skills

Nice to Have:
• Experience with machine learning and AI technologies
• Knowledge of DevOps practices and tools
• Contribution to open-source projects
• Advanced degree in Computer Science or Engineering`,
    location: "Remote",
    job_type: "full-time",
    experience_level: "senior"
  }
]

export function JobDescriptionForm() {
  const { jobDescription, setJobDescription, addRecentJob } = useAppStore()
  const [selectedSample, setSelectedSample] = useState(null)
  const [copiedField, setCopiedField] = useState(null)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: jobDescription
  })

  const batchUpload = useBatchJobUpload({
    onJobsLoad: (jobs) => {
      if (jobs.length > 0) {
        const firstJob = jobs[0]
        setJobDescription(firstJob)
        Object.keys(firstJob).forEach(key => {
          setValue(key, firstJob[key])
        })
      }
    }
  })

  const watchedValues = watch()

  const onSubmit = (data) => {
    const jobData = {
      ...data,
      id: data.id || `job_${Date.now()}`,
      createdAt: new Date()
    }
    setJobDescription(jobData)
    addRecentJob(jobData)
  }

  // Update store in real-time as user types
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedValues.title || watchedValues.company || watchedValues.description) {
        const jobData = {
          ...watchedValues,
          id: watchedValues.id || `job_${Date.now()}`
        }
        setJobDescription(jobData)
      }
    }, 500) // Debounce by 500ms

    return () => clearTimeout(timeoutId)
  }, [watchedValues.title, watchedValues.company, watchedValues.description, setJobDescription])

  const loadSampleJob = (sample) => {
    setSelectedSample(sample)
    setJobDescription(sample)
    Object.keys(sample).forEach(key => {
      setValue(key, sample[key])
    })
  }

  const handleCopy = async (text, field) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    }
  }

  const wordCount = watchedValues.description ? watchedValues.description.split(/\s+/).length : 0
  const charCount = watchedValues.description ? watchedValues.description.length : 0

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div {...batchUpload.getRootProps()} className={`
          text-center cursor-pointer transition-colors
          ${batchUpload.isDragActive ? 'border-primary-500 bg-primary-50' : ''}
          ${batchUpload.isDragReject ? 'border-red-500 bg-red-50' : ''}
        `}>
          <input {...batchUpload.getInputProps()} />
          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">
            {batchUpload.isDragActive 
              ? 'Drop your job description file here...'
              : 'Upload job descriptions (JSON/CSV) or paste manually below'
            }
          </p>
          <p className="text-sm text-gray-500">
            Supports JSON and CSV files for batch processing
          </p>
        </div>
        
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={batchUpload.downloadTemplate}
            className="btn btn-outline btn-sm"
          >
            Download Template
          </button>
        </div>
      </div>

      {/* Sample Jobs */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Sample Job Descriptions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleJobs.map((sample, index) => (
            <div 
              key={index}
              className={`
                card p-4 cursor-pointer transition-all hover:shadow-md
                ${selectedSample === sample ? 'ring-2 ring-primary-500 bg-primary-50' : ''}
              `}
              onClick={() => loadSampleJob(sample)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{sample.title}</h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopy(sample.description, `sample_${index}`)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {copiedField === `sample_${index}` ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-2">{sample.company}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{sample.location}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{sample.job_type}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Job Description Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">Job Title *</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                {...register('title', { required: 'Job title is required' })}
                className="input pl-10"
                placeholder="Full Stack Developer"
              />
            </div>
            {errors.title && (
              <p className="form-error">{errors.title.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Company Name *</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                {...register('company', { required: 'Company name is required' })}
                className="input pl-10"
                placeholder="Tech Startup Inc"
              />
            </div>
            {errors.company && (
              <p className="form-error">{errors.company.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                {...register('location')}
                className="input pl-10"
                placeholder="San Francisco, CA or Remote"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Job Type</label>
            <select
              {...register('job_type')}
              className="select"
            >
              {Object.entries(JOB_TYPES).map(([key, value]) => (
                <option key={key} value={value}>
                  {value.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Experience Level</label>
            <select
              {...register('experience_level')}
              className="select"
            >
              <option value="">Select level</option>
              {Object.entries(EXPERIENCE_LEVELS).map(([key, value]) => (
                <option key={key} value={value}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Salary Range</label>
            <input
              {...register('salary_range')}
              className="input"
              placeholder="$80,000 - $120,000"
            />
          </div>
        </div>

        <div className="form-group">
          <div className="flex items-center justify-between mb-2">
            <label className="form-label">Job Description *</label>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
              <button
                type="button"
                onClick={() => handleCopy(watchedValues.description || '', 'description')}
                className="flex items-center space-x-1 text-gray-400 hover:text-gray-600"
              >
                {copiedField === 'description' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>Copy</span>
              </button>
            </div>
          </div>
          <textarea
            {...register('description', { 
              required: 'Job description is required',
              minLength: {
                value: 100,
                message: 'Job description should be at least 100 characters'
              }
            })}
            className="textarea"
            rows={12}
            placeholder="Paste the complete job description here. Include responsibilities, requirements, qualifications, and any other relevant information. The more detailed the description, the better the AI can tailor your CV."
          />
          {errors.description && (
            <p className="form-error">{errors.description.message}</p>
          )}
          <div className="mt-2 flex items-start space-x-2">
            <Zap className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
            <p className="form-help">
              <strong>Tip:</strong> Include the complete job posting with requirements, 
              responsibilities, and preferred qualifications. Our AI will analyze this 
              to extract relevant keywords and tailor your CV accordingly.
            </p>
          </div>
        </div>

        {/* Preview Section */}
        {watchedValues.description && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Eye className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-gray-900">Preview</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div><strong>Title:</strong> {watchedValues.title || 'Not specified'}</div>
              <div><strong>Company:</strong> {watchedValues.company || 'Not specified'}</div>
              <div><strong>Location:</strong> {watchedValues.location || 'Not specified'}</div>
              <div><strong>Type:</strong> {watchedValues.job_type || 'Not specified'}</div>
              <div><strong>Description Length:</strong> {wordCount} words, {charCount} characters</div>
            </div>
          </div>
        )}
      </form>

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Tips for Better Results:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Copy the entire job posting, including requirements and responsibilities</li>
          <li>• Include preferred qualifications and nice-to-have skills</li>
          <li>• Don't edit or summarize - paste the original text for best keyword extraction</li>
          <li>• Multiple job descriptions can be uploaded via CSV/JSON for batch processing</li>
        </ul>
      </div>
    </div>
  )
}