from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.application import ApplicationStatusUpdate, ApplicationResponse
from app.services.candidate_service import candidate_service

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.patch("/{application_id}/status", response_model=ApplicationResponse, summary="Update candidate application pipeline status")
def update_status(application_id: int, req: ApplicationStatusUpdate, db: Session = Depends(get_db)):
    try:
        return candidate_service.update_application_status(db, application_id, req.status)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
