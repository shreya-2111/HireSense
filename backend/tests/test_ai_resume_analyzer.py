import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine, get_db

client = TestClient(app)

SAMPLE_DIR = os.path.join(os.path.dirname(__file__), "sample_resumes")

@pytest.fixture(scope="module", autouse=True)
def setup_test_job():
    """Create a test Job for Lead Python Developer."""
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    # Create or fetch target job
    job_payload = {
        "title": "Lead Python Developer",
        "department": "Engineering",
        "location": "Remote",
        "experience_min": 3,
        "experience_max": 8,
        "description": "Seeking an experienced Lead Python Developer to architect high-performance asynchronous REST APIs in FastAPI, manage MySQL databases, and deploy with Docker microservices.",
        "skills": [
            {"name": "Python", "importance": "required"},
            {"name": "FastAPI", "importance": "required"},
            {"name": "MySQL", "importance": "required"},
            {"name": "Docker", "importance": "required"}
        ]
    }
    res = client.post("/api/v1/jobs", json=job_payload)
    if res.status_code == 201:
        return res.json()["id"]
    
    # Fallback to listing jobs
    list_res = client.get("/api/v1/jobs")
    jobs = list_res.json()
    for j in jobs:
        if "Python" in j["title"]:
            return j["id"]
    return jobs[0]["id"]

def test_resume_pdf_a_high_match(setup_test_job):
    """Test PDF A (Alex Rivera - Backend Senior Specialist) against Python Job."""
    job_id = setup_test_job
    pdf_path = os.path.join(SAMPLE_DIR, "Alex_Rivera_Senior_Backend_Resume.pdf")
    assert os.path.exists(pdf_path), "PDF A file not found"

    with open(pdf_path, "rb") as f:
        upload_res = client.post(
            "/api/v1/resumes/upload",
            files={"file": ("Alex_Rivera_Senior_Backend_Resume.pdf", f, "application/pdf")}
        )
    assert upload_res.status_code == 200, f"Upload failed: {upload_res.text}"
    data = upload_res.json()

    # 1. Verify Real Extracted Candidate Data
    assert data["candidate_name"] == "Alex Rivera"
    assert data["email"] == "alex.rivera@cloudtech.io"
    assert "+1 (555) 234-5678" in (data["phone"] or "")
    assert "Austin" in (data["location"] or "")
    assert "Master" in (data["education"] or "")
    assert data["experience_years"] >= 4
    assert "Python" in data["skills"]
    assert "FastAPI" in data["skills"]
    assert "MySQL" in data["skills"]
    assert "Docker" in data["skills"]

    # 2. Analyze against Job
    analysis_res = client.post(
        "/api/v1/analyze-resume",
        json={"resume_id": data["resume_id"], "candidate_id": data["candidate_id"], "job_id": job_id}
    )
    assert analysis_res.status_code == 200
    analysis = analysis_res.json()

    # 3. Verify Deterministic High Match Score
    assert analysis["match_score"] >= 80.0
    assert analysis["recommendation"] == "Shortlist"
    assert len(analysis["matched_skills"]) >= 3
    assert len(analysis["missing_skills"]) == 0

    # 4. Verify AI Generated Questions
    assert "ai_questions" in analysis
    questions = analysis["ai_questions"]
    assert len(questions) == 5
    for q in questions:
        assert "question" in q and len(q["question"]) > 10
        assert "type" in q
        assert "difficulty" in q

def test_resume_pdf_b_skill_gaps(setup_test_job):
    """Test PDF B (Elena Rostova - Frontend Engineer) against Python Job."""
    job_id = setup_test_job
    pdf_path = os.path.join(SAMPLE_DIR, "Elena_Rostova_Frontend_Resume.pdf")
    assert os.path.exists(pdf_path), "PDF B file not found"

    with open(pdf_path, "rb") as f:
        upload_res = client.post(
            "/api/v1/resumes/upload",
            files={"file": ("Elena_Rostova_Frontend_Resume.pdf", f, "application/pdf")}
        )
    assert upload_res.status_code == 200
    data = upload_res.json()

    # 1. Verify Real Extracted Candidate Data
    assert data["candidate_name"] == "Elena Rostova"
    assert data["email"] == "elena.rostova@pixelcraft.dev"
    assert "Seattle" in (data["location"] or "")
    assert any("React" in s for s in data["skills"])
    assert any("TypeScript" in s for s in data["skills"])

    # 2. Analyze against Backend Job
    analysis_res = client.post(
        "/api/v1/analyze-resume",
        json={"resume_id": data["resume_id"], "candidate_id": data["candidate_id"], "job_id": job_id}
    )
    assert analysis_res.status_code == 200
    analysis = analysis_res.json()

    # 3. Verify Real Missing Skills & Score
    assert analysis["match_score"] < 65.0
    assert len(analysis["missing_skills"]) >= 3
    # Python, FastAPI, MySQL should be missing
    assert any(s in analysis["missing_skills"] for s in ["FastAPI", "MySQL", "Docker", "Python"])

    # 4. Verify AI Questions focus on missing skills
    questions = analysis.get("ai_questions", [])
    assert len(questions) == 5

def test_resume_pdf_c_design_specialist(setup_test_job):
    """Test PDF C (Maya Lin - Product Designer) against Python Job."""
    job_id = setup_test_job
    pdf_path = os.path.join(SAMPLE_DIR, "Maya_Lin_Design_Resume.pdf")
    assert os.path.exists(pdf_path), "PDF C file not found"

    with open(pdf_path, "rb") as f:
        upload_res = client.post(
            "/api/v1/resumes/upload",
            files={"file": ("Maya_Lin_Design_Resume.pdf", f, "application/pdf")}
        )
    assert upload_res.status_code == 200
    data = upload_res.json()

    assert data["candidate_name"] == "Maya Lin"
    assert data["email"] == "maya.lin@designstudio.co"
    assert "Figma" in data["skills"]
    assert "UI/UX" in data["skills"] or "Ui/Ux" in data["skills"]

    # Analyze against Backend Job
    analysis_res = client.post(
        "/api/v1/analyze-resume",
        json={"resume_id": data["resume_id"], "candidate_id": data["candidate_id"], "job_id": job_id}
    )
    assert analysis_res.status_code == 200
    analysis = analysis_res.json()

    assert analysis["match_score"] < 50.0
    assert len(analysis["missing_skills"]) >= 3

def test_dedicated_ai_interview_questions_endpoint(setup_test_job):
    """Test POST /api/v1/ai/interview-questions endpoint directly."""
    job_id = setup_test_job
    payload = {
        "job_id": job_id,
        "candidate_name": "Test Engineer",
        "match_score": 85.5,
        "matched_skills": ["Python", "FastAPI"],
        "missing_skills": ["Docker"]
    }
    res = client.post("/api/v1/ai/interview-questions", json=payload)
    assert res.status_code == 200
    res_data = res.json()
    assert "questions" in res_data
    assert len(res_data["questions"]) == 5
    for q in res_data["questions"]:
        assert "question" in q and len(q["question"]) > 5
        assert "type" in q
        assert "difficulty" in q
