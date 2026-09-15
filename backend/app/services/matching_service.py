from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.job import Job
from app.models.candidate import Candidate
from app.models.resume import Resume, ResumeAnalysis
from app.models.application import Application
from app.utils.scoring import calculate_comprehensive_match
from app.utils.file_parser import extract_candidate_info_from_text
from app.services.gemini_service import gemini_service

class MatchingService:
    def analyze_resume_for_job(
        self,
        db: Session,
        job_id: int,
        resume_id: Optional[int] = None,
        candidate_id: Optional[int] = None,
        resume_text: Optional[str] = None,
        required_skills: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Analyze a candidate resume against a job, save the analysis, and generate AI interview questions.
        """
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise ValueError(f"Job with ID {job_id} not found")

        # Get job required skills
        db_job_skills = [js.skill.name for js in job.skills if js.skill]
        if required_skills and len(required_skills) > 0:
            # Merge explicit required skills if provided
            job_skills = list(dict.fromkeys(required_skills + db_job_skills))
        else:
            job_skills = db_job_skills

        # Fetch resume / candidate
        resume = None
        candidate = None
        if resume_id:
            resume = db.query(Resume).filter(Resume.id == resume_id).first()
            if resume:
                candidate = resume.candidate
                resume_text = resume.extracted_text or resume_text
        elif candidate_id:
            candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
            if candidate and candidate.resumes:
                resume = candidate.resumes[0]
                resume_text = resume.extracted_text or resume_text

        # Extract structured details from text if available
        parsed_details = extract_candidate_info_from_text(resume_text or "") if resume_text else {}

        candidate_skills = []
        if candidate and candidate.skills:
            candidate_skills = [cs.skill.name for cs in candidate.skills if cs.skill]
        elif parsed_details.get("skills"):
            candidate_skills = parsed_details.get("skills", [])

        candidate_exp = candidate.experience_years if candidate else parsed_details.get("experience_years", 0)
        cand_edu = candidate.education if (candidate and candidate.education) else parsed_details.get("education")

        # Run scoring calculation with Universal Skill Intelligence
        match_result = calculate_comprehensive_match(
            candidate_skills=candidate_skills,
            required_skills=job_skills,
            candidate_exp_years=candidate_exp,
            job_min_exp=job.experience_min,
            job_max_exp=job.experience_max,
            candidate_text=resume_text or "",
            job_description=job.description or "",
            db=db
        )

        # Save analysis record to database if resume exists
        analysis_id = None
        if resume:
            existing_analysis = db.query(ResumeAnalysis).filter(
                ResumeAnalysis.resume_id == resume.id,
                ResumeAnalysis.job_id == job.id
            ).first()

            if existing_analysis:
                existing_analysis.match_score = match_result["match_score"]
                existing_analysis.summary = match_result["summary"]
                existing_analysis.matched_skills = match_result["matched_skills"]
                existing_analysis.inferred_skills = match_result.get("inferred_skills", [])
                existing_analysis.related_skills = match_result.get("related_skills", [])
                existing_analysis.missing_skills = match_result["missing_skills"]
                existing_analysis.skill_match_details = match_result.get("skill_match_details", [])
                existing_analysis.skill_match_summary = match_result.get("skill_match_summary", {})
                existing_analysis.experience_match = match_result["experience_match"]
                existing_analysis.education_match = match_result["education_match"]
                existing_analysis.recommendation = match_result["recommendation"]
                analysis_id = existing_analysis.id
            else:
                new_analysis = ResumeAnalysis(
                    resume_id=resume.id,
                    job_id=job.id,
                    match_score=match_result["match_score"],
                    summary=match_result["summary"],
                    matched_skills=match_result["matched_skills"],
                    inferred_skills=match_result.get("inferred_skills", []),
                    related_skills=match_result.get("related_skills", []),
                    missing_skills=match_result["missing_skills"],
                    skill_match_details=match_result.get("skill_match_details", []),
                    skill_match_summary=match_result.get("skill_match_summary", {}),
                    experience_match=match_result["experience_match"],
                    education_match=match_result["education_match"],
                    recommendation=match_result["recommendation"]
                )
                db.add(new_analysis)
                db.flush()
                analysis_id = new_analysis.id

        # Update or create candidate application record with real match score
        if candidate:
            application = db.query(Application).filter(
                Application.candidate_id == candidate.id,
                Application.job_id == job.id
            ).first()
            if application:
                application.match_score = match_result["match_score"]
                application.recommendation = match_result["recommendation"]
            else:
                application = Application(
                    candidate_id=candidate.id,
                    job_id=job.id,
                    status="Applied",
                    match_score=match_result["match_score"],
                    recommendation=match_result["recommendation"]
                )
                db.add(application)

            if not candidate.current_role or candidate.current_role in ['Applicant', 'Candidate', 'General Application']:
                candidate.current_role = job.title

        db.commit()

        candidate_name = candidate.name if candidate else parsed_details.get("candidate_name", "Candidate Profile")
        candidate_email = candidate.email if candidate else parsed_details.get("email")
        candidate_phone = candidate.phone if candidate else parsed_details.get("phone")
        candidate_location = candidate.location if candidate else parsed_details.get("location")
        final_exp = candidate.experience_years if (candidate and candidate.experience_years) else candidate_exp

        # Generate personalized AI interview questions via Gemini
        ai_questions = gemini_service.generate_interview_questions(
            candidate_name=candidate_name,
            job_title=job.title,
            experience_years=final_exp,
            education=cand_edu or "Not detected",
            candidate_skills=candidate_skills,
            job_description=job.description or "",
            required_skills=job_skills,
            match_score=match_result["match_score"],
            matched_skills=match_result["matched_skills"],
            missing_skills=match_result["missing_skills"],
            resume_text=resume_text or "",
            candidate_id=candidate.id if candidate else None,
            job_id=job.id,
            db=db
        )

        return {
            "id": analysis_id,
            "resume_id": resume.id if resume else None,
            "candidate_id": candidate.id if candidate else None,
            "candidate_name": candidate_name,
            "candidate_email": candidate_email,
            "phone": candidate_phone,
            "location": candidate_location,
            "linkedin": parsed_details.get("linkedin"),
            "github": parsed_details.get("github"),
            "experience_years": final_exp,
            "education": cand_edu or "Not detected",
            "degree": parsed_details.get("degree"),
            "university": parsed_details.get("university"),
            "companies": parsed_details.get("companies", []),
            "job_titles": parsed_details.get("job_titles", []),
            "projects": parsed_details.get("projects", []),
            "certifications": parsed_details.get("certifications", []),
            "job_id": job.id,
            "job_title": job.title,
            "match_score": match_result["match_score"],
            "summary": match_result["summary"],
            "matched_skills": match_result["matched_skills"],
            "direct_skills": match_result.get("direct_skills", []),
            "inferred_skills": match_result.get("inferred_skills", []),
            "inferred_matches": match_result.get("inferred_matches", []),
            "related_skills": match_result.get("related_skills", []),
            "related_matches": match_result.get("related_matches", []),
            "missing_skills": match_result["missing_skills"],
            "skill_match_summary": match_result.get("skill_match_summary", {}),
            "skill_match_details": match_result.get("skill_match_details", []),
            "experience_match": match_result["experience_match"],
            "education_match": match_result["education_match"],
            "recommendation": match_result["recommendation"],
            "strengths": match_result["strengths"],
            "interview_focus": match_result["interview_focus"],
            "interview_questions": match_result["interview_focus"],
            "ai_questions": ai_questions,
            "breakdown": match_result["breakdown"]
        }
 
matching_service = MatchingService()
