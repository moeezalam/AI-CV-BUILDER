import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_VALUES, STORAGE_KEYS } from '../utils/constants'
import { deepClone } from '../utils/helpers'

const useAppStore = create(
  persist(
    (set, get) => ({
      // User Profile State
      userProfile: DEFAULT_VALUES.USER_PROFILE,
      setUserProfile: (profile) => set({ userProfile: profile }),
      updateUserProfile: (updates) => set((state) => ({
        userProfile: { ...state.userProfile, ...updates }
      })),
      resetUserProfile: () => set({ userProfile: DEFAULT_VALUES.USER_PROFILE }),

      // Job Description State
      jobDescription: DEFAULT_VALUES.JOB_DESCRIPTION,
      setJobDescription: (job) => set({ jobDescription: job }),
      updateJobDescription: (updates) => set((state) => ({
        jobDescription: { ...state.jobDescription, ...updates }
      })),
      resetJobDescription: () => set({ jobDescription: DEFAULT_VALUES.JOB_DESCRIPTION }),

      // CV Options State
      cvOptions: DEFAULT_VALUES.CV_OPTIONS,
      setCvOptions: (options) => set({ cvOptions: options }),
      updateCvOptions: (updates) => set((state) => ({
        cvOptions: { ...state.cvOptions, ...updates }
      })),

      // Generated CV State
      generatedCV: null,
      setGeneratedCV: (cv) => set({ generatedCV: cv }),
      clearGeneratedCV: () => set({ generatedCV: null }),

      // Keywords State
      extractedKeywords: [],
      setExtractedKeywords: (keywords) => set({ extractedKeywords: keywords }),
      clearKeywords: () => set({ extractedKeywords: [] }),

      // Analysis State
      keywordAnalysis: null,
      setKeywordAnalysis: (analysis) => set({ keywordAnalysis: analysis }),
      clearAnalysis: () => set({ keywordAnalysis: null }),

      // UI State
      currentStep: 1,
      setCurrentStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),

      // Loading States
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),
      
      loadingStates: {
        extractingKeywords: false,
        generatingContent: false,
        creatingPDF: false,
        uploading: false,
      },
      setLoadingState: (key, value) => set((state) => ({
        loadingStates: { ...state.loadingStates, [key]: value }
      })),

      // Error State
      error: null,
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Recent Jobs State
      recentJobs: [],
      addRecentJob: (job) => set((state) => {
        const filtered = state.recentJobs.filter(j => j.id !== job.id)
        return {
          recentJobs: [job, ...filtered].slice(0, 10) // Keep last 10
        }
      }),
      removeRecentJob: (jobId) => set((state) => ({
        recentJobs: state.recentJobs.filter(j => j.id !== jobId)
      })),
      clearRecentJobs: () => set({ recentJobs: [] }),

      // CV Drafts State
      cvDrafts: [],
      saveDraft: (draft) => set((state) => {
        const existingIndex = state.cvDrafts.findIndex(d => d.id === draft.id)
        const newDrafts = [...state.cvDrafts]
        
        if (existingIndex >= 0) {
          newDrafts[existingIndex] = { ...draft, updatedAt: new Date() }
        } else {
          newDrafts.unshift({ ...draft, createdAt: new Date(), updatedAt: new Date() })
        }
        
        return { cvDrafts: newDrafts.slice(0, 20) } // Keep last 20 drafts
      }),
      deleteDraft: (draftId) => set((state) => ({
        cvDrafts: state.cvDrafts.filter(d => d.id !== draftId)
      })),
      clearDrafts: () => set({ cvDrafts: [] }),

      // Preferences State
      preferences: {
        theme: 'light',
        autoSave: true,
        showTips: true,
        defaultTemplate: 'modern',
        language: 'en',
      },
      setPreferences: (prefs) => set({ preferences: prefs }),
      updatePreferences: (updates) => set((state) => ({
        preferences: { ...state.preferences, ...updates }
      })),

      // Actions
      // Initialize app with sample data
      initializeWithSample: () => {
        const sampleProfile = {
          personal: {
            name: "John Doe",
            email: "john.doe@example.com",
            phone: "+1-555-0123",
            location: "New York, NY"
          },
          summary: "Experienced software developer with 5+ years in web development",
          work_experience: [
            {
              id: "exp1",
              company: "Tech Corp",
              role: "Senior Developer",
              start_date: "2020-01",
              end_date: "Present",
              bullets: [
                { id: "b1", text: "Developed React applications serving 10k+ users" },
                { id: "b2", text: "Led team of 3 developers on major projects" }
              ]
            }
          ],
          skills: [
            { id: "s1", name: "JavaScript", category: "technical" },
            { id: "s2", name: "React", category: "technical" },
            { id: "s3", name: "Node.js", category: "technical" }
          ],
          education: [
            {
              id: "edu1",
              degree: "Bachelor of Computer Science",
              institution: "University of Technology",
              start_date: "2015",
              end_date: "2019"
            }
          ]
        }

        const sampleJob = {
          title: "Full Stack Developer",
          company: "Startup Inc",
          description: "We are looking for a full stack developer with experience in JavaScript, React, Node.js, and modern web technologies."
        }

        set({
          userProfile: sampleProfile,
          jobDescription: sampleJob
        })
      },

      // Reset all data
      resetAll: () => set({
        userProfile: DEFAULT_VALUES.USER_PROFILE,
        jobDescription: DEFAULT_VALUES.JOB_DESCRIPTION,
        cvOptions: DEFAULT_VALUES.CV_OPTIONS,
        generatedCV: null,
        extractedKeywords: [],
        keywordAnalysis: null,
        currentStep: 1,
        error: null,
      }),

      // Export data
      exportData: () => {
        const state = get()
        return {
          userProfile: state.userProfile,
          jobDescription: state.jobDescription,
          cvOptions: state.cvOptions,
          recentJobs: state.recentJobs,
          preferences: state.preferences,
          exportedAt: new Date().toISOString(),
        }
      },

      // Import data
      importData: (data) => {
        if (data.userProfile) set({ userProfile: data.userProfile })
        if (data.jobDescription) set({ jobDescription: data.jobDescription })
        if (data.cvOptions) set({ cvOptions: data.cvOptions })
        if (data.recentJobs) set({ recentJobs: data.recentJobs })
        if (data.preferences) set({ preferences: data.preferences })
      },

      // Get completion status
      getCompletionStatus: () => {
        const state = get()
        const profile = state.userProfile
        
        return {
          personal: !!(profile.personal?.name && profile.personal?.email),
          summary: !!(profile.summary && profile.summary.length > 20),
          experience: !!(profile.work_experience?.length > 0),
          skills: !!(profile.skills?.length >= 3),
          education: !!(profile.education?.length > 0),
          jobDescription: !!(state.jobDescription?.title && state.jobDescription?.description),
        }
      },

      // Calculate overall progress
      getProgress: () => {
        const completion = get().getCompletionStatus()
        const completed = Object.values(completion).filter(Boolean).length
        const total = Object.keys(completion).length
        return Math.round((completed / total) * 100)
      },
    }),
    {
      name: STORAGE_KEYS.PREFERENCES,
      partialize: (state) => ({
        userProfile: state.userProfile,
        jobDescription: state.jobDescription,
        cvOptions: state.cvOptions,
        recentJobs: state.recentJobs,
        cvDrafts: state.cvDrafts,
        preferences: state.preferences,
      }),
    }
  )
)

export default useAppStore