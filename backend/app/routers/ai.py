from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.models.candidate import Candidate
from app.models.job import Job
from app.models.resume import Resume, ResumeAnalysis
from app.schemas.ai import AIInterviewQuestionsRequest, AIInterviewQuestionsResponse
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/ai", tags=["AI Interview Assistant"])

@router.post("/interview-questions", response_model=AIInterviewQuestionsResponse, summary="Generate personalized interview questions using Google Gemini AI")
def generate_ai_interview_questions(
    req: AIInterviewQuestionsRequest,
    db: Session = Depends(get_db)
):
    candidate = None
    job = None
    analysis = None
    resume = None

    # 1. Fetch analysis if provided
    if req.analysis_id:
        analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.id == req.analysis_id).first()
        if analysis:
            if not req.job_id:
                req.job_id = analysis.job_id
            if analysis.resume:
                resume = analysis.resume
                candidate = resume.candidate

    # 2. Fetch candidate if provided
    if req.candidate_id and not candidate:
        candidate = db.query(Candidate).filter(Candidate.id == req.candidate_id).first()
        if candidate and candidate.resumes and not resume:
            resume = candidate.resumes[0]

    # 3. Fetch job if provided
    if req.job_id:
        job = db.query(Job).filter(Job.id == req.job_id).first()

    # 4. Fetch resume if provided
    if req.resume_id and not resume:
        resume = db.query(Resume).filter(Resume.id == req.resume_id).first()
        if resume and not candidate:
            candidate = resume.candidate

    # Determine candidate details
    cand_name = candidate.name if candidate else req.candidate_name or "Candidate Profile"
    cand_exp = candidate.experience_years if candidate else 0
    cand_edu = candidate.education if candidate else "Not detected"
    cand_skills = [cs.skill.name for cs in candidate.skills if cs.skill] if (candidate and candidate.skills) else (req.matched_skills or [])
    resume_text = (resume.extracted_text if resume else req.resume_text) or ""

    # Determine job details
    job_title = job.title if job else req.job_title or "Target Position"
    job_desc = job.description if job else ""
    required_skills = [js.skill.name for js in job.skills if js.skill] if (job and job.skills) else []

    # Determine score and skill match
    match_score = req.match_score
    matched_skills = req.matched_skills or []
    missing_skills = req.missing_skills or []

    if analysis:
        match_score = analysis.match_score if match_score is None else match_score
        if not matched_skills and analysis.matched_skills:
            matched_skills = analysis.matched_skills
        if not missing_skills and analysis.missing_skills:
            missing_skills = analysis.missing_skills

    if match_score is None:
        match_score = 75.0

    questions = gemini_service.generate_interview_questions(
        candidate_name=cand_name,
        job_title=job_title,
        experience_years=cand_exp,
        education=cand_edu,
        candidate_skills=cand_skills,
        job_description=job_desc,
        required_skills=required_skills,
        match_score=float(match_score),
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        resume_text=resume_text,
        candidate_id=candidate.id if candidate else req.candidate_id,
        job_id=job.id if job else req.job_id,
        db=db
    )

    return {
        "candidate_id": candidate.id if candidate else req.candidate_id,
        "job_id": job.id if job else req.job_id,
        "match_score": float(match_score),
        "questions": questions
    }
