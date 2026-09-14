from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.job import Job
from app.models.skill import Skill, JobSkill
from app.models.application import Application
from app.models.interview import Interview
from app.schemas.job import JobCreate, JobUpdate
from app.utils.scoring import normalize_skill_name

class JobService:
    def _get_or_create_skill(self, db: Session, skill_name: str) -> Skill:
        norm = normalize_skill_name(skill_name)
        clean_name = skill_name.strip()
        skill = db.query(Skill).filter((Skill.normalized_name == norm) | (Skill.name == clean_name)).first()
        if not skill:
            try:
                skill = Skill(name=clean_name, normalized_name=norm)
                db.add(skill)
                db.flush()
            except Exception:
                db.rollback()
                skill = db.query(Skill).filter((Skill.normalized_name == norm) | (Skill.name == clean_name)).first()
        return skill

    def get_all_jobs(self, db: Session, status: Optional[str] = None, department: Optional[str] = None) -> List[Dict[str, Any]]:
        query = db.query(Job)
        if status:
            query = query.filter(Job.status == status)
        if department:
            query = query.filter(Job.department == department)
        
        jobs = query.order_by(Job.created_at.desc()).all()
        results = []
        for j in jobs:
            skills = [js.skill.name for js in j.skills if js.skill]
            
            # Aggregate stats
            applicants_count = len(j.applications)
            interviews_count = len(j.interviews)
            shortlisted_count = sum(1 for a in j.applications if a.status in ["Shortlisted", "Interview", "Hired"])
            
            pipeline = {
                "applied": sum(1 for a in j.applications if a.status == "Applied"),
                "screening": sum(1 for a in j.applications if a.status == "Screening"),
                "shortlisted": sum(1 for a in j.applications if a.status == "Shortlisted"),
                "interview": sum(1 for a in j.applications if a.status == "Interview"),
                "maybe": sum(1 for a in j.applications if a.status == "Maybe"),
                "rejected": sum(1 for a in j.applications if a.status == "Rejected"),
                "hired": sum(1 for a in j.applications if a.status == "Hired"),
            }

            results.append({
                "id": j.id,
                "title": j.title,
                "department": j.department,
                "location": j.location,
                "employment_type": j.employment_type,
                "description": j.description,
                "experience_min": j.experience_min,
                "experience_max": j.experience_max,
                "status": j.status,
                "created_by": j.created_by,
                "created_at": j.created_at,
                "updated_at": j.updated_at,
                "skills": skills,
                "applicants_count": applicants_count,
                "interviews_count": interviews_count,
                "shortlisted_count": shortlisted_count,
                "pipeline": pipeline
            })
        return results

    def get_job_by_id(self, db: Session, job_id: int) -> Optional[Dict[str, Any]]:
        j = db.query(Job).filter(Job.id == job_id).first()
        if not j:
            return None
        skills = [js.skill.name for js in j.skills if js.skill]
        applicants_count = len(j.applications)
        interviews_count = len(j.interviews)
        shortlisted_count = sum(1 for a in j.applications if a.status in ["Shortlisted", "Interview", "Hired"])
        
        pipeline = {
            "applied": sum(1 for a in j.applications if a.status == "Applied"),
            "screening": sum(1 for a in j.applications if a.status == "Screening"),
            "shortlisted": sum(1 for a in j.applications if a.status == "Shortlisted"),
            "interview": sum(1 for a in j.applications if a.status == "Interview"),
            "maybe": sum(1 for a in j.applications if a.status == "Maybe"),
            "rejected": sum(1 for a in j.applications if a.status == "Rejected"),
            "hired": sum(1 for a in j.applications if a.status == "Hired"),
        }

        return {
            "id": j.id,
            "title": j.title,
            "department": j.department,
            "location": j.location,
            "employment_type": j.employment_type,
            "description": j.description,
            "experience_min": j.experience_min,
            "experience_max": j.experience_max,
            "status": j.status,
            "created_by": j.created_by,
            "created_at": j.created_at,
            "updated_at": j.updated_at,
            "skills": skills,
            "applicants_count": applicants_count,
            "interviews_count": interviews_count,
            "shortlisted_count": shortlisted_count,
            "pipeline": pipeline
        }

    def create_job(self, db: Session, job_in: JobCreate, user_id: Optional[int] = None) -> Dict[str, Any]:
        job = Job(
            title=job_in.title,
            department=job_in.department,
            location=job_in.location,
            employment_type=job_in.employment_type or "Full-time",
            description=job_in.description,
            experience_min=job_in.experience_min or 0,
            experience_max=job_in.experience_max or 10,
            status=job_in.status or "Active",
            created_by=user_id
        )
        db.add(job)
        db.flush()

        if job_in.skills:
            for s_name in job_in.skills:
                skill = self._get_or_create_skill(db, s_name)
                job_skill = JobSkill(job_id=job.id, skill_id=skill.id, required=True, importance="required")
                db.add(job_skill)

        db.commit()
        db.refresh(job)
        return self.get_job_by_id(db, job.id)

    def update_job(self, db: Session, job_id: int, job_in: JobUpdate) -> Optional[Dict[str, Any]]:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return None

        update_data = job_in.dict(exclude_unset=True)
        skills = update_data.pop("skills", None)

        for key, value in update_data.items():
            setattr(job, key, value)

        if skills is not None:
            # Remove existing skills
            db.query(JobSkill).filter(JobSkill.job_id == job.id).delete()
            for s_name in skills:
                skill = self._get_or_create_skill(db, s_name)
                job_skill = JobSkill(job_id=job.id, skill_id=skill.id, required=True, importance="required")
                db.add(job_skill)

        db.commit()
        db.refresh(job)
        return self.get_job_by_id(db, job.id)

    def delete_job(self, db: Session, job_id: int) -> bool:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return False
        db.delete(job)
        db.commit()
        return True

    def add_skills(self, db: Session, job_id: int, skills_list: List[str]) -> Dict[str, Any]:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise ValueError(f"Job with ID {job_id} not found")
        for s_name in skills_list:
            skill = self._get_or_create_skill(db, s_name)
            existing = db.query(JobSkill).filter(JobSkill.job_id == job.id, JobSkill.skill_id == skill.id).first()
            if not existing:
                job_skill = JobSkill(job_id=job.id, skill_id=skill.id, required=True, importance="required")
                db.add(job_skill)
        db.commit()
        return self.get_job_by_id(db, job.id)

    def get_job_candidates(self, db: Session, job_id: int) -> List[Dict[str, Any]]:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise ValueError(f"Job with ID {job_id} not found")

        applications = db.query(Application).filter(Application.job_id == job_id).all()
        candidates = []
        for app in applications:
            c = app.candidate
            skills = [cs.skill.name for cs in c.skills if cs.skill]
            resume_name = c.resumes[0].file_name if c.resumes else None
            resume_id = c.resumes[0].id if c.resumes else None
            candidates.append({
                "id": c.id,
                "application_id": app.id,
                "name": c.name,
                "email": c.email,
                "phone": c.phone,
                "location": c.location,
                "experience_years": c.experience_years,
                "education": c.education,
                "current_company": c.current_company,
                "current_role": c.current_role,
                "summary": c.summary,
                "skills": skills,
                "match_score": app.match_score,
                "status": app.status,
                "recommendation": app.recommendation,
                "applied_job": job.title,
                "applied_job_id": job.id,
                "resume_file_name": resume_name,
                "resume_id": resume_id,
                "created_at": c.created_at,
                "updated_at": c.updated_at
            })
        return candidates

job_service = JobService()
