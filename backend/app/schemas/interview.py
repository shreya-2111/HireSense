from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class InterviewQuestionGenerateRequest(BaseModel):
    candidate_id: Optional[int] = None
    job_id: Optional[int] = None
    category: Optional[str] = "Technical" # Technical, Behavioral, Experience, Situational
    difficulty: Optional[str] = "Medium" # Easy, Medium, Hard
    quantity: Optional[int] = 5 # 5, 10, 15
    candidate_name: Optional[str] = None
    job_title: Optional[str] = None
    skills: Optional[List[str]] = []

class InterviewQuestionCreate(BaseModel):
    question: str
    category: Optional[str] = "Technical"
    difficulty: Optional[str] = "Medium"
    candidate_id: Optional[int] = None
    job_id: Optional[int] = None
    interview_id: Optional[int] = None

class InterviewQuestionResponse(BaseModel):
    id: int
    question: str
    category: str
    difficulty: str
    candidate_id: Optional[int] = None
    job_id: Optional[int] = None
    interview_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class InterviewBase(BaseModel):
    candidate_id: int
    job_id: int
    scheduled_at: datetime
    duration: Optional[int] = 45
    interview_type: Optional[str] = "Technical Round"
    interviewer: Optional[str] = "Sarah Lin"
    status: Optional[str] = "Scheduled"
    notes: Optional[str] = None

class InterviewCreate(InterviewBase):
    pass

class InterviewUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None
    duration: Optional[int] = None
    interview_type: Optional[str] = None
    interviewer: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class InterviewNotesUpdate(BaseModel):
    notes: str

class InterviewResponse(InterviewBase):
    id: int
    created_at: datetime
    updated_at: datetime
    candidate_name: Optional[str] = None
    candidate_role: Optional[str] = None
    job_title: Optional[str] = None
    questions: Optional[List[InterviewQuestionResponse]] = []

    class Config:
        from_attributes = True
