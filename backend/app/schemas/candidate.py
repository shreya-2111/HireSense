from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class CandidateBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    experience_years: Optional[int] = 0
    education: Optional[str] = None
    current_company: Optional[str] = None
    current_role: Optional[str] = None
    summary: Optional[str] = None

class CandidateCreate(CandidateBase):
    skills: Optional[List[str]] = []
    job_id: Optional[int] = None
    match_score: Optional[float] = 0.0

class CandidateUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    experience_years: Optional[int] = None
    education: Optional[str] = None
    current_company: Optional[str] = None
    current_role: Optional[str] = None
    summary: Optional[str] = None
    skills: Optional[List[str]] = None

class CandidateResponse(CandidateBase):
    id: int
    created_at: datetime
    updated_at: datetime
    skills: List[str] = []
    match_score: float = 0.0
    status: Optional[str] = "Applied"
    applied_job: Optional[str] = None
    applied_job_id: Optional[int] = None
    application_id: Optional[int] = None
    recommendation: Optional[str] = "Review"
    resume_file_name: Optional[str] = None
    resume_id: Optional[int] = None

    class Config:
        from_attributes = True
