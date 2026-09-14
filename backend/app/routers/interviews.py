from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.interview import (
    InterviewCreate, InterviewUpdate, InterviewNotesUpdate,
    InterviewResponse, InterviewQuestionGenerateRequest, InterviewQuestionResponse
)
from app.services.interview_service import interview_service

router = APIRouter(prefix="/interviews", tags=["Interviews & AI Questions"])

@router.get("", response_model=List[InterviewResponse], summary="List scheduled interviews with optional filters")
def list_interviews(
    status: Optional[str] = Query(None, description="Filter by status (Scheduled, Completed, Cancelled)"),
    job_id: Optional[int] = Query(None, description="Filter by job ID"),
    candidate_id: Optional[int] = Query(None, description="Filter by candidate ID"),
    db: Session = Depends(get_db)
):
    return interview_service.get_all_interviews(
        db, status=status, job_id=job_id, candidate_id=candidate_id
    )

@router.post("", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED, summary="Schedule a new interview")
def create_interview(int_in: InterviewCreate, db: Session = Depends(get_db)):
    return interview_service.create_interview(db, int_in)

@router.get("/{interview_id}", response_model=InterviewResponse, summary="Get interview details by ID")
def get_interview(interview_id: int, db: Session = Depends(get_db)):
    interview = interview_service.get_interview_by_id(db, interview_id)
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Interview {interview_id} not found")
    return interview

@router.put("/{interview_id}", response_model=InterviewResponse, summary="Update interview schedule or details")
def update_interview(interview_id: int, int_in: InterviewUpdate, db: Session = Depends(get_db)):
    updated = interview_service.update_interview(db, interview_id, int_in)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Interview {interview_id} not found")
    return updated

@router.delete("/{interview_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Cancel/Delete interview")
def delete_interview(interview_id: int, db: Session = Depends(get_db)):
    success = interview_service.delete_interview(db, interview_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Interview {interview_id} not found")
    return None

@router.patch("/{interview_id}/notes", response_model=InterviewResponse, summary="Update interview notes")
def update_interview_notes(interview_id: int, req: InterviewNotesUpdate, db: Session = Depends(get_db)):
    try:
        return interview_service.update_notes(db, interview_id, req.notes)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/questions/generate", response_model=List[InterviewQuestionResponse], summary="Generate role-tailored interview questions using AI")
def generate_questions(req: InterviewQuestionGenerateRequest, db: Session = Depends(get_db)):
    return interview_service.generate_questions(db, req)

@router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a generated interview question")
def delete_question(question_id: int, db: Session = Depends(get_db)):
    success = interview_service.delete_question(db, question_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Question {question_id} not found")
    return None
