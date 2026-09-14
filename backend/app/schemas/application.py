from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ApplicationCreate(BaseModel):
    candidate_id: int
    job_id: int
    status: Optional[str] = "Applied"
    match_score: Optional[float] = 0.0
    recommendation: Optional[str] = "Review"

class ApplicationStatusUpdate(BaseModel):
    status: str # Applied, Screening, Shortlisted, Interview, Maybe, Rejected, Hired

class ApplicationResponse(BaseModel):
    id: int
    candidate_id: int
    job_id: int
    status: str
    match_score: float
    recommendation: str
    applied_at: datetime
    updated_at: datetime
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    job_title: Optional[str] = None

    class Config:
        from_attributes = True
