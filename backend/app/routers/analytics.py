from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.analytics import DashboardMetricsResponse, JobAnalyticsResponse
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics & Reporting"])

@router.get("/dashboard", response_model=DashboardMetricsResponse, summary="Get dynamic dashboard recruitment KPIs and chart metrics")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    return analytics_service.get_dashboard_metrics(db)

@router.get("/jobs/{job_id}", response_model=JobAnalyticsResponse, summary="Get job-specific recruitment analytics")
def get_job_analytics(job_id: int, db: Session = Depends(get_db)):
    analytics = analytics_service.get_job_analytics(db, job_id)
    if not analytics:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Job {job_id} not found")
    return analytics

@router.get("/candidates/export", summary="Export candidate database as CSV format")
def export_candidates_csv(db: Session = Depends(get_db)):
    csv_data = analytics_service.export_candidates_csv(db)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=hiresense_candidates.csv"}
    )
