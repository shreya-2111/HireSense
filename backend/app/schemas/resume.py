from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ResumeUploadResponse(BaseModel):
    resume_id: Optional[int] = None
    candidate_id: Optional[int] = None
    file_name: str
    file_path: str
    file_type: str
    candidate_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    education: Optional[str] = None
    degree: Optional[str] = None
    university: Optional[str] = None
    experience_years: Optional[int] = 0
    companies: List[str] = []
    job_titles: List[str] = []
    skills: List[str] = []
    projects: List[str] = []
    certifications: List[str] = []
    summary: Optional[str] = None
    extracted_text: Optional[str] = None

class ResumeAnalysisRequest(BaseModel):
    resume_id: Optional[int] = None
    candidate_id: Optional[int] = None
    job_id: int
    resume_text: Optional[str] = None

class ResumeAnalysisResponse(BaseModel):
    id: Optional[int] = None
    resume_id: Optional[int] = None
    job_id: int
    job_title: Optional[str] = None
    candidate_id: Optional[int] = None
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    experience_years: Optional[int] = 0
    education: Optional[str] = None
    degree: Optional[str] = None
    university: Optional[str] = None
    companies: List[str] = []
    job_titles: List[str] = []
    projects: List[str] = []
    certifications: List[str] = []
    match_score: float
    summary: str
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    experience_match: bool = True
    education_match: bool = True
    recommendation: str = "Review"
    strengths: List[str] = []
    interview_focus: List[str] = []
    interview_questions: List[Any] = []
    ai_questions: List[Dict[str, Any]] = []
    breakdown: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
