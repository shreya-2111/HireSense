import io
import pytest
from app.utils.file_parser import extract_candidate_info_from_text
from app.utils.scoring import calculate_comprehensive_match

def test_no_dummy_values_in_parser():
    # Resume with no education and no explicit experience
    raw_text = """Shreya Raval
shreya.raval@example.com
Full Stack Web Developer
Skills: React, Node.js, Express, MongoDB, Tailwind CSS
Built full stack e-commerce web application with payment integration.
"""
    parsed = extract_candidate_info_from_text(raw_text, "Shreya_Raval_Resume.pdf")
    assert parsed["candidate_name"] == "Shreya Raval"
    assert parsed["email"] == "shreya.raval@example.com"
    assert any("React" in s for s in parsed["skills"])
    assert "Tailwind CSS" in parsed["skills"]
    assert parsed["education"] == "Not detected"
    assert parsed["experience_years"] == 0

def test_accurate_education_and_experience_extraction():
    # Resume with B.Tech in IT and 4 years experience
    raw_text = """Shreya Raval
shreya.raval@techdev.io | +1 987-654-3210
Software Engineer with 4 years of experience designing scalable microservices.
Education: Bachelor of Technology in Information Technology
Skills: Python, FastAPI, Docker, PostgreSQL, Redis, Kubernetes
"""
    parsed = extract_candidate_info_from_text(raw_text, "shreya_raval.docx")
    assert parsed["candidate_name"] == "Shreya Raval"
    assert parsed["email"] == "shreya.raval@techdev.io"
    assert parsed["experience_years"] == 4
    assert "B.Tech" in parsed["education"] or "Bachelor" in parsed["education"]
    assert "Python" in parsed["skills"]
    assert "FastAPI" in parsed["skills"]
    assert "Docker" in parsed["skills"]

def test_scoring_engine_dynamic_probes_no_static_strings():
    # Job requirements
    req_skills = ["React", "TypeScript", "Tailwind CSS"]
    # Candidate with Python and FastAPI (0 matched skills)
    cand_skills = ["Python", "FastAPI"]
    
    result = calculate_comprehensive_match(
        candidate_skills=cand_skills,
        required_skills=req_skills,
        candidate_exp_years=1,
        job_min_exp=3,
        job_max_exp=5,
        candidate_text="Python FastAPI engineer",
        job_description="Looking for React and TypeScript frontend developer"
    )

    # Check match result
    assert result["matched_skills"] == []
    assert set(result["missing_skills"]) == {"React", "TypeScript", "Tailwind CSS"}
    
    # Verify NO static strings
    for probe in result["interview_focus"]:
        assert "System architecture and collaborative delivery under deadlines" not in probe

    # Verify dynamic probe uses missing skills
    assert any("React" in probe for probe in result["interview_focus"])

def test_two_resumes_produce_distinct_records(client):
    # Create target job
    job_res = client.post("/api/v1/jobs", json={
        "title": "Backend Python Specialist",
        "department": "Engineering",
        "location": "Remote",
        "skills": ["Python", "FastAPI", "SQLAlchemy", "MySQL"]
    })
    job_id = job_res.json()["id"]

    # Resume A: Backend match
    resume_a_text = """Alex Backend
alex.backend@test.io
Backend engineer with 5 years experience in Python and FastAPI.
Skills: Python, FastAPI, SQLAlchemy, MySQL, Docker
Education: Master of Science in Computer Science
"""
    upload_a = client.post(
        "/api/v1/resumes/upload",
        files={"file": ("alex_backend.txt", io.BytesIO(resume_a_text.encode()), "text/plain")}
    ).json()

    analysis_a = client.post("/api/v1/analyze-resume", json={
        "resume_id": upload_a["resume_id"],
        "job_id": job_id
    }).json()

    assert analysis_a["candidate_name"] == "Alex Backend"
    assert analysis_a["match_score"] >= 80
    assert "Python" in analysis_a["matched_skills"]
    assert analysis_a["education"] == "Master's Degree" or "Master" in analysis_a["education"]

    # Resume B: Design candidate (Zero stack match)
    resume_b_text = """Elena Designer
elena.design@creative.org
Visual designer with 2 years experience in Figma, Adobe Photoshop, UI/UX.
Skills: Figma, Adobe, Photoshop, Illustrator, UI/UX
Education: Bachelor of Fine Arts
"""
    upload_b = client.post(
        "/api/v1/resumes/upload",
        files={"file": ("elena_designer.txt", io.BytesIO(resume_b_text.encode()), "text/plain")}
    ).json()

    analysis_b = client.post("/api/v1/analyze-resume", json={
        "resume_id": upload_b["resume_id"],
        "job_id": job_id
    }).json()

    assert analysis_b["candidate_name"] == "Elena Designer"
    assert analysis_b["match_score"] < analysis_a["match_score"]
    assert analysis_b["matched_skills"] == []
    assert len(analysis_b["missing_skills"]) > 0
    assert analysis_b["education"] != analysis_a["education"]
