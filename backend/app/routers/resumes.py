from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.schemas.resume import ResumeUploadResponse, ResumeAnalysisRequest, ResumeAnalysisResponse
from app.services.resume_service import resume_service
from app.services.matching_service import matching_service

router = APIRouter(tags=["Resumes & AI Analysis"])

@router.post("/resumes/upload", response_model=ResumeUploadResponse, summary="Upload a candidate resume (PDF, DOCX)")
async def upload_resume(
    file: UploadFile = File(...),
    candidate_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    return await resume_service.process_resume_upload(db, file, candidate_id)

@router.post("/analyze-resume", response_model=ResumeAnalysisResponse, summary="Analyze candidate resume match against job requirements")
def analyze_resume(req: ResumeAnalysisRequest, db: Session = Depends(get_db)):
    try:
        return matching_service.analyze_resume_for_job(
            db,
            job_id=req.job_id,
            resume_id=req.resume_id,
            candidate_id=req.candidate_id,
            resume_text=req.resume_text
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/resumes/analyze", response_model=ResumeAnalysisResponse, summary="Alias for analyze-resume")
def analyze_resume_alias(req: ResumeAnalysisRequest, db: Session = Depends(get_db)):
    return analyze_resume(req, db)
