import re
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Any

# Map variations to normalized canonical skill names
SYNONYM_MAP = {
    "react": "react",
    "react js": "react",
    "reactjs": "react",
    "react.js": "react",
    "javascript": "javascript",
    "js": "javascript",
    "typescript": "typescript",
    "ts": "typescript",
    "node": "node.js",
    "node js": "node.js",
    "nodejs": "node.js",
    "node.js": "node.js",
    "express": "express",
    "express js": "express",
    "expressjs": "express",
    "express.js": "express",
    "tailwind": "tailwind css",
    "tailwindcss": "tailwind css",
    "tailwind css": "tailwind css",
    "fastapi": "fastapi",
    "fast api": "fastapi",
    "sqlalchemy": "sqlalchemy",
    "sql": "sql",
    "mysql": "mysql",
    "postgres": "postgresql",
    "postgresql": "postgresql",
    "aws": "aws",
    "amazon web services": "aws",
    "docker": "docker",
    "k8s": "kubernetes",
    "kubernetes": "kubernetes",
    "python": "python",
    "py": "python",
    "html": "html",
    "html5": "html",
    "html 5": "html",
    "css": "css",
    "css3": "css",
    "css 3": "css",
    "git": "git",
    "github": "git",
    "flutter": "flutter",
    "php": "php",
    "mongodb": "mongodb",
    "postman": "postman",
    "rest api": "rest api",
    "rest apis": "rest api",
    "restful api": "rest api",
}

def normalize_skill_name(name: str) -> str:
    """Normalize a skill name by trimming, lowercasing, and mapping known variations."""
    cleaned = name.strip().lower()
    # Check exact cleaned version first
    if cleaned in SYNONYM_MAP:
        return SYNONYM_MAP[cleaned]
    # Check stripped punctuation version
    cleaned_spaced = re.sub(r'[\._\-\s]+', ' ', cleaned).strip()
    return SYNONYM_MAP.get(cleaned_spaced, cleaned_spaced)

def calculate_skill_overlap(candidate_skills: List[str], required_skills: List[str]) -> Tuple[List[str], List[str], float]:
    """
    Compare candidate skills with required job skills.
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
            if r_norm == c_norm or r_norm in c_norm or c_norm in r_norm:
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

    # 1. Skill Score
    matched_skills, missing_skills, skill_ratio = calculate_skill_overlap(candidate_skills, required_skills)
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
