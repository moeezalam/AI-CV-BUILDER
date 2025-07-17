import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Search, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="relative">
              <div className="text-9xl font-bold text-gray-200 select-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-primary-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Oops! The page you're looking for doesn't exist. It might have been moved, 
              deleted, or you entered the wrong URL.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/"
                className="btn btn-primary flex items-center justify-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Go Home</span>
              </Link>
              <button
                onClick={() => window.history.back()}
                className="btn btn-outline flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
            </div>
            
            <Link
              to="/builder"
              className="btn btn-ghost w-full flex items-center justify-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Create a CV</span>
            </Link>
          </motion.div>

          {/* Helpful Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 pt-8 border-t border-gray-200"
          >
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Popular Pages
            </h3>
            <div className="space-y-2">
              <Link
                to="/builder"
                className="block text-sm text-primary-600 hover:text-primary-700"
              >
                CV Builder
              </Link>
              <Link
                to="/templates"
                className="block text-sm text-primary-600 hover:text-primary-700"
              >
                Templates
              </Link>
              <Link
                to="/dashboard"
                className="block text-sm text-primary-600 hover:text-primary-700"
              >
                Dashboard
              </Link>
              <Link
                to="/about"
                className="block text-sm text-primary-600 hover:text-primary-700"
              >
                About Us
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}