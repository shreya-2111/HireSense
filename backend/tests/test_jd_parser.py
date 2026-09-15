import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.utils.file_parser import extract_jd_info_from_text

client = TestClient(app)

def test_extract_jd_info_from_text():
    sample_jd = """
    Job Title: Senior Full Stack Engineer
    Department: Engineering
    Location: Bengaluru, Karnataka
    Job Type: Hybrid
    Experience: 4-7 years of professional software development experience
    Salary: ₹20,00,000 - ₹30,00,000 / year

    About the Role:
    We are seeking an experienced Senior Full Stack Engineer to lead our core recruitment intelligence platform.
    
    Requirements & Core Skills:
    - 4+ years of hands-on experience with React, TypeScript, and Node.js
    - Strong database design skills using PostgreSQL and Redis
    - Solid understanding of REST APIs and Docker containers
    
    Nice to Have:
    - Familiarity with Next.js, Tailwind CSS, and AWS
    - Experience in automated testing with Jest or Pytest
    """

    parsed = extract_jd_info_from_text(sample_jd, "Senior_Full_Stack_Engineer_JD.txt")
    assert "Full Stack" in parsed["title"] or "Senior" in parsed["title"]
    assert parsed["department"] == "Engineering"
    assert "Bengaluru" in parsed["location"]
    assert parsed["employment_type"] == "Hybrid"
    assert parsed["experience_min"] == 4
    assert parsed["experience_max"] == 7
    assert any(s in parsed["required_skills"] for s in ["React.js", "TypeScript", "Node.js", "PostgreSQL"])
    assert any(s in parsed["nice_to_have_skills"] for s in ["Next.js", "Tailwind CSS", "AWS", "Jest", "Pytest"])

def test_parse_jd_endpoint():
    sample_jd_bytes = b"""
    Role: Backend Python Developer
    Location: Remote (India / Global)
    Type: Remote
    Experience: 3-5 yrs
    
    Requirements:
    - Python, FastAPI, MySQL, Docker, Git
    
    Nice to have:
    - Kubernetes, Redis, AWS
    """
    
    response = client.post(
        "/api/v1/jobs/parse-jd",
        files={"file": ("Backend_Python_JD.txt", sample_jd_bytes, "text/plain")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "Python" in data["title"] or "Backend" in data["title"]
    assert data["employment_type"] == "Remote"
    assert any(s in data["required_skills"] for s in ["Python", "FastAPI", "MySQL"])
