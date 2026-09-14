import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf(filename: str, title: str, subtitle: str, sections: list):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    doc = SimpleDocTemplate(filename, pagesize=letter, leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontSize=18, leading=22, textColor=colors.HexColor('#1E293B'))
    subtitle_style = ParagraphStyle('DocSubtitle', parent=styles['Normal'], fontSize=9, leading=13, textColor=colors.HexColor('#64748B'))
    section_heading = ParagraphStyle('SectionHeading', parent=styles['Heading2'], fontSize=12, leading=16, textColor=colors.HexColor('#2563EB'), spaceBefore=8, spaceAfter=4)
    body_style = ParagraphStyle('DocBody', parent=styles['Normal'], fontSize=9, leading=13, textColor=colors.HexColor('#334155'))
    
    elements = []
    elements.append(Paragraph(title, title_style))
    elements.append(Paragraph(subtitle, subtitle_style))
    elements.append(Spacer(1, 6))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceBefore=4, spaceAfter=8))
    
    for heading, text_items in sections:
        elements.append(Paragraph(heading.upper(), section_heading))
        for item in text_items:
            elements.append(Paragraph(f"• {item}" if len(text_items) > 1 and not item.startswith("Email:") else item, body_style))
            elements.append(Spacer(1, 2))
        elements.append(Spacer(1, 4))
        
    doc.build(elements)
    print(f"Generated: {filename}")

if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(__file__), "sample_resumes")
    
    # PDF A: Alex Rivera (Senior Backend Python Specialist)
    generate_pdf(
        os.path.join(out_dir, "Alex_Rivera_Senior_Backend_Resume.pdf"),
        "Alex Rivera",
        "Email: alex.rivera@cloudtech.io | Phone: +1 (555) 234-5678 | Location: Austin, TX | LinkedIn: linkedin.com/in/alex-rivera-backend | GitHub: github.com/alexrivera-dev",
        [
            ("Professional Summary", [
                "Senior Backend Engineer with 5 years of experience designing and scaling distributed APIs, microservices, and high-performance database architectures using Python, FastAPI, and MySQL."
            ]),
            ("Education", [
                "Master of Science in Computer Science — University of Texas at Austin (2020)"
            ]),
            ("Core Technical Skills", [
                "Languages & Frameworks: Python, FastAPI, SQLAlchemy, Django, REST API",
                "Databases & Caching: MySQL, PostgreSQL, Redis, Database Optimization",
                "DevOps & Infrastructure: Docker, Kubernetes, Linux, Git, CI/CD"
            ]),
            ("Professional Experience", [
                "Senior Backend Developer at CloudTech Solutions (2021 - Present, 5 years total experience)",
                "Architected asynchronous REST APIs in FastAPI handling 20M+ monthly database queries to MySQL.",
                "Containerized 14 microservices using Docker and automated CI/CD pipelines.",
                "Optimized SQL query performance and connection pooling, reducing p99 latency by 42%."
            ]),
            ("Key Projects", [
                "Distributed Async Queue Engine built with FastAPI, Redis, and MySQL",
                "Automated DB Migration & Health Monitoring System using SQLAlchemy"
            ]),
            ("Certifications", [
                "AWS Certified Solutions Architect — Associate (2023)"
            ])
        ]
    )

    # PDF B: Elena Rostova (Frontend Engineer with Skill Gaps for Backend Role)
    generate_pdf(
        os.path.join(out_dir, "Elena_Rostova_Frontend_Resume.pdf"),
        "Elena Rostova",
        "Email: elena.rostova@pixelcraft.dev | Phone: +1 (555) 345-6789 | Location: Seattle, WA | LinkedIn: linkedin.com/in/elena-rostova | GitHub: github.com/elenarostova",
        [
            ("Professional Summary", [
                "Frontend Engineer with 3 years of experience developing responsive user interfaces, accessible design systems, and client-side web applications using React, TypeScript, and Tailwind CSS."
            ]),
            ("Education", [
                "Bachelor of Science in Software Engineering — University of Washington (2022)"
            ]),
            ("Core Technical Skills", [
                "Frontend: React, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, Next.js, Redux",
                "Testing & Tools: Jest, Cypress, Vite, Webpack, Git, Figma"
            ]),
            ("Professional Experience", [
                "Frontend Software Engineer at PixelCraft Studio (2022 - Present, 3 years experience)",
                "Built interactive SaaS dashboards using React, TypeScript, and Tailwind CSS.",
                "Integrated client-side state management with Redux and optimized bundle size by 35% using Vite."
            ]),
            ("Key Projects", [
                "Real-time Enterprise Collaboration Canvas in React and TypeScript",
                "Component Design System Library published with Tailwind CSS"
            ]),
            ("Certifications", [
                "Meta Certified Frontend Developer (2023)"
            ])
        ]
    )

    # PDF C: Maya Lin (UI/UX Product Designer)
    generate_pdf(
        os.path.join(out_dir, "Maya_Lin_Design_Resume.pdf"),
        "Maya Lin",
        "Email: maya.lin@designstudio.co | Phone: +1 (555) 456-7890 | Location: San Francisco, CA | LinkedIn: linkedin.com/in/mayalindesign",
        [
            ("Professional Summary", [
                "Product & UI/UX Designer with 4 years of experience crafting intuitive design systems, user journeys, interactive prototypes, and wireframes for mobile and enterprise web products."
            ]),
            ("Education", [
                "Bachelor of Fine Arts in Interaction Design — California College of the Arts (2021)"
            ]),
            ("Core Competencies", [
                "Design Tools: Figma, Adobe XD, Photoshop, Illustrator, Prototyping, Wireframing",
                "Methodologies: User Research, Usability Testing, Responsive Design, Design Systems, Agile"
            ]),
            ("Professional Experience", [
                "Senior UI/UX Designer at Apex Digital (2021 - Present, 4 years experience)",
                "Spearheaded redesign of cloud management console, improving task completion rates by 28%.",
                "Constructed unified multi-brand design system in Figma with 500+ component variants."
            ]),
            ("Key Projects", [
                "Global B2B E-Commerce Design System & Prototype in Figma",
                "Mobile Health Tracking App UX Research & Usability Audit"
            ]),
            ("Certifications", [
                "Nielsen Norman Group UX Master Certified (2022)"
            ])
        ]
    )
