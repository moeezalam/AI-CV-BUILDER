import React from 'react'
import { motion } from 'framer-motion'
import { Loader2, Sparkles, FileText, Brain } from 'lucide-react'
import { cn } from '../../utils/helpers'

// Basic Loading Spinner
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  return (
    <Loader2 
      className={cn(
        'animate-spin text-blue-600',
        sizeClasses[size],
        className
      )}
    />
  )
}

// Loading Button
export const LoadingButton = ({ 
  children, 
  loading = false, 
  disabled = false,
  className = '',
  variant = 'primary',
  size = 'md',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50'
  }
  
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  }

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      {children}
    </button>
  )
}

// Skeleton Card for loading states
export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={cn('card animate-pulse', className)}>
      <div className="card-header">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="card-content space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  )
}

// AI Processing Loader with animations
export const AIProcessingLoader = ({ 
  message = 'Processing with AI...', 
  steps = [],
  currentStep = 0,
  className = '' 
}) => {
  const processingSteps = steps.length > 0 ? steps : [
    'Analyzing job description...',
    'Extracting key requirements...',
    'Optimizing CV content...',
    'Finalizing recommendations...'
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-col items-center space-y-6 p-8', className)}
    >
      {/* Main AI Icon with Animation */}
      <motion.div
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 3, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
        className="relative"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Brain className="w-8 h-8 text-white" />
        </div>
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full"
            animate={{
              x: [0, Math.cos(i * 60 * Math.PI / 180) * 30],
              y: [0, Math.sin(i * 60 * Math.PI / 180) * 30],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </motion.div>

      {/* Main Message */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {message}
        </h3>
        <p className="text-sm text-gray-600">
          Our AI is working hard to optimize your CV
        </p>
      </div>

      {/* Processing Steps */}
      <div className="w-full max-w-md space-y-3">
        {processingSteps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: index <= currentStep ? 1 : 0.5,
              x: 0 
            }}
            transition={{ delay: index * 0.2 }}
            className="flex items-center space-x-3"
          >
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
              index < currentStep 
                ? 'bg-green-500 text-white' 
                : index === currentStep
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-500'
            )}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            <span className={cn(
              'text-sm',
              index <= currentStep ? 'text-gray-900' : 'text-gray-500'
            )}>
              {step}
            </span>
            {index === currentStep && (
              <LoadingSpinner size="sm" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md">
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ 
              width: `${((currentStep + 1) / processingSteps.length) * 100}%` 
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Step {currentStep + 1} of {processingSteps.length}</span>
          <span>{Math.round(((currentStep + 1) / processingSteps.length) * 100)}%</span>
        </div>
      </div>
    </motion.div>
  )
}

// Simple Loading Overlay
export const LoadingOverlay = ({ message = 'Loading...', className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
        className
      )}
    >
      <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-900 font-medium">{message}</p>
      </div>
    </motion.div>
  )
}

// Loading State for Lists
export const LoadingList = ({ count = 3, className = '' }) => {
  return (
    <div className={cn('space-y-4', className)}>
      {[...Array(count)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default {
  LoadingSpinner,
  LoadingButton,
  SkeletonCard,
  AIProcessingLoader,
  LoadingOverlay,
  LoadingList
}