from app.schemas.auth import LoginRequest, RegisterRequest, Token, TokenData
from app.schemas.user import UserBase, UserCreate, UserResponse
from app.schemas.skill import SkillBase, SkillCreate, SkillResponse, JobSkillAdd, JobSkillResponse, CandidateSkillAdd, CandidateSkillResponse
from app.schemas.job import JobBase, JobCreate, JobUpdate, JobResponse, JobSkillsUpdate
from app.schemas.candidate import CandidateBase, CandidateCreate, CandidateUpdate, CandidateResponse
from app.schemas.resume import ResumeUploadResponse, ResumeAnalysisRequest, ResumeAnalysisResponse
from app.schemas.application import ApplicationCreate, ApplicationStatusUpdate, ApplicationResponse
from app.schemas.interview import InterviewCreate, InterviewUpdate, InterviewNotesUpdate, InterviewResponse, InterviewQuestionGenerateRequest, InterviewQuestionCreate, InterviewQuestionResponse
from app.schemas.analytics import DashboardMetricsResponse, JobAnalyticsResponse

__all__ = [
    "LoginRequest", "RegisterRequest", "Token", "TokenData",
    "UserBase", "UserCreate", "UserResponse",
    "SkillBase", "SkillCreate", "SkillResponse", "JobSkillAdd", "JobSkillResponse", "CandidateSkillAdd", "CandidateSkillResponse",
    "JobBase", "JobCreate", "JobUpdate", "JobResponse", "JobSkillsUpdate",
    "CandidateBase", "CandidateCreate", "CandidateUpdate", "CandidateResponse",
    "ResumeUploadResponse", "ResumeAnalysisRequest", "ResumeAnalysisResponse",
    "ApplicationCreate", "ApplicationStatusUpdate", "ApplicationResponse",
    "InterviewCreate", "InterviewUpdate", "InterviewNotesUpdate", "InterviewResponse", "InterviewQuestionGenerateRequest", "InterviewQuestionCreate", "InterviewQuestionResponse",
    "DashboardMetricsResponse", "JobAnalyticsResponse"
]
