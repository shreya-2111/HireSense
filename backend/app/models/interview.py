import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    scheduled_at = Column(DateTime, nullable=False, index=True)
    duration = Column(Integer, default=45, nullable=False) # in minutes
    interview_type = Column(String(50), default="Technical Round", nullable=False) # Technical Round, HR Screen, System Design, Final Culture Fit
    interviewer = Column(String(255), default="Sarah Lin", nullable=False)
    status = Column(String(50), default="Scheduled", nullable=False, index=True) # Scheduled, Completed, Cancelled, Rescheduled
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    candidate = relationship("Candidate", back_populates="interviews")
    job = relationship("Job", back_populates="interviews")
    questions = relationship("InterviewQuestion", back_populates="interview")

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="SET NULL"), nullable=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    question = Column(Text, nullable=False)
    category = Column(String(50), default="Technical", nullable=False) # Technical, Behavioral, Experience, Situational
    difficulty = Column(String(50), default="Medium", nullable=False) # Easy, Medium, Hard
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    candidate = relationship("Candidate", back_populates="interview_questions")
    job = relationship("Job", back_populates="interview_questions")
    interview = relationship("Interview", back_populates="questions")
