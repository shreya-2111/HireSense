from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.interview import Interview, InterviewQuestion
from app.models.candidate import Candidate
from app.models.job import Job
from app.schemas.interview import InterviewCreate, InterviewUpdate, InterviewQuestionGenerateRequest
from app.services.llm_service import llm_service

class InterviewService:
    def get_all_interviews(
        self,
        db: Session,
        status: Optional[str] = None,
        job_id: Optional[int] = None,
        candidate_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        query = db.query(Interview)
        if status:
            query = query.filter(Interview.status == status)
        if job_id:
            query = query.filter(Interview.job_id == job_id)
        if candidate_id:
            query = query.filter(Interview.candidate_id == candidate_id)

        interviews = query.order_by(Interview.scheduled_at.asc()).all()
        results = []
        for i in interviews:
            results.append({
                "id": i.id,
                "candidate_id": i.candidate_id,
                "candidate_name": i.candidate.name if i.candidate else "Candidate",
                "candidate_role": i.candidate.current_role if i.candidate else "",
                "job_id": i.job_id,
                "job_title": i.job.title if i.job else "Job",
                "scheduled_at": i.scheduled_at,
                "duration": i.duration,
                "interview_type": i.interview_type,
                "interviewer": i.interviewer,
                "status": i.status,
                "notes": i.notes,
                "questions": [
                    {
                        "id": q.id,
                        "question": q.question,
                        "category": q.category,
                        "difficulty": q.difficulty,
                        "candidate_id": q.candidate_id,
                        "job_id": q.job_id,
                        "interview_id": q.interview_id,
                        "created_at": q.created_at
                    }
                    for q in i.questions
                ],
                "created_at": i.created_at,
                "updated_at": i.updated_at
            })
        return results

    def get_interview_by_id(self, db: Session, interview_id: int) -> Optional[Dict[str, Any]]:
        i = db.query(Interview).filter(Interview.id == interview_id).first()
        if not i:
            return None
        return {
            "id": i.id,
            "candidate_id": i.candidate_id,
            "candidate_name": i.candidate.name if i.candidate else "Candidate",
            "candidate_role": i.candidate.current_role if i.candidate else "",
            "job_id": i.job_id,
            "job_title": i.job.title if i.job else "Job",
            "scheduled_at": i.scheduled_at,
            "duration": i.duration,
            "interview_type": i.interview_type,
            "interviewer": i.interviewer,
            "status": i.status,
            "notes": i.notes,
            "questions": [
                {
                    "id": q.id,
                    "question": q.question,
                    "category": q.category,
                    "difficulty": q.difficulty,
                    "candidate_id": q.candidate_id,
                    "job_id": q.job_id,
                    "interview_id": q.interview_id,
                    "created_at": q.created_at
                }
                for q in i.questions
            ],
            "created_at": i.created_at,
            "updated_at": i.updated_at
        }

    def create_interview(self, db: Session, int_in: InterviewCreate) -> Dict[str, Any]:
        interview = Interview(
            candidate_id=int_in.candidate_id,
            job_id=int_in.job_id,
            scheduled_at=int_in.scheduled_at,
            duration=int_in.duration or 45,
            interview_type=int_in.interview_type or "Technical Round",
            interviewer=int_in.interviewer or "Sarah Lin",
            status=int_in.status or "Scheduled",
            notes=int_in.notes
        )
        db.add(interview)
        db.commit()
        db.refresh(interview)
        return self.get_interview_by_id(db, interview.id)

    def update_interview(self, db: Session, interview_id: int, int_in: InterviewUpdate) -> Optional[Dict[str, Any]]:
        interview = db.query(Interview).filter(Interview.id == interview_id).first()
        if not interview:
            return None
        
        update_data = int_in.dict(exclude_unset=True)
        for k, v in update_data.items():
            setattr(interview, k, v)

        db.commit()
        db.refresh(interview)
        return self.get_interview_by_id(db, interview.id)

    def delete_interview(self, db: Session, interview_id: int) -> bool:
        interview = db.query(Interview).filter(Interview.id == interview_id).first()
        if not interview:
            return False
        db.delete(interview)
        db.commit()
        return True

    def update_notes(self, db: Session, interview_id: int, notes: str) -> Dict[str, Any]:
        interview = db.query(Interview).filter(Interview.id == interview_id).first()
        if not interview:
            raise ValueError(f"Interview with ID {interview_id} not found")
        interview.notes = notes
        db.commit()
        db.refresh(interview)
        return self.get_interview_by_id(db, interview.id)

    def generate_questions(self, db: Session, req: InterviewQuestionGenerateRequest) -> List[Dict[str, Any]]:
        candidate_name = req.candidate_name or "Candidate"
        job_title = req.job_title or "Software Engineer"
        skills = req.skills or []
        job_desc = ""
        resume_text = ""

        if req.candidate_id:
            cand = db.query(Candidate).filter(Candidate.id == req.candidate_id).first()
            if cand:
                candidate_name = cand.name
                if not skills and cand.skills:
                    skills = [cs.skill.name for cs in cand.skills if cs.skill]
                if cand.resumes:
                    resume_text = cand.resumes[0].extracted_text or ""

        if req.job_id:
            job = db.query(Job).filter(Job.id == req.job_id).first()
            if job:
                job_title = job.title
                job_desc = job.description or ""
                if not skills and job.skills:
                    skills = [js.skill.name for js in job.skills if js.skill]

        # Call LLM service for questions
        raw_questions = llm_service.generate_interview_questions(
            candidate_name=candidate_name,
            job_title=job_title,
            category=req.category or "Technical",
            difficulty=req.difficulty or "Medium",
            quantity=req.quantity or 5,
            skills=skills,
            job_description=job_desc,
            resume_text=resume_text
        )

        saved_records = []
        for q_item in raw_questions:
            q_record = InterviewQuestion(
                candidate_id=req.candidate_id,
                job_id=req.job_id,
                question=q_item["question"],
                category=q_item.get("category", req.category or "Technical"),
                difficulty=q_item.get("difficulty", req.difficulty or "Medium")
            )
            db.add(q_record)
            db.flush()
            saved_records.append({
                "id": q_record.id,
                "question": q_record.question,
                "category": q_record.category,
                "difficulty": q_record.difficulty,
                "candidate_id": q_record.candidate_id,
                "job_id": q_record.job_id,
                "created_at": q_record.created_at
            })

        db.commit()
        return saved_records

    def delete_question(self, db: Session, question_id: int) -> bool:
        q = db.query(InterviewQuestion).filter(InterviewQuestion.id == question_id).first()
        if not q:
            return False
        db.delete(q)
        db.commit()
        return True

interview_service = InterviewService()
