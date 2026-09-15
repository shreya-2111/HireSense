# HireSense — Frontend Application

Modern, accessible single-page web application built with **React 18**, **Vite**, and **Tailwind CSS** for the HireSense AI Recruitment & Candidate Screening Platform.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The app runs at `http://localhost:5173` with instant Hot Module Replacement (HMR).

### 3. Production Build
```bash
npm run build
```
Creates an optimized production bundle in the `dist/` directory.

---

## 🛠️ Key UI Features

- **Resume Analyzer**: Real-time resume upload, parsing, and multi-layer skill matching with expandable *"Why?"* reasoning drawers.
- **Dynamic Skill Matrix**: Displays Direct (🟢), Inferred (🔵 with evidence & confidence), Related (🟡), and Missing (🔴) skills.
- **Candidate Pool**: Multi-filter candidate table with match score badges, role search, and stage progress.
- **Candidate Details**: Transparent Job Requirement Comparison table, experience timeline, and AI Interview Question Studio.
- **Recruiter Analytics**: Interactive Recharts visualizations covering match distributions, hiring funnels, and CSV data exports.
- **Job Requisition Management**: Dynamic job posting wizard with skill tagging and candidate applicant rankings.
