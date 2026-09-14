import io
import pytest

def test_complete_27_step_recruiter_workflow(client):
    """
    Simulates the exact end-to-end recruiter workflow from registration to CSV export.
    """
    # Step 1: Register Recruiter
    reg_res = client.post("/api/v1/auth/register", json={
        "name": "Audit Recruiter",
        "email": "audit.recruiter@hiresense.ai",
        "password": "ProductionReady2026!",
        "role": "recruiter"
    })
    assert reg_res.status_code == 201
    auth_token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {auth_token}"}

    # Step 2: Verify Profile via /auth/me
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "audit.recruiter@hiresense.ai"

    # Step 3: Create Job with Required Skills
    job_res = client.post("/api/v1/jobs", json={
        "title": "Staff Platform Architect",
        "department": "Engineering",
        "location": "San Francisco, CA (Hybrid)",
        "employment_type": "Full-time",
        "description": "Architect high-performance FastAPI microservices and distributed data pipelines.",
        "experience_min": 5,
        "experience_max": 10,
        "status": "Active",
        "skills": ["Python", "FastAPI", "MySQL", "Docker", "Kubernetes"]
    })
    assert job_res.status_code == 201
    job = job_res.json()
    job_id = job["id"]
    assert len(job["skills"]) == 5

    # Step 4: Add additional skill to Job
    skill_add_res = client.post(f"/api/v1/jobs/{job_id}/skills", json={"skills": ["AWS"]})
    assert skill_add_res.status_code == 200
    assert "AWS" in skill_add_res.json()["skills"]

    # Step 5: Create / Sourced Candidate
    cand_res = client.post("/api/v1/candidates", json={
        "name": "Morgan Thorne",
        "email": "morgan.thorne@cloudscale.io",
        "phone": "+1 (555) 987-6543",
        "location": "San Francisco, CA",
        "experience_years": 6,
        "education": "M.S. in Computer Science - Stanford",
        "current_company": "CloudScale Systems",
        "current_role": "Senior Backend Architect",
        "summary": "Specialist in Python FastAPI microservices, MySQL database sharding, and Kubernetes deployments.",
        "skills": ["Python", "FastAPI", "MySQL", "Docker", "Kubernetes", "AWS"]
    })
    assert cand_res.status_code == 201
    candidate = cand_res.json()
    candidate_id = candidate["id"]

    # Step 6: Attach Candidate to Job (Creates Application)
    attach_res = client.post(f"/api/v1/jobs/{job_id}/candidates/{candidate_id}")
    assert attach_res.status_code == 200
    attached_cand = attach_res.json()
    assert attached_cand["applied_job_id"] == job_id
    assert attached_cand["match_score"] >= 85
    application_id = attached_cand["application_id"]

    # Step 7: Upload Resume File
    resume_text = f"""Morgan Thorne
morgan.thorne@cloudscale.io | +1 (555) 987-6543
San Francisco, CA
Senior Backend Architect with 6 years experience building high throughput Python and FastAPI applications.
Skills: Python, FastAPI, MySQL, Docker, Kubernetes, AWS, Redis, GraphQL
Education: M.S. in Computer Science - Stanford
"""
    resume_file = ("morgan_thorne_resume.txt", io.BytesIO(resume_text.encode('utf-8')), "text/plain")
    upload_res = client.post(
        "/api/v1/resumes/upload",
        files={"file": resume_file},
        data={"candidate_id": candidate_id}
    )
    assert upload_res.status_code == 200
    upload_data = upload_res.json()
    resume_id = upload_data["resume_id"]

    # Step 8: Analyze Resume against Job
    analysis_res = client.post("/api/v1/analyze-resume", json={
        "resume_id": resume_id,
        "job_id": job_id,
        "candidate_id": candidate_id
    })
    assert analysis_res.status_code == 200
    analysis = analysis_res.json()
    assert analysis["match_score"] >= 85
    assert len(analysis["matched_skills"]) >= 4
    assert analysis["experience_match"] is True
    assert analysis["education_match"] is True
    assert analysis["recommendation"] == "Shortlist"

    # Step 9: Generate Interview Questions
    q_res = client.post("/api/v1/interviews/questions/generate", json={
        "candidate_id": candidate_id,
        "job_id": job_id,
        "category": "Technical",
        "difficulty": "Hard",
        "quantity": 5
    })
    assert q_res.status_code == 200
    questions = q_res.json()
    assert len(questions) == 5
    first_q_id = questions[0]["id"]

    # Step 10: Delete a single question
    del_q_res = client.delete(f"/api/v1/interviews/questions/{first_q_id}")
    assert del_q_res.status_code == 204

    # Step 11: Schedule Interview
    int_res = client.post("/api/v1/interviews", json={
        "candidate_id": candidate_id,
        "job_id": job_id,
        "scheduled_at": "2026-10-20T11:00:00",
        "duration": 60,
        "interview_type": "System Design",
        "interviewer": "Sarah Lin",
        "notes": "Candidate scored 95% on matching engine."
    })
    assert int_res.status_code == 201
    interview = int_res.json()
    interview_id = interview["id"]

    # Step 12: Update Interview Notes
    notes_res = client.patch(f"/api/v1/interviews/{interview_id}/notes", json={
        "notes": "Candidate demonstrated world-class mastery of database partitioning and cache coherency."
    })
    assert notes_res.status_code == 200
    assert "world-class mastery" in notes_res.json()["notes"]

    # Step 13: Shortlist Application Pipeline Status
    status_res = client.patch(f"/api/v1/applications/{application_id}/status", json={
        "status": "Shortlisted"
    })
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "Shortlisted"

    # Step 14: Verify Dashboard Analytics
    dash_res = client.get("/api/v1/analytics/dashboard")
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["total_candidates"] >= 1
    assert dash_data["active_jobs"] >= 1
    assert dash_data["shortlisted_candidates"] >= 1
    assert dash_data["avg_match_score"] > 0

    # Step 15: Export CSV
    csv_res = client.get("/api/v1/analytics/candidates/export")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "Morgan Thorne" in csv_res.text
    assert "Staff Platform Architect" in csv_res.text
