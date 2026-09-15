# HireSense — Dynamic Universal AI Skill Intelligence & Recruitment Platform

HireSense is an enterprise-grade, AI-powered talent acquisition and candidate screening platform designed to streamline resume evaluation, job management, candidate tracking, and interview preparation through **Dynamic Universal AI Skill Intelligence & Semantic Skill Matching**.

---

## 📌 Project Summary

HireSense modernizes and automates the end-to-end recruitment lifecycle:
- **Universal Multi-Layer Skill Intelligence**: Solves rigid keyword matching by understanding canonical aliases, framework hierarchies (`Next.js` $\rightarrow$ `React.js`, `Django` $\rightarrow$ `Python`, `Amazon EKS` $\rightarrow$ `Kubernetes`), technology implementations (`PostgreSQL` $\rightarrow$ `SQL`), and dynamic AI relationship discovery.
- **Explainable 4-Tier Skill Classification**: Classifies every job requirement into **Direct**, **Inferred**, **Related / Partial**, or **Missing** with confidence scores and recruiter *"Why?"* reasoning drawers.
- **Hybrid Resume Parsing & OCR Fallback**: Ingests and parses digital PDFs, DOCX, and scanned image resumes via `pdfplumber`, `PyPDF2`, `python-docx`, and 300 DPI `Tesseract OCR`.
- **Deterministic Multi-Factor Scoring**: Transparently weights Skills (50%), Experience (25%), Education (15%), and Domain Relevance (10%) without black-box bias.
- **Personalized AI Interview Question Studio**: Generates score-aware, skill-gap-focused technical and behavioral interview questions using Google Gemini AI with automatic heuristic fallback.
- **Recruiter Command Center**: Centralized pipeline tracking, interview scheduling, interactive analytics visualizations, and CSV talent exports.

---

## 🧠 Dynamic Universal AI Skill Intelligence Architecture

The matching engine uses a multi-layered hybrid intelligence model that replaces naive string matching with deep semantic and ontological reasoning:

```
                     CANDIDATE RESUME / JOB DESCRIPTION
                                     │
                                     ▼
                        Technology Normalization Layer
             (C, C++, C#, .NET, Go, Java, TypeScript safely preserved)
                                     │
                                     ▼
                         Canonical Alias Detection
                       (e.g., ReactJS, react.js -> react.js)
                                     │
                                     ▼
         ┌────────────────────────────────────────────────────────┐
         │         UNIVERSAL SKILL INTELLIGENCE ENGINE            │
         │                                                        │
         │  Layer 1: Exact String Matching                        │
         │  Layer 2: Case & Punctuation Invariance                │
         │  Layer 3: Canonical Alias Resolution                   │
         │  Layer 4: Multi-Category Skill Ontology Graph          │
         │  Layer 5: Dynamic AI Relationship Discovery (Gemini)   │
         │  Layer 6: Context-Aware Resume Signal Weighting        │
         └───────────────────────────┬────────────────────────────┘
                                     │
                                     ▼
                4-Tier Skill Classification & Scoring
          ┌─────────────────┬─────────────────┬─────────────────┐
          ▼                 ▼                 ▼                 ▼
   🟢 DIRECT          🔵 INFERRED        🟡 RELATED         🔴 MISSING
  (100% Weight)       (90% Weight)       (40% Weight)       (0% Weight)
  Exact Mention     BUILT_ON / FRAMEWORK  Ecosystem/Adjacent  No Evidence
          │                 │                 │                 │
          └─────────────────┴────────┬────────┴─────────────────┘
                                     │
                                     ▼
                        Deterministic Job-Fit Score
                       (Skills + Experience + Edu + Rel)
                                     │
                                     ▼
                  Recruiter Transparency & "Why?" UI
```

### 1. The 6 Intelligence Layers
1. **Layer 1 — Exact String Matching**: Detects explicit skill mentions across candidate profile and resume text.
2. **Layer 2 — Technology-Safe Normalization**: Case-insensitive and punctuation-aware normalization that strictly preserves distinct languages (e.g., `C`, `C++`, `C#`, `.NET`, `Go`, `Java`, `TypeScript`).
3. **Layer 3 — Canonical Alias Detection**: Maps tech variations and version suffixes (e.g., `React 18` / `ReactJS` $\rightarrow$ `react.js`, `Python 3` $\rightarrow$ `python`, `Postgres DB` $\rightarrow$ `postgresql`, `K8s` $\rightarrow$ `kubernetes`) to standard canonical entities.
4. **Layer 4 — Skill Ontology Graph**: Multi-category relationship graph covering programming languages, frontend/backend frameworks, databases, cloud, DevOps, mobile, testing, and AI:
   - `Next.js` $\xrightarrow{\text{BUILT\_ON}}$ `React.js`
   - `Django` / `FastAPI` / `Flask` $\xrightarrow{\text{FRAMEWORK\_OF}}$ `Python`
   - `Spring Boot` $\xrightarrow{\text{FRAMEWORK\_OF}}$ `Java`
   - `Amazon EKS` / `Google GKE` / `Azure AKS` $\xrightarrow{\text{MANAGED\_SERVICE\_FOR}}$ `Kubernetes`
   - `PostgreSQL` / `MySQL` / `SQLite` $\xrightarrow{\text{IMPLEMENTS}}$ `SQL`
   - `TypeScript` $\xrightarrow{\text{SUPERSET\_OF}}$ `JavaScript`
   - `Selenium` / `Cypress` / `Playwright` $\xrightarrow{\text{TOOL\_FOR}}$ `Testing`
5. **Layer 5 — Dynamic AI Relationship Discovery (Google Gemini)**:
   - Evaluates unknown technologies in real time when not found in the static ontology.
   - Structured JSON validation with confidence thresholds ($\ge 0.80$ for Inferred, $\ge 0.60$ for Related).
   - High-confidence discoveries are staged in the database as candidates for admin review before permanent promotion, preventing hallucination contamination.
6. **Layer 6 — Context-Aware Resume Signal Weighting**:
   - Differentiates active production engineering (`"Architected and deployed microservices in Next.js"`) from weak learning mentions (`"Currently learning Next.js fundamentals"`), modulating confidence scores accordingly.

### 2. Four Match Classifications
| Classification | Description | Example | Credit |
|---|---|---|---|
| 🟢 **DIRECT MATCH** | Candidate explicitly mentions the required skill. | JD: `React.js`<br>Resume: `React.js` | 100% |
| 🔵 **INFERRED MATCH** | Strong evidence provided through a parent/child framework or service. | JD: `React.js`<br>Resume: `Next.js` (`BUILT_ON`) | 90% $\times$ Confidence |
| 🟡 **RELATED / PARTIAL** | Adjacent ecosystem knowledge without direct equivalence. | JD: `React.js`<br>Resume: `React Native` (`ECOSYSTEM_OF`) | 40% $\times$ Confidence |
| 🔴 **MISSING** | No sufficient explicit, inferred, or related evidence found. | JD: `Python`<br>Resume: `Java` | 0% |

> **Anti-Hallucination Guardrail**: Domain co-occurrence is strictly rejected (e.g., `HTML` does *not* infer `React.js`; `Java` does *not* infer `Python`).

---

## 📊 Deterministic Job-Fit Scoring Engine

Match scores are calculated transparently using NumPy vector operations:

$$\text{Total Match Score} = (S \times 0.50) + (E \times 0.25) + (B \times 0.15) + (R \times 0.10)$$

- **$S$ — Skill Score (50%)**: Weighted score across all job requirements based on Direct (100%), Inferred (90%), Related (40%), and Missing (0%) matches.
- **$E$ — Experience Fit (25%)**: Linear and non-linear tenure evaluation against required minimum and maximum experience ranges.
- **$B$ — Education & Background (15%)**: Degree hierarchy recognition (Ph.D., Master's, Bachelor's, Certifications).
- **$R$ — Domain Relevance (10%)**: Natural language keyword overlap between candidate achievements and job description.

---

## 🛠️ Technology Stack

| Domain | Technology / Library | Purpose |
|---|---|---|
| **Backend Framework** | **FastAPI (Python 3.11+)** | Asynchronous REST API with Pydantic v2 data validation and auto OpenAPI documentation |
| **ASGI Web Server** | **Uvicorn** | High-throughput asynchronous HTTP application server |
| **Database & ORM** | **SQLAlchemy 2.0 + SQLite / MySQL** | Relational data persistence with automatic schema provisioning and relationship mappings |
| **Authentication** | **JWT (python-jose) + Bcrypt (passlib)** | Cryptographic 12-round password hashing and stateless Bearer token authorization |
| **Document Parsing** | **pdfplumber + PyPDF2 + python-docx** | Layout-aware digital resume text extraction |
| **OCR Fallback** | **pytesseract + pdf2image + Pillow** | 300 DPI image rasterization and OCR fallback for scanned and photo resumes |
| **Generative AI** | **Google Gemini API** | AI-driven dynamic relationship discovery and role-specific interview question generation |
| **Data Analytics** | **NumPy + Pandas** | Fast vector dot-product scoring calculations and pipeline CSV streaming |
| **Frontend Framework** | **React 18 + Vite** | Component-driven single page application with instant Hot Module Replacement (HMR) |
| **Styling & UI** | **Tailwind CSS + Lucide React** | Modern design system, accessible components, and consistent vector iconography |
| **Visualizations** | **Recharts** | Interactive SVG charts for match distributions, pipeline stages, and department breakdowns |

---

## 📁 Project Structure

```
HireSense/
├── backend/
│   ├── app/
│   │   ├── core/               # Database engine, security, JWT, and config
│   │   ├── models/             # SQLAlchemy models (User, Job, Candidate, Skill, SkillOntology, Resume, Interview)
│   │   ├── routers/            # REST API route controllers (auth, jobs, candidates, resumes, ai, analytics)
│   │   ├── schemas/            # Pydantic validation schemas
│   │   ├── services/
│   │   │   ├── skill_intelligence.py  # 6-Layer Universal Skill Intelligence & Ontology Engine
│   │   │   ├── matching_service.py    # Multi-factor candidate-job matching service
│   │   │   ├── gemini_service.py      # Google Gemini AI client with fallback
│   │   │   ├── resume_service.py      # Resume parsing, validation, and storage
│   │   │   ├── candidate_service.py   # Candidate pool and application management
│   │   │   ├── job_service.py         # Job creation and requisition management
│   │   │   └── analytics_service.py   # Recruitment metrics aggregation
│   │   ├── utils/
│   │   │   ├── scoring.py             # Deterministic weighted scoring algorithm
│   │   │   └── file_parser.py         # Text & OCR extraction pipeline
│   │   └── main.py             # FastAPI application entrypoint
│   ├── tests/                  # Pytest test suite (100% passing)
│   ├── requirements.txt        # Python package dependencies
│   └── uploads/                # Resume document storage
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── candidates/     # CandidateTable, SkillBadge, JobRequirementComparison, QuestionStudioModal
│   │   │   ├── resumeAnalysis/ # ResumeUploader, AnalysisResults with "Why?" drawers
│   │   │   ├── jobs/           # JobCard, JobFilters, JobModal
│   │   │   ├── interviews/     # ScheduleModal, InterviewTimeline
│   │   │   ├── analytics/      # MetricCards, FunnelChart, ScoreDistribution
│   │   │   └── ui/             # Card, Button, Badge, Modal, Progress, Toast
│   │   ├── context/            # RecruitmentContext (central state & API sync)
│   │   ├── pages/              # Dashboard, Jobs, Candidates, ResumeAnalyzer, Interviews, Analytics
│   │   ├── services/           # Axios API services
│   │   └── App.jsx             # Top-level routing & layout shell
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & **npm**
- **Tesseract-OCR** *(Optional, for scanned resume OCR support)*

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Copy .env.example to .env and configure your GEMINI_API_KEY (optional)
cp .env.example .env

# Start FastAPI development server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend API will be live at `http://127.0.0.1:8000`  
Interactive Swagger API documentation: `http://127.0.0.1:8000/docs`

---

### 2. Frontend Setup

```bash
# Navigate to Frontend directory (in a new terminal)
cd Frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```

Frontend application will be accessible at `http://localhost:5173`

---

### 3. Running Backend Tests

```bash
# In backend/ directory:
python -m pytest
```

All 27 test suites validate normalization, skill inference, anti-hallucination guardrails, OCR parsing, and end-to-end API workflows.

---

## 🛡️ Security & Privacy
- **Untrusted Input Sanitation**: Resumes and JD texts are treated as untrusted data with strict anti-prompt injection parsing.
- **Bcrypt Password Hashing**: Recruiter passwords hashed with 12 cryptographic salt rounds.
- **Stateless Bearer JWT**: Protected endpoints verify token signature, expiration, and user context.
- **Data Integrity**: Inferred skills never alter original candidate text; original evidence is permanently preserved for recruiter verification.
