export const MOCK_ANALYTICS = {
  metrics: {
    totalCandidates: 248,
    totalCandidatesChange: "+18% vs last month",
    avgMatchScore: 76.4,
    avgMatchScoreChange: "+3.2% vs last month",
    shortlistedCount: 42,
    shortlistedRate: "16.9% conversion",
    interviewsScheduled: 16,
    interviewsScheduledDetail: "6 upcoming this week",
    activeJobsCount: 8,
    reviewedCount: 184,
    reviewRate: "74.2% completion"
  },

  // Chart 1: Candidates by Job (Horizontal / Vertical Bar Chart)
  candidatesByJob: [
    { name: "Frontend Dev", applicants: 42, shortlisted: 6, interviews: 4 },
    { name: "Backend Dev", applicants: 38, shortlisted: 5, interviews: 3 },
    { name: "UI/UX Designer", applicants: 54, shortlisted: 8, interviews: 5 },
    { name: "Python / Data", applicants: 29, shortlisted: 4, interviews: 2 },
    { name: "DevOps Engineer", applicants: 21, shortlisted: 3, interviews: 2 },
    { name: "Mobile (React N)", applicants: 64, shortlisted: 12, interviews: 0 },
  ],

  // Chart 2: Match Score Distribution (Histogram)
  scoreDistribution: [
    { range: "90 - 100%", count: 32, label: "Strong Match", fill: "#10b981" },
    { range: "80 - 89%", count: 68, label: "Good Match", fill: "#3b82f6" },
    { range: "70 - 79%", count: 84, label: "Acceptable", fill: "#60a5fa" },
    { range: "60 - 69%", count: 44, label: "Potential", fill: "#f59e0b" },
    { range: "< 60%", count: 20, label: "Low Fit", fill: "#94a3b8" }
  ],

  // Chart 3: Candidate Pipeline Funnel
  pipelineFunnel: [
    { stage: "Applied", candidates: 248, percentage: 100, fill: "#2563eb" },
    { stage: "AI Screened", candidates: 184, percentage: 74, fill: "#3b82f6" },
    { stage: "Shortlisted", candidates: 42, percentage: 17, fill: "#60a5fa" },
    { stage: "Interview", candidates: 16, percentage: 6.5, fill: "#10b981" },
    { stage: "Offer Extended", candidates: 6, percentage: 2.4, fill: "#059669" },
    { stage: "Hired", candidates: 4, percentage: 1.6, fill: "#047857" }
  ],

  // Chart 4: Monthly Recruitment Overview (Dashboard)
  monthlyTrend: [
    { month: "Sep", applications: 120, reviewed: 95 },
    { month: "Oct", applications: 145, reviewed: 115 },
    { month: "Nov", applications: 180, reviewed: 140 },
    { month: "Dec", applications: 160, reviewed: 130 },
    { month: "Jan", applications: 210, reviewed: 165 },
    { month: "Feb", applications: 248, reviewed: 184 },
  ],

  // Department Breakdown
  departmentBreakdown: [
    { department: "Engineering", activeJobs: 3, candidates: 101, avgScore: 78.5, timeToScreen: "1.4 days" },
    { department: "Product Design", activeJobs: 1, candidates: 54, avgScore: 79.2, timeToScreen: "1.8 days" },
    { department: "Data & AI", activeJobs: 1, candidates: 29, avgScore: 75.1, timeToScreen: "2.1 days" },
    { department: "Infrastructure", activeJobs: 1, candidates: 21, avgScore: 81.3, timeToScreen: "1.2 days" },
    { department: "Product Management", activeJobs: 1, candidates: 43, avgScore: 72.0, timeToScreen: "2.5 days" }
  ]
};
