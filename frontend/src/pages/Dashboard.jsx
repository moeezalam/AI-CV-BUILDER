import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  FileText, 
  Download, 
  Trash2, 
  Edit,
  Eye,
  Calendar,
  TrendingUp,
  Target,
  Clock,
  BarChart3
} from 'lucide-react'
import { motion } from 'framer-motion'
import useAppStore from '../store/useAppStore'
import { formatDate, formatRelativeTime } from '../utils/helpers'

export function Dashboard() {
  const {
    cvDrafts,
    recentJobs,
    userProfile,
    deleteDraft,
    removeRecentJob,
    clearDrafts,
    clearRecentJobs,
    getProgress
  } = useAppStore()

  const [activeTab, setActiveTab] = useState('overview')

  const progress = getProgress()
  const hasProfile = userProfile.personal?.name && userProfile.personal?.email

  const stats = {
    totalCVs: cvDrafts.length,
    totalJobs: recentJobs.length,
    profileCompleteness: progress,
    lastActivity: cvDrafts.length > 0 ? cvDrafts[0].updatedAt : null
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'cvs', label: 'My CVs', icon: FileText },
    { id: 'jobs', label: 'Recent Jobs', icon: Target },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back{hasProfile ? `, ${userProfile.personal.name}` : ''}!
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your CVs and track your job applications
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              to="/builder"
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New CV</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total CVs"
            value={stats.totalCVs}
            icon={FileText}
            color="blue"
          />
          <StatCard
            title="Job Applications"
            value={stats.totalJobs}
            icon={Target}
            color="green"
          />
          <StatCard
            title="Profile Complete"
            value={`${stats.profileCompleteness}%`}
            icon={TrendingUp}
            color="purple"
          />
          <StatCard
            title="Last Activity"
            value={stats.lastActivity ? formatRelativeTime(stats.lastActivity) : 'Never'}
            icon={Clock}
            color="orange"
          />
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <OverviewTab 
              stats={stats}
              hasProfile={hasProfile}
              recentCVs={cvDrafts.slice(0, 3)}
              recentJobs={recentJobs.slice(0, 3)}
            />
          )}

          {activeTab === 'cvs' && (
            <CVsTab 
              cvs={cvDrafts}
              onDelete={deleteDraft}
              onClearAll={clearDrafts}
            />
          )}

          {activeTab === 'jobs' && (
            <JobsTab 
              jobs={recentJobs}
              onDelete={removeRecentJob}
              onClearAll={clearRecentJobs}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm p-6"
    >
      <div className="flex items-center">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </motion.div>
  )
}

// Overview Tab Component
function OverviewTab({ stats, hasProfile, recentCVs, recentJobs }) {
  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/builder"
          className="card p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
              <Plus className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Create New CV</h3>
              <p className="text-sm text-gray-600">Start building a new CV</p>
            </div>
          </div>
        </Link>

        <Link
          to="/templates"
          className="card p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Browse Templates</h3>
              <p className="text-sm text-gray-600">Explore CV templates</p>
            </div>
          </div>
        </Link>

        <Link
          to="/builder"
          className="card p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Analyze Job</h3>
              <p className="text-sm text-gray-600">Extract job keywords</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Profile Completeness */}
      {!hasProfile && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-900 mb-1">
                Complete Your Profile
              </h3>
              <p className="text-sm text-yellow-800 mb-3">
                Add your personal information and work experience to get better CV recommendations.
              </p>
              <Link
                to="/builder"
                className="btn btn-sm bg-yellow-600 text-white hover:bg-yellow-700"
              >
                Complete Profile
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent CVs */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent CVs</h3>
            <Link
              to="#"
              onClick={() => setActiveTab('cvs')}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
          
          {recentCVs.length > 0 ? (
            <div className="space-y-3">
              {recentCVs.map((cv) => (
                <div key={cv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {cv.name || 'Untitled CV'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatRelativeTime(cv.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No CVs created yet</p>
              <p className="text-sm">Create your first CV to get started</p>
            </div>
          )}
        </div>

        {/* Recent Jobs */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Jobs</h3>
            <Link
              to="#"
              onClick={() => setActiveTab('jobs')}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
          
          {recentJobs.length > 0 ? (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Target className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {job.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {job.company} • {formatRelativeTime(job.createdAt)}
                      </p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No jobs analyzed yet</p>
              <p className="text-sm">Add job descriptions to track them</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// CVs Tab Component
function CVsTab({ cvs, onDelete, onClearAll }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">My CVs</h2>
        {cvs.length > 0 && (
          <button
            onClick={onClearAll}
            className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
          >
            Clear All
          </button>
        )}
      </div>

      {cvs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cvs.map((cv) => (
            <CVCard
              key={cv.id}
              cv={cv}
              onDelete={() => onDelete(cv.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No CVs yet</h3>
          <p className="text-gray-600 mb-6">Create your first CV to get started</p>
          <Link to="/builder" className="btn btn-primary">
            Create New CV
          </Link>
        </div>
      )}
    </div>
  )
}

// Jobs Tab Component
function JobsTab({ jobs, onDelete, onClearAll }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Recent Jobs</h2>
        {jobs.length > 0 && (
          <button
            onClick={onClearAll}
            className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
          >
            Clear All
          </button>
        )}
      </div>

      {jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onDelete={() => onDelete(job.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs tracked</h3>
          <p className="text-gray-600 mb-6">Add job descriptions to track and analyze them</p>
          <Link to="/builder" className="btn btn-primary">
            Analyze Job Description
          </Link>
        </div>
      )}
    </div>
  )
}

// CV Card Component
function CVCard({ cv, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {cv.name || 'Untitled CV'}
            </h3>
            <p className="text-sm text-gray-500">
              {formatDate(cv.updatedAt)}
            </p>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        {cv.relevanceScore && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Match Score:</span>
            <span className="font-medium text-primary-600">{cv.relevanceScore}%</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Template:</span>
          <span className="font-medium">{cv.templateUsed || 'Modern'}</span>
        </div>
      </div>

      <div className="flex space-x-2">
        <button className="btn btn-outline btn-sm flex-1 flex items-center justify-center space-x-1">
          <Eye className="w-3 h-3" />
          <span>View</span>
        </button>
        <button className="btn btn-outline btn-sm flex-1 flex items-center justify-center space-x-1">
          <Edit className="w-3 h-3" />
          <span>Edit</span>
        </button>
        <button className="btn btn-primary btn-sm flex-1 flex items-center justify-center space-x-1">
          <Download className="w-3 h-3" />
          <span>PDF</span>
        </button>
      </div>
    </motion.div>
  )
}

// Job Card Component
function JobCard({ job, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1">{job.title}</h3>
            <p className="text-gray-600 mb-2">{job.company}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(job.createdAt)}</span>
              </span>
              {job.location && (
                <span>{job.location}</span>
              )}
              {job.job_type && (
                <span className="badge badge-default text-xs">
                  {job.job_type}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="text-gray-400 hover:text-gray-600">
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}