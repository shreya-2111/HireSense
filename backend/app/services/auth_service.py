from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest
from app.core.security import verify_password, get_password_hash, create_access_token

class AuthService:
    def register(self, db: Session, req: RegisterRequest) -> User:
        existing = db.query(User).filter(User.email == req.email).first()
        if existing:
            raise ValueError("Email already registered")
        
        user = User(
            name=req.name,
            email=req.email,
            password_hash=get_password_hash(req.password),
            role=req.role or "recruiter",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def authenticate(self, db: Session, email: str, password: str) -> Optional[User]:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    def forgot_password(self, db: Session, email: str) -> dict:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise ValueError("No account found with this email address")
        return {
            "message": f"Password reset instructions and verification code prepared for {email}",
            "email": email
        }

    def reset_password(self, db: Session, email: str, new_password: str) -> User:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise ValueError("No account found with this email address")
        if len(new_password) < 6:
            raise ValueError("Password must be at least 6 characters")
        
        user.password_hash = get_password_hash(new_password)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def create_user_token(self, user: User) -> dict:
        access_token = create_access_token(
            subject=user.email,
            claims={"user_id": user.id, "role": user.role, "name": user.name}
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        }

auth_service = AuthService()

