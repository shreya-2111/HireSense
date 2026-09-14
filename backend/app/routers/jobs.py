from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.job import JobCreate, JobUpdate, JobResponse, JobSkillsUpdate
from app.schemas.candidate import CandidateResponse
from app.services.job_service import job_service
from app.services.candidate_service import candidate_service

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("", response_model=List[JobResponse], summary="List all jobs with filters")
def list_jobs(
    status: Optional[str] = Query(None, description="Filter by status (Active, Closed, Draft)"),
    department: Optional[str] = Query(None, description="Filter by department"),
    db: Session = Depends(get_db)
):
    return job_service.get_all_jobs(db, status=status, department=department)

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED, summary="Create a new job posting")
def create_job(job_in: JobCreate, db: Session = Depends(get_db)):
    return job_service.create_job(db, job_in)

@router.get("/{job_id}", response_model=JobResponse, summary="Get job details by ID")
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = job_service.get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Job {job_id} not found")
    return job

@router.put("/{job_id}", response_model=JobResponse, summary="Update job details")
def update_job(job_id: int, job_in: JobUpdate, db: Session = Depends(get_db)):
    updated = job_service.update_job(db, job_id, job_in)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Job {job_id} not found")
    return updated

@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a job posting")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    success = job_service.delete_job(db, job_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Job {job_id} not found")
    return None

@router.post("/{job_id}/skills", response_model=JobResponse, summary="Add required skills to job")
def add_job_skills(job_id: int, skills_in: JobSkillsUpdate, db: Session = Depends(get_db)):
    try:
        return job_service.add_skills(db, job_id, skills_in.skills)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.get("/{job_id}/candidates", response_model=List[CandidateResponse], summary="List candidates attached to a job")
def get_job_candidates(job_id: int, db: Session = Depends(get_db)):
    try:
        return job_service.get_job_candidates(db, job_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/{job_id}/candidates/{candidate_id}", response_model=CandidateResponse, summary="Attach candidate to job creating application")
def attach_candidate(job_id: int, candidate_id: int, db: Session = Depends(get_db)):
    try:
        return candidate_service.attach_to_job(db, job_id, candidate_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
