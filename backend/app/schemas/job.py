from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.schemas.skill import JobSkillResponse

class JobBase(BaseModel):
    title: str
    department: str
    location: str
    employment_type: Optional[str] = "Full-time"
    description: Optional[str] = None
    experience_min: Optional[int] = 0
    experience_max: Optional[int] = 10
    status: Optional[str] = "Active"

class JobCreate(JobBase):
    skills: Optional[List[str]] = []

class JobUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    description: Optional[str] = None
    experience_min: Optional[int] = None
    experience_max: Optional[int] = None
    status: Optional[str] = None
    skills: Optional[List[str]] = None

class JobResponse(JobBase):
    id: int
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    skills: List[str] = []
    applicants_count: int = 0
    interviews_count: int = 0
    shortlisted_count: int = 0
    pipeline: Optional[Dict[str, int]] = None

    class Config:
        from_attributes = True

class JobSkillsUpdate(BaseModel):
    skills: List[str]
