from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
import pandas as pd
import io
from app.models.candidate import Candidate
from app.models.job import Job
from app.models.application import Application
from app.models.interview import Interview
from app.models.skill import Skill, CandidateSkill, JobSkill

class AnalyticsService:
    def get_dashboard_metrics(self, db: Session) -> Dict[str, Any]:
        total_candidates = db.query(Candidate).count()
        total_jobs = db.query(Job).count()
        active_jobs = db.query(Job).filter(Job.status == "Active").count()
        total_applications = db.query(Application).count()
        interviews_scheduled = db.query(Interview).filter(Interview.status == "Scheduled").count()
        
        # Candidates reviewed = count of applications where status != 'Applied'
        reviewed_count = db.query(Application).filter(Application.status != "Applied").count()
        shortlisted_count = db.query(Application).filter(Application.status.in_(["Shortlisted", "Interview", "Hired"])).count()

        # Average Match Score
        avg_score_res = db.query(func.avg(Application.match_score)).filter(Application.match_score > 0).scalar()
        avg_match_score = round(float(avg_score_res), 1) if avg_score_res is not None else 0.0

        # Status Breakdown
        status_counts = db.query(Application.status, func.count(Application.id)).group_by(Application.status).all()
        status_breakdown = {status: count for status, count in status_counts}
        for s in ["Applied", "Screening", "Shortlisted", "Interview", "Maybe", "Rejected", "Hired"]:
            if s not in status_breakdown:
                status_breakdown[s] = 0

        # Department Distribution
        dept_counts = db.query(Job.department, func.count(Job.id)).group_by(Job.department).all()
        dept_distribution = {dept: count for dept, count in dept_counts}

        # Top Skills
        skill_counts = (
            db.query(Skill.name, func.count(CandidateSkill.id))
            .join(CandidateSkill, Skill.id == CandidateSkill.skill_id)
            .group_by(Skill.name)
            .order_by(func.count(CandidateSkill.id).desc())
            .limit(6)
            .all()
        )
        top_skills = [{"name": name, "count": count} for name, count in skill_counts]

        # Pipeline stages
        hiring_pipeline = {
            "Sourced": total_candidates,
            "Applied": status_breakdown.get("Applied", 0),
            "Screening": status_breakdown.get("Screening", 0),
            "Shortlisted": status_breakdown.get("Shortlisted", 0),
            "Interview": status_breakdown.get("Interview", 0),
            "Hired": status_breakdown.get("Hired", 0),
        }

        return {
            "total_candidates": total_candidates,
            "candidates_reviewed": reviewed_count,
            "active_jobs": active_jobs,
            "interviews_scheduled": interviews_scheduled,
            "shortlisted_candidates": shortlisted_count,
            "total_applications": total_applications,
            "avg_match_score": avg_match_score,
            "status_breakdown": status_breakdown,
            "department_distribution": dept_distribution,
            "top_skills": top_skills,
            "hiring_pipeline": hiring_pipeline,
            "recent_activity": []
        }

    def get_job_analytics(self, db: Session, job_id: int) -> Optional[Dict[str, Any]]:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return None

        applications = db.query(Application).filter(Application.job_id == job_id).all()
        applicants_count = len(applications)
        
        scores = [a.match_score for a in applications if a.match_score > 0]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

        status_breakdown = {}
        top_candidates = []
        for a in sorted(applications, key=lambda x: x.match_score, reverse=True)[:5]:
            c = a.candidate
            if c:
                top_candidates.append({
                    "id": c.id,
                    "name": c.name,
                    "role": c.current_role,
                    "match_score": a.match_score,
                    "status": a.status
                })

        for a in applications:
            status_breakdown[a.status] = status_breakdown.get(a.status, 0) + 1

        return {
            "job_id": job.id,
            "title": job.title,
            "department": job.department,
            "applicants_count": applicants_count,
            "avg_match_score": avg_score,
            "status_breakdown": status_breakdown,
            "top_candidates": top_candidates
        }

    def export_candidates_csv(self, db: Session) -> str:
        candidates = db.query(Candidate).all()
        columns = [
            "Candidate ID", "Name", "Email", "Phone", "Location",
            "Experience Years", "Current Role", "Current Company",
            "Applied Job", "Application Status", "Match Score (%)",
            "Skills", "Created At"
        ]
        data = []
        for c in candidates:
            app = c.applications[0] if c.applications else None
            skills = ", ".join([cs.skill.name for cs in c.skills if cs.skill])
            data.append({
                "Candidate ID": c.id,
                "Name": c.name,
                "Email": c.email,
                "Phone": c.phone or "",
                "Location": c.location or "",
                "Experience Years": c.experience_years,
                "Current Role": c.current_role or "",
                "Current Company": c.current_company or "",
                "Applied Job": app.job.title if app and app.job else "N/A",
                "Application Status": app.status if app else "N/A",
                "Match Score (%)": app.match_score if app else 0.0,
                "Skills": skills,
                "Created At": c.created_at.strftime("%Y-%m-%d %H:%M:%S") if c.created_at else ""
            })

        df = pd.DataFrame(data, columns=columns)
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)
        return csv_buffer.getvalue()


analytics_service = AnalyticsService()
