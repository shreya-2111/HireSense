import os
import re
import uuid
from typing import Dict, Any, Optional
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.candidate import Candidate
from app.models.skill import Skill, CandidateSkill
from app.models.resume import Resume
from app.utils.file_parser import extract_text_from_file, extract_candidate_info_from_text
from app.utils.scoring import normalize_skill_name

ALLOWED_EXTENSIONS = {"pdf", "docx", "doc", "txt"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

class ResumeService:
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
 
    async def process_resume_upload(
        self,
        db: Session,
        file: UploadFile,
        candidate_id: Optional[int] = None
    ) -> Dict[str, Any]:
        # 1. Validate extension
        filename = file.filename or "resume.pdf"
        ext = filename.lower().split('.')[-1]
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            )

        # 2. Read bytes and check size
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File exceeds maximum allowed size of 10MB"
            )

        # 3. Ensure uploads directory exists and save file
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        unique_filename = f"{uuid.uuid4().hex[:8]}_{filename}"
        saved_file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

        with open(saved_file_path, "wb") as f:
            f.write(contents)

        # 4. Extract text & structured data
        try:
            extracted_text = extract_text_from_file(contents, filename)
        except Exception as e:
            extracted_text = f"Error extracting text: {str(e)}"

        parsed_info = extract_candidate_info_from_text(extracted_text, filename)

        # 5. Link or create Candidate
        candidate = None
        cand_name = parsed_info.get("candidate_name") or "Candidate Profile"
        cand_email = parsed_info.get("email")
        if not cand_email:
            clean_prefix = re.sub(r'[^a-zA-Z0-9]', '.', cand_name.lower().strip()).strip('.')
            cand_email = f"{clean_prefix or 'candidate'}@applicant.hiresense.local"

        if candidate_id:
            candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()

        if not candidate:
            # Check by email if candidate exists
            existing = db.query(Candidate).filter(Candidate.email == cand_email).first()
            if existing:
                candidate = existing
                if parsed_info.get("candidate_name") and parsed_info["candidate_name"] != "Candidate Profile":
                    candidate.name = parsed_info["candidate_name"]
                if parsed_info.get("education") and parsed_info["education"] != "Not detected":
                    candidate.education = parsed_info["education"]
                if parsed_info.get("experience_years") is not None:
                    candidate.experience_years = parsed_info["experience_years"]
                if parsed_info.get("phone"):
                    candidate.phone = parsed_info["phone"]
                if parsed_info.get("location"):
                    candidate.location = parsed_info["location"]
                if parsed_info.get("summary"):
                    candidate.summary = parsed_info["summary"]
            else:
                candidate = Candidate(
                    name=cand_name,
                    email=cand_email,
                    phone=parsed_info.get("phone"),
                    location=parsed_info.get("location"),
                    education=parsed_info.get("education") or "Not detected",
                    experience_years=parsed_info.get("experience_years", 0),
                    current_role="Applicant",
                    summary=parsed_info.get("summary")
                )
                db.add(candidate)
                db.flush()

        # Update candidate skills from resume
        for s_name in parsed_info["skills"]:
            skill = self._get_or_create_skill(db, s_name)
            cand_skill = db.query(CandidateSkill).filter(
                CandidateSkill.candidate_id == candidate.id,
                CandidateSkill.skill_id == skill.id
            ).first()
            if not cand_skill:
                cand_skill = CandidateSkill(
                    candidate_id=candidate.id,
                    skill_id=skill.id,
                    proficiency="intermediate",
                    source="extracted"
                )
                db.add(cand_skill)

        # 6. Save Resume Record
        resume = Resume(
            candidate_id=candidate.id,
            file_name=filename,
            file_path=saved_file_path,
            file_type=ext,
            extracted_text=extracted_text
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)

        return {
            "resume_id": resume.id,
            "candidate_id": candidate.id,
            "candidate_name": candidate.name,
            "email": candidate.email,
            "phone": candidate.phone,
            "location": parsed_info.get("location") or candidate.location,
            "linkedin": parsed_info.get("linkedin"),
            "github": parsed_info.get("github"),
            "education": candidate.education or parsed_info.get("education"),
            "degree": parsed_info.get("degree"),
            "university": parsed_info.get("university"),
            "experience_years": candidate.experience_years,
            "companies": parsed_info.get("companies", []),
            "job_titles": parsed_info.get("job_titles", []),
            "skills": parsed_info["skills"],
            "projects": parsed_info.get("projects", []),
            "certifications": parsed_info.get("certifications", []),
            "summary": parsed_info["summary"],
            "file_name": filename,
            "file_path": saved_file_path,
            "file_type": ext,
            "extracted_text": extracted_text
        }

resume_service = ResumeService()
