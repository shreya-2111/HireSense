import os
import json
import logging
from typing import List, Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = settings.LLM_MODEL

    def is_available(self) -> bool:
        """Check if a real LLM API key is configured."""
        return bool(self.api_key and self.api_key.strip() and not self.api_key.startswith("your-"))

    def generate_interview_questions(
        self,
        candidate_name: str,
        job_title: str,
        category: str = "Technical",
        difficulty: str = "Medium",
        quantity: int = 5,
        skills: List[str] = None,
        job_description: str = "",
        resume_text: str = ""
    ) -> List[Dict[str, str]]:
        """
        Generate intelligent interview questions.
        Uses OpenAI/LLM if API key is provided; otherwise uses deterministic smart templates.
        """
        if self.is_available():
            try:
                import urllib.request
                prompt = (
                    f"You are a Senior Technical Recruiter. Generate exactly {quantity} interview questions "
                    f"for candidate '{candidate_name}' interviewing for '{job_title}'.\n"
                    f"Category: {category}\nDifficulty: {difficulty}\n"
                    f"Candidate Skills: {', '.join(skills or [])}\n"
                    f"Job Context: {job_description[:300]}\n"
                    f"Return ONLY a JSON array of objects with keys 'question', 'category', 'difficulty'."
                )
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}"
                }
                body = {
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": "You generate targeted interview questions in strict JSON array format."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7
                }
                req = urllib.request.Request(
                    "https://api.openai.com/v1/chat/completions",
                    data=json.dumps(body).encode("utf-8"),
                    headers=headers,
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=10) as response:
                    res_data = json.loads(response.read().decode("utf-8"))
                    content = res_data["choices"][0]["message"]["content"].strip()
                    # Clean markdown code block if returned
                    if content.startswith("```"):
                        content = content.split("```")[1]
                        if content.startswith("json"):
                            content = content[4:]
                    questions = json.loads(content)
                    if isinstance(questions, list) and len(questions) > 0:
                        return [
                            {
                                "question": q.get("question", str(q)),
                                "category": q.get("category", category),
                                "difficulty": q.get("difficulty", difficulty)
                            }
                            for q in questions[:quantity]
                        ]
            except Exception as e:
                logger.warning(f"LLM API call failed, falling back to rule-based questions: {e}")

        # Graceful Deterministic Fallback Questions based on role, category, skills
        return self._generate_fallback_questions(candidate_name, job_title, category, difficulty, quantity, skills)

    def _generate_fallback_questions(
        self,
        candidate_name: str,
        job_title: str,
        category: str,
        difficulty: str,
        quantity: int,
        skills: List[str] = None
    ) -> List[Dict[str, str]]:
        skill_1 = skills[0] if skills and len(skills) > 0 else "core framework"
        skill_2 = skills[1] if skills and len(skills) > 1 else "system architecture"
        skill_3 = skills[2] if skills and len(skills) > 2 else "database scaling"

        catalog = {
            "Technical": [
                f"How would you architect a production application in {skill_1} to ensure high performance and maintainability?",
                f"Explain how you approach error handling, retries, and circuit breakers in a {skill_2} environment.",
                f"What strategies do you use for query optimization and indexing when working with {skill_3}?",
                f"Can you explain the trade-offs between monolithic architecture and microservices in the context of {job_title}?",
                f"Describe how you design secure RESTful APIs with token validation and role-based access control.",
                f"Walk me through how you optimize frontend bundle sizes and web vitals when using {skill_1}.",
                f"How do you implement CI/CD automated test pipelines and zero-downtime deployments?",
                f"Explain how you debug memory leaks and race conditions in production systems."
            ],
            "Behavioral": [
                "Tell me about a time you had a critical disagreement with a senior engineer or product manager on technical design. How did you resolve it?",
                "Describe a situation where a production deployment caused a critical bug. What were your immediate triage steps and post-mortem actions?",
                "How do you prioritize competing deadlines across multiple concurrent product roadmap initiatives?",
                "Share an experience where you had to mentor a junior engineer through a complex technical challenge.",
                "Describe a time you received difficult constructive feedback and how you adapted your working style.",
                "How do you maintain code quality and testing standards under high delivery pressure?"
            ],
            "Experience": [
                f"Walk us through your most challenging project as a {job_title}. What was your specific architectural contribution?",
                f"How have you scaled {skill_1} applications in your previous roles to handle high concurrency?",
                f"Describe the most complex database schema or data pipeline you designed and maintained.",
                f"What was the most impactful refactoring initiative you led, and what measurable improvements did it produce?",
                "How do you balance shipping fast versus accumulating technical debt in your team's workflow?"
            ],
            "Situational": [
                f"If our core {job_title} service experienced a 500% spike in latency during peak hours, how would you systematically diagnose it?",
                f"Suppose you need to migrate our database from legacy models to a modern schema with zero user downtime. What is your strategy?",
                f"A stakeholder demands a high-priority feature in half the estimated time. What trade-offs do you propose?",
                "If a legacy third-party dependency is found to have a critical CVE vulnerability, how do you handle hot-patching?",
                "How would you design an automated regression testing suite for our hiring and applicant workflow?"
            ]
        }

        questions_list = catalog.get(category, catalog["Technical"])
        selected = []
        for i in range(min(quantity, len(questions_list))):
            selected.append({
                "question": questions_list[i % len(questions_list)],
                "category": category,
                "difficulty": difficulty
            })
        return selected

llm_service = LLMService()
