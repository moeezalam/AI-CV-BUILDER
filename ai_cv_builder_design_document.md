**Overview**

This document defines the architecture and implementation plan for a web‑hosted AI CV Builder that ingests a job description (JD) and a user’s profile data, tailors CV content to maximize ATS (Applicant Tracking System) scores, and outputs a formatted LaTeX (PDF) CV. The solution uses the Claude API for natural‑language processing, modular pipelines for keyword extraction and content generation, and a LaTeX templating engine.

---

**1. System Architecture**

- **Frontend (Web UI)**

  - Single‑Page Application (e.g., React + Tailwind)
  - Input forms:
    - User profile upload (JSON/YAML or PDF → parsed to JSON)
    - Job description text/paste
  - Preview pane (renders intermediate JSON and final PDF preview via embedded PDF.js)
  - Controls: Generate CV, Download PDF

- **Backend (API Server)**

  - RESTful endpoints (Node.js/Express or Python/Flask/FastAPI)
  - Endpoints:
    - POST `/api/extract-keywords` → returns JD keywords & weights
    - POST `/api/tailor-content` → returns tailored sections
    - POST `/api/render-cv` → returns compiled PDF

- **AI Pipeline**

  1. **Keyword Extraction**
     - Call Claude API with JD, prompt: "Extract and rank top skills, technologies, keywords (nouns, noun phrases) relevant to this job description with weights."
     - Output: `[ { "keyword": "Kotlin", "weight": 0.9 }, … ]`
  2. **Section Selection**
     - Filter user's experiences & projects: match against JD keywords.
     - Algorithm: compute overlap score per experience bullet point; keep top‑N per category.
  3. **Bullet‑Point Rewriting**
     - For each selected bullet, call Claude API with prompt: "Rewrite this bullet to emphasize [list of JD keywords], using active voice, include metrics if available."
  4. **Summary & Skills Generation**
     - Prompt: "Generate a 3‑line professional summary emphasizing strengths for this JD."
     - Prompt: "List skills section sorted by relevance weights."

- **Template & Rendering**

  - Use a LaTeX template with placeholders for:
    - Header (name, contact)
    - Summary
    - Skills
    - Work Experience
    - Projects/Education
  - Populate placeholders with JSON from AI pipeline.
  - Invoke `pdflatex` (or `latexmk`) via child process; capture PDF output.

---

**2. Data Model**

```json
UserProfile {
  personal: { name, email, phone, linkedIn, location }
  summary: text
  work_experience: [ {
    company, role, start_date, end_date, bullets:[{ text, metrics? }]
  } ]
  projects: [ { name, description, technologies } ]
  education: [ { degree, institution, dates } ]
}
JDAnalysis {
  keywords: [ { keyword, weight } ]
  summary_recommendation: text
}
TailoredCV {
  summary, skills:[string], experience:[ { company, role, dates, bullets:[string] } ], projects, education
}
```

---

**3. Detailed Workflow**

1. **User submits** profile JSON + JD text.
2. **Backend** /api/extract-keywords:
   - Input: JD text
   - Action: POST to Claude API v\*/extract
   - Prompt: *see Prompt Library* → returns `JDAnalysis.keywords`
3. **Section Scoring**:
   - For each `UserProfile.work_experience.bullet`: compute score = sum(weights of overlapping keywords).
   - Select top 2 roles & top 3 bullets per role.
4. **Rewrite Bullets**:
   - For each selected bullet: POST to Claude with prompt template:
     > "Rewrite: `{bullet}` Emphasize: `{top 5 JD keywords}` Use active voice, begin with strong verb, include metrics."
   - Collect rewritten bullets.
5. **Generate Summary & Skills**:
   - Summary: call Claude with:
     > "Generate a 3‑line summary for a candidate matching this JD: `{JD}` using these keywords: `{keywords}`."
   - Skills:
     > "List skills and technologies from `{keywords}`, sorted by relevance."
6. **Assemble **``** JSON**.
7. **Render LaTeX** via `/api/render-cv`:
   - Load `template.tex`
   - Replace placeholders (e.g., `<<SUMMARY>>`) with generated content.
   - Run `pdflatex`; return PDF.

---

**4. Prompt Library**

1. **Extract Keywords**

```
""
Given the following job description, extract the top 15 keywords (skills, technologies, action nouns) and assign each a relevance weight between 0 and 1. Respond in JSON array format.
Job Description:
"{JD_TEXT}"
"""
```

2. **Rewrite Bullet**

```
""
Rewrite the following resume bullet to align with this job’s requirements. Emphasize these keywords: {KEYWORDS}. Use active voice, start with a strong verb, and include any available metrics. Output a single bullet.
Original:
"{BULLET_TEXT}"
"""
```

3. **Generate Summary**

```
""
Generate a 3‑line professional summary tailored to this job description. Use the following keywords: {KEYWORDS}. Maximum 50 words.
Job Description:
"{JD_TEXT}"
"""
```

4. **List Skills**

```
""
From the extracted keywords list, output a Markdown bullet list of skills sorted by weight descending.
Keywords:
{KEYWORD_ARRAY}
"""
```

---

**5. Technology Stack**

- **Frontend**: React, Tailwind CSS, PDF.js
- **Backend**: Node.js + Express OR Python + FastAPI
- **AI**: Claude API (via HTTP)
- **Templating**: Jinja2 (Python) or Handlebars (Node) to inject JSON into LaTeX source
- **LaTeX Engine**: TeX Live, `pdflatex`, Docker container for reproducibility
- **Data Store**: Optional Redis or Postgres for caching recent JD analyses

---

**6. Deployment & Scalability**

- Containerize backend + LaTeX toolchain (Docker)
- Use serverless functions (e.g., AWS Lambda) for short‐lived API calls to Claude
- CDN for frontend, SSL
- CI/CD pipeline: GitHub Actions to build Docker image, run tests, deploy to Kubernetes or AWS Fargate

---

**7. ATS Considerations**

- Mirror section headers exactly: `Work Experience`, `Education`, `Skills`.
- Include exact JD keywords at least once.
- Ensure PDF text is selectable (no raster images).
- Output in reverse‑chronological order.

---

**8. Error Handling & Logging**

- Validate inputs (profile JSON schema, JD length).
- Retry Claude API on 429/5xx with exponential backoff.
- Log requests, responses (sanitize PII), latencies.

---

**9. Testing & QA**

- Unit tests for keyword scoring logic.
- Integration tests mocking Claude API (stub responses).
- End‑to‑end tests: sample profile + JD → PDF with expected sections.

---

**10. Next Steps**

1. Prototype backend keyword extraction & LaTeX rendering.
2. Build minimal frontend form & test round trip.
3. Integrate bullet rewriting flows.
4. User acceptance testing with real JDs.
5. Optimize API usage (batch calls).

