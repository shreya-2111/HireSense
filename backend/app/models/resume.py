import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False) # pdf, docx, txt
    extracted_text = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    candidate = relationship("Candidate", back_populates="resumes")
    analyses = relationship("ResumeAnalysis", back_populates="resume", cascade="all, delete-orphan")

class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    summary = Column(Text, nullable=True)
    match_score = Column(Float, default=0.0, nullable=False)
    matched_skills = Column(JSON, nullable=True) # list of direct / primary matched skill names
    inferred_skills = Column(JSON, nullable=True) # list of inferred skill names
    related_skills = Column(JSON, nullable=True) # list of related/partial skill names
    missing_skills = Column(JSON, nullable=True) # list of missing skill names
    skill_match_details = Column(JSON, nullable=True) # list of rich skill match explanation objects
    skill_match_summary = Column(JSON, nullable=True) # dictionary with counts: direct, inferred, related, missing
    experience_match = Column(Boolean, default=False, nullable=False)
    education_match = Column(Boolean, default=False, nullable=False)
    recommendation = Column(String(50), default="Review", nullable=False) # Shortlist, Interview, Maybe, Reject, Review
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    resume = relationship("Resume", back_populates="analyses")
    job = relationship("Job", back_populates="resume_analyses")
