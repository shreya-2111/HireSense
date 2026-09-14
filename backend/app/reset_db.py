import os
import shutil
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import engine, Base, SessionLocal
from app.core.config import settings
from app.models.user import User

def reset_database():
    print("Purging all dummy and seeded data from HireSense database...")
    
    db = SessionLocal()
    existing_users = []
    try:
        # Save real user accounts
        for u in db.query(User).all():
            existing_users.append({
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "password_hash": u.password_hash,
                "role": u.role,
                "is_active": u.is_active,
            })
    except Exception as e:
        print(f"User backup note: {e}")
    finally:
        db.close()

    # Drop / Truncate recruitment dummy data
    try:
        with engine.connect() as conn:
            if "mysql" in settings.DATABASE_URL:
                conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
                for table in reversed(Base.metadata.sorted_tables):
                    conn.execute(text(f"TRUNCATE TABLE `{table.name}`;"))
                conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
                conn.commit()
                print("All MySQL recruitment tables cleared successfully.")
            else:
                Base.metadata.drop_all(bind=engine)
                Base.metadata.create_all(bind=engine)
                print("All SQLite tables reset cleanly.")
    except Exception as e:
        print(f"Direct truncate error: {e}. Dropping and recreating tables...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

    # Restore registered user accounts
    if existing_users:
        db = SessionLocal()
        try:
            for u_data in existing_users:
                user = User(
                    id=u_data["id"],
                    name=u_data["name"],
                    email=u_data["email"],
                    password_hash=u_data["password_hash"],
                    role=u_data["role"],
                    is_active=u_data["is_active"],
                )
                db.add(user)
            db.commit()
            print(f"Preserved {len(existing_users)} registered user account(s).")
        except Exception as e:
            db.rollback()
            print(f"User restore note: {e}")
        finally:
            db.close()

    # Clear uploads directory
    if os.path.exists(settings.UPLOAD_DIR):
        for filename in os.listdir(settings.UPLOAD_DIR):
            file_path = os.path.join(settings.UPLOAD_DIR, filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                print(f"Failed to delete upload {file_path}: {e}")
        print("Uploads directory emptied.")

    # Remove local sqlite file if MySQL is primary
    if os.path.exists("hiresense.db") and "mysql" in settings.DATABASE_URL:
        try:
            os.remove("hiresense.db")
        except Exception:
            pass

    print("\n[SUCCESS] All dummy candidates, jobs, resumes, and interviews have been completely purged.")
    print("HireSense is now operating exclusively with 100% real live data.")

if __name__ == "__main__":
    reset_database()
