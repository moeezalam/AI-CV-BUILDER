// Simple test script to verify the server starts correctly
const app = require('./src/app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3001;

// Test data
const testUserProfile = {
  personal: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1-555-0123",
    location: "New York, NY"
  },
  summary: "Experienced software developer with 5+ years in web development",
  work_experience: [
    {
      company: "Tech Corp",
      role: "Senior Developer",
      start_date: "2020-01",
      end_date: "Present",
      bullets: [
        { text: "Developed React applications serving 10k+ users" },
        { text: "Led team of 3 developers on major projects" }
      ]
    }
  ],
  skills: [
    { name: "JavaScript", category: "technical" },
    { name: "React", category: "technical" },
    { name: "Node.js", category: "technical" }
  ],
  education: [
    {
      degree: "Bachelor of Computer Science",
      institution: "University of Technology",
      start_date: "2015",
      end_date: "2019"
    }
  ]
};

const testJobDescription = {
  title: "Full Stack Developer",
  company: "Startup Inc",
  description: "We are looking for a full stack developer with experience in JavaScript, React, Node.js, and modern web technologies. The ideal candidate should have strong problem-solving skills and experience with agile development."
};

async function testEndpoints() {
  const server = app.listen(PORT, () => {
    logger.info(`Test server running on port ${PORT}`);
  });

  // Wait a moment for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // Test health endpoint
    const response = await fetch(`http://localhost:${PORT}/health`);
    const healthData = await response.json();
    console.log('✅ Health check:', healthData);

    // Test keyword extraction (would need Claude API key)
    console.log('📝 Test data prepared:');
    console.log('- User Profile:', testUserProfile.personal.name);
    console.log('- Job Description:', testJobDescription.title);
    
    console.log('\n🚀 Server is ready for testing!');
    console.log(`Visit http://localhost:${PORT}/health for health check`);
    console.log(`API endpoints available at http://localhost:${PORT}/api/`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  // Keep server running
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down test server...');
    server.close(() => {
      process.exit(0);
    });
  });
}

// Run tests
testEndpoints().catch(console.error);