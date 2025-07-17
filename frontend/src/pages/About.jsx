import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Brain, 
  Target, 
  Zap, 
  Shield, 
  Users, 
  Award,
  ArrowRight,
  CheckCircle,
  Github,
  Mail,
  MessageCircle
} from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Intelligence',
    description: 'Our advanced AI analyzes job descriptions and tailors your CV content to match specific requirements, increasing your chances of getting noticed by recruiters and ATS systems.'
  },
  {
    icon: Target,
    title: 'ATS Optimization',
    description: 'Every template and generated content is optimized for Applicant Tracking Systems, ensuring your CV passes through automated screening processes.'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Generate a complete, tailored CV in minutes, not hours. Perfect for applying to multiple positions quickly and efficiently.'
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data is processed securely and never stored permanently. We prioritize your privacy and data security above all else.'
  }
]

const team = [
  {
    name: 'Alex Johnson',
    role: 'AI Engineer',
    bio: 'Specializes in natural language processing and machine learning systems.',
    avatar: '/team/alex.jpg'
  },
  {
    name: 'Sarah Chen',
    role: 'Product Designer',
    bio: 'Creates intuitive user experiences and beautiful, functional interfaces.',
    avatar: '/team/sarah.jpg'
  },
  {
    name: 'Mike Rodriguez',
    role: 'Full Stack Developer',
    bio: 'Builds scalable web applications and robust backend systems.',
    avatar: '/team/mike.jpg'
  }
]

const stats = [
  { label: 'CVs Generated', value: '50,000+' },
  { label: 'Success Rate', value: '85%' },
  { label: 'Happy Users', value: '12,000+' },
  { label: 'Countries', value: '25+' }
]

export function About() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              About AI CV Builder
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to help professionals create outstanding CVs that get results. 
              Our AI-powered platform combines cutting-edge technology with proven recruitment 
              insights to give you the competitive edge you need.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Job searching can be overwhelming, especially when you're competing with 
                hundreds of other candidates. Traditional CV writing is time-consuming 
                and often ineffective against modern ATS systems.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                That's why we created AI CV Builder - to democratize access to professional, 
                ATS-optimized CVs that actually get results. Our platform uses advanced AI 
                to analyze job descriptions and tailor your CV content accordingly.
              </p>
              <div className="space-y-4">
                {[
                  'Increase interview callbacks by up to 40%',
                  'Save hours of manual CV customization',
                  'Beat ATS systems with optimized formatting',
                  'Access professional templates and designs'
                ].map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
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
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Why It Matters</h3>
                <p className="text-primary-100 mb-6">
                  Studies show that 75% of CVs never reach human recruiters due to ATS filtering. 
                  Our AI ensures your CV not only passes these systems but also resonates with 
                  hiring managers.
                </p>
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="text-3xl font-bold mb-2">75%</div>
                  <div className="text-sm text-primary-100">
                    of CVs are filtered out by ATS systems before reaching recruiters
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How We're Different
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines AI intelligence with recruitment expertise to deliver 
              results that traditional CV builders simply can't match.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl p-8 shadow-sm"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
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

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Professionals Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of professionals who've already boosted their careers
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600">
              Passionate professionals dedicated to your career success
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-8 text-center shadow-sm"
              >
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium mb-4">
                  {member.role}
                </p>
                <p className="text-gray-600">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Powered by Advanced AI
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Our platform leverages state-of-the-art natural language processing 
                and machine learning algorithms to understand job requirements and 
                optimize your CV content accordingly.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Brain className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Natural Language Processing</h4>
                    <p className="text-gray-600">Analyzes job descriptions to extract key requirements and skills</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Target className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Keyword Optimization</h4>
                    <p className="text-gray-600">Matches your experience with job-specific keywords and phrases</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Award className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">ATS Compatibility</h4>
                    <p className="text-gray-600">Ensures your CV passes through automated screening systems</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="font-mono text-sm space-y-2">
                <div className="text-green-400">{'// AI Analysis Process'}</div>
                <div className="text-blue-400">{'function analyzeJobDescription(jobText) {'}</div>
                <div className="ml-4 text-gray-300">{'const keywords = extractKeywords(jobText);'}</div>
                <div className="ml-4 text-gray-300">{'const requirements = parseRequirements(jobText);'}</div>
                <div className="ml-4 text-gray-300">{'return optimizeCV(userProfile, keywords);'}</div>
                <div className="text-blue-400">{'}'}</div>
                <div className="mt-4 text-yellow-400">{'// Result: 85% average match improvement'}</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Have questions or feedback? We'd love to hear from you.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <a
                href="mailto:hello@aicvbuilder.com"
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
              >
                <Mail className="w-5 h-5" />
                <span>hello@aicvbuilder.com</span>
              </a>
              <a
                href="https://github.com/aicvbuilder"
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Support Chat</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of professionals who've already boosted their careers with AI-powered CVs.
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
      </section>
    </div>
  )
}