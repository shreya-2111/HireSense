import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine

client = TestClient(app)

SAMPLE_DIR = os.path.join(os.path.dirname(__file__), "sample_resumes")
UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")

@pytest.fixture(scope="module", autouse=True)
def setup_frontend_job():
    Base.metadata.create_all(bind=engine)
    
    # Create Frontend Developer job
    job_payload = {
        "title": "Frontend Developer",
        "department": "Engineering",
        "location": "Remote",
        "experience_min": 2,
        "experience_max": 8,
        "description": "Seeking a passionate Frontend Developer with React, JavaScript, HTML, CSS, and Node.js experience to build high quality responsive web applications.",
        "skills": ["React", "JavaScript", "HTML", "CSS", "Node.js", "TypeScript"]
    }
    res = client.post("/api/v1/jobs", json=job_payload)
    if res.status_code in [200, 201]:
        return res.json()["id"]
    
    list_res = client.get("/api/v1/jobs")
    jobs = list_res.json()
    for j in jobs:
        if "Frontend" in j["title"]:
            return j["id"]
    return jobs[0]["id"]

def test_ocr_extraction_on_scanned_pdf(setup_frontend_job):
    """Test OCR text extraction on real scanned PDF (Shreya Raval)."""
    job_id = setup_frontend_job
    
    target_pdf = os.path.join(SAMPLE_DIR, "Shreya_Raval_Scanned_Resume.pdf")
    assert os.path.exists(target_pdf), "Shreya_Raval_Scanned_Resume.pdf not found in sample_resumes"

    with open(target_pdf, "rb") as f:
        upload_res = client.post(
            "/api/v1/resumes/upload",
            files={"file": ("Shreya_Raval_Resume (1).pdf", f, "application/pdf")}
        )
    assert upload_res.status_code == 200, f"Upload failed: {upload_res.text}"
    data = upload_res.json()

    # 1. Verify Real OCR Extracted Candidate Data
    assert "Shreya" in data["candidate_name"]
    assert "shreyaraval" in data["email"]
    assert "9265841913" in (data["phone"] or "")
    assert "MSc" in (data["education"] or "") or "BCA" in (data["education"] or "")
    
    # Verify OCR Extracted Skills
    skills = data["skills"]
    assert any("React" in s for s in skills)
    assert any("JavaScript" in s for s in skills)
    assert any("Node" in s for s in skills)
    assert any("MySQL" in s for s in skills)
    assert any("MongoDB" in s for s in skills)
    assert any("Flutter" in s for s in skills)

    # Verify OCR Extracted Projects
    projects = data.get("projects", [])
    assert len(projects) > 0
    assert any("Vidhyarth" in p or "ReadListenPlay" in p or "Hotel" in p for p in projects)

    # 2. Analyze against Frontend Job
    analysis_res = client.post(
        "/api/v1/analyze-resume",
        json={"resume_id": data["resume_id"], "candidate_id": data["candidate_id"], "job_id": job_id}
    )
    assert analysis_res.status_code == 200
    analysis = analysis_res.json()

    # 3. Verify Deterministic Match Score & Matched Skills
    assert analysis["match_score"] >= 75.0
    assert any("React" in s for s in analysis["matched_skills"])
    assert any("JavaScript" in s for s in analysis["matched_skills"])
    assert any("HTML" in s for s in analysis["matched_skills"])
    assert any("CSS" in s for s in analysis["matched_skills"])
    assert any("Node" in s for s in analysis["matched_skills"])

    # 4. Verify Gemini AI Generated Questions
    assert "ai_questions" in analysis
    questions = analysis["ai_questions"]
    assert len(questions) == 5
    for q in questions:
        assert "question" in q and len(q["question"]) > 10
        assert "type" in q
        assert "difficulty" in q

def test_two_different_resumes_produce_different_data(setup_frontend_job):
    """Verify that a scanned PDF and a text PDF produce completely distinct real data."""
    job_id = setup_frontend_job
    
    # Upload text-based Backend PDF
    backend_pdf = os.path.join(SAMPLE_DIR, "Alex_Rivera_Senior_Backend_Resume.pdf")
    with open(backend_pdf, "rb") as f:
        res1 = client.post(
            "/api/v1/resumes/upload",
            files={"file": ("Alex_Rivera_Senior_Backend_Resume.pdf", f, "application/pdf")}
        )
    data1 = res1.json()

    # Upload Designer PDF
    designer_pdf = os.path.join(SAMPLE_DIR, "Maya_Lin_Design_Resume.pdf")
    with open(designer_pdf, "rb") as f:
        res2 = client.post(
            "/api/v1/resumes/upload",
            files={"file": ("Maya_Lin_Design_Resume.pdf", f, "application/pdf")}
        )
    data2 = res2.json()

    # Verify completely distinct candidate identities
    assert data1["candidate_name"] != data2["candidate_name"]
    assert data1["email"] != data2["email"]
    assert data1["skills"] != data2["skills"]
