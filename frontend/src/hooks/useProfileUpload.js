import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'
import { UPLOAD_CONFIG, VALIDATION_RULES } from '../utils/constants'

export function useProfileUpload({ onProfileLoad }) {
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors.some(e => e.code === 'file-too-large')) {
        toast.error(VALIDATION_RULES.FILE_SIZE)
      } else if (rejection.errors.some(e => e.code === 'file-invalid-type')) {
        toast.error(VALIDATION_RULES.FILE_TYPE)
      } else {
        toast.error('Invalid file')
      }
      return
    }

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      
      if (file.type === UPLOAD_CONFIG.ACCEPTED_TYPES.JSON) {
        // Handle JSON file
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const profile = JSON.parse(e.target.result)
            onProfileLoad(profile)
            toast.success('Profile loaded successfully')
          } catch (error) {
            toast.error('Invalid JSON file format')
          }
        }
        reader.readAsText(file)
      } else {
        toast.error('Only JSON files are supported for profile upload')
      }
    }
  }, [onProfileLoad])

  const dropzone = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    maxSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
    multiple: false
  })

  // Load sample profile function
  const loadSampleProfile = useCallback(() => {
    const sampleProfile = {
      personal: {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1-555-0123",
        location: "New York, NY",
        linkedIn: "linkedin.com/in/johndoe",
        website: "https://johndoe.dev"
      },
      summary: "Experienced software developer with 5+ years in web development, specializing in React and Node.js applications.",
      work_experience: [
        {
          id: "exp1",
          company: "Tech Corp",
          role: "Senior Software Engineer",
          start_date: "2020-01",
          end_date: "",
          current: true,
          bullets: [
            { id: "b1", text: "Developed React applications serving 10k+ users daily" },
            { id: "b2", text: "Led team of 3 developers on major product features" },
            { id: "b3", text: "Improved application performance by 40% through optimization" }
          ]
        },
        {
          id: "exp2",
          company: "StartupXYZ",
          role: "Full Stack Developer",
          start_date: "2018-06",
          end_date: "2019-12",
          current: false,
          bullets: [
            { id: "b4", text: "Built RESTful APIs using Node.js and Express" },
            { id: "b5", text: "Implemented responsive UI components with React" }
          ]
        }
      ],
      skills: [
        { id: "s1", name: "JavaScript", category: "technical", proficiency: "expert" },
        { id: "s2", name: "React", category: "technical", proficiency: "advanced" },
        { id: "s3", name: "Node.js", category: "technical", proficiency: "advanced" },
        { id: "s4", name: "TypeScript", category: "technical", proficiency: "intermediate" },
        { id: "s5", name: "Leadership", category: "soft", proficiency: "advanced" }
      ],
      education: [
        {
          id: "edu1",
          degree: "Bachelor of Computer Science",
          institution: "University of Technology",
          start_date: "2015-09",
          end_date: "2019-05",
          gpa: "3.8"
        }
      ],
      projects: [
        {
          id: "proj1",
          name: "E-commerce Platform",
          description: "Full-stack e-commerce application with payment integration",
          technologies: "React, Node.js, MongoDB, Stripe API",
          url: "https://github.com/johndoe/ecommerce"
        }
      ]
    }
    
    onProfileLoad(sampleProfile)
    toast.success('Sample profile loaded successfully')
  }, [onProfileLoad])

  // Download profile function
  const downloadProfile = useCallback((profile, filename = 'profile.json') => {
    const dataStr = JSON.stringify(profile, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
    toast.success('Profile downloaded successfully')
  }, [])

  return {
    ...dropzone,
    loadSampleProfile,
    downloadProfile
  }
}

export default useProfileUpload