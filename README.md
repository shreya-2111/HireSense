# HireSense — Intelligent Recruitment & Candidate Screening Platform

HireSense is a recruiter-focused candidate screening, resume matching, and interview intelligence suite.

## Project Structure

```text
HireSense/
├── .gitignore
├── README.md
└── Frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── analytics/
    │   │   ├── candidates/
    │   │   ├── dashboard/
    │   │   ├── interviews/
    │   │   ├── jobs/
    │   │   ├── layout/
    │   │   ├── resumeAnalysis/
    │   │   └── ui/
    │   ├── context/
    │   │   └── RecruitmentContext.jsx
    │   ├── data/
    │   │   ├── mockAnalytics.js
    │   │   ├── mockCandidates.js
    │   │   ├── mockInterviews.js
    │   │   ├── mockJobs.js
    │   │   └── mockResumeSamples.js
    │   ├── pages/
    │   │   ├── AnalyticsPage.jsx
    │   │   ├── CandidateDetailsPage.jsx
    │   │   ├── CandidatesPage.jsx
    │   │   ├── CreateJobPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── InterviewsPage.jsx
    │   │   ├── JobDetailsPage.jsx
    │   │   ├── JobsPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── ResumeAnalyzerPage.jsx
    │   │   └── SettingsPage.jsx
    │   ├── services/
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

## Core Workflows

1. **Recruiter Authentication**: Secure login and demo recruiter access.
2. **Requisition Management**: Create, publish, close, and manage active job openings with skill matrix criteria.
3. **Resume Analyzer**: Screen `.pdf`, `.docx`, or `.txt` resumes against open jobs to generate match scores, extracted skill tags, and gap summaries.
4. **Candidate Pipeline**: Filter, rank, and shortlist candidates across positions.
5. **Interview Question Studio**: Generate and customize role-tailored technical and situational interview questions.
6. **Interview Scheduling & Prep Dossier**: Coordinate sessions and log candidate evaluation notes.
7. **Recruitment Analytics**: Dynamic dashboard metrics and CSV report export.
