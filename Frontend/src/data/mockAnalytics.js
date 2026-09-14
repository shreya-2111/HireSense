export const MOCK_ANALYTICS = {
  metrics: {
    totalCandidates: 0,
    totalCandidatesChange: "0% from last month",
    avgMatchScore: 0,
    avgMatchScoreChange: "No candidates yet",
    shortlistedCount: 0,
    shortlistedRate: "0% conversion",
    interviewsScheduled: 0,
    interviewsScheduledDetail: "0 upcoming sessions",
    activeJobsCount: 0,
    reviewedCount: 0,
    reviewRate: "0% completion"
  },

  // Chart 1: Candidates by Job
  candidatesByJob: [],

  // Chart 2: Match Score Distribution
  scoreDistribution: [
    { range: "90 - 100%", count: 0, label: "Strong Match", fill: "#10b981" },
    { range: "80 - 89%", count: 0, label: "Good Match", fill: "#3b82f6" },
    { range: "70 - 79%", count: 0, label: "Acceptable", fill: "#60a5fa" },
    { range: "60 - 69%", count: 0, label: "Potential", fill: "#f59e0b" },
    { range: "< 60%", count: 0, label: "Low Fit", fill: "#94a3b8" }
  ],

  // Chart 3: Candidate Pipeline Funnel
  pipelineFunnel: [
    { stage: "Applied", candidates: 0, percentage: 0, fill: "#2563eb" },
    { stage: "AI Screened", candidates: 0, percentage: 0, fill: "#3b82f6" },
    { stage: "Shortlisted", candidates: 0, percentage: 0, fill: "#60a5fa" },
    { stage: "Interview", candidates: 0, percentage: 0, fill: "#10b981" },
    { stage: "Offer Extended", candidates: 0, percentage: 0, fill: "#059669" },
    { stage: "Hired", candidates: 0, percentage: 0, fill: "#047857" }
  ],

  // Chart 4: Monthly Recruitment Overview
  monthlyTrend: [
    { month: "Apr", applications: 0, reviewed: 0 },
    { month: "May", applications: 0, reviewed: 0 },
    { month: "Jun", applications: 0, reviewed: 0 },
    { month: "Jul", applications: 0, reviewed: 0 },
    { month: "Aug", applications: 0, reviewed: 0 },
    { month: "Sep", applications: 0, reviewed: 0 },
  ],

  // Department Breakdown
  departmentBreakdown: []
};
