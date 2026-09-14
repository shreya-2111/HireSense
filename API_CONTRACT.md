# HireSense API Contract

**Base URL**: `http://localhost:8000/api/v1`  
**Interactive Swagger Docs**: `http://localhost:8000/docs`  
**ReDoc**: `http://localhost:8000/redoc`

---

## 1. Authentication

### `POST /auth/register`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "name": "Sarah Lin",
    "email": "sarah@hiresense.ai",
    "password": "password123",
    "role": "recruiter"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "name": "Sarah Lin",
      "email": "sarah@hiresense.ai",
      "role": "recruiter"
    }
  }
  ```

### `POST /auth/login`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "sarah@hiresense.ai",
    "password": "password123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "name": "Sarah Lin",
      "email": "sarah@hiresense.ai",
      "role": "recruiter"
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: `{"detail": "Incorrect email or password"}`

### `GET /auth/me`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response `200 OK`**:
  ```json
  {
    "id": 1,
    "name": "Sarah Lin",
    "email": "sarah@hiresense.ai",
    "role": "recruiter",
    "is_active": true,
    "created_at": "2026-09-10T12:00:00",
    "updated_at": "2026-09-10T12:00:00"
  }
  ```

---

## 2. Jobs API

### `GET /jobs`
- **Query Params**: `status` (optional), `department` (optional)
- **Response `200 OK`**:
  ```json
  [
    {
      "id": 1,
      "title": "Senior Full-Stack Engineer",
      "department": "Engineering",
      "location": "San Francisco, CA (Hybrid)",
      "employment_type": "Full-time",
      "description": "Building real-time AI recruitment tooling...",
      "experience_min": 4,
      "experience_max": 8,
      "status": "Active",
      "skills": ["React", "TypeScript", "FastAPI", "Python", "Tailwind CSS"],
      "applicants_count": 5,
      "interviews_count": 2,
      "shortlisted_count": 3,
      "pipeline": {
        "applied": 1,
        "screening": 1,
        "shortlisted": 1,
        "interview": 1,
        "maybe": 0,
        "rejected": 1,
        "hired": 0
      },
      "created_at": "2026-09-10T10:00:00",
      "updated_at": "2026-09-10T10:00:00"
    }
  ]
  ```

### `POST /jobs`
- **Request Body**:
  ```json
  {
    "title": "Lead Product Designer",
    "department": "Design",
    "location": "New York, NY",
    "employment_type": "Full-time",
    "description": "Design user workflows...",
    "experience_min": 5,
    "experience_max": 10,
    "skills": ["Figma", "UI/UX", "Tailwind CSS"]
  }
  ```
- **Response `201 Created`**: Job object.

### `GET /jobs/{job_id}`
- **Response `200 OK`**: Job object.

### `PUT /jobs/{job_id}`
- **Request Body**: Partial or full job fields.
- **Response `200 OK`**: Updated job object.

### `DELETE /jobs/{job_id}`
- **Response `204 No Content`**

### `POST /jobs/{job_id}/skills`
- **Request Body**:
  ```json
  {
    "skills": ["Docker", "Kubernetes"]
  }
  ```
- **Response `200 OK`**: Updated job object.

### `GET /jobs/{job_id}/candidates`
- **Response `200 OK`**: Array of candidates attached to the specified job.

### `POST /jobs/{job_id}/candidates/{candidate_id}`
- **Response `200 OK`**: Candidate object with newly created/updated `application_id`, `applied_job_id`, and `match_score`.

---

## 3. Candidates API

### `GET /candidates`
- **Query Params**: `search`, `job_id`, `status`, `min_experience`
- **Response `200 OK`**:
  ```json
  [
    {
      "id": 1,
      "name": "Alex Rivera",
      "email": "alex.rivera@techcorp.io",
      "phone": "+1 (555) 234-5678",
      "location": "San Francisco, CA",
      "experience_years": 5,
      "education": "B.S. in Computer Science",
      "current_company": "Apex Cloud Systems",
      "current_role": "Senior Frontend Developer",
      "summary": "Specialist in high-scale React...",
      "skills": ["React", "TypeScript", "FastAPI"],
      "match_score": 94.0,
      "status": "Shortlisted",
      "recommendation": "Shortlist",
      "applied_job": "Senior Full-Stack Engineer",
      "applied_job_id": 1,
      "application_id": 1,
      "resume_file_name": "Alex_Rivera_Resume.pdf",
      "resume_id": 1
    }
  ]
  ```

### `POST /candidates`
- **Request Body**:
  ```json
  {
    "name": "Elena Rostova",
    "email": "elena.rostova@datascience.io",
    "phone": "+1 (555) 345-6789",
    "location": "Seattle, WA",
    "experience_years": 4,
    "skills": ["Python", "NLP", "FastAPI"],
    "job_id": 2
  }
  ```
- **Response `201 Created`**: Candidate object.

### `GET /candidates/{candidate_id}`
- **Response `200 OK`**: Candidate object.

### `PUT /candidates/{candidate_id}`
- **Request Body**: Candidate fields to update.
- **Response `200 OK`**: Updated candidate object.

### `DELETE /candidates/{candidate_id}`
- **Response `204 No Content`**

### `GET /candidates/{candidate_id}/resume`
- **Response `200 OK`**: Resume record with file path and extracted text.

### `GET /candidates/{candidate_id}/interviews`
- **Response `200 OK`**: Array of interviews for candidate.

---

## 4. Application Status

### `PATCH /applications/{application_id}/status`
- **Request Body**:
  ```json
  {
    "status": "Shortlisted"
  }
  ```
- **Allowed Statuses**: `Applied`, `Screening`, `Shortlisted`, `Interview`, `Maybe`, `Rejected`, `Hired`
- **Response `200 OK`**: Updated application object.

---

## 5. Resumes & AI Analysis

### `POST /resumes/upload`
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `file`: Resume file (PDF, DOCX, TXT)
  - `candidate_id`: (optional)
- **Response `200 OK`**:
  ```json
  {
    "resume_id": 1,
    "candidate_id": 1,
    "candidate_name": "Alex Rivera",
    "email": "alex.rivera@techcorp.io",
    "phone": "+1 (555) 234-5678",
    "education": "B.S. in Computer Science",
    "experience_years": 5,
    "skills": ["React", "TypeScript", "Tailwind CSS", "FastAPI"],
    "summary": "Specialist in high-scale React...",
    "file_name": "resume.pdf",
    "file_path": "uploads/abc123_resume.pdf",
    "file_type": "pdf",
    "extracted_text": "Alex Rivera..."
  }
  ```

### `POST /analyze-resume`
- **Request Body**:
  ```json
  {
    "job_id": 1,
    "resume_id": 1,
    "candidate_id": 1
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "id": 1,
    "resume_id": 1,
    "job_id": 1,
    "candidate_id": 1,
    "match_score": 92.5,
    "summary": "Candidate scored 93% overall alignment...",
    "matched_skills": ["React", "TypeScript", "FastAPI"],
    "missing_skills": ["Python"],
    "experience_match": true,
    "education_match": true,
    "recommendation": "Shortlist",
    "strengths": [
      "Strong proficiency in key stack: React, TypeScript, FastAPI",
      "5 years experience satisfies requirements"
    ],
    "interview_focus": [
      "Evaluate practical exposure to: Python",
      "System architecture and collaborative delivery under deadlines"
    ],
    "breakdown": {
      "skill_score": 85.0,
      "experience_score": 100.0,
      "education_score": 90.0,
      "relevance_score": 95.0
    }
  }
  ```

---

## 6. Interviews & Question Generation

### `GET /interviews`
- **Response `200 OK`**: Array of scheduled interviews.

### `POST /interviews`
- **Request Body**:
  ```json
  {
    "candidate_id": 1,
    "job_id": 1,
    "scheduled_at": "2026-10-15T14:30:00",
    "duration": 45,
    "interview_type": "Technical Round",
    "interviewer": "Sarah Lin",
    "notes": "Candidate passed resume screening with 92%."
  }
  ```
- **Response `201 Created`**: Interview object.

### `PATCH /interviews/{interview_id}/notes`
- **Request Body**:
  ```json
  {
    "notes": "Strong grasp of React concurrency and REST endpoints."
  }
  ```
- **Response `200 OK`**: Updated interview object.

### `POST /interviews/questions/generate`
- **Request Body**:
  ```json
  {
    "candidate_id": 1,
    "job_id": 1,
    "category": "Technical",
    "difficulty": "Medium",
    "quantity": 5
  }
  ```
- **Response `200 OK`**:
  ```json
  [
    {
      "id": 1,
      "question": "How would you architect a production application in React to ensure high performance and maintainability?",
      "category": "Technical",
      "difficulty": "Medium",
      "candidate_id": 1,
      "job_id": 1,
      "created_at": "2026-09-10T14:30:00"
    }
  ]
  ```

---

## 7. Analytics & Reports

### `GET /analytics/dashboard`
- **Response `200 OK`**:
  ```json
  {
    "total_candidates": 4,
    "candidates_reviewed": 3,
    "active_jobs": 4,
    "interviews_scheduled": 2,
    "shortlisted_candidates": 3,
    "total_applications": 4,
    "avg_match_score": 92.3,
    "status_breakdown": {
      "Applied": 0,
      "Screening": 1,
      "Shortlisted": 1,
      "Interview": 2,
      "Maybe": 0,
      "Rejected": 0,
      "Hired": 0
    },
    "department_distribution": {
      "Engineering": 1,
      "AI & Innovation": 1,
      "Design": 1,
      "Infrastructure": 1
    },
    "top_skills": [
      {"name": "React", "count": 3},
      {"name": "FastAPI", "count": 3}
    ],
    "hiring_pipeline": {
      "Sourced": 4,
      "Applied": 0,
      "Screening": 1,
      "Shortlisted": 1,
      "Interview": 2,
      "Hired": 0
    }
  }
  ```

### `GET /analytics/candidates/export`
- **Response `200 OK`**: Content-Type `text/csv`, CSV attachment containing full candidate details.
