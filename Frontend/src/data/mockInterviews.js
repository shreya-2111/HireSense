export const INITIAL_INTERVIEWS = [
  {
    id: "int-1",
    candidateId: "cand-1",
    candidateName: "Aarav Shah",
    candidateAvatar: "AS",
    position: "Frontend Developer",
    jobId: "job-1",
    date: "2025-02-26",
    time: "10:30 AM - 11:30 AM EST",
    type: "Technical Deep-Dive",
    interviewer: "David Larson (VP Eng)",
    interviewerRole: "VP of Engineering",
    status: "Scheduled", // Scheduled | Completed | Pending Feedback
    meetingLink: "https://meet.hiresense.internal/int-aarav-frontend",
    prepData: {
      summary: "Aarav has 4.5 years of solid React and TypeScript experience. Led component library modernization with impressive telemetry metrics. Highly recommended for technical verification.",
      strengths: [
        "Extensive experience with React 18 concurrent features, custom hooks, and Tailwind CSS",
        "Clear track record of web performance optimization (reduced page load by 38%)",
        "High match score (92%) across all core technical requirements"
      ],
      areasToExplore: [
        "Candidate lacks production experience with Next.js and Server Components",
        "Unit testing practices: Need to verify if candidate has used alternatives to Jest or Vitest",
        "Scale experience: Determine max concurrent user traffic handled in previous positions"
      ],
      suggestedQuestions: [
        "Walk us through how you would optimize a high-frequency table with 1,000+ rows in React.",
        "What is your philosophy on state management: when do you reach for Context API vs external state libraries?",
        "Since our roadmap relies on Next.js 14 App Router, what is your understanding of Server vs Client components?"
      ]
    },
    notes: "Candidate was very articulate during initial recruiter screen. Highlighted strong interest in our design system."
  },
  {
    id: "int-2",
    candidateId: "cand-2",
    candidateName: "Elena Rostova",
    candidateAvatar: "ER",
    position: "Backend Developer",
    jobId: "job-2",
    date: "2025-02-26",
    time: "2:00 PM - 3:00 PM EST",
    type: "System Architecture",
    interviewer: "Rachel Torres (Lead Architect)",
    interviewerRole: "Lead Architect",
    status: "Scheduled",
    meetingLink: "https://meet.hiresense.internal/int-elena-backend",
    prepData: {
      summary: "Elena is a 95% match with 6 years experience in high-throughput Python and FastAPI. Extremely strong distributed systems foundation.",
      strengths: [
        "Proven latency reduction (P99 down from 450ms to 48ms using FastAPI & Redis)",
        "Deep PostgreSQL indexing and partitioning knowledge",
        "Docker & AWS cloud architecture hands-on deployment"
      ],
      areasToExplore: [
        "Candidate primarily used Redis Streams; assess adaptability to Apache Kafka",
        "Team leadership: Candidate was lead engineer, verify collaborative decision making style"
      ],
      suggestedQuestions: [
        "How do you approach database schema migrations on tables with 100M+ rows with zero downtime?",
        "Describe how you design idempotent API endpoints when handling third-party webhooks."
      ]
    },
    notes: "Hiring manager requested deep dive into database concurrency and transaction isolation levels."
  },
  {
    id: "int-3",
    candidateId: "cand-4",
    candidateName: "Priya Sharma",
    candidateAvatar: "PS",
    position: "UI/UX Designer",
    jobId: "job-3",
    date: "2025-02-27",
    time: "11:00 AM - 12:00 PM EST",
    type: "Portfolio Presentation",
    interviewer: "Siddharth Rao (Head of Design)",
    interviewerRole: "Head of Design",
    status: "Scheduled",
    meetingLink: "https://meet.hiresense.internal/int-priya-design",
    prepData: {
      summary: "Priya holds 4 years in B2B SaaS product design and design system governance in Figma. Strong communication and data-driven approach.",
      strengths: [
        "Created 150+ component tokenized design system in Figma",
        "Demonstrated 17% onboarding conversion increase through empirical user research",
        "Fluent in HTML/CSS constraints, making developer handoffs seamless"
      ],
      areasToExplore: [
        "Experience collaborating with distributed/remote engineering teams",
        "Familiarity with rapid prototyping validation tools (Maze, UserTesting)"
      ],
      suggestedQuestions: [
        "Walk through your favorite case study where qualitative user feedback reshaped your product hypothesis.",
        "How do you resolve design token discrepancies between Figma and production Tailwind configs?"
      ]
    },
    notes: "Review portfolio deck sent via email prior to call."
  },
  {
    id: "int-4",
    candidateId: "cand-5",
    candidateName: "David Kim",
    candidateAvatar: "DK",
    position: "Python / Data Engineer",
    jobId: "job-4",
    date: "2025-02-28",
    time: "3:30 PM - 4:30 PM EST",
    type: "Coding & ETL Pipeline",
    interviewer: "Dr. Elena Zhao (Director Data)",
    interviewerRole: "Director of Data Science",
    status: "Scheduled",
    meetingLink: "https://meet.hiresense.internal/int-david-data",
    prepData: {
      summary: "David has 5.2 years building data pipelines with Airflow, Python, and PostgreSQL. Strong focus on data quality frameworks.",
      strengths: [
        "Managed 60+ daily production Airflow DAGs with great reliability",
        "Tangible infrastructure cost savings through SQL optimization ($4,200/mo)",
        "Proactive automated schema monitoring"
      ],
      areasToExplore: [
        "Vector database exposure (Qdrant/Pinecone/pgvector)",
        "Real-time streaming vs batch processing trade-offs"
      ],
      suggestedQuestions: [
        "How do you handle backfills for dependent DAGs when upstream tables change?",
        "What metrics do you rely on to alert on data pipeline latency and silent corruptions?"
      ]
    },
    notes: "Pair coding session on SQL window functions and pandas aggregation."
  },
  {
    id: "int-5",
    candidateId: "cand-7",
    candidateName: "Jordan Vance",
    candidateAvatar: "JV",
    position: "DevOps & Cloud Engineer",
    jobId: "job-5",
    date: "2025-02-24",
    time: "1:00 PM - 2:00 PM EST",
    type: "Screening Call",
    interviewer: "Sarah Lin (Lead Recruiter)",
    interviewerRole: "Lead Technical Recruiter",
    status: "Completed",
    meetingLink: "https://meet.hiresense.internal/int-jordan-recruiter",
    prepData: {
      summary: "Jordan is an AWS Certified Solutions Architect with 7 years of Kubernetes and Terraform experience.",
      strengths: [
        "Exemplary DevOps tenure and cloud automation certifications",
        "Direct experience with GitOps and ArgoCD"
      ],
      areasToExplore: [
        "Compensation expectations alignment",
        "Availability and start timeline"
      ],
      suggestedQuestions: [
        "What motivated you to consider new opportunities at this stage?",
        "What does your ideal team culture look like?"
      ]
    },
    notes: "Super positive conversation. Candidate is enthusiastic about our cloud roadmap. Recommended moving immediately to technical stage."
  },
  {
    id: "int-6",
    candidateId: "cand-3",
    candidateName: "Marcus Chen",
    candidateAvatar: "MC",
    position: "Frontend Developer",
    jobId: "job-1",
    date: "2025-02-25",
    time: "4:00 PM - 4:45 PM EST",
    type: "Recruiter Screen",
    interviewer: "Sarah Lin (Lead Recruiter)",
    interviewerRole: "Lead Technical Recruiter",
    status: "Pending Feedback",
    meetingLink: "https://meet.hiresense.internal/int-marcus-screen",
    prepData: {
      summary: "Marcus is a solid 78% match with good accessibility knowledge. Needs verification on TypeScript level.",
      strengths: ["Strong empathy for accessibility (WCAG AA)", "Clean design execution"],
      areasToExplore: ["TypeScript fluency", "Testing confidence"],
      suggestedQuestions: ["How do you transition from pure JavaScript to strict TypeScript?"]
    },
    notes: "Call completed. Awaiting notes writeup from hiring manager."
  }
];
