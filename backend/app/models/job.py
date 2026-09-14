import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False, index=True)
    department = Column(String(100), nullable=False, index=True)
    location = Column(String(100), nullable=False)
    employment_type = Column(String(50), default="Full-time", nullable=False) # Full-time, Part-time, Contract, Remote
    description = Column(Text, nullable=True)
    experience_min = Column(Integer, default=0, nullable=False)
    experience_max = Column(Integer, default=10, nullable=False)
    status = Column(String(50), default="Active", nullable=False, index=True) # Active, Closed, Draft
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    creator = relationship("User", back_populates="jobs")
    skills = relationship("JobSkill", back_populates="job", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
    resume_analyses = relationship("ResumeAnalysis", back_populates="job", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="job", cascade="all, delete-orphan")
    interview_questions = relationship("InterviewQuestion", back_populates="job", cascade="all, delete-orphan")
