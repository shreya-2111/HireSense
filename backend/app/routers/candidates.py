from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.candidate import CandidateCreate, CandidateUpdate, CandidateResponse
from app.services.candidate_service import candidate_service

router = APIRouter(prefix="/candidates", tags=["Candidates"])

@router.get("", response_model=List[CandidateResponse], summary="List all candidates with search and filters")
def list_candidates(
    search: Optional[str] = Query(None, description="Search by name, role, email or company"),
    job_id: Optional[int] = Query(None, description="Filter by applied job ID"),
    status: Optional[str] = Query(None, description="Filter by application status"),
    min_experience: Optional[int] = Query(None, description="Filter by minimum years of experience"),
    db: Session = Depends(get_db)
):
    return candidate_service.get_all_candidates(
        db, search=search, job_id=job_id, status=status, min_experience=min_experience
    )

@router.post("", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED, summary="Create a new candidate profile")
def create_candidate(cand_in: CandidateCreate, db: Session = Depends(get_db)):
    return candidate_service.create_candidate(db, cand_in)

@router.get("/{candidate_id}", response_model=CandidateResponse, summary="Get candidate details by ID")
def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    cand = candidate_service.get_candidate_by_id(db, candidate_id)
    if not cand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Candidate {candidate_id} not found")
    return cand

@router.put("/{candidate_id}", response_model=CandidateResponse, summary="Update candidate details")
def update_candidate(candidate_id: int, cand_in: CandidateUpdate, db: Session = Depends(get_db)):
    updated = candidate_service.update_candidate(db, candidate_id, cand_in)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Candidate {candidate_id} not found")
    return updated

@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a candidate")
def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    success = candidate_service.delete_candidate(db, candidate_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Candidate {candidate_id} not found")
    return None

@router.get("/{candidate_id}/resume", summary="Get candidate's resume information and extracted text")
def get_candidate_resume(candidate_id: int, db: Session = Depends(get_db)):
    resume = candidate_service.get_candidate_resume(db, candidate_id)
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No resume found for candidate {candidate_id}")
    return resume

@router.get("/{candidate_id}/interviews", summary="Get list of interviews scheduled for candidate")
def get_candidate_interviews(candidate_id: int, db: Session = Depends(get_db)):
    return candidate_service.get_candidate_interviews(db, candidate_id)
