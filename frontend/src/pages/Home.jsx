import { Link } from 'react-router-dom'
import {
  ArrowRight,
  FileText,
  Brain,
  Zap,
  Target,
  CheckCircle,
  Star,
  Users,
  TrendingUp
} from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Content',
    description: 'Generate tailored CV content using advanced AI that understands job requirements and optimizes for ATS systems.'
  },
  {
    icon: Target,
    title: 'Keyword Optimization',
    description: 'Automatically extract and match keywords from job descriptions to maximize your CV\'s visibility to recruiters.'
  },
  {
    icon: FileText,
    title: 'Professional Templates',
    description: 'Choose from modern, ATS-friendly templates that look great and pass through applicant tracking systems.'
  },
  {
    icon: Zap,
    title: 'Instant Generation',
    description: 'Create a complete, tailored CV in minutes, not hours. Perfect for applying to multiple positions quickly.'
  }
]

const benefits = [
  'Increase interview callbacks by up to 40%',
  'Save hours of manual CV customization',
  'Beat ATS systems with optimized formatting',
  'Stand out with AI-enhanced content',
  'Professional LaTeX PDF output',
  'Multiple template options'
]

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Software Engineer',
    company: 'Tech Corp',
    content: 'This tool helped me land my dream job! The AI-generated content was spot-on and the ATS optimization really worked.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'Marketing Manager',
    company: 'Growth Inc',
    content: 'I got 3x more interview calls after using this CV builder. The keyword matching is incredibly effective.',
    rating: 5
  },
  {
    name: 'Emily Davis',
    role: 'Data Scientist',
    company: 'Analytics Pro',
    content: 'The professional templates and AI content generation saved me so much time. Highly recommended!',
    rating: 5
  }
]

const stats = [
  { label: 'CVs Generated', value: '10,000+' },
  { label: 'Success Rate', value: '85%' },
  { label: 'Time Saved', value: '5 hours' },
  { label: 'Happy Users', value: '2,500+' }
]

export function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-blue-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Create{' '}
                <span className="text-primary-600">AI-Powered</span>{' '}
                CVs That Get You Hired
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Build professional, ATS-optimized resumes tailored to specific job descriptions
                using advanced AI technology. Increase your interview callbacks by up to 40%.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/builder"
                  className="btn btn-primary btn-lg flex items-center justify-center gap-2"
                >
                  Start Building Your CV
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/templates"
                  className="btn btn-outline btn-lg flex items-center justify-center gap-2"
                >
                  View Templates
                  <FileText className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-2">
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-primary-300 rounded w-1/2"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-primary-600 text-white rounded-full p-3">
                <Brain className="w-6 h-6" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AI CV Builder?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced AI technology and professional templates help you create
              CVs that stand out and get results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Get More Interviews with AI-Optimized CVs
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our AI analyzes job descriptions and optimizes your CV content to match
                what recruiters and ATS systems are looking for.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-8 text-white">
                <TrendingUp className="w-12 h-12 mb-6" />
                <h3 className="text-2xl font-bold mb-4">40% More Callbacks</h3>
                <p className="text-primary-100 mb-6">
                  Users report significantly higher interview callback rates after
                  using our AI-optimized CVs.
                </p>
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="text-sm text-primary-100 mb-2">Success Rate</div>
                  <div className="flex items-center">
                    <div className="flex-1 bg-white bg-opacity-20 rounded-full h-2 mr-3">
                      <div className="bg-white h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-white font-semibold">85%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of professionals who've boosted their careers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Build Your Perfect CV?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of professionals who've already boosted their careers
              with AI-powered CVs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/builder"
                className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/about"
                className="btn border-white text-white hover:bg-white hover:text-primary-600 btn-lg"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}