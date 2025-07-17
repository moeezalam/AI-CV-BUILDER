# AI CV Builder - Complete Project Structure

## Project Organization

```
ai-cv-builder/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── keywordController.js
│   │   │   ├── contentController.js
│   │   │   └── pdfController.js
│   │   ├── services/
│   │   │   ├── claudeService.js
│   │   │   ├── keywordService.js
│   │   │   ├── contentService.js
│   │   │   └── latexService.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── UserProfile.js
│   │   │   ├── JobDescription.js
│   │   │   └── TailoredCV.js
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── routes/
│   │   │   ├── api.js
│   │   │   └── health.js
│   │   ├── templates/
│   │   │   ├── modern-cv.tex
│   │   │   ├── classic-cv.tex
│   │   │   └── template-config.json
│   │   └── app.js
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   └── Dockerfile
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Loading.jsx
│   │   │   │   └── ErrorBoundary.jsx
│   │   │   ├── forms/
│   │   │   │   ├── ProfileForm.jsx
│   │   │   │   ├── JobDescriptionForm.jsx
│   │   │   │   └── CVPreview.jsx
│   │   │   ├── upload/
│   │   │   │   ├── FileUpload.jsx
│   │   │   │   └── DragDrop.jsx
│   │   │   └── pdf/
│   │   │       ├── PDFViewer.jsx
│   │   │       └── PDFDownload.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── CVBuilder.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── fileService.js
│   │   ├── hooks/
│   │   │   ├── useAPI.js
│   │   │   ├── useFileUpload.js
│   │   │   └── usePDFGeneration.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   └── validation.js
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   └── components.css
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── docker-compose.yml
├── README.md
└── .gitignore
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+ with Express.js
- **AI Integration**: Claude API via Anthropic SDK
- **PDF Generation**: LaTeX with pdflatex
- **Validation**: Joi for input validation
- **Testing**: Jest with Supertest
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **PDF Viewing**: react-pdf + PDF.js
- **State Management**: React Context + useReducer
- **Form Handling**: React Hook Form
- **HTTP Client**: Axios

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Environment**: Multiple .env files for different stages
- **Monitoring**: Winston logging + health checks

## Key Features

1. **Modular Architecture**: Each component has a single responsibility
2. **Error Handling**: Comprehensive error handling at all levels
3. **Testing**: Unit, integration, and e2e tests
4. **Security**: Input validation, rate limiting, CORS
5. **Performance**: Caching, lazy loading, optimized builds
6. **Monitoring**: Logging, health checks, metrics
7. **Documentation**: README files, API docs, code comments

## Next Steps

1. Set up the backend server and API endpoints
2. Create the frontend React application
3. Implement Claude AI integration
4. Set up LaTeX PDF generation
5. Add comprehensive testing
6. Configure deployment pipeline