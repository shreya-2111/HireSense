from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.candidate import Candidate
from app.models.skill import Skill, CandidateSkill
from app.models.job import Job
from app.models.application import Application
from app.models.resume import Resume
from app.models.interview import Interview
from app.schemas.candidate import CandidateCreate, CandidateUpdate
from app.utils.scoring import normalize_skill_name, calculate_comprehensive_match

class CandidateService:
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

    def get_all_candidates(
        self,
        db: Session,
        search: Optional[str] = None,
        job_id: Optional[int] = None,
        status: Optional[str] = None,
        min_experience: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        query = db.query(Candidate)

        if search:
            s_term = f"%{search}%"
            query = query.filter(
                or_(
                    Candidate.name.ilike(s_term),
                    Candidate.email.ilike(s_term),
                    Candidate.current_role.ilike(s_term),
                    Candidate.current_company.ilike(s_term)
                )
            )

        if min_experience is not None:
            query = query.filter(Candidate.experience_years >= min_experience)

        candidates = query.order_by(Candidate.created_at.desc()).all()
        results = []

        for c in candidates:
            # Check applications (find job-specific or highest score application)
            if job_id:
                primary_app = next((a for a in c.applications if a.job_id == job_id), None)
                if not primary_app:
                    continue
            else:
                primary_app = max(c.applications, key=lambda a: a.match_score or 0.0) if c.applications else None

            # Filter by status if requested
            if status and (not primary_app or primary_app.status != status):
                continue

            skills = [cs.skill.name for cs in c.skills if cs.skill]
            resume_name = c.resumes[0].file_name if c.resumes else None
            resume_id = c.resumes[0].id if c.resumes else None

            results.append({
                "id": c.id,
                "name": c.name,
                "email": c.email,
                "phone": c.phone,
                "location": c.location,
                "experience_years": c.experience_years,
                "education": c.education,
                "current_company": c.current_company,
                "current_role": c.current_role or (primary_app.job.title if primary_app and primary_app.job else "Applicant"),
                "summary": c.summary,
                "skills": skills,
                "match_score": primary_app.match_score if primary_app else 0.0,
                "status": primary_app.status if primary_app else "Applied",
                "recommendation": primary_app.recommendation if primary_app else "Review",
                "applied_job": primary_app.job.title if primary_app and primary_app.job else None,
                "applied_job_id": primary_app.job_id if primary_app else None,
                "application_id": primary_app.id if primary_app else None,
                "resume_file_name": resume_name,
                "resume_id": resume_id,
                "created_at": c.created_at,
                "updated_at": c.updated_at
            })

        return results

    def get_candidate_by_id(self, db: Session, candidate_id: int) -> Optional[Dict[str, Any]]:
        c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not c:
            return None

        primary_app = max(c.applications, key=lambda a: a.match_score or 0.0) if c.applications else None
        skills = [cs.skill.name for cs in c.skills if cs.skill]
        resume_name = c.resumes[0].file_name if c.resumes else None
        resume_id = c.resumes[0].id if c.resumes else None

        return {
            "id": c.id,
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
            "match_score": primary_app.match_score if primary_app else 0.0,
            "status": primary_app.status if primary_app else "Applied",
            "recommendation": primary_app.recommendation if primary_app else "Review",
            "applied_job": primary_app.job.title if primary_app and primary_app.job else None,
            "applied_job_id": primary_app.job_id if primary_app else None,
            "application_id": primary_app.id if primary_app else None,
            "resume_file_name": resume_name,
            "resume_id": resume_id,
            "created_at": c.created_at,
            "updated_at": c.updated_at
        }

    def create_candidate(self, db: Session, cand_in: CandidateCreate) -> Dict[str, Any]:
        # Reuse existing candidate if email exists
        candidate = None
        if cand_in.email:
            candidate = db.query(Candidate).filter(Candidate.email == cand_in.email).first()
        if not candidate and cand_in.name:
            candidate = db.query(Candidate).filter(Candidate.name == cand_in.name).first()

        if candidate:
            if cand_in.name:
                candidate.name = cand_in.name
            if cand_in.phone:
                candidate.phone = cand_in.phone
            if cand_in.location:
                candidate.location = cand_in.location
            if cand_in.experience_years is not None:
                candidate.experience_years = cand_in.experience_years
            if cand_in.education:
                candidate.education = cand_in.education
            if cand_in.current_company:
                candidate.current_company = cand_in.current_company
            if cand_in.current_role and cand_in.current_role != 'Applicant':
                candidate.current_role = cand_in.current_role
            if cand_in.summary:
                candidate.summary = cand_in.summary
        else:
            candidate = Candidate(
                name=cand_in.name,
                email=cand_in.email,
                phone=cand_in.phone,
                location=cand_in.location,
                experience_years=cand_in.experience_years or 0,
                education=cand_in.education,
                current_company=cand_in.current_company,
                current_role=cand_in.current_role,
                summary=cand_in.summary
            )
            db.add(candidate)
            db.flush()

        if cand_in.skills:
            # Clear old manual skills if re-attaching
            db.query(CandidateSkill).filter(
                CandidateSkill.candidate_id == candidate.id,
                CandidateSkill.source == "manual"
            ).delete()
            for s_name in cand_in.skills:
                skill = self._get_or_create_skill(db, s_name)
                cand_skill = db.query(CandidateSkill).filter(
                    CandidateSkill.candidate_id == candidate.id,
                    CandidateSkill.skill_id == skill.id
                ).first()
                if not cand_skill:
                    cand_skill = CandidateSkill(candidate_id=candidate.id, skill_id=skill.id, proficiency="intermediate", source="manual")
                    db.add(cand_skill)

        # Attach to job if specified
        if cand_in.job_id:
            job = db.query(Job).filter(Job.id == cand_in.job_id).first()
            if job:
                # Update candidate role to job title if current_role was generic
                if candidate.current_role in [None, 'Applicant', 'Candidate']:
                    candidate.current_role = job.title

                # Compute match score
                job_skills = [js.skill.name for js in job.skills if js.skill]
                match_res = calculate_comprehensive_match(
                    candidate_skills=cand_in.skills or [],
                    required_skills=job_skills,
                    candidate_exp_years=cand_in.experience_years or 0,
                    job_min_exp=job.experience_min,
                    job_max_exp=job.experience_max,
                    job_description=job.description or ""
                )

                # Check if application already exists
                existing_app = db.query(Application).filter(
                    Application.candidate_id == candidate.id,
                    Application.job_id == job.id
                ).first()

                if existing_app:
                    existing_app.match_score = cand_in.match_score or match_res["match_score"]
                    existing_app.recommendation = match_res["recommendation"]
                else:
                    app = Application(
                        candidate_id=candidate.id,
                        job_id=job.id,
                        status="Applied",
                        match_score=cand_in.match_score or match_res["match_score"],
                        recommendation=match_res["recommendation"]
                    )
                    db.add(app)

        db.commit()
        db.refresh(candidate)
        return self.get_candidate_by_id(db, candidate.id)

    def update_candidate(self, db: Session, candidate_id: int, cand_in: CandidateUpdate) -> Optional[Dict[str, Any]]:
        cand = db.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not cand:
            return None

        update_data = cand_in.dict(exclude_unset=True)
        skills = update_data.pop("skills", None)

        for key, value in update_data.items():
            setattr(cand, key, value)

        if skills is not None:
            db.query(CandidateSkill).filter(CandidateSkill.candidate_id == cand.id).delete()
            for s_name in skills:
                skill = self._get_or_create_skill(db, s_name)
                cand_skill = CandidateSkill(candidate_id=cand.id, skill_id=skill.id, proficiency="intermediate", source="manual")
                db.add(cand_skill)

        db.commit()
        db.refresh(cand)
        return self.get_candidate_by_id(db, cand.id)

    def delete_candidate(self, db: Session, candidate_id: int) -> bool:
        cand = db.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not cand:
            return False
        db.delete(cand)
        db.commit()
        return True

    def attach_to_job(self, db: Session, job_id: int, candidate_id: int) -> Dict[str, Any]:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise ValueError(f"Job with ID {job_id} not found")
        cand = db.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not cand:
            raise ValueError(f"Candidate with ID {candidate_id} not found")

        # Check if already attached
        existing_app = db.query(Application).filter(
            Application.job_id == job_id,
            Application.candidate_id == candidate_id
        ).first()

        cand_skills = [cs.skill.name for cs in cand.skills if cs.skill]
        job_skills = [js.skill.name for js in job.skills if js.skill]
        match_res = calculate_comprehensive_match(
            candidate_skills=cand_skills,
            required_skills=job_skills,
            candidate_exp_years=cand.experience_years,
            job_min_exp=job.experience_min,
            job_max_exp=job.experience_max,
            job_description=job.description or ""
        )

        if existing_app:
            existing_app.match_score = match_res["match_score"]
            existing_app.recommendation = match_res["recommendation"]
            db.commit()
            db.refresh(existing_app)
            return self.get_candidate_by_id(db, cand.id)

        new_app = Application(
            candidate_id=cand.id,
            job_id=job.id,
            status="Applied",
            match_score=match_res["match_score"],
            recommendation=match_res["recommendation"]
        )
        db.add(new_app)
        db.commit()
        return self.get_candidate_by_id(db, cand.id)

    def update_application_status(self, db: Session, application_id: int, new_status: str) -> Dict[str, Any]:
        app = db.query(Application).filter(Application.id == application_id).first()
        if not app:
            raise ValueError(f"Application with ID {application_id} not found")
        app.status = new_status
        db.commit()
        db.refresh(app)
        return {
            "id": app.id,
            "candidate_id": app.candidate_id,
            "job_id": app.job_id,
            "status": app.status,
            "match_score": app.match_score,
            "recommendation": app.recommendation,
            "applied_at": app.applied_at,
            "updated_at": app.updated_at
        }

    def get_candidate_resume(self, db: Session, candidate_id: int) -> Optional[Dict[str, Any]]:
        cand = db.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not cand or not cand.resumes:
            return None
        r = cand.resumes[0]
        return {
            "id": r.id,
            "candidate_id": r.candidate_id,
            "file_name": r.file_name,
            "file_path": r.file_path,
            "file_type": r.file_type,
            "extracted_text": r.extracted_text,
            "uploaded_at": r.uploaded_at
        }

    def get_candidate_interviews(self, db: Session, candidate_id: int) -> List[Dict[str, Any]]:
        interviews = db.query(Interview).filter(Interview.candidate_id == candidate_id).all()
        return [
            {
                "id": i.id,
                "candidate_id": i.candidate_id,
                "job_id": i.job_id,
                "job_title": i.job.title if i.job else "",
                "scheduled_at": i.scheduled_at,
                "duration": i.duration,
                "interview_type": i.interview_type,
                "interviewer": i.interviewer,
                "status": i.status,
                "notes": i.notes,
                "created_at": i.created_at
            }
            for i in interviews
        ]

candidate_service = CandidateService()
