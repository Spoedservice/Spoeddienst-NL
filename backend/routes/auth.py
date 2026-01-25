"""Authentication routes for SpoedDienst24"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone, timedelta
import uuid
import bcrypt
import jwt

from config.database import db, JWT_SECRET, JWT_ALGORITHM, get_current_user, FRONTEND_URL
from models.schemas import UserCreate, UserLogin, User, ForgotPasswordRequest, ResetPasswordRequest
from services.email import send_password_reset_email

router = APIRouter(prefix="/auth", tags=["auth"])


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_token(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


@router.post("/register")
async def register_customer(user: UserCreate):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_obj = User(
        email=user.email,
        name=user.name,
        phone=user.phone
    )
    user_dict = user_obj.model_dump()
    user_dict["password"] = hash_password(user.password)
    user_dict["created_at"] = user_dict["created_at"].isoformat()
    
    await db.users.insert_one(user_dict)
    token = create_token(user_obj.id, "customer")
    
    return {"token": token, "user": {"id": user_obj.id, "email": user_obj.email, "name": user_obj.name, "role": "customer"}}


@router.post("/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        user = await db.vakmannen.find_one({"email": credentials.email}, {"_id": 0})
    
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["role"])
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"]
        }
    }


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "vakman":
        user = await db.vakmannen.find_one({"id": current_user["user_id"]}, {"_id": 0, "password": 0})
    else:
        user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0, "password": 0})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Send password reset email"""
    email = request.email.lower().strip()
    
    user = await db.users.find_one({"email": email}, {"_id": 0})
    user_type = "user"
    
    if not user:
        user = await db.vakmannen.find_one({"email": email}, {"_id": 0})
        user_type = "vakman"
    
    if not user:
        return {"message": "Als dit e-mailadres bij ons bekend is, ontvang je een reset link."}
    
    reset_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    await db.password_resets.insert_one({
        "email": email,
        "token": reset_token,
        "user_type": user_type,
        "expires_at": expires_at.isoformat(),
        "used": False
    })
    
    await send_password_reset_email(user, reset_token)
    
    return {"message": "Als dit e-mailadres bij ons bekend is, ontvang je een reset link."}


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password with token"""
    reset_record = await db.password_resets.find_one({
        "token": request.token,
        "used": False
    })
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Ongeldige of verlopen reset link")
    
    expires_at = datetime.fromisoformat(reset_record["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Reset link is verlopen")
    
    hashed_password = hash_password(request.new_password)
    
    if reset_record["user_type"] == "vakman":
        await db.vakmannen.update_one(
            {"email": reset_record["email"]},
            {"$set": {"password": hashed_password}}
        )
    else:
        await db.users.update_one(
            {"email": reset_record["email"]},
            {"$set": {"password": hashed_password}}
        )
    
    await db.password_resets.update_one(
        {"token": request.token},
        {"$set": {"used": True}}
    )
    
    return {"message": "Wachtwoord succesvol gewijzigd"}
