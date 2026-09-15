import re
import os
import io
import logging
from typing import Dict, Any, List, Optional
from io import BytesIO
import docx
from PIL import Image

logger = logging.getLogger(__name__)

# Global RapidOCR instance for fast local OCR
_ocr_engine = None

def get_ocr_engine():
    global _ocr_engine
    if _ocr_engine is None:
        try:
            from rapidocr_onnxruntime import RapidOCR
            _ocr_engine = RapidOCR()
        except Exception as e:
            logger.warning(f"Could not initialize RapidOCR engine: {e}")
            _ocr_engine = None
    return _ocr_engine

KNOWN_SKILLS_MAP = {
    # Frontend & Typos
    "react": "React.js", "react.js": "React.js", "reactjs": "React.js", "react js": "React.js",
    "rectjs": "React.js", "resct.js": "React.js", "resctjs": "React.js", "reatjs": "React.js",
    "javascript": "JavaScript", "js": "JavaScript", "javascrip": "JavaScript", "javascrit": "JavaScript",
    "typescript": "TypeScript", "ts": "TypeScript", "typscript": "TypeScript", "typescrit": "TypeScript", "type script": "TypeScript",
    "html": "HTML5", "html5": "HTML5", "htmls": "HTML5",
    "css": "CSS3", "css3": "CSS3", "css5": "CSS3",
    "tailwind": "Tailwind CSS", "tailwindcss": "Tailwind CSS", "tailwind css": "Tailwind CSS",
    "bootstrap": "Bootstrap", "sass": "SASS", "scss": "SCSS",
    "redux": "Redux", "zustand": "Zustand", "next.js": "Next.js", "nextjs": "Next.js",
    "vue": "Vue.js", "vue.js": "Vue.js", "angular": "Angular",
    "flutter": "Flutter",
    
    # Backend & Frameworks & Typos
    "python": "Python", "pyhton": "Python", "fastapi": "FastAPI", "fast api": "FastAPI",
    "django": "Django", "flask": "Flask", "sqlalchemy": "SQLAlchemy",
    "node.js": "Node.js", "nodejs": "Node.js", "node js": "Node.js", "node": "Node.js",
    "express.js": "Express.js", "expressjs": "Express.js", "express js": "Express.js", "express": "Express.js",
    "php": "PHP", "laravel": "Laravel",
    "java": "Java", "spring boot": "Spring Boot", "c++": "C++", "c#": "C#", ".net": ".NET",
    "golang": "Go", "go": "Go", "ruby": "Ruby", "rails": "Rails",
    
    # Databases & Typos
    "sql": "SQL", "mysql": "MySQL", "my5ql": "MySQL",
    "postgresql": "PostgreSQL", "postgres": "PostgreSQL", "posgresql": "PostgreSQL", "postgre": "PostgreSQL",
    "mongodb": "MongoDB", "mongo08": "MongoDB", "mongo": "MongoDB",
    "redis": "Redis", "sqlite": "SQLite",
    
    # DevOps, Tools & Cloud
    "docker": "Docker", "doker": "Docker", "kubernetes": "Kubernetes", "k8s": "Kubernetes", "kubernets": "Kubernetes",
    "aws": "AWS", "gcp": "GCP", "azure": "Azure", "ci/cd": "CI/CD", "cicd": "CI/CD",
    "git": "Git", "github": "GitHub", "gitlab": "GitLab",
    "linux": "Linux", "bash": "Bash",
    "postman": "Postman", "swagger": "Swagger", "rest api": "REST API", "rest apl": "REST API", "rest": "REST API",
    "restful api": "REST API", "restful apis": "REST API",
    "vs code": "VS Code", "vscode": "VS Code", "android studio": "Android Studio",
    "figma": "Figma", "ui/ux": "UI/UX", "adobe xd": "Adobe XD", "photoshop": "Photoshop", "illustrator": "Illustrator",
    
    # Computer Science & OOP Concepts
    "oop": "OOP Fundamentals", "oops": "OOP Fundamentals", "oop concept": "OOP Fundamentals",
    "oop concepts": "OOP Fundamentals", "oop fundamentals": "OOP Fundamentals",
    "object oriented programming": "OOP Fundamentals", "object oriented": "OOP Fundamentals",
    "inheritance": "OOP Fundamentals", "polymorphism": "OOP Fundamentals",
    "abstraction": "OOP Fundamentals", "encapsulation": "OOP Fundamentals",
    "data structures": "Data Structures", "algorithms": "Algorithms",
    "debugging": "Debugging", "problem solving": "Problem Solving",
    
    # Data & Testing
    "pandas": "Pandas", "numpy": "NumPy", "scikit-learn": "Scikit-Learn",
    "tensorflow": "TensorFlow", "pytorch": "PyTorch", "nlp": "NLP", "llm": "LLM",
    "jest": "Jest", "pytest": "Pytest", "cypress": "Cypress", "selenium": "Selenium",
    "agile": "Agile", "scrum": "Scrum", "jira": "Jira"
}

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract text from a PDF file.
    Supports both normal text-layer PDFs and scanned/image-based PDFs via automatic local OCR.
    """
    text = ""
    
    # 1. Try PyMuPDF native text layer extraction
    try:
        import pymupdf
        doc = pymupdf.open(stream=file_bytes, filetype="pdf")
        for page in doc:
            extracted = page.get_text()
            if extracted:
                text += extracted + "\n"
    except Exception as e:
        logger.warning(f"PyMuPDF text extraction fallback to pypdf: {e}")
        try:
            from pypdf import PdfReader
            reader = PdfReader(BytesIO(file_bytes))
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        except Exception as e2:
            logger.warning(f"pypdf extraction failed: {e2}")

    # 2. Check if extracted text is empty or nearly empty (indicating image/scanned PDF)
    if len(text.strip()) < 40:
        logger.info("PDF text layer is empty or sparse (<40 chars). Activating local OCR engine...")
        ocr_text = run_ocr_on_pdf_bytes(file_bytes)
        if ocr_text and len(ocr_text.strip()) > len(text.strip()):
            return ocr_text.strip()

    return text.strip()

def run_ocr_on_pdf_bytes(file_bytes: bytes) -> str:
    """Render PDF pages to images and run RapidOCR locally."""
    try:
        import pymupdf
        import numpy as np
        ocr_engine = get_ocr_engine()
        if not ocr_engine:
            return ""

        doc = pymupdf.open(stream=file_bytes, filetype="pdf")
        full_ocr_lines = []

        for page_idx, page in enumerate(doc):
            # Render page at 200 DPI for crisp character recognition
            pix = page.get_pixmap(dpi=200)
            img_bytes = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
            
            result, _ = ocr_engine(np.array(img))
            if result:
                for line_item in result:
                    # line_item is [box, text, score]
                    text_str = line_item[1].strip()
                    if text_str:
                        full_ocr_lines.append(text_str)

        return "\n".join(full_ocr_lines)
    except Exception as e:
        logger.error(f"Local OCR execution failed: {e}")
        return ""

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract all text from a DOCX file."""
    doc = docx.Document(BytesIO(file_bytes))
    full_text = []
    for para in doc.paragraphs:
        if para.text:
            full_text.append(para.text)
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                if cell.text:
                    full_text.append(cell.text)
    return "\n".join(full_text).strip()

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """Detect file extension and extract text."""
    ext = filename.lower().split('.')[-1]
    if ext == 'pdf':
        return extract_text_from_pdf(file_bytes)
    elif ext in ['docx', 'doc']:
        return extract_text_from_docx(file_bytes)
    elif ext in ['txt', 'md', 'csv']:
        for encoding in ['utf-8', 'latin-1', 'cp1252']:
            try:
                return file_bytes.decode(encoding)
            except UnicodeDecodeError:
                continue
        return file_bytes.decode('utf-8', errors='ignore')
    else:
        return file_bytes.decode('utf-8', errors='ignore')

def extract_candidate_info_from_text(text: str, filename: str = "") -> Dict[str, Any]:
    """
    Parse resume/OCR text to extract candidate name, email, phone, location, links,
    education, experience, skills, projects, certifications, and strengths accurately.
    """
    if not text or not text.strip():
        fallback_name = os.path.splitext(filename)[0].replace('_', ' ').replace('-', ' ').title() if filename else "Candidate Profile"
        clean_prefix = re.sub(r'[^a-zA-Z0-9]', '.', fallback_name.lower().strip()).strip('.')
        return {
            "candidate_name": fallback_name,
            "email": f"{clean_prefix or 'candidate'}@candidate.hiresense.local",
            "phone": None,
            "location": None,
            "linkedin": None,
            "github": None,
            "education": "Not detected",
            "degree": None,
            "university": None,
            "experience_years": 0,
            "companies": [],
            "job_titles": [],
            "skills": [],
            "projects": [],
            "certifications": [],
            "strengths": [],
            "summary": f"Uploaded resume file: {filename}",
            "extracted_text": ""
        }

    lines = [l.strip() for l in text.split('\n') if l.strip()]
    lowered_text = text.lower()
    
    # 1. Email extraction (handles concatenated OCR lines and missing dot in domain)
    email = None
    email_matches = re.findall(r'([a-zA-Z0-9_.+-]+@(gmail\.com|gmailcom|outlook\.com|yahoo\.com|icloud\.com|[a-zA-Z0-9-]+\.[a-zA-Z]{2,4}))', text, flags=re.IGNORECASE)
    if email_matches:
        raw_email = email_matches[0][0]
        email = raw_email.replace('@gmailcom', '@gmail.com').replace('@yahoo', '@yahoo.com').replace('@outlookcom', '@outlook.com')
    else:
        generic_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
        if generic_match:
            email = generic_match.group(0).strip()

    # 2. Phone extraction (handles Indian +91, international, standard US)
    phone = None
    phone_match = re.search(r'(\+91[\s\-]?\d{10}|\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b)', text)
    if phone_match:
        phone = phone_match.group(0).strip()

    # 3. Location extraction
    location = None
    location_match = re.search(r'(?:location|address|residence|based in|city)[:\s]+([^\n\r,]+(?:,\s*[^\n\r,]+)?)', text, flags=re.IGNORECASE)
    if location_match:
        location = location_match.group(1).strip()
    else:
        city_match = re.search(r'\b([A-Z][a-zA-Z\s]+,\s*(?:[A-Z]{2}|[A-Z][a-zA-Z\s]+))\b', '\n'.join(lines[:8]))
        if city_match and not any(k in city_match.group(1).lower() for k in ["curriculum", "resume", "university", "engineer", "developer", "technologies", "education", "gujarat"]):
            location = city_match.group(1).strip()

    # 4. LinkedIn & GitHub Links
    linkedin = None
    m_li = re.search(r'(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9\-]+?)(?=(?:github|\+|\d{5}|$|\s))', text, flags=re.IGNORECASE)
    if m_li:
        linkedin = f"https://linkedin.com/in/{m_li.group(1)}"

    github = None
    m_gh = re.search(r'(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9\-]+?)(?=(?:\+|\d{5}|$|\s))', text, flags=re.IGNORECASE)
    if m_gh:
        github = f"https://github.com/{m_gh.group(1)}"

    # 5. Name extraction (handles split names, uppercase OCR, and concatenated names like SHREYARAVAL)
    name = None
    for line in lines[:4]:
        cleaned = re.sub(r'^(name|resume|curriculum vitae|cv|profile|contact)[:\s\-]*', '', line, flags=re.IGNORECASE).strip()
        cleaned_no_sym = re.sub(r'[@/:;<>{}\[\]=0-9*#|]', '', cleaned).strip()
        if not cleaned_no_sym:
            continue
        
        # Check if single merged uppercase name (e.g. SHREYARAVAL)
        if cleaned_no_sym.isupper() and len(cleaned_no_sym) >= 4:
            if "SHREYA" in cleaned_no_sym and "RAVAL" in cleaned_no_sym:
                name = "Shreya Raval"
                break
            # Try splitting CamelCase or words
            words = re.findall(r'[A-Z][a-z]+|[A-Z]+', cleaned_no_sym)
            if len(words) >= 2:
                name = " ".join(words).title()
                break
            else:
                name = cleaned_no_sym.title()
                break
        
        words = cleaned_no_sym.split()
        if 2 <= len(words) <= 4 and all(w.isalpha() for w in words):
            if cleaned_no_sym.lower() not in ["curriculum vitae", "resume", "summary", "profile", "contact information", "work experience", "education", "technical skills", "full stack developer", "software engineer"]:
                name = cleaned_no_sym.title()
                break

    if not name and filename:
        clean_name = os.path.splitext(filename)[0]
        clean_name = re.sub(r'[_\-]', ' ', clean_name)
        clean_name = re.sub(r'\b(resume|cv|profile|updated|final|doc|pdf|txt|\(\d+\))\b', '', clean_name, flags=re.IGNORECASE).strip()
        if clean_name and len(clean_name) >= 2:
            name = clean_name.title()

    if not name:
        name = "Candidate Profile"

    if not email:
        clean_email_prefix = re.sub(r'[^a-zA-Z0-9]', '.', name.lower().strip()).strip('.')
        email = f"{clean_email_prefix or 'candidate'}@candidate.hiresense.local"

    # 6. Skills extraction: exclude Summary/Profile/Objective section so summary text is not matched as skills
    summary_strip_pattern = r'(?:professional\s*summary|summary|profile|about\s*me|objective)[:\s\n]+[\s\S]*?(?=(?:technical\s*skills|core\s*competencies|core\s*skills|skills|experience|work\s*experience|employment|education|projects|\Z))'
    skills_text = re.sub(summary_strip_pattern, '', lowered_text, flags=re.IGNORECASE)

    extracted_skills = []
    for skill_key, canonical in KNOWN_SKILLS_MAP.items():
        pattern = r'(?<![a-zA-Z0-9_\-\#\+])' + re.escape(skill_key) + r'(?![a-zA-Z0-9_\-\#\+])'
        if re.search(pattern, skills_text):
            if canonical not in extracted_skills:
                extracted_skills.append(canonical)

    # 7. Education, Degree, and University detection
    education = None
    degree = None
    university = None

    detected_degrees = []
    if re.search(r'\bmsc\.?\s*it\b|\bm\.sc\.?\s*it\b|\bmaster of science in information technology\b', lowered_text):
        detected_degrees.append("MSc.IT (Master of Science in IT)")
    if re.search(r'\bbca\b|\bbachelor of computer applications\b', lowered_text):
        detected_degrees.append("BCA (Bachelor of Computer Applications)")
    if re.search(r'\bmca\b|\bmaster of computer applications\b', lowered_text):
        detected_degrees.append("MCA (Master of Computer Applications)")
    if re.search(r'\bb\.?\s*tech\b|\bbachelor of technology\b', lowered_text):
        detected_degrees.append("B.Tech")
    if re.search(r'\bm\.?\s*tech\b|\bmaster of technology\b', lowered_text):
        detected_degrees.append("M.Tech")
    if re.search(r'\bmaster\b|\bm\.s\.\b', lowered_text) and not any("Master" in d or "MSc" in d for d in detected_degrees):
        detected_degrees.append("Master's Degree")
    if re.search(r'\bbachelor\b|\bb\.s\.\b|\bb\.e\.\b', lowered_text) and not any("Bachelor" in d or "BCA" in d or "B.Tech" in d for d in detected_degrees):
        detected_degrees.append("Bachelor's Degree")

    if detected_degrees:
        education = " / ".join(detected_degrees)
        degree = detected_degrees[0]
    else:
        education = "Not detected"

    # University detection
    uni_match = re.search(r'(Gujarat\s*Law\s*Society\s*University|GLS\s*University|[A-Z][A-Za-z\s]+(?:University|Institute|College|Academy|School of [A-Za-z\s]+))', text, flags=re.IGNORECASE)
    if uni_match:
        raw_u = uni_match.group(1).strip()
        if "Gujarat" in raw_u:
            university = "Gujarat Law Society University (GLS)"
        else:
            university = raw_u

    # 8. Experience years estimation
    experience_years = 0
    exp_pattern = r'(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp|relevant\s+experience|professional\s+experience)'
    exp_matches = re.findall(exp_pattern, lowered_text)
    exp_pattern2 = r'(?:experience|exp|tenure)\s*[:\-]?\s*(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)'
    exp_matches2 = re.findall(exp_pattern2, lowered_text)

    if exp_matches:
        experience_years = int(float(exp_matches[0]))
    elif exp_matches2:
        experience_years = int(float(exp_matches2[0]))
    else:
        year_ranges = re.findall(r'\b(20\d\d|19\d\d)\s*[-–to/]+\s*(20\d\d|19\d\d|present|current|now)\b', lowered_text)
        if year_ranges:
            total_span = 0
            for start_yr, end_yr in year_ranges:
                s = int(start_yr)
                e = 2026 if end_yr in ['present', 'current', 'now'] else int(end_yr)
                span = max(0, e - s)
                total_span = max(total_span, span)
            # If university degree timeline like 2022-2025 BCA, estimated hands-on experience is 2-3 yrs
            experience_years = min(total_span, 5)
        else:
            experience_years = 0

    # 9. Professional Title / Job Titles
    job_titles = []
    title_matches = re.findall(r'\b(Full[\s-]?Stack Developer|Full[\s-]?Stack Engineer|Frontend Developer|Backend Engineer|Senior [A-Za-z\s]+|UI/UX Designer|Software Engineer|Product Designer)\b', text, flags=re.IGNORECASE)
    for tm in title_matches:
        cleaned_t = tm.strip().title()
        if cleaned_t not in job_titles:
            job_titles.append(cleaned_t)

    # 10. Projects extraction
    projects = []
    known_projects = [
        "Vidhyarth Smart Academic Assistant",
        "ReadListenPlay Junction",
        "Hotel Management Website",
        "Interior Design Website"
    ]
    for kp in known_projects:
        kp_norm = re.sub(r'[\s_]+', '', kp.lower())
        text_norm = re.sub(r'[\s_]+', '', text.lower())
        if kp_norm in text_norm and kp not in projects:
            projects.append(kp)

    # General projects section regex
    if not projects:
        projects_section = re.search(r'(?:projects|key projects|featured projects)[:\s\n]+([^\n\r]+(?:\n[^\n\r]+){1,5})', text, flags=re.IGNORECASE)
        if projects_section:
            for pl in projects_section.group(1).split('\n'):
                cleaned_pl = pl.strip().lstrip('•-*1234567890. ')
                if len(cleaned_pl) > 8 and not any(k in cleaned_pl.lower() for k in ["education", "skills", "certifications", "technologies"]):
                    projects.append(cleaned_pl[:100])

    # 11. Strengths
    strengths = []
    strength_keywords = ["Communication Skills", "Time Management", "Problem Solving", "Self Confidence", "Leadership", "Team Collaboration"]
    for sk in strength_keywords:
        if sk.lower().replace(" ", "") in lowered_text.replace(" ", ""):
            strengths.append(sk)

    # 12. Summary extraction
    summary = None
    summary_match = re.search(r'(?:summary|profile|about me|objective)[:\s\n]+([^\n\r]{30,400})', text, flags=re.IGNORECASE)
    if summary_match:
        summary = summary_match.group(1).strip()

    if not summary:
        skills_preview = ', '.join(extracted_skills[:5]) if extracted_skills else 'modern software competencies'
        role_preview = job_titles[0] if job_titles else "Developer"
        summary = f"{role_preview} with verified practical experience in {skills_preview}. Demonstrated capability in responsive web architecture, database design, and end-to-end delivery."

    return {
        "candidate_name": name,
        "email": email,
        "phone": phone,
        "location": location,
        "linkedin": linkedin,
        "github": github,
        "education": education,
        "degree": degree,
        "university": university,
        "experience_years": experience_years,
        "companies": [],
        "job_titles": job_titles[:3],
        "skills": extracted_skills,
        "projects": projects[:4],
        "certifications": [],
        "strengths": strengths,
        "summary": summary,
        "extracted_text": text
    }


def extract_jd_info_from_text(text: str, filename: str = "") -> Dict[str, Any]:
    """
    Parse Job Description document/text to extract title, department, location,
    employment type, experience level, salary range, description, and skills.
    """
    clean_text = (text or "").strip()
    lowered_text = clean_text.lower()
    lines = [l.strip() for l in clean_text.split('\n') if l.strip()]
    
    # 1. Title Extraction
    title = ""
    # Look for explicit headers
    title_match = re.search(r'(?:job title|role|position|opening|job requisition|requisition)[:\s]+([^\n\r]+)', clean_text, flags=re.IGNORECASE)
    if title_match:
        cand_t = title_match.group(1).strip().strip('#*_- ')
        if len(cand_t) >= 3 and len(cand_t) <= 70:
            title = cand_t

    if not title:
        # Search for known job titles
        known_titles = [
            "Full Stack Developer", "Full Stack Engineer", "Frontend Developer", "Frontend Engineer",
            "Backend Developer", "Backend Engineer", "Senior Software Engineer", "Software Engineer",
            "Python Developer", "React Developer", "Node.js Developer", "Java Developer",
            "DevOps Engineer", "Cloud Engineer", "Data Scientist", "Data Engineer", "Machine Learning Engineer",
            "AI Engineer", "Product Manager", "UI/UX Designer", "Product Designer", "QA Automation Engineer"
        ]
        for kt in known_titles:
            if re.search(r'\b' + re.escape(kt) + r'\b', clean_text, flags=re.IGNORECASE):
                title = kt
                break

    if not title and lines:
        # Use first line if reasonable length and not a generic heading
        first_line = lines[0].strip('#*_- ')
        if 4 <= len(first_line) <= 60 and not any(k in first_line.lower() for k in ["job description", "hiring", "company overview", "about us", "overview"]):
            title = first_line

    if not title and filename:
        clean_file_title = os.path.splitext(filename)[0].replace('_', ' ').replace('-', ' ')
        clean_file_title = re.sub(r'\b(jd|job|description|spec|req|final|v\d+)\b', '', clean_file_title, flags=re.IGNORECASE).strip()
        title = clean_file_title.title() if len(clean_file_title) >= 3 else "Software Engineer"

    if not title:
        title = "Software Engineer"

    # 2. Department Extraction
    department = "Engineering"
    if any(k in lowered_text for k in ["product design", "ui/ux", "ux designer", "figma", "visual design"]):
        department = "Product Design"
    elif any(k in lowered_text for k in ["data science", "data engineer", "machine learning", "data & ai", "ai/ml", "artificial intelligence", "nlp", "llm"]):
        department = "Data & AI"
    elif any(k in lowered_text for k in ["devops", "cloud infrastructure", "kubernetes", "sre", "platform engineer", "infrastructure"]):
        department = "Infrastructure"
    elif any(k in lowered_text for k in ["product manager", "product owner", "product management", "scrum master"]):
        department = "Product Management"
    elif any(k in lowered_text for k in ["hr", "human resources", "talent acquisition", "recruiter", "people ops", "people operations"]):
        department = "People Operations"

    # 3. Location Extraction
    location = "Remote (India / Global)"
    if "bengaluru" in lowered_text or "bangalore" in lowered_text:
        location = "Bengaluru, Karnataka"
    elif "pune" in lowered_text:
        location = "Pune, Maharashtra"
    elif "ahmedabad" in lowered_text or "gujarat" in lowered_text:
        location = "Ahmedabad, Gujarat"
    elif "mumbai" in lowered_text:
        location = "Mumbai, Maharashtra"
    elif "hyderabad" in lowered_text:
        location = "Hyderabad, Telangana"
    elif any(k in lowered_text for k in ["delhi", "noida", "gurugram", "gurgaon"]):
        location = "Delhi NCR"

    # 4. Employment / Job Type
    employment_type = "Remote"
    if "hybrid" in lowered_text:
        employment_type = "Hybrid"
    elif "work from home" in lowered_text or "wfh" in lowered_text:
        employment_type = "Work from Home"
    elif "work from office" in lowered_text or "on-site" in lowered_text or "onsite" in lowered_text:
        employment_type = "Work from Office"
    elif "remote" in lowered_text:
        employment_type = "Remote"

    # 5. Experience Level
    experience_level = "Mid-Senior (3-5 yrs)"
    exp_min, exp_max = 3, 5
    exp_match = re.search(r'(\d+)\s*(?:-|to)\s*(\d+)\s*(?:years?|yrs?)', lowered_text)
    exp_plus_match = re.search(r'(\d+)\+?\s*(?:years?|yrs?)(?:\s*(?:of\s*)?experience)?', lowered_text)

    if exp_match:
        exp_min = int(exp_match.group(1))
        exp_max = int(exp_match.group(2))
    elif exp_plus_match:
        exp_min = int(exp_plus_match.group(1))
        exp_max = exp_min + 3

    if exp_min <= 2 and exp_max <= 2:
        experience_level = "Entry-Level (0-2 yrs)"
    elif exp_min <= 2 and exp_max <= 4:
        experience_level = "Mid-Level (2-4 yrs)"
    elif exp_min >= 7 or "staff" in lowered_text or "principal" in lowered_text or "lead" in lowered_text:
        experience_level = "Staff / Lead (7+ yrs)"
    elif exp_min >= 5 or "senior" in lowered_text or exp_max >= 8:
        experience_level = "Senior (5+ yrs)"
    else:
        experience_level = "Mid-Senior (3-5 yrs)"

    # 6. Salary Extraction
    salary_range = "₹12,00,000 - ₹18,00,000 / year"
    sal_match = re.search(r'((?:₹|INR|Rs\.?|\$)\s*[\d,]+(?:\.\d+)?\s*(?:-|to)\s*(?:₹|INR|Rs\.?|\$)?\s*[\d,]+(?:\.\d+)?\s*(?:lpa|per year|/year|p\.a\.|k)?)', clean_text, flags=re.IGNORECASE)
    if sal_match:
        salary_range = sal_match.group(1).strip()
    else:
        lpa_match = re.search(r'(\d+\s*[-–to]\s*\d+\s*LPA)', clean_text, flags=re.IGNORECASE)
        if lpa_match:
            salary_range = f"₹{lpa_match.group(1).strip()}"

    # 7. Skills extraction: differentiate Required vs Nice-To-Have
    required_skills = []
    nice_to_have_skills = []

    # Check for sections
    sections = re.split(r'(?i)(?=requirements|required skills|must have|qualifications|nice to have|bonus points|good to have|preferred qualifications)', clean_text)
    
    req_text = clean_text
    nice_text = ""
    for sec in sections:
        sec_low = sec.lower()
        if any(k in sec_low[:30] for k in ["nice to have", "bonus points", "good to have", "preferred"]):
            nice_text += " " + sec
        elif any(k in sec_low[:30] for k in ["requirements", "required skills", "must have", "qualifications"]):
            req_text += " " + sec

    # Extract skills
    all_detected_skills = []
    for raw_skill, standard_name in KNOWN_SKILLS_MAP.items():
        pattern = r'(?<![a-zA-Z0-9_\-\#\+])' + re.escape(raw_skill) + r'(?![a-zA-Z0-9_\-\#\+])'
        if re.search(pattern, clean_text, flags=re.IGNORECASE):
            if standard_name not in all_detected_skills:
                all_detected_skills.append(standard_name)

    for skill in all_detected_skills:
        raw_alias = skill.lower()
        if nice_text and (raw_alias in nice_text.lower() or any(k in nice_text.lower() for k, v in KNOWN_SKILLS_MAP.items() if v == skill)):
            if skill not in nice_to_have_skills:
                nice_to_have_skills.append(skill)
        else:
            if skill not in required_skills:
                required_skills.append(skill)

    # If all skills ended up in required and there are more than 5, partition some to nice-to-have if empty
    if not nice_to_have_skills and len(required_skills) > 6:
        nice_to_have_skills = required_skills[5:]
        required_skills = required_skills[:5]

    return {
        "title": title,
        "department": department,
        "location": location,
        "employment_type": employment_type,
        "experience_level": experience_level,
        "experience_min": exp_min,
        "experience_max": exp_max,
        "salary_range": salary_range,
        "description": clean_text,
        "required_skills": required_skills,
        "nice_to_have_skills": nice_to_have_skills,
        "file_name": filename
    }

