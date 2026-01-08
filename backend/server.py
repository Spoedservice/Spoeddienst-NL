from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
import bcrypt
import jwt
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'spoedklus_secret_key_2024')
JWT_ALGORITHM = "HS256"

# Stripe Config
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

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

class VakmanCreate(UserBase):
    password: str
    service_type: str  # elektricien, loodgieter, slotenmaker
    description: str
    hourly_rate: float
    location: str

class Vakman(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str = "vakman"
    service_type: str
    description: str
    hourly_rate: float
    location: str
    is_approved: bool = False
    is_available: bool = True
    rating: float = 0.0
    total_reviews: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ServiceCategory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    slug: str
    description: str
    icon: str
    base_price: float
    emergency_price: float
    image_url: str

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
    status: str = "pending"  # pending, accepted, in_progress, completed, cancelled
    price: float = 0.0
    payment_status: str = "unpaid"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    booking_id: str
    vakman_id: str
    rating: int
    comment: str

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    booking_id: str
    vakman_id: str
    customer_id: str
    customer_name: str
    rating: int
    comment: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    booking_id: str
    session_id: str
    amount: float
    currency: str = "eur"
    status: str = "initiated"
    payment_status: str = "pending"
    metadata: Dict = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7  # 7 days
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== SERVICE DATA ====================

SERVICES = [
    {
        "id": "elektricien",
        "name": "Elektricien",
        "slug": "elektricien",
        "description": "Storingen, installaties en reparaties aan uw elektra",
        "icon": "Zap",
        "base_price": 69.0,
        "emergency_price": 99.0,
        "image_url": "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
        "id": "loodgieter",
        "name": "Loodgieter",
        "slug": "loodgieter",
        "description": "Lekkages, verstoppingen en sanitair installaties",
        "icon": "Droplets",
        "base_price": 75.0,
        "emergency_price": 109.0,
        "image_url": "https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
        "id": "slotenmaker",
        "name": "Slotenmaker",
        "slug": "slotenmaker",
        "description": "Buitengesloten? Sloten vervangen of repareren",
        "icon": "Key",
        "base_price": 89.0,
        "emergency_price": 129.0,
        "image_url": "https://images.pexels.com/photos/279810/pexels-photo-279810.jpeg?auto=compress&cs=tinysrgb&w=800"
    }
]

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
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

@api_router.post("/auth/login")
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

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "vakman":
        user = await db.vakmannen.find_one({"id": current_user["user_id"]}, {"_id": 0, "password": 0})
    else:
        user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0, "password": 0})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ==================== VAKMAN ROUTES ====================

@api_router.post("/vakman/register")
async def register_vakman(vakman: VakmanCreate):
    existing = await db.vakmannen.find_one({"email": vakman.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    vakman_obj = Vakman(
        email=vakman.email,
        name=vakman.name,
        phone=vakman.phone,
        service_type=vakman.service_type,
        description=vakman.description,
        hourly_rate=vakman.hourly_rate,
        location=vakman.location
    )
    vakman_dict = vakman_obj.model_dump()
    vakman_dict["password"] = hash_password(vakman.password)
    vakman_dict["created_at"] = vakman_dict["created_at"].isoformat()
    
    await db.vakmannen.insert_one(vakman_dict)
    token = create_token(vakman_obj.id, "vakman")
    
    return {"token": token, "user": {"id": vakman_obj.id, "email": vakman_obj.email, "name": vakman_obj.name, "role": "vakman", "is_approved": False}}

@api_router.get("/vakmannen")
async def get_vakmannen(service_type: Optional[str] = None):
    query = {"is_approved": True, "is_available": True}
    if service_type:
        query["service_type"] = service_type
    
    vakmannen = await db.vakmannen.find(query, {"_id": 0, "password": 0}).to_list(100)
    return vakmannen

@api_router.get("/vakman/dashboard")
async def get_vakman_dashboard(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "vakman":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    vakman = await db.vakmannen.find_one({"id": current_user["user_id"]}, {"_id": 0, "password": 0})
    bookings = await db.bookings.find({"vakman_id": current_user["user_id"]}, {"_id": 0}).to_list(100)
    
    stats = {
        "total_jobs": len(bookings),
        "completed_jobs": len([b for b in bookings if b["status"] == "completed"]),
        "pending_jobs": len([b for b in bookings if b["status"] == "pending"]),
        "earnings": sum([b["price"] for b in bookings if b["payment_status"] == "paid"])
    }
    
    return {"vakman": vakman, "bookings": bookings, "stats": stats}

@api_router.put("/vakman/availability")
async def update_availability(is_available: bool, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "vakman":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.vakmannen.update_one({"id": current_user["user_id"]}, {"$set": {"is_available": is_available}})
    return {"message": "Availability updated"}

# ==================== SERVICE ROUTES ====================

@api_router.get("/services")
async def get_services():
    return SERVICES

@api_router.get("/services/{slug}")
async def get_service(slug: str):
    service = next((s for s in SERVICES if s["slug"] == slug), None)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    vakmannen = await db.vakmannen.find({"service_type": slug, "is_approved": True}, {"_id": 0, "password": 0}).to_list(10)
    return {"service": service, "vakmannen": vakmannen}

# ==================== BOOKING ROUTES ====================

@api_router.post("/bookings")
async def create_booking(booking: BookingCreate):
    service = next((s for s in SERVICES if s["id"] == booking.service_type), None)
    if not service:
        raise HTTPException(status_code=400, detail="Invalid service type")
    
    price = service["emergency_price"] if booking.is_emergency else service["base_price"]
    
    booking_obj = Booking(
        service_type=booking.service_type,
        is_emergency=booking.is_emergency,
        description=booking.description,
        address=booking.address,
        postal_code=booking.postal_code,
        city=booking.city,
        preferred_date=booking.preferred_date,
        preferred_time=booking.preferred_time,
        customer_name=booking.customer_name,
        customer_email=booking.customer_email,
        customer_phone=booking.customer_phone,
        price=price
    )
    
    booking_dict = booking_obj.model_dump()
    booking_dict["created_at"] = booking_dict["created_at"].isoformat()
    
    # Store the original dict before MongoDB adds _id
    response_booking = booking_dict.copy()
    
    await db.bookings.insert_one(booking_dict)
    
    return {"booking": response_booking, "message": "Booking created successfully"}

@api_router.get("/bookings")
async def get_bookings(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "vakman":
        bookings = await db.bookings.find({"vakman_id": current_user["user_id"]}, {"_id": 0}).to_list(100)
    elif current_user["role"] == "admin":
        bookings = await db.bookings.find({}, {"_id": 0}).to_list(100)
    else:
        user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
        if user:
            bookings = await db.bookings.find({"customer_email": user["email"]}, {"_id": 0}).to_list(100)
        else:
            bookings = []
    
    return bookings

@api_router.get("/bookings/{booking_id}")
async def get_booking(booking_id: str):
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@api_router.put("/bookings/{booking_id}/status")
async def update_booking_status(booking_id: str, status: str, current_user: dict = Depends(get_current_user)):
    valid_statuses = ["pending", "accepted", "in_progress", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    await db.bookings.update_one({"id": booking_id}, {"$set": {"status": status}})
    return {"message": "Status updated"}

@api_router.put("/bookings/{booking_id}/assign")
async def assign_vakman(booking_id: str, vakman_id: str, current_user: dict = Depends(get_current_user)):
    await db.bookings.update_one({"id": booking_id}, {"$set": {"vakman_id": vakman_id, "status": "accepted"}})
    return {"message": "Vakman assigned"}

# ==================== PAYMENT ROUTES ====================

@api_router.post("/payments/checkout")
async def create_checkout(booking_id: str, request: Request):
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    origin = request.headers.get("origin", host_url)
    success_url = f"{origin}/booking/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/booking/{booking_id}"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(booking["price"]),
        currency="eur",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"booking_id": booking_id}
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    transaction = PaymentTransaction(
        booking_id=booking_id,
        session_id=session.session_id,
        amount=float(booking["price"]),
        currency="eur",
        status="initiated",
        payment_status="pending",
        metadata={"booking_id": booking_id}
    )
    tx_dict = transaction.model_dump()
    tx_dict["created_at"] = tx_dict["created_at"].isoformat()
    await db.payment_transactions.insert_one(tx_dict)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, request: Request):
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction and booking if paid
    if status.payment_status == "paid":
        tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        if tx and tx["payment_status"] != "paid":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"status": "completed", "payment_status": "paid"}}
            )
            await db.bookings.update_one(
                {"id": tx["booking_id"]},
                {"$set": {"payment_status": "paid"}}
            )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            session_id = webhook_response.session_id
            tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
            if tx and tx["payment_status"] != "paid":
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {"$set": {"status": "completed", "payment_status": "paid"}}
                )
                await db.bookings.update_one(
                    {"id": tx["booking_id"]},
                    {"$set": {"payment_status": "paid"}}
                )
        
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# ==================== REVIEW ROUTES ====================

class PublicReviewCreate(BaseModel):
    customer_name: str
    city: Optional[str] = ""
    service: str
    rating: int
    comment: str

@api_router.post("/reviews/public")
async def create_public_review(review: PublicReviewCreate):
    """Allow customers to submit reviews without login"""
    review_obj = {
        "id": str(uuid.uuid4()),
        "customer_name": review.customer_name,
        "city": review.city,
        "service": review.service,
        "rating": review.rating,
        "comment": review.comment,
        "status": "pending",  # needs approval
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.public_reviews.insert_one(review_obj)
    return {"message": "Review submitted successfully"}

@api_router.post("/reviews")
async def create_review(review: ReviewCreate, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    review_obj = Review(
        booking_id=review.booking_id,
        vakman_id=review.vakman_id,
        customer_id=current_user["user_id"],
        customer_name=user["name"],
        rating=review.rating,
        comment=review.comment
    )
    
    review_dict = review_obj.model_dump()
    review_dict["created_at"] = review_dict["created_at"].isoformat()
    await db.reviews.insert_one(review_dict)
    
    # Update vakman rating
    reviews = await db.reviews.find({"vakman_id": review.vakman_id}, {"_id": 0}).to_list(1000)
    avg_rating = sum([r["rating"] for r in reviews]) / len(reviews)
    await db.vakmannen.update_one(
        {"id": review.vakman_id},
        {"$set": {"rating": avg_rating, "total_reviews": len(reviews)}}
    )
    
    return {"message": "Review created"}

@api_router.get("/reviews/latest")
async def get_latest_reviews():
    reviews = await db.reviews.find({}, {"_id": 0}).sort("created_at", -1).to_list(6)
    
    # If no reviews yet, return sample reviews
    if not reviews:
        reviews = [
            {"customer_name": "H.p.m.", "rating": 5, "comment": "De verstopping was snel en effectief verholpen. Snelle reactie en zeer vriendelijk.", "service": "Afvoer laten ontstoppen", "city": "Amsterdam"},
            {"customer_name": "Ilse", "rating": 5, "comment": "Prima specialist, werkt netjes en snel, en levert ook nog wat extra service. Top!", "service": "Vlotter laten vervangen", "city": "Rotterdam"},
            {"customer_name": "Richard", "rating": 5, "comment": "Eindresultaat is top. Echt een vakman.", "service": "Kraan laten plaatsen of vervangen", "city": "Utrecht"},
            {"customer_name": "Anwar", "rating": 5, "comment": "Aardige man. Correct en betrouwbaar. Werkt ook goed en denkt mee. Zou hem zo nogmaals inhuren.", "service": "Quooker laten installeren", "city": "Den Haag"},
            {"customer_name": "Maurice", "rating": 5, "comment": "Zeer prettige communicatie vooraf! Assistentie bij aanschaf benodigd materiaal en ondanks sneeuw keurig op tijd voor de klus. Vakman! Aanrader 👍", "service": "Opbouw doucheset laten plaatsen", "city": "Eindhoven"},
            {"customer_name": "Renate", "rating": 5, "comment": "Hüseyin is een bekwame vakman. Snel gewerkt en de tijd genomen voor duidelijke uitleg. We bevelen hem zeker aan!", "service": "Kraan laten plaatsen of vervangen", "city": "Groningen"}
        ]
    
    return reviews

@api_router.get("/reviews/{vakman_id}")
async def get_vakman_reviews(vakman_id: str):
    reviews = await db.reviews.find({"vakman_id": vakman_id}, {"_id": 0}).to_list(100)
    return reviews

# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/vakmannen")
async def admin_get_vakmannen(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    vakmannen = await db.vakmannen.find({}, {"_id": 0, "password": 0}).to_list(100)
    return vakmannen

@api_router.put("/admin/vakmannen/{vakman_id}/approve")
async def approve_vakman(vakman_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.vakmannen.update_one({"id": vakman_id}, {"$set": {"is_approved": True}})
    return {"message": "Vakman approved"}

@api_router.get("/admin/bookings")
async def admin_get_bookings(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    bookings = await db.bookings.find({}, {"_id": 0}).to_list(100)
    return bookings

@api_router.get("/admin/stats")
async def admin_get_stats(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    total_bookings = await db.bookings.count_documents({})
    pending_bookings = await db.bookings.count_documents({"status": "pending"})
    completed_bookings = await db.bookings.count_documents({"status": "completed"})
    total_vakmannen = await db.vakmannen.count_documents({})
    pending_vakmannen = await db.vakmannen.count_documents({"is_approved": False})
    total_users = await db.users.count_documents({})
    
    return {
        "total_bookings": total_bookings,
        "pending_bookings": pending_bookings,
        "completed_bookings": completed_bookings,
        "total_vakmannen": total_vakmannen,
        "pending_vakmannen": pending_vakmannen,
        "total_users": total_users
    }

# ==================== STATS ROUTES (PUBLIC) ====================

@api_router.get("/stats/public")
async def get_public_stats():
    total_bookings = await db.bookings.count_documents({})
    total_vakmannen = await db.vakmannen.count_documents({"is_approved": True})
    reviews = await db.reviews.find({}, {"_id": 0}).to_list(1000)
    avg_rating = sum([r["rating"] for r in reviews]) / len(reviews) if reviews else 4.7
    
    return {
        "total_bookings": total_bookings + 1250,  # Add some base numbers
        "total_vakmannen": total_vakmannen + 85,
        "total_reviews": len(reviews) + 2340,
        "avg_rating": round(avg_rating, 1)
    }

# ==================== PREMIUM SUBSCRIPTION ROUTES ====================

# Bankgegevens voor premium betalingen
# IBAN: NL07REVO6329249105
# BIC: CHASDEFX

class PremiumSubscribeRequest(BaseModel):
    plan: str  # 'monthly' or 'yearly'
    amount: float

class PremiumSubscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_email: Optional[str] = None
    plan: str
    amount: float
    currency: str = "eur"
    status: str = "pending"
    payment_method: str = "stripe"
    session_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

@api_router.post("/premium/subscribe")
async def create_premium_subscription(subscription: PremiumSubscribeRequest, request: Request):
    """Create a premium subscription checkout session"""
    
    amount = 39.95 if subscription.plan == 'monthly' else 399.00
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    origin = request.headers.get("origin", host_url)
    success_url = f"{origin}/premium/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/premium"
    
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency="eur",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "type": "premium_subscription",
            "plan": subscription.plan
        }
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Store subscription record
    sub = PremiumSubscription(
        plan=subscription.plan,
        amount=amount,
        session_id=session.session_id
    )
    sub_dict = sub.model_dump()
    sub_dict["created_at"] = sub_dict["created_at"].isoformat()
    await db.premium_subscriptions.insert_one(sub_dict)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/premium/status/{session_id}")
async def get_premium_status(session_id: str, request: Request):
    """Check premium subscription payment status"""
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
    
    if status.payment_status == "paid":
        await db.premium_subscriptions.update_one(
            {"session_id": session_id},
            {"$set": {"status": "active", "payment_status": "paid"}}
        )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "SpoedDienst24 API", "version": "1.0.0"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
