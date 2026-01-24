"""Pydantic models for SpoedDienst24"""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid


# ==================== USER MODELS ====================

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str = "customer"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================== VAKMAN MODELS ====================

class VakmanCreate(UserBase):
    password: str
    service_type: str
    description: str = ""
    hourly_rate: float
    location: str
    kvk_nummer: str = ""
    btw_nummer: str = ""
    verzekering: str = ""
    verzekering_maatschappij: str = ""

class Vakman(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    service_type: str
    description: str = ""
    hourly_rate: float
    location: str
    is_approved: bool = False
    is_available: bool = False
    rating: float = 0.0
    total_reviews: int = 0
    kvk_nummer: str = ""
    btw_nummer: str = ""
    verzekering: str = ""
    verzekering_maatschappij: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================== SERVICE MODELS ====================

class ServiceCategory(BaseModel):
    id: str
    title: str
    slug: str
    description: str
    icon: str
    color: str
    base_price: float
    emergency_price: float
    common_issues: list


# ==================== BOOKING MODELS ====================

class BookingCreate(BaseModel):
    service_type: str
    is_emergency: bool = False
    description: str
    address: str
    postal_code: str
    city: str
    preferred_date: str
    preferred_time: str
    customer_name: str
    customer_email: EmailStr
    customer_phone: str

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: Optional[str] = None
    vakman_id: Optional[str] = None
    vakman_name: Optional[str] = None
    service_type: str
    is_emergency: bool
    description: str
    address: str
    postal_code: str
    city: str
    preferred_date: str
    preferred_time: str
    customer_name: str
    customer_email: str
    customer_phone: str
    status: str = "pending"
    price: float = 0.0
    payment_status: str = "unpaid"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================== REVIEW MODELS ====================

class ReviewCreate(BaseModel):
    vakman_id: str
    booking_id: str
    rating: int
    comment: str

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    vakman_id: str
    booking_id: str
    rating: int
    comment: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PublicReviewCreate(BaseModel):
    customer_name: str
    city: str
    service_type: str
    rating: int
    comment: str


# ==================== PAYMENT MODELS ====================

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    booking_id: str
    amount: float
    status: str = "pending"
    stripe_session_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================== AUTH MODELS ====================

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# ==================== ADMIN MODELS ====================

class AssignVakmanRequest(BaseModel):
    vakman_id: str


# ==================== PREMIUM MODELS ====================

class PremiumSubscribeRequest(BaseModel):
    vakman_email: EmailStr
    plan: str = "monthly"
    session_id: Optional[str] = None

class PremiumSubscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vakman_id: str
    vakman_email: str
    plan: str
    status: str = "pending"
    stripe_session_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
