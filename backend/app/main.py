import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import init_db
from app.routers import (
    auth_router,
    jobs_router,
    candidates_router,
    resumes_router,
    interviews_router,
    analytics_router,
    applications_router,
    ai_router
)

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("hiresense")

app = FastAPI(
    title=settings.APP_NAME,
    description="HireSense AI-Driven Recruitment Intelligence Platform API. Built with FastAPI, SQLAlchemy, and MySQL.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
origins = settings.CORS_ORIGINS.split(",") if settings.CORS_ORIGINS else ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file hosting for resume uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(jobs_router, prefix=settings.API_V1_PREFIX)
app.include_router(candidates_router, prefix=settings.API_V1_PREFIX)
app.include_router(resumes_router, prefix=settings.API_V1_PREFIX)
app.include_router(interviews_router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics_router, prefix=settings.API_V1_PREFIX)
app.include_router(applications_router, prefix=settings.API_V1_PREFIX)
app.include_router(ai_router, prefix=settings.API_V1_PREFIX)

@app.on_event("startup")
def on_startup():
    logger.info("Initializing HireSense Database...")
    init_db()
    logger.info("Database initialized successfully.")
    print("\n" + "="*60)
    print("[HIRESENSE] LIVE SERVERS READY")
    print("="*60)
    print("Frontend Web App:     http://localhost:5173")
    print("Backend API:          http://localhost:8000")
    print("Swagger API Docs:     http://localhost:8000/docs")
    print("ReDoc API Docs:       http://localhost:8000/redoc")
    print("="*60 + "\n")


@app.get("/", tags=["Health Check"])
def root():
    return {
        "status": "online",
        "platform": settings.APP_NAME,
        "docs": "/docs",
        "redoc": "/redoc",
        "api_prefix": settings.API_V1_PREFIX
    }

@app.get("/health", tags=["Health Check"])
def health_check():
    return {"status": "healthy", "service": "HireSense Backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
