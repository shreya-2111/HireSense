# HireSense — Intelligent Recruitment & Candidate Screening Platform

HireSense is an AI-powered talent acquisition and candidate screening platform designed to streamline resume evaluation, job management, candidate tracking, and interview preparation.

---

## 📌 Project Summary

HireSense automates the end-to-end recruiter workflow:
- Ingests and parses resumes across digital and scanned PDF formats via a hybrid text extraction and OCR engine.
- Calculates deterministic, multi-factor compatibility Match Scores between candidate profiles and job requirements.
- Generates role-tailored technical and behavioral interview questions using Google Gemini AI with an internal zero-downtime heuristic fallback.
- Provides a centralized recruiter workspace for pipeline stage tracking, interview scheduling, and recruitment analytics.

---

## 🛠️ Technology Stack

| Domain | Technology / Library | Purpose |
|---|---|---|
| **Backend Framework** | **FastAPI (Python 3.11+)** | High-performance asynchronous REST API with native Pydantic data validation and auto OpenAPI documentation |
| **ASGI Web Server** | **Uvicorn** | High-throughput asynchronous HTTP application server |
| **Database & ORM** | **SQLAlchemy 2.0 + MySQL / SQLite** | Relational data persistence with automatic table provisioning and connection pooling |
| **Authentication** | **JWT (python-jose) + Bcrypt (passlib)** | Cryptographic 12-round password hashing and stateless Bearer token authorization |
| **Document Parsing** | **pdfplumber + PyPDF2 + python-docx** | Layout-aware digital resume text extraction |
| **Optical Character Recognition** | **pytesseract + pdf2image + Pillow** | 300 DPI image rasterization and OCR fallback for scanned and photo resumes |
| **Generative AI** | **Google Gemini API** | AI-driven candidate evaluation, skill gap identification, and role-specific interview question generation |
| **Data Analytics** | **Pandas** | Metric aggregation and dynamic candidate pipeline CSV streaming |
| **Frontend Framework** | **React 18 + Vite** | High-performance component-driven single page application with fast Virtual DOM rendering |
| **Styling & Design System** | **Tailwind CSS** | Custom responsive UI tokens, modern color palette, and sleek interface components |
| **Icons & Visuals** | **Lucide React** | Consistent vector iconography across navigation, actions, and data cards |
| **Data Visualizations** | **Recharts** | Interactive SVG charts for match score distributions, hiring funnels, and department breakdowns |

---

## 📁 Project Structure & File Purpose

### Backend (`backend/`)
| File / Directory | What it is used for |
|---|---|
| `app/main.py` | FastAPI application entrypoint, CORS configuration, static upload mounting, and router registration. |
| `app/core/config.py` | Environment variable management and centralized application settings via Pydantic. |
| `app/core/database.py` | SQLAlchemy database engine initialization, connection pooling, and session dependency (`get_db`). |
| `app/core/security.py` | Bcrypt password hashing, JWT token creation, cryptographic verification, and auth route guards. |
| `app/models/` | SQLAlchemy ORM entity definitions for `User`, `Job`, `Candidate`, `Skill`, `Resume`, `Application`, and `Interview`. |
| `app/schemas/` | Pydantic validation models defining strict request payloads and serialized JSON responses. |
| `app/routers/` | REST controllers managing routes for auth, jobs, candidates, resume analysis, interviews, analytics, and AI. |
| `app/services/file_parser.py` | Multi-format resume text extraction supporting digital PDFs, DOCX, text files, and Tesseract OCR for scanned documents. |
| `app/services/scoring.py` | Mathematical matching engine computing composite candidate scores from skills (70%), experience (20%), and context (10%). |
| `app/services/gemini_service.py` | Google Gemini LLM client for candidate evaluations with automated rule-based question fallback. |
| `app/services/*_service.py` | Business logic service layer for authentication, jobs, candidates, interviews, and recruitment analytics. |
| `app/reset_db.py` | Production database utility for purging dummy recruitment data while preserving recruiter user accounts. |
| `uploads/` | Dedicated filesystem storage directory for candidate resume uploads. |
| `requirements.txt` | Python package dependency specifications. |

### Frontend (`Frontend/`)
| File / Directory | What it is used for |
|---|---|
| `src/main.jsx` | React root mounting point rendering the application into the DOM tree with global styling. |
| `src/App.jsx` | Top-level routing layout managing public auth routes and authenticated shell navigation. |
| `src/context/RecruitmentContext.jsx` | Central state management managing recruiter auth, jobs, candidates, interviews, toasts, and live API sync. |
| `src/services/apiClient.js` | Axios HTTP client configured with base URL, error interceptors, and automatic Bearer token injection. |
| `src/services/*Service.js` | Modular API services for jobs, candidates, interviews, resume analysis, auth, and analytics. |
| `src/pages/DashboardPage.jsx` | Executive recruiter overview with KPI cards, recruitment volume charts, and upcoming interview countdowns. |
| `src/pages/JobsPage.jsx` | Job opening repository with multi-status tabs, search filtering, and table/card view modes. |
| `src/pages/CreateJobPage.jsx` | Interactive job posting form with dynamic skill tagging, experience ranges, and compensation details. |
| `src/pages/JobDetailsPage.jsx` | Job overview screen displaying position requirements and ranked candidate applicants. |
| `src/pages/CandidatesPage.jsx` | Global talent pool table supporting multi-criteria filtering by job, match tier, experience, and status. |
| `src/pages/CandidateDetailsPage.jsx` | Deep candidate profile view with verified skills, score breakdowns, and AI-generated interview questions. |
| `src/pages/ResumeAnalyzerPage.jsx` | Drag-and-drop resume screening tool with live match scoring and skill gap comparison against open jobs. |
| `src/pages/InterviewsPage.jsx` | Interview scheduling portal with slot management, meeting links, and candidate preparation drawers. |
| `src/pages/AnalyticsPage.jsx` | Visual recruitment intelligence charts covering match distributions, pipeline stages, and CSV data export. |
| `src/pages/SettingsPage.jsx` | Recruiter profile preferences, company branding settings, and notification sensitivity thresholds. |
| `src/pages/LoginPage.jsx` & `RegisterPage.jsx` | Authentication portals with recruiter account registration and login. |
| `src/components/ui/HireSenseLogo.jsx` | Reusable official brand logo component supporting full horizontal and compact icon mark variants. |
| `src/components/` | Reusable UI component modules for candidate tables, modals, badges, inputs, layout headers, and charts. |
| `public/` | Public asset repository hosting multi-resolution brand favicons, app icons, and web manifest assets. |

---

## ⚡ Important Information & System Highlights

### 1. Hybrid Resume Parsing & OCR Fallback
The resume parsing pipeline inspects uploaded documents using native digital extractors (`pdfplumber`, `python-docx`). If character density indicates an image or scanned paper document, the pipeline automatically rasterizes pages to high-resolution bitmaps and applies **Tesseract Optical Character Recognition (OCR)**, ensuring zero extraction failures.

### 2. Multi-Factor Deterministic Match Scoring
Match scores are computed deterministically without black-box bias:
$$\text{Match Score} = (\text{Skill Match} \times 0.70) + (\text{Experience Fit} \times 0.20) + (\text{Context \& Education} \times 0.10)$$
- **Skill Match (70%)**: Normalized exact and synonym matching between extracted skills and required/bonus job requirements.
- **Experience Fit (20%)**: Non-linear comparison of candidate years against requisition requirements.
- **Context & Education (10%)**: Verification of domain terminology and degree alignment.

### 3. Google Gemini AI & Resilient Heuristic Fallback
Candidate strength/gap analysis and interview question generation utilize the **Google Gemini API**. If the external AI service reaches rate limits (HTTP 429) or is offline, HireSense seamlessly switches to an internal heuristic rule-based question generator mapped directly to candidate skill gaps, guaranteeing uninterrupted availability.

### 4. Stateless Security & Role-Based Access
Passwords are protected with 12-round **Bcrypt** cryptographic hashing. Authenticated sessions rely on signed **JSON Web Tokens (JWT)** passed via HTTP `Authorization: Bearer <token>` headers and validated on every protected API endpoint.

### 5. Relational Data Model
The database architecture decouples candidates from job requisitions through a many-to-many `applications` relational structure, allowing a single candidate profile to apply for multiple roles while tracking distinct stage statuses and match scores independently.
