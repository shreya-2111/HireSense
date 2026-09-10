export const INITIAL_CANDIDATES = [
  {
    id: "cand-1",
    name: "Aarav Shah",
    email: "aarav.shah@example.com",
    phone: "+1 (555) 234-8901",
    location: "Seattle, WA (Open to Remote)",
    appliedJobId: "job-1",
    appliedRole: "Frontend Developer",
    experienceYears: 4.5,
    matchScore: 92,
    matchTier: "Strong Match",
    status: "Shortlisted", // Shortlisted | Maybe | Rejected | Under Review | Interview Scheduled
    appliedDate: "2025-02-18",
    avatar: "AS",
    summary: "Proven Frontend Engineer with 4+ years specializing in modern React, TypeScript, and high-performance user interfaces. Built modular component libraries serving 300k+ active SaaS users and reduced page load times by 38% through optimized virtualized lists and code splitting.",
    fitBreakdown: {
      skillScore: 94,
      experienceScore: 90,
      educationScore: 92,
    },
    matchedSkills: ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind CSS"],
    missingSkills: ["Next.js", "Jest"],
    experienceTimeline: [
      {
        role: "Senior Frontend Engineer",
        company: "Veloce Cloud Technologies",
        period: "2022 - Present (2.5 yrs)",
        location: "Seattle, WA",
        achievements: [
          "Architected core dashboard UI using React 18, TypeScript, and Tailwind CSS, increasing interaction speed by 42%.",
          "Mentored 4 junior frontend developers and established engineering guidelines for reusable accessible components.",
          "Implemented comprehensive end-to-end telemetry and client-side caching strategies."
        ]
      },
      {
        role: "Frontend Developer",
        company: "Apex Digital Solutions",
        period: "2020 - 2022 (2 yrs)",
        location: "San Jose, CA",
        achievements: [
          "Built responsive client portals and billing dashboards using React, Redux, and modern CSS flex/grid layouts.",
          "Collaborated directly with UX designers in Figma to translate wireframes into pixel-perfect components.",
          "Refactored legacy vanilla JavaScript widgets into clean modular React components."
        ]
      }
    ],
    education: {
      degree: "B.S. in Computer Science",
      institution: "University of Washington",
      year: "2020",
      gpa: "3.8 / 4.0",
      details: "Honors in Human-Computer Interaction and Software Engineering"
    },
    interviewQuestions: [
      {
        id: "q1",
        question: "Explain how you would optimize a React application that experiences performance bottlenecks during high-frequency table updates.",
        rationale: "Targeting candidate's stated expertise in React performance tuning and virtualized layouts."
      },
      {
        id: "q2",
        question: "What is the practical difference between useMemo and useCallback, and in what situations can overuse actually hurt application performance?",
        rationale: "Testing fundamental React hook memory mechanics and profiling knowledge."
      },
      {
        id: "q3",
        question: "How would you structure a large-scale frontend application to cleanly separate UI components from business logic and state management?",
        rationale: "Evaluating architectural maturity and clean code practices."
      },
      {
        id: "q4",
        question: "Since our stack leverages Next.js for server components and you have primarily built SPAs, how do you approach learning and transitioning to SSR/RSC paradigms?",
        rationale: "Directly probing the identified missing skill (Next.js)."
      },
      {
        id: "q5",
        question: "You mentioned lacking production experience with Jest. How do you approach automated frontend testing (unit, integration, or visual regression)?",
        rationale: "Assessing testing mindset to bridge the testing gap."
      }
    ]
  },
  {
    id: "cand-2",
    name: "Elena Rostova",
    email: "elena.rostova@example.com",
    phone: "+1 (555) 782-4419",
    location: "Austin, TX (Hybrid)",
    appliedJobId: "job-2",
    appliedRole: "Backend Developer",
    experienceYears: 6.0,
    matchScore: 95,
    matchTier: "Strong Match",
    status: "Interview Scheduled",
    appliedDate: "2025-02-15",
    avatar: "ER",
    summary: "Staff Backend Engineer with deep mastery in Python, FastAPI, distributed event queues, and PostgreSQL query tuning. Scaled payment ingestion microservices processing over 12,000 transactions per minute with 99.99% uptime.",
    fitBreakdown: {
      skillScore: 98,
      experienceScore: 94,
      educationScore: 92,
    },
    matchedSkills: ["Python", "FastAPI", "PostgreSQL", "Docker", "REST APIs", "Redis", "AWS"],
    missingSkills: ["Kafka"],
    experienceTimeline: [
      {
        role: "Lead Backend Engineer",
        company: "PayPulse Global",
        period: "2021 - Present (3.5 yrs)",
        location: "Austin, TX",
        achievements: [
          "Engineered asynchronous processing engine with FastAPI and Redis Streams, reducing P99 latency from 450ms to 48ms.",
          "Designed database schema partitions and optimized indexing on a 5TB PostgreSQL cluster.",
          "Authored Dockerized CI/CD deployment pipelines on AWS ECS."
        ]
      },
      {
        role: "Software Engineer",
        company: "QuantData Labs",
        period: "2018 - 2021 (3 yrs)",
        location: "Denver, CO",
        achievements: [
          "Developed high-throughput REST APIs using Python and Flask.",
          "Wrote automated unit and load test suites using PyTest and Locust."
        ]
      }
    ],
    education: {
      degree: "M.S. in Computer Engineering",
      institution: "UT Austin",
      year: "2018",
      gpa: "3.9 / 4.0",
      details: "Specialization in Distributed Systems and Cloud Computing"
    },
    interviewQuestions: [
      {
        id: "q1",
        question: "How do you diagnose and resolve PostgreSQL connection pool exhaustion under sudden traffic spikes?",
        rationale: "Validates real-world database resilience under high load."
      },
      {
        id: "q2",
        question: "Can you walk through your approach to implementing distributed idempotency across asynchronous microservices?",
        rationale: "Tests financial/transactional architecture integrity."
      },
      {
        id: "q3",
        question: "While you're highly proficient with Redis Streams, we use Apache Kafka for enterprise replay. How do consumer group semantics compare?",
        rationale: "Addresses identified missing skill (Kafka)."
      }
    ]
  },
  {
    id: "cand-3",
    name: "Marcus Chen",
    email: "marcus.chen@example.com",
    phone: "+1 (555) 438-1290",
    location: "San Francisco, CA",
    appliedJobId: "job-1",
    appliedRole: "Frontend Developer",
    experienceYears: 3.0,
    matchScore: 78,
    matchTier: "Good Match",
    status: "Under Review",
    appliedDate: "2025-02-19",
    avatar: "MC",
    summary: "Product-minded Frontend Engineer with strong JavaScript and React foundations. Led accessibility compliance overhaul (WCAG 2.1 AA) across customer dashboard and built data visualization widgets using D3 and Chart.js.",
    fitBreakdown: {
      skillScore: 76,
      experienceScore: 80,
      educationScore: 82,
    },
    matchedSkills: ["React", "JavaScript", "HTML", "CSS", "Tailwind CSS"],
    missingSkills: ["TypeScript", "Next.js", "Jest"],
    experienceTimeline: [
      {
        role: "Frontend Developer",
        company: "SentryFlow Analytics",
        period: "2022 - Present (2.5 yrs)",
        location: "San Francisco, CA",
        achievements: [
          "Spearheaded redesign of real-time monitoring charts and notification modals using React.",
          "Audited and remediated 80+ accessibility issues to achieve WCAG AA compliance.",
          "Partnered with product team on A/B tests that boosted user conversion by 19%."
        ]
      }
    ],
    education: {
      degree: "B.S. in Information Systems",
      institution: "UC Berkeley",
      year: "2021",
      gpa: "3.7 / 4.0",
      details: "Focus on Web Technologies and UX Engineering"
    },
    interviewQuestions: [
      {
        id: "q1",
        question: "How do you manage complex asynchronous data fetching and cache invalidation without causing layout jitter?",
        rationale: "Explores core state management and network lifecycle."
      },
      {
        id: "q2",
        question: "Our codebase is 100% strict TypeScript. How comfortable are you writing complex generics, utility types, and discriminated unions?",
        rationale: "Targets key missing requirement (TypeScript)."
      },
      {
        id: "q3",
        question: "Describe your workflow for testing edge cases in accessible keyboard navigation and screen reader announcements.",
        rationale: "Dives into candidate's noted strength in accessibility."
      }
    ]
  },
  {
    id: "cand-4",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "+1 (555) 902-3341",
    location: "New York, NY",
    appliedJobId: "job-3",
    appliedRole: "UI/UX Designer",
    experienceYears: 4.0,
    matchScore: 91,
    matchTier: "Strong Match",
    status: "Shortlisted",
    appliedDate: "2025-02-14",
    avatar: "PS",
    summary: "Senior Product Designer with 4 years designing B2B workflow platforms and comprehensive design systems in Figma. Known for tight collaboration with engineering teams and data-informed user research.",
    fitBreakdown: {
      skillScore: 95,
      experienceScore: 90,
      educationScore: 88,
    },
    matchedSkills: ["Figma", "Design Systems", "User Research", "Wireframing", "Prototyping", "HTML/CSS"],
    missingSkills: ["Usability Testing Tools"],
    experienceTimeline: [
      {
        role: "Product Designer",
        company: "Kite FinTech",
        period: "2021 - Present (3 yrs)",
        location: "New York, NY",
        achievements: [
          "Built multi-brand design system in Figma with 150+ components, cutting developer handoff time by 50%.",
          "Conducted 40+ user interviews to redesign onboarding flow, lowering bounce rate from 31% to 14%.",
          "Designed responsive web and tablet layouts for enterprise traders."
        ]
      }
    ],
    education: {
      degree: "B.Des in Interaction Design",
      institution: "Carnegie Mellon University",
      year: "2020",
      gpa: "3.85 / 4.0",
      details: "Dean's List, Human Computer Interaction Institute"
    },
    interviewQuestions: [
      {
        id: "q1",
        question: "Can you walk us through how you manage component tokens and variable hierarchies across light and dark themes in Figma?",
        rationale: "Validates technical mastery of modern Figma token systems."
      },
      {
        id: "q2",
        question: "Describe a situation where user research contradicted an executive's preferred direction. How did you advocate for the user while aligning business goals?",
        rationale: "Assesses cross-functional diplomacy and data presentation skills."
      }
    ]
  },
  {
    id: "cand-5",
    name: "David Kim",
    email: "david.kim@example.com",
    phone: "+1 (555) 314-5582",
    location: "Chicago, IL (Remote)",
    appliedJobId: "job-4",
    appliedRole: "Python / Data Engineer",
    experienceYears: 5.2,
    matchScore: 88,
    matchTier: "Strong Match",
    status: "Interview Scheduled",
    appliedDate: "2025-02-16",
    avatar: "DK",
    summary: "Data Engineer with extensive track record building ETL pipelines, optimizing SQL queries on multi-terabyte warehouses, and integrating automated data quality checks.",
    fitBreakdown: {
      skillScore: 90,
      experienceScore: 88,
      educationScore: 85,
    },
    matchedSkills: ["Python", "SQL", "Pandas", "ETL Pipelines", "PostgreSQL", "Airflow"],
    missingSkills: ["Vector Databases"],
    experienceTimeline: [
      {
        role: "Senior Data Engineer",
        company: "Apex Analytics Corp",
        period: "2021 - Present (3.5 yrs)",
        location: "Chicago, IL",
        achievements: [
          "Orchestrated 60+ daily Airflow DAGs aggregating telemetry data from 40k edge nodes.",
          "Optimized slow SQL queries and materialized views, cutting warehouse costs by $4,200/mo.",
          "Built automated schema drift detectors using Great Expectations."
        ]
      }
    ],
    education: {
      degree: "B.S. in Statistics and Computer Science",
      institution: "University of Illinois Urbana-Champaign",
      year: "2019",
      gpa: "3.75 / 4.0",
      details: "Undergraduate research in predictive modeling"
    },
    interviewQuestions: [
      {
        id: "q1",
        question: "How do you handle backfilling historical data without locking active tables or causing cascading DAG failures?",
        rationale: "Evaluates pipeline reliability and maintenance expertise."
      },
      {
        id: "q2",
        question: "We are experimenting with Vector Databases (such as pgvector and Qdrant) for document retrieval. What are your initial thoughts on indexing strategies for high-dimensional embeddings?",
        rationale: "Probes candidate's adaptability to our AI/vector search roadmap."
      }
    ]
  },
  {
    id: "cand-6",
    name: "Sophia Taylor",
    email: "sophia.taylor@example.com",
    phone: "+1 (555) 671-9823",
    location: "Boston, MA (Remote)",
    appliedJobId: "job-1",
    appliedRole: "Frontend Developer",
    experienceYears: 2.0,
    matchScore: 61,
    matchTier: "Potential Match",
    status: "Maybe",
    appliedDate: "2025-02-17",
    avatar: "ST",
    summary: "Junior frontend developer with 2 years of experience building responsive landing pages, marketing sites, and basic React components. Eager learner with clean design sensibilities.",
    fitBreakdown: {
      skillScore: 60,
      experienceScore: 58,
      educationScore: 75,
    },
    matchedSkills: ["HTML", "CSS", "JavaScript", "React"],
    missingSkills: ["TypeScript", "Tailwind CSS", "Next.js", "Jest"],
    experienceTimeline: [
      {
        role: "Junior Web Developer",
        company: "Beacon Digital Agency",
        period: "2023 - Present (1.5 yrs)",
        location: "Boston, MA",
        achievements: [
          "Built responsive client websites using HTML5, SCSS, and React.",
          "Implemented contact forms with client-side regex validations.",
          "Assisted senior developers with responsive QA across mobile browsers."
        ]
      }
    ],
    education: {
      degree: "B.A. in Digital Media Arts",
      institution: "Northeastern University",
      year: "2023",
      gpa: "3.6 / 4.0",
      details: "Minor in Computer Science"
    },
    interviewQuestions: [
      {
        id: "q1",
        question: "Can you explain how the JavaScript event loop works, specifically microtasks vs macrotasks?",
        rationale: "Assesses core JS fundamentals for a junior candidate."
      },
      {
        id: "q2",
        question: "Our team uses TypeScript extensively. What steps have you taken so far to learn TypeScript and type definitions?",
        rationale: "Explores learning trajectory and willingness to bridge skill gap."
      }
    ]
  },
  {
    id: "cand-7",
    name: "Jordan Vance",
    email: "jordan.vance@example.com",
    phone: "+1 (555) 839-4411",
    location: "Atlanta, GA (Hybrid)",
    appliedJobId: "job-5",
    appliedRole: "DevOps & Cloud Engineer",
    experienceYears: 7.0,
    matchScore: 94,
    matchTier: "Strong Match",
    status: "Shortlisted",
    appliedDate: "2025-02-12",
    avatar: "JV",
    summary: "Senior Infrastructure Engineer specializing in Kubernetes, Terraform, and multi-region AWS resilience. Champion of automated security scanning and GitOps deployment workflows.",
    fitBreakdown: {
      skillScore: 96,
      experienceScore: 95,
      educationScore: 88,
    },
    matchedSkills: ["AWS", "Terraform", "Kubernetes", "Docker", "Linux", "CI/CD", "Prometheus"],
    missingSkills: ["Ansible"],
    experienceTimeline: [
      {
        role: "Lead DevOps Engineer",
        company: "Stratos Cloud Systems",
        period: "2020 - Present (4.5 yrs)",
        location: "Atlanta, GA",
        achievements: [
          "Migrated 45 microservices to AWS EKS using Terraform and ArgoCD with zero downtime.",
          "Decreased mean time to recovery (MTTR) by 65% through Prometheus and Grafana alerting.",
          "Automated SOC2 compliance scanning in GitHub Actions."
        ]
      }
    ],
    education: {
      degree: "B.S. in Computer Networks and Cybersecurity",
      institution: "Georgia Tech",
      year: "2017",
      gpa: "3.8 / 4.0",
      details: "AWS Certified Solutions Architect — Professional"
    },
    interviewQuestions: [
      {
        id: "q1",
        question: "How do you structure Terraform modules to avoid state drift across multiple environments (Dev, Staging, Prod)?",
        rationale: "Evaluates IaC maturity and enterprise scalability."
      },
      {
        id: "q2",
        question: "Describe your experience rolling out zero-downtime blue/green or canary deployments with Kubernetes ingress controllers.",
        rationale: "Tests practical release engineering chops."
      }
    ]
  },
  {
    id: "cand-8",
    name: "Liam O'Connor",
    email: "liam.oconnor@example.com",
    phone: "+1 (555) 293-1102",
    location: "Portland, OR (Remote)",
    appliedJobId: "job-2",
    appliedRole: "Backend Developer",
    experienceYears: 4.0,
    matchScore: 74,
    matchTier: "Good Match",
    status: "Under Review",
    appliedDate: "2025-02-19",
    avatar: "LO",
    summary: "Full stack/backend engineer with experience in Python, Flask, and SQLite/PostgreSQL. Good understanding of API authentication (OAuth2/JWT) and background workers.",
    fitBreakdown: {
      skillScore: 72,
      experienceScore: 75,
      educationScore: 80,
    },
    matchedSkills: ["Python", "PostgreSQL", "Docker", "REST APIs"],
    missingSkills: ["FastAPI", "Redis", "Kafka"],
    experienceTimeline: [
      {
        role: "Backend Engineer",
        company: "Cascade Commerce",
        period: "2022 - Present (2.5 yrs)",
        location: "Portland, OR",
        achievements: [
          "Built inventory tracking endpoints with Flask and SQLAlchemy.",
          "Integrated Stripe webhook listeners with idempotent event logging.",
          "Containerized dev environments using Docker Compose."
        ]
      }
    ],
    education: {
      degree: "B.S. in Software Development",
      institution: "Oregon State University",
      year: "2021",
      gpa: "3.5 / 4.0",
      details: "Senior project on Microservice Auth Systems"
    },
    interviewQuestions: [
      {
        id: "q1",
        question: "You have built APIs with Flask; our backend uses FastAPI with async/await. How familiar are you with asynchronous coroutines in Python?",
        rationale: "Assesses transition readiness to FastAPI async runtime."
      },
      {
        id: "q2",
        question: "How would you handle caching frequently requested catalog endpoints that update once per hour?",
        rationale: "Tests caching concepts given missing Redis experience."
      }
    ]
  },
  {
    id: "cand-9",
    name: "Mei-Ling Zhou",
    email: "meiling.zhou@example.com",
    phone: "+1 (555) 604-9821",
    location: "Toronto, ON (Remote)",
    appliedJobId: "job-3",
    appliedRole: "UI/UX Designer",
    experienceYears: 5.5,
    matchScore: 93,
    matchTier: "Strong Match",
    status: "Shortlisted",
    appliedDate: "2025-02-11",
    avatar: "MZ",
    summary: "Principal Product Designer with extensive SaaS background. Skilled in user journeys, complex data tables, information architecture, and user testing.",
    fitBreakdown: {
      skillScore: 96,
      experienceScore: 92,
      educationScore: 90,
    },
    matchedSkills: ["Figma", "Design Systems", "User Research", "Wireframing", "Prototyping", "Usability Testing"],
    missingSkills: ["HTML/CSS"],
    experienceTimeline: [
      {
        role: "Lead UX Designer",
        company: "OmniFlow HR",
        period: "2020 - Present (4.5 yrs)",
        location: "Toronto, ON",
        achievements: [
          "Redesigned the core candidate evaluation workflow, reducing time-to-hire by 22%.",
          "Maintained enterprise design token system across web and mobile surfaces.",
          "Conducted usability lab testing with 60+ enterprise recruiters."
        ]
      }
    ],
    education: {
      degree: "B.A. in Cognitive Science & Human Interaction",
      institution: "University of Toronto",
      year: "2019",
      gpa: "3.9 / 4.0",
      details: "Research focus on perceptual ergonomics in software"
    },
    interviewQuestions: [
      {
        id: "q1",
        question: "How do you balance high-density information architecture (like data tables and metrics) with clean visual hierarchy?",
        rationale: "Directly relates to our core recruiter table and dashboard design."
      }
    ]
  },
  {
    id: "cand-10",
    name: "Tyler Jenkins",
    email: "tyler.jenkins@example.com",
    phone: "+1 (555) 712-4091",
    location: "Dallas, TX",
    appliedJobId: "job-1",
    appliedRole: "Frontend Developer",
    experienceYears: 1.5,
    matchScore: 54,
    matchTier: "Low Match",
    status: "Rejected",
    appliedDate: "2025-02-09",
    avatar: "TJ",
    summary: "Junior developer with basic HTML/CSS knowledge and entry-level JavaScript. Has not worked with modern component frameworks or state management libraries.",
    fitBreakdown: {
      skillScore: 48,
      experienceScore: 52,
      educationScore: 68,
    },
    matchedSkills: ["HTML", "CSS"],
    missingSkills: ["React", "JavaScript", "TypeScript", "Tailwind CSS", "Next.js", "Jest"],
    experienceTimeline: [
      {
        role: "Web Content Specialist",
        company: "Lone Star Media",
        period: "2023 - 2024 (1.5 yrs)",
        location: "Dallas, TX",
        achievements: [
          "Maintained WordPress blog layouts and adjusted CSS styles.",
          "Created landing pages using drag-and-drop page builders."
        ]
      }
    ],
    education: {
      degree: "Associate Degree in Web Development",
      institution: "Dallas College",
      year: "2023",
      gpa: "3.4 / 4.0",
      details: "Coursework in HTML, CSS, and introductory script authoring"
    },
    interviewQuestions: [
      {
        id: "q1",
        question: "Can you walk through what component state means in React and how it differs from HTML DOM variables?",
        rationale: "Foundational screen question."
      }
    ]
  }
];
