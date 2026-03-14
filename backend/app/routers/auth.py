from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Volunteer, Organization
from ..schemas import UserLogin
from ..utils.auth import verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login")
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    # Universal login for users, volunteers, and organizations.
    """
    
    # Try User login
    user = db.query(User).filter(User.email == credentials.email).first()
    if user and verify_password(credentials.password, user.password_hash):
        return {
            "token": f"user_{user.id}",
            "user_id": str(user.id),
            "user_type": "user",
            "name": user.name,
            "email": user.email
        }
    
    # Try Volunteer login
    volunteer = db.query(Volunteer).filter(Volunteer.email == credentials.email).first()
    if volunteer and volunteer.password_hash and verify_password(credentials.password, volunteer.password_hash):
        if not volunteer.is_active:
            raise HTTPException(
                status_code=403,
                detail="Your volunteer application is pending approval"
            )
        return {
            "token": f"volunteer_{volunteer.id}",
            "user_id": str(volunteer.id),
            "user_type": "volunteer",
            "name": volunteer.name,
            "email": volunteer.email
        }
    
    # Try Organization login
    organization = db.query(Organization).filter(Organization.email == credentials.email).first()
    if organization and organization.password_hash and verify_password(credentials.password, organization.password_hash):
        if not organization.is_active:
            raise HTTPException(
                status_code=403,
                detail="Your organization account is pending approval"
            )
        return {
            "token": f"organization_{organization.id}",
            "user_id": str(organization.id),
            "user_type": "organization",
            "name": organization.name,
            "email": organization.email
        }
    
    # Not Found
    raise HTTPException(
        status_code=401,
        detail="Invalid email or password"
    )
