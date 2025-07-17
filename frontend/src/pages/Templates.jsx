import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Download, Star, Check, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTemplates } from '../hooks/useAPI'
import { LoadingSpinner, SkeletonCard } from '../components/common/Loading'
import { CV_TEMPLATES } from '../utils/constants'

const mockTemplates = [
  {
    id: 'modern',
    name: 'Modern Professional',
    description: 'Clean, modern design with color accents and professional layout',
    preview: '/templates/modern-preview.png',
    features: [
      'Color-coded sections',
      'Modern typography',
      'ATS-friendly format',
      'Professional layout'
    ],
    colors: ['blue', 'green', 'red', 'purple', 'orange'],
    rating: 4.8,
    downloads: 15420,
    category: 'Professional'
  },
  {
    id: 'classic',
    name: 'Classic Traditional',
    description: 'Traditional, conservative layout perfect for formal industries',
    preview: '/templates/classic-preview.png',
    features: [
      'Traditional design',
      'Conservative layout',
      'Highly compatible',
      'Clean typography'
    ],
    colors: ['black', 'blue', 'gray'],
    rating: 4.6,
    downloads: 12350,
    category: 'Traditional'
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Simple, minimalist design focusing on content over decoration',
    preview: '/templates/minimal-preview.png',
    features: [
      'Minimalist design',
      'Content-focused',
      'Easy to read',
      'Versatile layout'
    ],
    colors: ['black', 'gray', 'blue'],
    rating: 4.7,
    downloads: 9870,
    category: 'Minimal'
  },
  {
    id: 'creative',
    name: 'Creative Modern',
    description: 'Creative layout with unique styling for design-focused roles',
    preview: '/templates/creative-preview.png',
    features: [
      'Creative layout',
      'Unique styling',
      'Visual appeal',
      'Design-focused'
    ],
    colors: ['purple', 'teal', 'orange', 'pink'],
    rating: 4.5,
    downloads: 7650,
    category: 'Creative'
  }
]

const categories = ['All', 'Professional', 'Traditional', 'Minimal', 'Creative']

export function Templates() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  
  const { data: templatesData, isLoading, error } = useTemplates()
  
  // Use mock data if API fails
  const templates = templatesData?.data?.templates || mockTemplates

  const filteredTemplates = selectedCategory === 'All' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Professional CV Templates
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Choose from our collection of professionally designed, ATS-optimized templates. 
            Each template is crafted to help you stand out while ensuring compatibility with 
            applicant tracking systems.
          </motion.p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-sm">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Failed to load templates</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-outline"
            >
              Try Again
            </button>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredTemplates.map((template, index) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={index}
                onSelect={setSelectedTemplate}
                isSelected={selectedTemplate?.id === template.id}
              />
            ))}
          </motion.div>
        )}

        {filteredTemplates.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">No templates found in this category.</p>
          </div>
        )}

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16 bg-primary-600 rounded-2xl p-12 text-white"
        >
          <h2 className="text-3xl font-bold mb-4">
            Ready to Create Your Perfect CV?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Choose a template and let our AI tailor your CV to match any job description. 
            Get started in minutes and increase your interview callbacks.
          </p>
          <Link
            to="/builder"
            className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg inline-flex items-center space-x-2"
          >
            <span>Start Building Your CV</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  )
}

// Template Card Component
function TemplateCard({ template, index, onSelect, isSelected }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`
        bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl
        ${isSelected ? 'ring-2 ring-primary-500' : ''}
      `}
    >
      {/* Template Preview */}
      <div className="relative aspect-[3/4] bg-gray-100">
        <img
          src={template.preview || '/placeholder-template.png'}
          alt={template.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/placeholder-template.png'
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={() => onSelect(template)}
            className="btn btn-primary opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="badge badge-primary">
            {template.category}
          </span>
        </div>

        {/* Rating */}
        <div className="absolute top-4 right-4 bg-white rounded-full px-2 py-1 flex items-center space-x-1">
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
          <span className="text-xs font-medium">{template.rating}</span>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {template.name}
        </h3>
        <p className="text-gray-600 mb-4 text-sm">
          {template.description}
        </p>

        {/* Features */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
          <div className="space-y-1">
            {template.features.slice(0, 3).map((feature, i) => (
              <div key={i} className="flex items-center space-x-2 text-sm text-gray-600">
                <Check className="w-3 h-3 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Color Options */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Available Colors:</h4>
          <div className="flex space-x-2">
            {template.colors.slice(0, 4).map((color, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-gray-200"
                style={{ 
                  backgroundColor: color === 'black' ? '#000' : 
                                 color === 'blue' ? '#3b82f6' :
                                 color === 'green' ? '#22c55e' :
                                 color === 'red' ? '#ef4444' :
                                 color === 'purple' ? '#8b5cf6' :
                                 color === 'orange' ? '#f97316' :
                                 color === 'gray' ? '#6b7280' : color
                }}
              />
            ))}
            {template.colors.length > 4 && (
              <span className="text-xs text-gray-500 self-center">
                +{template.colors.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>{template.downloads?.toLocaleString()} downloads</span>
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span>{template.rating}/5</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => onSelect(template)}
            className="btn btn-outline btn-sm flex-1 flex items-center justify-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
          <Link
            to={`/builder?template=${template.id}`}
            className="btn btn-primary btn-sm flex-1 flex items-center justify-center space-x-2"
          >
            <span>Use Template</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// Template Preview Modal Component
function TemplatePreviewModal({ template, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
            <p className="text-gray-600">{template.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preview Image */}
            <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={template.preview || '/placeholder-template.png'}
                alt={template.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-template.png'
                }}
              />
            </div>

            {/* Template Details */}
            <div className="space-y-6">
              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                <div className="space-y-2">
                  {template.features.map((feature, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Options */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Color Options</h3>
                <div className="flex flex-wrap gap-3">
                  {template.colors.map((color, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-gray-200"
                        style={{ 
                          backgroundColor: color === 'black' ? '#000' : 
                                         color === 'blue' ? '#3b82f6' :
                                         color === 'green' ? '#22c55e' :
                                         color === 'red' ? '#ef4444' :
                                         color === 'purple' ? '#8b5cf6' :
                                         color === 'orange' ? '#f97316' :
                                         color === 'gray' ? '#6b7280' : color
                        }}
                      />
                      <span className="text-sm text-gray-600 capitalize">{color}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary-600">
                      {template.downloads?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Downloads</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary-600 flex items-center justify-center space-x-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span>{template.rating}</span>
                    </div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Link
                  to={`/builder?template=${template.id}`}
                  className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <span>Use This Template</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={onClose}
                  className="btn btn-outline"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}