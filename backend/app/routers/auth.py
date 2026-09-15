from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest, ResetPasswordResponse, Token
from app.schemas.user import UserResponse
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED, summary="Register a new recruiter/admin user")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    try:
        user = auth_service.register(db, req)
        return auth_service.create_user_token(user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/login", response_model=Token, summary="Authenticate user and return JWT access token")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate(db, req.email, req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth_service.create_user_token(user)

@router.post("/forgot-password", response_model=ResetPasswordResponse, summary="Initiate password recovery")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    try:
        res = auth_service.forgot_password(db, req.email)
        return res
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/reset-password", response_model=ResetPasswordResponse, summary="Reset user password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        user = auth_service.reset_password(db, req.email, req.new_password)
        return {"message": "Password updated successfully. You can now sign in.", "email": user.email}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/me", response_model=UserResponse, summary="Get current authenticated user profile")
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

