import os
import json
import logging
import re
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.interview import InterviewQuestion

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = getattr(settings, "GEMINI_MODEL", "gemini-3.6-flash")
        self._client = None

    def _get_client(self):
        if self._client is None and self.is_available():
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key.strip())
            except Exception as e:
                logger.error(f"Failed to initialize Google GenAI Client: {e}")
                self._client = None
        return self._client

    def is_available(self) -> bool:
        """Check if a real Gemini API key is configured."""
        return bool(
            self.api_key and 
            self.api_key.strip() and 
            not self.api_key.startswith("your-") and
            len(self.api_key.strip()) > 10
        )

    def generate_interview_questions(
        self,
        candidate_name: str,
        job_title: str,
        experience_years: int = 0,
        education: str = "Not detected",
        candidate_skills: Optional[List[str]] = None,
        job_description: str = "",
        required_skills: Optional[List[str]] = None,
        match_score: float = 0.0,
        matched_skills: Optional[List[str]] = None,
        missing_skills: Optional[List[str]] = None,
        resume_text: str = "",
        candidate_id: Optional[int] = None,
        job_id: Optional[int] = None,
        db: Optional[Session] = None
    ) -> List[Dict[str, Any]]:
        """
        Generate exactly 5 personalized, score-aware, skill-gap-focused interview questions using Google Gemini API.
        """
        candidate_skills = candidate_skills or []
        required_skills = required_skills or []
        matched_skills = matched_skills or []
        missing_skills = missing_skills or []

        questions = None

        if self.is_available():
            try:
                client = self._get_client()
                if client:
                    prompt = self._build_prompt(
                        candidate_name=candidate_name,
                        job_title=job_title,
                        experience_years=experience_years,
                        education=education,
                        candidate_skills=candidate_skills,
                        job_description=job_description,
                        required_skills=required_skills,
                        match_score=match_score,
                        matched_skills=matched_skills,
                        missing_skills=missing_skills,
                        resume_text=resume_text
                    )

                    response = client.models.generate_content(
                        model=self.model_name,
                        contents=prompt,
                    )

                    if response and response.text:
                        questions = self._parse_json_response(response.text)
            except Exception as e:
                logger.warning(f"Google Gemini question generation failed: {e}. Falling back to rule-based questions.")

        # If Gemini API was unavailable or errored, generate intelligent fallback questions
        if not questions or len(questions) < 5:
            questions = self._generate_fallback_questions(
                candidate_name=candidate_name,
                job_title=job_title,
                experience_years=experience_years,
                matched_skills=matched_skills,
                missing_skills=missing_skills,
                match_score=match_score
            )

        # Ensure exactly 5 questions
        questions = questions[:5]

        # Persist to database if db session and foreign keys are supplied
        if db and candidate_id and job_id:
            try:
                self._persist_questions_to_db(db, candidate_id, job_id, questions)
            except Exception as db_err:
                logger.warning(f"Could not persist interview questions to MySQL: {db_err}")

        return questions

    def _build_prompt(
        self,
        candidate_name: str,
        job_title: str,
        experience_years: int,
        education: str,
        candidate_skills: List[str],
        job_description: str,
        required_skills: List[str],
        match_score: float,
        matched_skills: List[str],
        missing_skills: List[str],
        resume_text: str
    ) -> str:
        # Score-conditioned focus
        if match_score >= 80:
            score_guidance = (
                "The candidate is a HIGH MATCH (Score: " + f"{match_score:.1f}" + "%). "
                "Focus on advanced system design, architectural trade-offs, performance optimization, and depth in verified skills."
            )
        elif match_score >= 50:
            score_guidance = (
                "The candidate is a MEDIUM MATCH (Score: " + f"{match_score:.1f}" + "%). "
                "Validate both core strengths and probe adaptability regarding identified missing requirements."
            )
        else:
            score_guidance = (
                "The candidate is a LOW MATCH (Score: " + f"{match_score:.1f}" + "%). "
                "Assess fundamentals, problem-solving aptitude, and how quickly the candidate can bridge missing skill gaps."
            )

        prompt = f"""You are an AI recruitment interview assistant.

Generate personalized interview questions for this candidate.
Use ONLY the supplied candidate information and job information.
Do not invent candidate experience, projects, skills or achievements.

Consider:
- candidate resume
- job requirements
- match score
- matched skills
- missing skills
- candidate experience

CANDIDATE INFORMATION:
- Name: {candidate_name}
- Total Experience: {experience_years} years
- Education: {education}
- Verified Candidate Skills: {', '.join(candidate_skills) if candidate_skills else 'None listed'}
- Excerpt from Resume: {resume_text[:600]}

TARGET JOB REQUISITION:
- Target Job: {job_title}
- Required Job Skills: {', '.join(required_skills) if required_skills else 'Standard role skills'}
- Job Overview: {job_description[:300]}

DETERMINISTIC EVALUATION METRICS:
- Match Score: {match_score:.1f}%
- Matched Skills: {', '.join(matched_skills) if matched_skills else 'None'}
- Missing Skills: {', '.join(missing_skills) if missing_skills else 'None'}

SCORE GUIDANCE:
{score_guidance}

REQUIREMENTS:
Generate exactly 5 interview questions.
Questions should be relevant to the candidate and target job.
Mix:
- Technical
- Experience-based
- Skill validation
- Problem-solving
- Skill-gap questions

If the candidate has a missing required skill (such as {', '.join(missing_skills[:3]) if missing_skills else 'any unverified prerequisite'}), include an appropriate question to assess that skill.

IMPORTANT: Do not include protected or sensitive demographic attributes.
Return JSON only in this exact format:
{{
  "questions": [
    {{
      "question": "The interview question text",
      "type": "Technical" | "Experience-based" | "Skill validation" | "Problem-solving" | "Skill-gap",
      "difficulty": "Easy" | "Medium" | "Hard",
      "reason": "Why this question was generated based on the candidate's background, score, or skill gaps"
    }}
  ]
}}
"""
        return prompt

    def _parse_json_response(self, raw_text: str) -> Optional[List[Dict[str, Any]]]:
        """Safely parse JSON response from Gemini."""
        text = raw_text.strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)
            text = text.strip()

        try:
            data = json.loads(text)
            if isinstance(data, dict) and "questions" in data and isinstance(data["questions"], list):
                valid_questions = []
                for q in data["questions"]:
                    if isinstance(q, dict) and "question" in q:
                        valid_questions.append({
                            "question": q.get("question", "").strip(),
                            "type": q.get("type", "Technical"),
                            "difficulty": q.get("difficulty", "Medium"),
                            "reason": q.get("reason", "Generated from candidate profile and role requirements")
                        })
                if valid_questions:
                    return valid_questions
        except Exception as e:
            logger.warning(f"Error parsing Gemini JSON response: {e}")

        return None

    def _generate_fallback_questions(
        self,
        candidate_name: str,
        job_title: str,
        experience_years: int,
        matched_skills: List[str],
        missing_skills: List[str],
        match_score: float
    ) -> List[Dict[str, Any]]:
        """Intelligent, score-aware fallback question generation."""
        s1 = matched_skills[0] if matched_skills else "core technologies"
        s2 = matched_skills[1] if len(matched_skills) > 1 else "system design"
        m1 = missing_skills[0] if missing_skills else None
        m2 = missing_skills[1] if len(missing_skills) > 1 else None

        questions = []

        # 1. Technical / Architecture
        if match_score >= 80:
            questions.append({
                "question": f"Given your deep experience with {s1}, how would you architect a distributed, high-throughput service in {job_title} to guarantee low latency and fault tolerance?",
                "type": "Technical",
                "difficulty": "Hard",
                "reason": f"Evaluates advanced architectural design with verified core competency: {s1}."
            })
        else:
            questions.append({
                "question": f"Can you explain your workflow for debugging and resolving critical bottlenecks when developing with {s1}?",
                "type": "Technical",
                "difficulty": "Medium",
                "reason": f"Verifies practical problem-solving capability in {s1}."
            })

        # 2. Skill-gap assessment
        if m1:
            questions.append({
                "question": f"The {job_title} role relies on {m1}. What hands-on experience or transferable conceptual knowledge do you have with {m1} or related tools?",
                "type": "Skill-gap",
                "difficulty": "Medium",
                "reason": f"Identified skill gap in target requisition: {m1}."
            })
        else:
            questions.append({
                "question": f"How do you approach end-to-end testing, CI/CD integration, and production monitoring for {s2} implementations?",
                "type": "Skill validation",
                "difficulty": "Medium",
                "reason": f"Assesses production readiness across verified stack: {s2}."
            })

        # 3. Experience-based
        exp_text = f"over {experience_years} years of experience" if experience_years > 0 else "your recent projects"
        questions.append({
            "question": f"Reflecting on {exp_text}, walk us through a challenging technical hurdle you solved for {job_title}. What trade-offs did you make?",
            "type": "Experience-based",
            "difficulty": "Medium",
            "reason": "Validates actual hands-on domain experience and technical decision-making."
        })

        # 4. Problem-solving
        if m2:
            questions.append({
                "question": f"If tasked with delivering a feature requiring {m2} under a strict deadline, how would you quickly upskill and ensure best practices?",
                "type": "Problem-solving",
                "difficulty": "Medium",
                "reason": f"Probes technical adaptability for required competency: {m2}."
            })
        else:
            questions.append({
                "question": f"How would you handle a sudden 10x surge in workload or query complexity in your {s1} and {s2} data layer?",
                "type": "Problem-solving",
                "difficulty": "Hard" if match_score >= 80 else "Medium",
                "reason": "Assesses performance optimization and resilience under scale."
            })

        # 5. Domain / Quality validation
        questions.append({
            "question": f"How do you maintain high code quality, comprehensive test coverage, and clear documentation when collaborating with cross-functional teams in {job_title}?",
            "type": "Skill validation",
            "difficulty": "Easy" if match_score < 50 else "Medium",
            "reason": "Evaluates engineering standards, communication, and team alignment."
        })

        return questions

    def _persist_questions_to_db(
        self,
        db: Session,
        candidate_id: int,
        job_id: int,
        questions: List[Dict[str, Any]]
    ):
        """Persist generated interview questions into the database."""
        for q in questions:
            # Check if identical question exists for this candidate/job
            existing = db.query(InterviewQuestion).filter(
                InterviewQuestion.candidate_id == candidate_id,
                InterviewQuestion.job_id == job_id,
                InterviewQuestion.question == q["question"]
            ).first()
            if not existing:
                record = InterviewQuestion(
                    candidate_id=candidate_id,
                    job_id=job_id,
                    question=q["question"],
                    category=q.get("type", "Technical"),
                    difficulty=q.get("difficulty", "Medium")
                )
                db.add(record)
        db.commit()

    def parse_job_description(self, jd_text: str, filename: str = "") -> Dict[str, Any]:
        """
        Extract structured Job Requisition fields from JD text using Gemini AI with robust rule-based fallback.
        """
        from app.utils.file_parser import extract_jd_info_from_text
        
        fallback_data = extract_jd_info_from_text(jd_text, filename)
        if not self.is_available():
            return fallback_data

        try:
            client = self._get_client()
            if not client:
                return fallback_data

            prompt = f"""
You are an expert technical recruiter and ATS specialist. Extract structured job requisition information from the provided Job Description text.

JOB DESCRIPTION TEXT:
{jd_text[:4000]}

FILENAME: {filename}

Return a valid JSON object ONLY with the following keys and exact structure:
{{
  "title": "Clear concise job title (e.g. Senior Frontend Engineer)",
  "department": "One of: Engineering, Product Design, Data & AI, Infrastructure, Product Management, People Operations",
  "location": "One of: Bengaluru, Karnataka | Pune, Maharashtra | Ahmedabad, Gujarat | Mumbai, Maharashtra | Hyderabad, Telangana | Delhi NCR | Remote (India / Global)",
  "employment_type": "One of: Remote | Work from Home | Work from Office | Hybrid",
  "experience_level": "One of: Entry-Level (0-2 yrs) | Mid-Level (2-4 yrs) | Mid-Senior (3-5 yrs) | Senior (5+ yrs) | Staff / Lead (7+ yrs)",
  "experience_min": integer minimum years,
  "experience_max": integer maximum years,
  "salary_range": "e.g. ₹12,00,000 - ₹18,00,000 / year or detected salary",
  "description": "Clean, structured overview and responsibilities text extracted from the JD",
  "required_skills": ["List", "of", "must-have", "technical", "skills"],
  "nice_to_have_skills": ["List", "of", "nice-to-have", "bonus", "skills"]
}}
"""
            response = client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )

            if response and response.text:
                json_text = response.text.strip()
                if json_text.startswith("```json"):
                    json_text = json_text[7:]
                elif json_text.startswith("```"):
                    json_text = json_text[3:]
                if json_text.endswith("```"):
                    json_text = json_text[:-3]
                parsed = json.loads(json_text.strip())

                # Validate and merge with fallback
                return {
                    "title": parsed.get("title") or fallback_data["title"],
                    "department": parsed.get("department") or fallback_data["department"],
                    "location": parsed.get("location") or fallback_data["location"],
                    "employment_type": parsed.get("employment_type") or fallback_data["employment_type"],
                    "experience_level": parsed.get("experience_level") or fallback_data["experience_level"],
                    "experience_min": parsed.get("experience_min", fallback_data["experience_min"]),
                    "experience_max": parsed.get("experience_max", fallback_data["experience_max"]),
                    "salary_range": parsed.get("salary_range") or fallback_data["salary_range"],
                    "description": jd_text.strip() if (jd_text and jd_text.strip()) else (fallback_data.get("description") or ""),
                    "required_skills": parsed.get("required_skills") if isinstance(parsed.get("required_skills"), list) and parsed.get("required_skills") else fallback_data["required_skills"],
                    "nice_to_have_skills": parsed.get("nice_to_have_skills") if isinstance(parsed.get("nice_to_have_skills"), list) else fallback_data["nice_to_have_skills"],
                    "file_name": filename
                }
        except Exception as e:
            logger.warning(f"Gemini JD parsing failed: {e}. Using rule-based fallback.")

        return fallback_data

gemini_service = GeminiService()
 