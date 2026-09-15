import io
import pytest

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_auth_registration_and_login(client):
    # 1. Register new user
    reg_payload = {
        "name": "Jane Recruiter",
        "email": "jane@example.com",
        "password": "strongpassword123",
        "role": "recruiter"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "jane@example.com"
 
    # 2. Duplicate registration rejection
    dup_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_res.status_code == 400
    assert "already registered" in dup_res.json()["detail"].lower()

    # 3. Invalid login rejection
    bad_login = client.post("/api/v1/auth/login", json={"email": "jane@example.com", "password": "wrongpassword"})
    assert bad_login.status_code == 401

    # 4. Valid Login
    login_payload = {
        "email": "jane@example.com",
        "password": "strongpassword123"
    }
    login_res = client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # 5. Access /me
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["name"] == "Jane Recruiter"

    # 6. Reject unauthenticated /me
    bad_me = client.get("/api/v1/auth/me")
    assert bad_me.status_code == 401

def test_job_crud_and_skills(client):
    # 1. Create Job
    job_payload = {
        "title": "Senior Backend Developer",
        "department": "Engineering",
        "location": "Remote",
        "employment_type": "Full-time",
        "description": "Develop scalable Python FastAPI microservices.",
        "experience_min": 3,
        "experience_max": 7,
        "skills": ["Python", "FastAPI", "SQLAlchemy", "MySQL"]
    }
    create_res = client.post("/api/v1/jobs", json=job_payload)
    assert create_res.status_code == 201
    job_data = create_res.json()
    assert job_data["title"] == "Senior Backend Developer"
    assert "Python" in job_data["skills"]
    job_id = job_data["id"]

    # 2. Get Job
    get_res = client.get(f"/api/v1/jobs/{job_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == job_id

    # 3. Add Skills
    skill_res = client.post(f"/api/v1/jobs/{job_id}/skills", json={"skills": ["Docker", "Redis"]})
    assert skill_res.status_code == 200
    assert "Docker" in skill_res.json()["skills"]

    # 4. Update Job
    update_res = client.put(f"/api/v1/jobs/{job_id}", json={"location": "Hybrid"})
    assert update_res.status_code == 200
    assert update_res.json()["location"] == "Hybrid"

def test_candidate_creation_and_attachment(client):
    # 1. Create Job first
    job_res = client.post("/api/v1/jobs", json={
        "title": "Frontend Lead",
        "department": "Engineering",
        "location": "New York, NY",
        "skills": ["React", "TypeScript", "Tailwind CSS"]
    })
    job_id = job_res.json()["id"]

    # 2. Create Candidate
    cand_payload = {
        "name": "David Miller",
        "email": "david.miller@example.com",
        "phone": "+1 (555) 123-9876",
        "location": "New York, NY",
        "experience_years": 5,
        "skills": ["React", "TypeScript", "Tailwind CSS", "Redux"],
        "job_id": job_id
    }
    cand_res = client.post("/api/v1/candidates", json=cand_payload)
    assert cand_res.status_code == 201
    cand_data = cand_res.json()
    cand_id = cand_data["id"]
    assert cand_data["applied_job_id"] == job_id
    assert cand_data["match_score"] > 70

    # 3. Prevent duplicate candidate attachment crash
    attach_res = client.post(f"/api/v1/jobs/{job_id}/candidates/{cand_id}")
    assert attach_res.status_code == 200
    assert attach_res.json()["applied_job_id"] == job_id

    # 4. Get candidates for job
    job_cands_res = client.get(f"/api/v1/jobs/{job_id}/candidates")
    assert job_cands_res.status_code == 200
    assert len(job_cands_res.json()) >= 1

    # 5. Update application status
    app_id = cand_data["application_id"]
    if app_id:
        status_res = client.patch(f"/api/v1/applications/{app_id}/status", json={"status": "Shortlisted"})
        assert status_res.status_code == 200
        assert status_res.json()["status"] == "Shortlisted"

def test_resume_upload_and_analysis(client):
    # 1. Create Job
    job_res = client.post("/api/v1/jobs", json={
        "title": "Full Stack Engineer",
        "department": "Engineering",
        "location": "Remote",
        "skills": ["React", "Python", "FastAPI"]
    })
    job_id = job_res.json()["id"]

    # 2. Upload text resume
    sample_resume_content = b"""John Doe
john.doe@testdev.com | +1 (555) 432-1098
Senior Software Engineer with 6 years experience building React and FastAPI applications.
Skills: React, Python, FastAPI, TypeScript, MySQL, Docker
Education: B.S. in Computer Science
"""
    file_tuple = ("john_doe_resume.txt", io.BytesIO(sample_resume_content), "text/plain")
    upload_res = client.post(
        "/api/v1/resumes/upload",
        files={"file": file_tuple}
    )
    assert upload_res.status_code == 200
    upload_data = upload_res.json()
    assert upload_data["candidate_name"] == "John Doe"
    assert "React" in upload_data["skills"] or "Python" in upload_data["skills"]
    resume_id = upload_data["resume_id"]

    # 3. Analyze resume for strong candidate
    analysis_res = client.post("/api/v1/analyze-resume", json={
        "resume_id": resume_id,
        "job_id": job_id
    })
    assert analysis_res.status_code == 200
    analysis_data = analysis_res.json()
    assert analysis_data["match_score"] >= 80
    assert "matched_skills" in analysis_data
    assert "React" in analysis_data["matched_skills"]
    assert analysis_data["recommendation"] == "Shortlist"

def test_interview_scheduling_and_questions(client):
    # 1. Create Job & Candidate
    job_res = client.post("/api/v1/jobs", json={"title": "Data Engineer", "department": "Data", "location": "Remote", "skills": ["Python", "SQL"]})
    job_id = job_res.json()["id"]

    cand_res = client.post("/api/v1/candidates", json={
        "name": "Sarah Connor",
        "email": "sarah.connor@test.com",
        "experience_years": 4,
        "skills": ["Python", "SQL"]
    })
    cand_id = cand_res.json()["id"]

    # 2. Schedule Interview
    int_payload = {
        "candidate_id": cand_id,
        "job_id": job_id,
        "scheduled_at": "2026-10-15T10:00:00",
        "duration": 45,
        "interview_type": "Technical Round",
        "interviewer": "Sarah Lin",
        "notes": "Candidate exhibits deep database optimization knowledge."
    }
    int_res = client.post("/api/v1/interviews", json=int_payload)
    assert int_res.status_code == 201
    int_data = int_res.json()
    int_id = int_data["id"]

    # 3. Update notes
    notes_res = client.patch(f"/api/v1/interviews/{int_id}/notes", json={"notes": "Updated: Strong problem solving recorded."})
    assert notes_res.status_code == 200
    assert "Updated" in notes_res.json()["notes"]

    # 4. Generate interview questions across categories
    for category in ["Technical", "Behavioral", "Experience", "Situational"]:
        q_gen_res = client.post("/api/v1/interviews/questions/generate", json={
            "candidate_id": cand_id,
            "job_id": job_id,
            "category": category,
            "difficulty": "Medium",
            "quantity": 5
        })
        assert q_gen_res.status_code == 200
        questions = q_gen_res.json()
        assert len(questions) == 5
        assert all("question" in q for q in questions)
        assert all(q["category"] == category for q in questions)

def test_analytics_and_csv_export(client):
    # 1. Dashboard Metrics
    dash_res = client.get("/api/v1/analytics/dashboard")
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert "total_candidates" in dash_data
    assert "active_jobs" in dash_data
    assert "hiring_pipeline" in dash_data

    # 2. CSV Export
    export_res = client.get("/api/v1/analytics/candidates/export")
    assert export_res.status_code == 200
    assert "text/csv" in export_res.headers["content-type"]
    assert "Candidate ID" in export_res.text
