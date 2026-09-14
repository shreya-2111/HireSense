from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class AIQuestionItem(BaseModel):
    question: str
    type: str = "Technical"
    difficulty: str = "Medium"
    reason: Optional[str] = None

class AIInterviewQuestionsRequest(BaseModel):
    candidate_id: Optional[int] = None
    job_id: Optional[int] = None
    analysis_id: Optional[int] = None
    resume_id: Optional[int] = None
    candidate_name: Optional[str] = None
    job_title: Optional[str] = None
    match_score: Optional[float] = None
    matched_skills: Optional[List[str]] = None
    missing_skills: Optional[List[str]] = None
    resume_text: Optional[str] = None

class AIInterviewQuestionsResponse(BaseModel):
    candidate_id: Optional[int] = None
    job_id: Optional[int] = None
    match_score: float = 0.0
    questions: List[AIQuestionItem] = []
