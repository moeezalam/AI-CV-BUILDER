import React, { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { 
  Plus, 
  Trash2, 
  Upload, 
  Download,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin
} from 'lucide-react'
import useAppStore from '../../store/useAppStore'
import { generateId } from '../../utils/helpers'
import { SKILL_CATEGORIES } from '../../utils/constants'
import useProfileUpload from '../../hooks/useProfileUpload'

export function ProfileForm() {
  const { userProfile, setUserProfile, initializeWithSample } = useAppStore()
  const [activeTab, setActiveTab] = useState('personal')

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: userProfile
  })

  const { 
    fields: experienceFields, 
    append: appendExperience, 
    remove: removeExperience 
  } = useFieldArray({
    control,
    name: 'work_experience'
  })

  const { 
    fields: skillFields, 
    append: appendSkill, 
    remove: removeSkill 
  } = useFieldArray({
    control,
    name: 'skills'
  })

  const { 
    fields: educationFields, 
    append: appendEducation, 
    remove: removeEducation 
  } = useFieldArray({
    control,
    name: 'education'
  })

  const { 
    fields: projectFields, 
    append: appendProject, 
    remove: removeProject 
  } = useFieldArray({
    control,
    name: 'projects'
  })

  const profileUpload = useProfileUpload({
    onProfileLoad: (profile) => {
      setUserProfile(profile)
      // Update form values
      Object.keys(profile).forEach(key => {
        setValue(key, profile[key])
      })
    }
  })

  const onSubmit = (data) => {
    setUserProfile(data)
  }

  // Handle manual form submission to update store
  const handleFormSubmit = (data) => {
    setUserProfile(data)
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'experience', label: 'Experience', icon: 'briefcase' },
    { id: 'skills', label: 'Skills', icon: 'zap' },
    { id: 'education', label: 'Education', icon: 'graduation-cap' },
    { id: 'projects', label: 'Projects', icon: 'folder' }
  ]

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div {...profileUpload.getRootProps()} className={`
          text-center cursor-pointer transition-colors
          ${profileUpload.isDragActive ? 'border-primary-500 bg-primary-50' : ''}
          ${profileUpload.isDragReject ? 'border-red-500 bg-red-50' : ''}
        `}>
          <input {...profileUpload.getInputProps()} />
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">
            {profileUpload.isDragActive 
              ? 'Drop your profile file here...'
              : 'Drag & drop your profile JSON file, or click to browse'
            }
          </p>
          <p className="text-sm text-gray-500">
            Supports JSON files up to 5MB
          </p>
        </div>
        
        <div className="flex justify-center space-x-4 mt-4">
          <button
            type="button"
            onClick={profileUpload.loadSampleProfile}
            className="btn btn-outline btn-sm"
          >
            Load Sample Profile
          </button>
          <button
            type="button"
            onClick={() => profileUpload.downloadProfile(userProfile, 'my-profile.json')}
            className="btn btn-outline btn-sm flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Current</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information Tab */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Personal Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('personal.name', { required: 'Name is required' })}
                    className="input pl-10"
                    placeholder="John Doe"
                  />
                </div>
                {errors.personal?.name && (
                  <p className="form-error">{errors.personal.name.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('personal.email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className="input pl-10"
                    placeholder="john@example.com"
                  />
                </div>
                {errors.personal?.email && (
                  <p className="form-error">{errors.personal.email.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('personal.phone')}
                    type="tel"
                    className="input pl-10"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('personal.location')}
                    className="input pl-10"
                    placeholder="New York, NY"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">LinkedIn Profile</label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('personal.linkedIn')}
                    className="input pl-10"
                    placeholder="linkedin.com/in/johndoe"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Website/Portfolio</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('personal.website')}
                    type="url"
                    className="input pl-10"
                    placeholder="https://johndoe.dev"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Professional Summary</label>
              <textarea
                {...register('summary')}
                className="textarea"
                rows={4}
                placeholder="Brief professional summary highlighting your key strengths and experience..."
              />
              <p className="form-help">
                A compelling summary that highlights your key qualifications and career objectives.
              </p>
            </div>
          </div>
        )}

        {/* Work Experience Tab */}
        {activeTab === 'experience' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
              <button
                type="button"
                onClick={() => appendExperience({
                  id: generateId(),
                  company: '',
                  role: '',
                  start_date: '',
                  end_date: '',
                  current: false,
                  bullets: []
                })}
                className="btn btn-outline btn-sm flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Experience</span>
              </button>
            </div>

            {experienceFields.map((field, index) => (
              <ExperienceCard
                key={field.id}
                index={index}
                register={register}
                control={control}
                onRemove={() => removeExperience(index)}
                errors={errors}
              />
            ))}

            {experienceFields.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No work experience added yet.</p>
                <p className="text-sm">Click "Add Experience" to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Skills</h3>
              <button
                type="button"
                onClick={() => appendSkill({
                  id: generateId(),
                  name: '',
                  category: 'technical',
                  proficiency: 'intermediate'
                })}
                className="btn btn-outline btn-sm flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Skill</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillFields.map((field, index) => (
                <div key={field.id} className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Skill {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="form-group">
                      <label className="form-label">Skill Name</label>
                      <input
                        {...register(`skills.${index}.name`, { required: 'Skill name is required' })}
                        className="input"
                        placeholder="JavaScript"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="form-group">
                        <label className="form-label">Category</label>
                        <select
                          {...register(`skills.${index}.category`)}
                          className="select"
                        >
                          {Object.entries(SKILL_CATEGORIES).map(([key, value]) => (
                            <option key={key} value={value}>
                              {value.charAt(0).toUpperCase() + value.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Level</label>
                        <select
                          {...register(`skills.${index}.proficiency`)}
                          className="select"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {skillFields.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No skills added yet.</p>
                <p className="text-sm">Click "Add Skill" to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* Education Tab */}
        {activeTab === 'education' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Education</h3>
              <button
                type="button"
                onClick={() => appendEducation({
                  id: generateId(),
                  degree: '',
                  institution: '',
                  start_date: '',
                  end_date: '',
                  gpa: '',
                  relevant_courses: []
                })}
                className="btn btn-outline btn-sm flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Education</span>
              </button>
            </div>

            {educationFields.map((field, index) => (
              <EducationCard
                key={field.id}
                index={index}
                register={register}
                onRemove={() => removeEducation(index)}
                errors={errors}
              />
            ))}
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Projects</h3>
              <button
                type="button"
                onClick={() => appendProject({
                  id: generateId(),
                  name: '',
                  description: '',
                  technologies: [],
                  url: '',
                  start_date: '',
                  end_date: ''
                })}
                className="btn btn-outline btn-sm flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Project</span>
              </button>
            </div>

            {projectFields.map((field, index) => (
              <ProjectCard
                key={field.id}
                index={index}
                register={register}
                onRemove={() => removeProject(index)}
                errors={errors}
              />
            ))}
          </div>
        )}
      </form>
    </div>
  )
}

// Experience Card Component
function ExperienceCard({ index, register, control, onRemove, errors }) {
  const { fields: bulletFields, append: appendBullet, remove: removeBullet } = useFieldArray({
    control,
    name: `work_experience.${index}.bullets`
  })

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-gray-900">Experience {index + 1}</h4>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="form-group">
          <label className="form-label">Company *</label>
          <input
            {...register(`work_experience.${index}.company`, { required: 'Company is required' })}
            className="input"
            placeholder="Company Name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Job Title *</label>
          <input
            {...register(`work_experience.${index}.role`, { required: 'Job title is required' })}
            className="input"
            placeholder="Software Engineer"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Start Date *</label>
          <input
            {...register(`work_experience.${index}.start_date`, { required: 'Start date is required' })}
            type="month"
            className="input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">End Date</label>
          <input
            {...register(`work_experience.${index}.end_date`)}
            type="month"
            className="input"
          />
          <div className="mt-2">
            <label className="flex items-center space-x-2">
              <input
                {...register(`work_experience.${index}.current`)}
                type="checkbox"
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-600">Currently working here</span>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="form-label">Key Achievements</label>
          <button
            type="button"
            onClick={() => appendBullet({ id: generateId(), text: '', metrics: '' })}
            className="btn btn-outline btn-sm flex items-center space-x-1"
          >
            <Plus className="w-3 h-3" />
            <span>Add Achievement</span>
          </button>
        </div>

        {bulletFields.map((bullet, bulletIndex) => (
          <div key={bullet.id} className="flex items-start space-x-2">
            <textarea
              {...register(`work_experience.${index}.bullets.${bulletIndex}.text`)}
              className="textarea flex-1"
              rows={2}
              placeholder="Describe your achievement with specific metrics..."
            />
            <button
              type="button"
              onClick={() => removeBullet(bulletIndex)}
              className="text-red-600 hover:text-red-800 mt-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// Education Card Component
function EducationCard({ index, register, onRemove, errors }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-gray-900">Education {index + 1}</h4>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Degree *</label>
          <input
            {...register(`education.${index}.degree`, { required: 'Degree is required' })}
            className="input"
            placeholder="Bachelor of Science in Computer Science"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Institution *</label>
          <input
            {...register(`education.${index}.institution`, { required: 'Institution is required' })}
            className="input"
            placeholder="University Name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input
            {...register(`education.${index}.start_date`)}
            type="month"
            className="input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">End Date</label>
          <input
            {...register(`education.${index}.end_date`)}
            type="month"
            className="input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">GPA (Optional)</label>
          <input
            {...register(`education.${index}.gpa`)}
            className="input"
            placeholder="3.8"
          />
        </div>
      </div>
    </div>
  )
}

// Project Card Component
function ProjectCard({ index, register, onRemove, errors }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-gray-900">Project {index + 1}</h4>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              {...register(`projects.${index}.name`, { required: 'Project name is required' })}
              className="input"
              placeholder="E-commerce Platform"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Project URL</label>
            <input
              {...register(`projects.${index}.url`)}
              type="url"
              className="input"
              placeholder="https://github.com/username/project"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea
            {...register(`projects.${index}.description`, { required: 'Description is required' })}
            className="textarea"
            rows={3}
            placeholder="Brief description of the project and your role..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Technologies Used</label>
          <input
            {...register(`projects.${index}.technologies`)}
            className="input"
            placeholder="React, Node.js, MongoDB (comma-separated)"
          />
          <p className="form-help">Enter technologies separated by commas</p>
        </div>
      </div>
    </div>
  )
}