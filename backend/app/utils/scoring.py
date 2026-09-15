import re
import difflib
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Any

# Map variations, synonyms, and common typos to normalized canonical skill names
SYNONYM_MAP = {
    # React & Typos
    "react": "react",
    "react js": "react",
    "reactjs": "react",
    "react.js": "react",
    "rectjs": "react",
    "resct.js": "react",
    "resctjs": "react",
    "reatjs": "react",
    "reackjs": "react",
    "rect.js": "react",

    # JavaScript & Typos
    "javascript": "javascript",
    "js": "javascript",
    "javascrip": "javascript",
    "javascrit": "javascript",
    "javacript": "javascript",
    "java script": "javascript",
    "javascript es6+": "javascript",

    # TypeScript & Typos
    "typescript": "typescript",
    "ts": "typescript",
    "type script": "typescript",
    "typescrit": "typescript",
    "typscript": "typescript",

    # Node & Express
    "node": "node.js",
    "node js": "node.js",
    "nodejs": "node.js",
    "node.js": "node.js",
    "express": "express",
    "express js": "express",
    "expressjs": "express",
    "express.js": "express",

    # Python & Typos
    "python": "python",
    "py": "python",
    "pyhton": "python",
    "pyton": "python",
    "fastapi": "fastapi",
    "fast api": "fastapi",
    "fast-api": "fastapi",
    "django": "django",
    "djano": "django",
    "flask": "flask",
    "sqlalchemy": "sqlalchemy",

    # Databases & SQL
    "sql": "sql",
    "mysql": "mysql",
    "my5ql": "mysql",
    "postgres": "postgresql",
    "postgresql": "postgresql",
    "postgre": "postgresql",
    "postgress": "postgresql",
    "potgresql": "postgresql",
    "posgresql": "postgresql",
    "mongodb": "mongodb",
    "mongo": "mongodb",
    "mongo db": "mongodb",
    "redis": "redis",
    "sqlite": "sqlite",

    # Cloud & DevOps & Typos
    "aws": "aws",
    "amazon web services": "aws",
    "docker": "docker",
    "doker": "docker",
    "dockr": "docker",
    "k8s": "kubernetes",
    "kubernetes": "kubernetes",
    "kubernets": "kubernetes",
    "ci/cd": "ci/cd",
    "cicd": "ci/cd",
    "celery": "celery",

    # Web & UI
    "tailwind": "tailwind css",
    "tailwindcss": "tailwind css",
    "tailwind css": "tailwind css",
    "html": "html",
    "html5": "html",
    "html 5": "html",
    "css": "css",
    "css3": "css",
    "css 3": "css",
    "bootstrap": "bootstrap",

    # Version Control
    "git": "git",
    "github": "git",
    "gitlab": "git",

    # REST APIs
    "rest api": "rest api",
    "rest apis": "rest api",
    "restful api": "rest api",
    "restful apis": "rest api",
    "rest": "rest api",
    "restful": "rest api",
    "api integration": "rest api",
    "postman": "postman",

    # OOP Concepts & Fundamentals
    "oop": "oop",
    "oops": "oop",
    "oop concept": "oop",
    "oop concepts": "oop",
    "oop fundamentals": "oop",
    "object oriented programming": "oop",
    "object oriented": "oop",
    "object-oriented programming": "oop",
    "inheritance": "oop",
    "polymorphism": "oop",
    "abstraction": "oop",
    "encapsulation": "oop",
    "abstract classes": "oop",
    "abstract class": "oop",
    "interfaces": "oop",
    "data structures": "data structures",
    "algorithms": "algorithms",
    "debugging": "debugging",
}

# Semantic Concept Clusters for Knowledge Graph matching (strictly conceptual paradigms like OOP)
CONCEPT_CLUSTERS = [
    {
        "cluster_id": "oop",
        "terms": {
            "oop", "oops", "oop concept", "oop concepts", "oop fundamentals",
            "object oriented programming", "object oriented", "object-oriented programming",
            "inheritance", "polymorphism", "abstraction", "encapsulation",
            "abstract class", "abstract classes", "interfaces", "classes and objects"
        }
    }
]

def normalize_skill_name(name: str) -> str:
    """Normalize a skill name by trimming, lowercasing, and mapping known variations & typos."""
    cleaned = (name or "").strip().lower()
    if cleaned in SYNONYM_MAP:
        return SYNONYM_MAP[cleaned]
    # Check stripped punctuation version
    cleaned_spaced = re.sub(r'[\._\-\s]+', ' ', cleaned).strip()
    if cleaned_spaced in SYNONYM_MAP:
        return SYNONYM_MAP[cleaned_spaced]
    return cleaned_spaced

def is_skill_match(req_norm: str, cand_norm: str) -> bool:
    """
    Check if required skill matches candidate skill using:
    1. Exact normalized match
    2. Semantic Concept Family Clusters (e.g. 'OOP Concept' matches 'Inheritance', 'Polymorphism', 'Abstraction')
    3. Typo-tolerant fuzzy string similarity (e.g. 'rectjs' / 'resct.js' matches 'react')
    4. Exact token / word-boundary multi-word phrase containment
    """
    if not req_norm or not cand_norm:
        return False
    
    r_clean = re.sub(r'[\._\-\s]+', ' ', req_norm.strip().lower()).strip()
    c_clean = re.sub(r'[\._\-\s]+', ' ', cand_norm.strip().lower()).strip()

    if r_clean == c_clean:
        return True

    # 1. Concept Family matching (e.g. OOP family concepts)
    for cluster in CONCEPT_CLUSTERS:
        terms = cluster["terms"]
        r_in = r_clean in terms or any(t == r_clean or (len(t) >= 4 and t in r_clean) for t in terms)
        c_in = c_clean in terms or any(t == c_clean or (len(t) >= 4 and t in c_clean) for t in terms)
        if r_in and c_in:
            return True

    # 2. Fuzzy Typo Matching (e.g., 'rectjs', 'resct.js' vs 'react.js')
    r_no_space = r_clean.replace(" ", "")
    c_no_space = c_clean.replace(" ", "")
    if r_no_space == c_no_space:
        return True

    if len(r_no_space) >= 4 and len(c_no_space) >= 4:
        similarity = difflib.SequenceMatcher(None, r_no_space, c_no_space).ratio()
        if similarity >= 0.80:
            return True

    # 3. Word boundary multi-word token matching
    pattern_r = r'(?<![a-zA-Z0-9_\-\.\#\+])' + re.escape(r_clean) + r'(?![a-zA-Z0-9_\-\.\#\+])'
    pattern_c = r'(?<![a-zA-Z0-9_\-\.\#\+])' + re.escape(c_clean) + r'(?![a-zA-Z0-9_\-\.\#\+])'
    
    if len(r_clean) >= 4 and re.search(pattern_r, c_clean, flags=re.IGNORECASE):
        return True
    if len(c_clean) >= 4 and re.search(pattern_c, r_clean, flags=re.IGNORECASE):
        return True
    
    return False

def check_concept_in_text(skill_name: str, text: str) -> bool:
    """Check if any related term of a concept cluster or fuzzy skill appears in raw text."""
    if not skill_name or not text:
        return False
    s_clean = re.sub(r'[\._\-\s]+', ' ', skill_name.strip().lower()).strip()
    lowered_text = text.lower()

    # Check direct word match
    pattern_direct = r'(?<![a-zA-Z0-9_\-\.\#\+])' + re.escape(s_clean) + r'(?![a-zA-Z0-9_\-\.\#\+])'
    if re.search(pattern_direct, lowered_text):
        return True

    # Check concept family cluster in text
    for cluster in CONCEPT_CLUSTERS:
        terms = cluster["terms"]
        if s_clean in terms or any(t == s_clean or (len(t) >= 4 and t in s_clean) for t in terms):
            for t in terms:
                pattern = r'(?<![a-zA-Z0-9_\-\.\#\+])' + re.escape(t) + r'(?![a-zA-Z0-9_\-\.\#\+])'
                if re.search(pattern, lowered_text):
                    return True
    return False

def calculate_skill_overlap(
    candidate_skills: List[str], 
    required_skills: List[str],
    candidate_text: str = ""
) -> Tuple[List[str], List[str], float]:
    """
    Compare candidate skills with required job skills based on explicit candidate skills only.
    Returns: (matched_skills, missing_skills, match_ratio_0_to_1)
    """
    if not required_skills:
        return candidate_skills, [], 1.0

    cand_norm = {normalize_skill_name(s): s for s in candidate_skills}
    req_norm = {normalize_skill_name(s): s for s in required_skills}

    matched = []
    missing = []

    for r_norm, original_req in req_norm.items():
        found = False
        for c_norm, original_cand in cand_norm.items():
            if is_skill_match(r_norm, c_norm):
                matched.append(original_req)
                found = True
                break

        if not found:
            missing.append(original_req)

    ratio = len(matched) / len(required_skills) if required_skills else 1.0
    return matched, missing, float(ratio)

def calculate_comprehensive_match(
    candidate_skills: List[str],
    required_skills: List[str],
    candidate_exp_years: int,
    job_min_exp: int,
    job_max_exp: int,
    candidate_text: str = "",
    job_description: str = "",
    weights: Dict[str, float] = None
) -> Dict[str, Any]:
    """
    Calculate deterministic matching score based on:
    - Skill Match: 50%
    - Experience Match: 25%
    - Education Match: 15%
    - Relevance Match: 10%
    """
    if weights is None:
        weights = {
            "skill": 0.50,
            "experience": 0.25,
            "education": 0.15,
            "relevance": 0.10
        }
 
    # 1. Skill Score with semantic taxonomy & text concept scanning
    matched_skills, missing_skills, skill_ratio = calculate_skill_overlap(
        candidate_skills, 
        required_skills, 
        candidate_text=candidate_text
    )
    skill_score = skill_ratio * 100.0

    # 2. Experience Score
    if candidate_exp_years >= job_min_exp:
        if job_max_exp > 0 and candidate_exp_years <= job_max_exp + 4:
            exp_score = 100.0
        elif candidate_exp_years > job_max_exp + 4:
            exp_score = 90.0 # Overqualified slightly
        else:
            exp_score = 100.0
        experience_match = True
    else:
        gap = job_min_exp - candidate_exp_years
        exp_score = max(20.0, 100.0 - (gap * 25.0))
        experience_match = (exp_score >= 60.0)

    # 3. Education Score
    edu_score = 60.0
    education_match = False
    if candidate_text:
        lowered = candidate_text.lower()
        if "ph.d" in lowered or "phd" in lowered or "doctorate" in lowered:
            edu_score = 100.0
            education_match = True
        elif "master" in lowered or "m.s." in lowered or "m.tech" in lowered or "mca" in lowered or "mba" in lowered or "msc" in lowered or "m.sc" in lowered:
            edu_score = 95.0
            education_match = True
        elif "bachelor" in lowered or "b.s." in lowered or "b.tech" in lowered or "b.e." in lowered or "degree" in lowered or "bca" in lowered or "university" in lowered or "college" in lowered:
            edu_score = 85.0
            education_match = True
        elif "diploma" in lowered or "certificate" in lowered or "bootcamp" in lowered:
            edu_score = 75.0
            education_match = True

    # 4. Keyword / Context Relevance
    relevance_score = 70.0
    if job_description and candidate_text:
        job_words = set(re.findall(r'\b\w{4,}\b', job_description.lower()))
        cand_words = set(re.findall(r'\b\w{4,}\b', candidate_text.lower()))
        if job_words:
            overlap = len(job_words.intersection(cand_words))
            relevance_score = min(100.0, max(30.0, (overlap / len(job_words)) * 250.0))

    # Calculate weighted total using NumPy array dot product
    score_vector = np.array([skill_score, exp_score, edu_score, relevance_score])
    weight_vector = np.array([weights["skill"], weights["experience"], weights["education"], weights["relevance"]])
    total_score = float(np.dot(score_vector, weight_vector))
    total_score = round(min(99.0, max(15.0, total_score)), 1)

    # Recommendation heuristic
    if total_score >= 80:
        recommendation = "Shortlist"
    elif total_score >= 65:
        recommendation = "Interview"
    elif total_score >= 45:
        recommendation = "Maybe"
    else:
        recommendation = "Reject"

    # Strengths (strictly factual based on data)
    strengths = []
    if matched_skills:
        strengths.append(f"Demonstrated proficiency in required stack: {', '.join(matched_skills[:4])}")
    if candidate_exp_years >= job_min_exp and job_min_exp > 0:
        strengths.append(f"{candidate_exp_years} years experience satisfies minimum requirements ({job_min_exp} yrs)")
    elif candidate_exp_years > 0:
        strengths.append(f"{candidate_exp_years} years of relevant domain experience")
    if education_match:
        strengths.append("Verified relevant educational background")

    # Interview focus areas (strictly dynamically generated from candidate vs job gap)
    interview_focus = []
    if missing_skills:
        interview_focus.append(f"Evaluate practical exposure to: {', '.join(missing_skills[:4])}")
    if matched_skills:
        interview_focus.append(f"Probe hands-on architecture and depth with: {', '.join(matched_skills[:3])}")
    if candidate_exp_years < job_min_exp:
        interview_focus.append(f"Assess project ownership and execution readiness for a {job_min_exp}+ year requirement")
    elif not missing_skills and matched_skills:
        interview_focus.append("Assess end-to-end system design, edge-case mitigation, and production reliability")

    if not interview_focus:
        interview_focus.append("Evaluate domain understanding and technical problem-solving methodology")

    summary = (
        f"Candidate scored {round(total_score)}% overall alignment. "
        f"Demonstrates matching capabilities in {len(matched_skills)} of {len(required_skills) if required_skills else len(matched_skills)} core skills "
        f"with {candidate_exp_years} years of relevant domain experience."
    )

    return {
        "match_score": total_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "experience_match": experience_match,
        "education_match": education_match,
        "recommendation": recommendation,
        "summary": summary,
        "strengths": strengths,
        "interview_focus": interview_focus,
        "breakdown": {
            "skill_score": round(skill_score, 1),
            "experience_score": round(exp_score, 1),
            "education_score": round(edu_score, 1),
            "relevance_score": round(relevance_score, 1)
        }
    }
