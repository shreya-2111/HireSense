from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class DashboardMetricsResponse(BaseModel):
    total_candidates: int
    candidates_reviewed: int
    active_jobs: int
    interviews_scheduled: int
    shortlisted_candidates: int
    total_applications: int
    avg_match_score: float
    status_breakdown: Dict[str, int]
    department_distribution: Dict[str, int]
    top_skills: List[Dict[str, Any]]
    hiring_pipeline: Dict[str, int]
    recent_activity: Optional[List[Dict[str, Any]]] = []

class JobAnalyticsResponse(BaseModel):
    job_id: int
    title: str
    department: str
    applicants_count: int
    avg_match_score: float
    status_breakdown: Dict[str, int]
    top_candidates: List[Dict[str, Any]]
