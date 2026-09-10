export const MOCK_RESUME_SAMPLES = [
  {
    id: "sample-1",
    title: "Aarav Shah — Senior React Specialist",
    fileName: "Aarav_Shah_Senior_Frontend_CV.pdf",
    fileSize: "142 KB",
    suggestedJobId: "job-1",
    rawText: `AARAV SHAH
Senior Frontend Engineer | Seattle, WA | aarav.shah@example.com | github.com/aaravshah

SUMMARY
Frontend Engineer with 4.5+ years of production experience crafting enterprise SaaS user interfaces. Expert in React 18, TypeScript, Tailwind CSS, and Web Performance Optimization.

PROFESSIONAL EXPERIENCE
Senior Frontend Engineer | Veloce Cloud Technologies (2022 - Present)
- Architected enterprise multi-tenant dashboard in React 18 and TypeScript.
- Implemented virtualization for large tabular datasets (10k+ rows) decreasing rendering lag by 65%.
- Maintained core Tailwind CSS design system components across 3 product verticals.

Frontend Developer | Apex Digital Solutions (2020 - 2022)
- Built interactive customer billing portals using React and Redux.
- Collaborated in Figma to implement pixel-perfect, accessible UI components (WCAG 2.1).

SKILLS
Core: React, JavaScript (ES6+), TypeScript, HTML5, CSS3, Tailwind CSS, Redux Toolkit, RESTful APIs, Git, Webpack, Vite.

EDUCATION
B.S. in Computer Science — University of Washington (2020), GPA: 3.8/4.0`,
    matchResult: {
      matchScore: 92,
      tier: "Strong Match",
      matchedSkills: ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind CSS"],
      missingSkills: ["Next.js", "Jest"],
      summary: "High-caliber frontend specialist with deep mastery in React, TypeScript, and modern styling. Exceptional performance tuning track record. Has minor gaps in Next.js SSR and Jest automated testing suites, but easily bridgeable given strong foundational JS.",
      experienceYears: 4.5,
      education: "B.S. in Computer Science (University of Washington)",
      interviewQuestions: [
        "How do you profile and eliminate unnecessary re-renders in deep React component trees?",
        "What strategies do you use to manage optimistic updates and error rollbacks in RESTful applications?",
        "How would you approach introducing Next.js App Router into an existing single-page React app?"
      ]
    }
  },
  {
    id: "sample-2",
    title: "Sarah Jenkins — Full Stack Python & React",
    fileName: "Sarah_Jenkins_FullStack_Resume.docx",
    fileSize: "188 KB",
    suggestedJobId: "job-2",
    rawText: `SARAH JENKINS
Full Stack / Backend Engineer | Denver, CO | sarah.jenkins@example.com

SUMMARY
Versatile Software Engineer with 5 years building resilient microservices in Python, FastAPI, and PostgreSQL, paired with React frontend dashboards.

PROFESSIONAL EXPERIENCE
Senior Backend Engineer | CloudScale Networks (2021 - Present)
- Designed and maintained FastAPI backend handling 20M daily API calls.
- Configured PostgreSQL replicas and tuned connection pooling for low-latency queries.
- Deployed microservices on AWS with Docker and Kubernetes.

Software Engineer | BitStream Software (2019 - 2021)
- Developed REST APIs in Python and Flask.
- Integrated payment gateways (Stripe) and background queue workers with Redis.

SKILLS
Languages & Frameworks: Python, FastAPI, Flask, SQL, PostgreSQL, Docker, Redis, AWS, Git, REST APIs.

EDUCATION
B.S. in Software Engineering — Colorado State University (2019)`,
    matchResult: {
      matchScore: 94,
      tier: "Strong Match",
      matchedSkills: ["Python", "FastAPI", "PostgreSQL", "Docker", "REST APIs", "Redis"],
      missingSkills: ["Kafka"],
      summary: "Impressive backend developer matching 94% of criteria. Strong production background with FastAPI, async workers, and PostgreSQL optimization. Ready for immediate technical screening.",
      experienceYears: 5.0,
      education: "B.S. in Software Engineering (Colorado State University)",
      interviewQuestions: [
        "Explain how you structure asynchronous background tasks in FastAPI using Redis vs Celery.",
        "How do you design database transactions to prevent race conditions during high-volume balance transfers?",
        "What are the operational challenges you encountered when managing Docker containers in Kubernetes?"
      ]
    }
  },
  {
    id: "sample-3",
    title: "Devon Vance — Junior Web Developer",
    fileName: "Devon_Vance_Resume.pdf",
    fileSize: "98 KB",
    suggestedJobId: "job-1",
    rawText: `DEVON VANCE
Junior Frontend Developer | Austin, TX | devon.vance@example.com

SUMMARY
Energetic junior web developer with 1.5 years experience in HTML5, CSS3, vanilla JavaScript, and basic React components.

EXPERIENCE
Junior Web Developer | LoneStar Web Studio (2023 - Present)
- Coded responsive landing pages for local business clients.
- Integrated CSS animations and styled forms.
- Assisted with bug fixes on client React websites.

SKILLS
HTML, CSS, JavaScript, Basic React, Git, Responsive Web Design.

EDUCATION
Certificate in Web Development — Austin Coding Academy (2023)`,
    matchResult: {
      matchScore: 58,
      tier: "Potential Match",
      matchedSkills: ["HTML", "CSS", "JavaScript", "React"],
      missingSkills: ["TypeScript", "Tailwind CSS", "Next.js", "Jest"],
      summary: "Shows enthusiasm and foundational web design capability, but significantly lacks required TypeScript depth, enterprise component architecture, and automated testing experience for a mid-senior role.",
      experienceYears: 1.5,
      education: "Certificate in Web Development (Austin Coding Academy)",
      interviewQuestions: [
        "What is the difference between let, const, and var scope in JavaScript?",
        "Can you describe how CSS specificity works and how you avoid style collisions?",
        "What resources do you use to accelerate your TypeScript and React learning?"
      ]
    }
  }
];
