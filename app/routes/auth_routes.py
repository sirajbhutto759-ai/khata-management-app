import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.config import SECRET_KEY, ALGORITHM
from app.database import get_db
from app.models import User, ExpenseCategory, Notification
from app.schemas import (
    UserRegister, UserLogin, UserResponse, TokenResponse,
    UserProfileUpdate, ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordConfirm
)
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

DEFAULT_EXPENSE_CATEGORIES = [
    {"name": "Rent", "icon": "home"},
    {"name": "Electricity", "icon": "zap"},
    {"name": "Salary", "icon": "users"},
    {"name": "Transport", "icon": "truck"},
    {"name": "Food", "icon": "coffee"},
    {"name": "Internet", "icon": "wifi"},
    {"name": "Purchases", "icon": "shopping-bag"},
    {"name": "Other", "icon": "more-horizontal"}
]

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered."
        )

    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        business_name=user_in.business_name,
        owner_name=user_in.owner_name,
        email=user_in.email.lower(),
        phone=user_in.phone,
        password_hash=hashed_pwd,
        currency="PKR",
        language="en",
        theme="light"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Seed default expense categories for user
    for cat in DEFAULT_EXPENSE_CATEGORIES:
        db.add(ExpenseCategory(user_id=new_user.id, name=cat["name"], icon=cat["icon"]))

    # Seed welcome notification
    db.add(Notification(
        user_id=new_user.id,
        title="Welcome to Khata Management",
        message=f"Assalamu Alaikum! Welcome {new_user.owner_name}. Manage your business transactions seamlessly.",
        type="success"
    ))
    db.commit()

    access_token = create_access_token({"sub": str(new_user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email.lower()).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    access_token = create_access_token({"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_data.business_name is not None:
        current_user.business_name = profile_data.business_name
    if profile_data.owner_name is not None:
        current_user.owner_name = profile_data.owner_name
    if profile_data.phone is not None:
        current_user.phone = profile_data.phone
    if profile_data.currency is not None:
        current_user.currency = profile_data.currency
    if profile_data.language is not None:
        current_user.language = profile_data.language
    if profile_data.theme is not None:
        current_user.theme = profile_data.theme
    if profile_data.logo_url is not None:
        current_user.logo_url = profile_data.logo_url

    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/change-password")
def change_password(
    pwd_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(pwd_data.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect."
        )

    current_user.password_hash = get_password_hash(pwd_data.new_password)
    db.commit()

    # Add notification
    db.add(Notification(
        user_id=current_user.id,
        title="Password Changed",
        message="Your account password was updated successfully.",
        type="info"
    ))
    db.commit()

    return {"message": "Password changed successfully."}

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        # Avoid user enumeration for security, return success message
        return {"message": "If the email is registered, password reset instructions have been generated."}
    
    # Return reset token for quick testing / simulation in app
    reset_token = create_access_token({"sub": str(user.id), "reset": True})
    return {
        "message": "Reset token generated successfully.",
        "reset_token": reset_token
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordConfirm, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(req.token, SECRET_KEY, algorithms=[ALGORITHM])
        if not payload.get("reset"):
            raise HTTPException(status_code=400, detail="Invalid reset token")
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password reset successfully. You can now login with your new password."}
