import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger("hiresense.database")

def create_db_engine():
    db_url = settings.DATABASE_URL
    try:
        # If MySQL connection URL, ensure target database exists
        if "mysql" in db_url:
            # Parse server URL without database name to ensure DB exists
            try:
                # e.g. mysql+pymysql://root:root@localhost:3306/hiresense_db
                parts = db_url.rsplit("/", 1)
                server_url = parts[0]
                db_name = parts[1].split("?")[0] if len(parts) > 1 else "hiresense_db"

                temp_engine = create_engine(server_url, pool_pre_ping=True)
                with temp_engine.connect() as conn:
                    conn.execute(text(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
                    conn.commit()
                temp_engine.dispose()
                logger.info(f"Database `{db_name}` verified/created successfully.")
            except Exception as e:
                logger.warning(f"Could not auto-create MySQL database on server: {e}. Attempting direct connection...")

        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_recycle=3600,
            echo=False
        )
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info(f"Connected to database: {db_url}")
        return engine
    except Exception as e:
        logger.error(f"Failed to connect to primary database ({db_url}): {e}")
        # Fallback to local SQLite to ensure the backend is always 100% operational
        fallback_url = "sqlite:///./hiresense.db"
        logger.warning(f"Falling back to local SQLite database: {fallback_url}")
        return create_engine(fallback_url, connect_args={"check_same_thread": False})

engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """FastAPI dependency for yielding database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize all database tables from SQLAlchemy models."""
    import app.models # ensure all models are registered
    Base.metadata.create_all(bind=engine)

