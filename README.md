# AI CV Builder

An intelligent CV builder that uses Claude AI to tailor resumes for specific job descriptions, optimizing for ATS (Applicant Tracking System) compatibility and keyword matching.

## Features

- **AI-Powered Content Generation**: Uses Claude API to generate tailored CV content
- **Keyword Extraction & Analysis**: Automatically extracts relevant keywords from job descriptions
- **ATS Optimization**: Ensures CVs are optimized for Applicant Tracking Systems
- **Multiple Templates**: Modern and classic LaTeX templates for professional PDFs
- **Content Enhancement**: Rewrites bullet points and summaries for better impact
- **Batch Processing**: Process multiple job descriptions simultaneously

## Architecture

### Backend (Node.js + Express)
- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic for AI integration, keyword analysis, and PDF generation
- **Models**: Data structures for UserProfile, JobDescription, and TailoredCV
- **Middleware**: Authentication, validation, and error handling
- **Templates**: LaTeX templates for PDF generation

### Key Components

1. **Keyword Service**: Extracts and analyzes keywords from job descriptions
2. **Content Service**: Generates tailored CV content using AI
3. **Claude Service**: Integrates with Anthropic's Claude API
4. **LaTeX Service**: Generates professional PDFs from CV data

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- Claude API key from Anthropic
- LaTeX distribution (TeX Live recommended)
- Optional: MongoDB for data persistence

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-cv-builder
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   PORT=3001
   NODE_ENV=development
   CLAUDE_API_KEY=your_claude_api_key_here
   ```

4. **Install LaTeX (for PDF generation)**
   
   **Windows:**
   ```bash
   # Install MiKTeX or TeX Live
   # Download from: https://miktex.org/ or https://www.tug.org/texlive/
   ```
   
   **macOS:**
   ```bash
   brew install --cask mactex
   ```
   
   **Linux:**
   ```bash
   sudo apt-get install texlive-full
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Test the setup**
   ```bash
   node test-server.js
   ```

## API Endpoints

### Health Check
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed system information

### Keyword Extraction
- `POST /api/extract-keywords` - Extract keywords from job description
- `POST /api/analyze-keywords` - Analyze CV against job keywords
- `GET /api/keyword-suggestions/:industry?` - Get keyword suggestions

### Content Generation
- `POST /api/tailor-content` - Generate tailored CV content
- `POST /api/generate-summary` - Generate professional summary
- `POST /api/enhance-experience` - Enhance work experience descriptions
- `POST /api/optimize-content` - Optimize existing content

### PDF Generation
- `POST /api/render-cv` - Generate PDF from CV data
- `POST /api/preview-cv` - Preview PDF without downloading
- `GET /api/templates` - Get available templates

## Usage Examples

### 1. Extract Keywords from Job Description

```javascript
const response = await fetch('/api/extract-keywords', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: "Full Stack Developer",
    company: "Tech Corp",
    description: "We are looking for a developer with React, Node.js, and AWS experience..."
  })
});

const { data } = await response.json();
console.log('Extracted keywords:', data.analysis.keywords);
```

### 2. Generate Tailored CV Content

```javascript
const response = await fetch('/api/tailor-content', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userProfile: {
      personal: { name: "John Doe", email: "john@example.com" },
      work_experience: [...],
      skills: [...]
    },
    jobDescription: {
      title: "Software Engineer",
      description: "Looking for React developer..."
    }
  })
});

const { data } = await response.json();
console.log('Tailored CV:', data.tailoredCV);
```

### 3. Generate PDF

```javascript
const response = await fetch('/api/render-cv', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cvData: {
      personal: { name: "John Doe", email: "john@example.com" },
      summary: "Experienced developer...",
      skills: ["JavaScript", "React", "Node.js"],
      experience: [...],
      education: [...]
    },
    template: "modern",
    options: {
      fontSize: "11pt",
      colorScheme: "blue"
    }
  })
});

const { data } = await response.json();
console.log('PDF generated:', data.downloadUrl);
```

## Data Models

### UserProfile
```javascript
{
  personal: { name, email, phone, linkedIn, location },
  summary: "Professional summary text",
  work_experience: [
    {
      company: "Company Name",
      role: "Job Title",
      start_date: "2020-01",
      end_date: "Present",
      bullets: [{ text: "Achievement description" }]
    }
  ],
  skills: [{ name: "JavaScript", category: "technical" }],
  projects: [{ name: "Project", description: "...", technologies: [...] }],
  education: [{ degree: "BS Computer Science", institution: "University" }]
}
```

### JobDescription
```javascript
{
  title: "Job Title",
  company: "Company Name",
  description: "Full job description text",
  keywords: [{ keyword: "React", weight: 0.9, category: "technical" }]
}
```

## Configuration

### Environment Variables

- `CLAUDE_API_KEY`: Your Anthropic Claude API key
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `LOG_LEVEL`: Logging level (info/debug/error)
- `LATEX_TIMEOUT`: LaTeX compilation timeout in ms

### Template Options

- **Templates**: `modern`, `classic`
- **Font Sizes**: `10pt`, `11pt`, `12pt`
- **Color Schemes**: `blue`, `green`, `red`, `black`
- **Margins**: `narrow`, `normal`, `wide`

## Development

### Project Structure
```
backend/
├── src/
│   ├── controllers/     # HTTP request handlers
│   ├── services/        # Business logic
│   ├── models/          # Data models
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── templates/       # LaTeX templates
│   └── utils/           # Utility functions
├── tests/               # Test files
└── package.json
```

### Adding New Features

1. **New API Endpoint**: Add route in `routes/api.js`
2. **Business Logic**: Implement in appropriate service
3. **Data Validation**: Add schema in `middleware/validation_middleware.js`
4. **Error Handling**: Use existing error classes in middleware

### Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "keyword"

# Run with coverage
npm run test:coverage
```

## Deployment

### Docker Deployment

```bash
# Build image
docker build -t ai-cv-builder .

# Run container
docker run -p 3001:3001 -e CLAUDE_API_KEY=your_key ai-cv-builder
```

### Production Considerations

1. **Environment Variables**: Set all required env vars
2. **LaTeX Installation**: Ensure LaTeX is available in production
3. **File Storage**: Configure persistent storage for generated PDFs
4. **Rate Limiting**: Configure appropriate rate limits for Claude API
5. **Monitoring**: Set up logging and monitoring
6. **Security**: Enable HTTPS and proper CORS settings

## Troubleshooting

### Common Issues

1. **LaTeX not found**: Install LaTeX distribution
2. **Claude API errors**: Check API key and rate limits
3. **PDF generation fails**: Verify LaTeX installation and templates
4. **Memory issues**: Increase Node.js memory limit for large documents

### Debug Mode

Set `NODE_ENV=development` and `LOG_LEVEL=debug` for detailed logging.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section
- Review the API documentation
- Open an issue on GitHub