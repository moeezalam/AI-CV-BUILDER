import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Menu, 
  X, 
  FileText, 
  Home, 
  Settings, 
  Layout as LayoutIcon,
  Info,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react'
import { cn } from '../../utils/helpers'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'CV Builder', href: '/builder', icon: FileText },
  { name: 'Templates', href: '/templates', icon: LayoutIcon },
  { name: 'About', href: '/about', icon: Info },
]

const socialLinks = [
  { name: 'GitHub', href: '#', icon: Github },
  { name: 'Twitter', href: '#', icon: Twitter },
  { name: 'LinkedIn', href: '#', icon: Linkedin },
]

export function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  AI CV Builder
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors',
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  AI CV Builder
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Create professional, ATS-optimized resumes tailored to specific job descriptions using AI technology.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Quick Links
              </h3>
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Connect
              </h3>
              <div className="flex space-x-4">
                {socialLinks.map((item) => {
                  const Icon = item.icon
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className="text-gray-400 hover:text-primary-600 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="sr-only">{item.name}</span>
                      <Icon className="w-5 h-5" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-600">
                © 2024 AI CV Builder. All rights reserved.
              </p>
              <div className="mt-4 md:mt-0 flex space-x-6">
                <a href="#" className="text-sm text-gray-600 hover:text-primary-600">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm text-gray-600 hover:text-primary-600">
                  Terms of Service
                </a>
                <a href="#" className="text-sm text-gray-600 hover:text-primary-600">
                  Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}