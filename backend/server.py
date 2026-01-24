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
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

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

# SMTP Config
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.transip.email')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 465))
SMTP_USER = os.environ.get('SMTP_USER', 'info@spoeddienst24.nl')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
SMTP_FROM = os.environ.get('SMTP_FROM', 'info@spoeddienst24.nl')

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint for Kubernetes (without /api prefix)
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "spoeddienst24-backend"}

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

async def send_booking_email(booking_data: dict):
    """Send booking notification email to Spoeddienst26@gmail.com"""
    try:
        service_names = {
            "elektricien": "Elektricien",
            "loodgieter": "Loodgieter",
            "slotenmaker": "Slotenmaker"
        }
        service_name = service_names.get(booking_data.get("service_type", ""), booking_data.get("service_type", "Onbekend"))
        is_spoed = "JA - SPOED" if booking_data.get("is_emergency") else "Nee"
        
        # Create email content
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #FF4500; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">⚡ SpoedDienst24</h1>
                <p style="color: white; margin: 5px 0;">Nieuwe Boeking Ontvangen</p>
            </div>
            
            <div style="padding: 20px; background-color: #f8f9fa;">
                <h2 style="color: #333; border-bottom: 2px solid #FF4500; padding-bottom: 10px;">Boekingsdetails</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Boeking ID:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">{booking_data.get('id', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Dienst:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">{service_name}</td>
                    </tr>
                    <tr style="background-color: {'#ffe6e6' if booking_data.get('is_emergency') else 'transparent'};">
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Spoed:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; color: {'#FF4500' if booking_data.get('is_emergency') else '#333'}; font-weight: {'bold' if booking_data.get('is_emergency') else 'normal'};">{is_spoed}</td>
                    </tr>
                </table>
                
                <h3 style="color: #333; margin-top: 20px;">Klantgegevens</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Naam:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">{booking_data.get('customer_name', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>E-mail:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><a href="mailto:{booking_data.get('customer_email', '')}">{booking_data.get('customer_email', 'N/A')}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Telefoon:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><a href="tel:{booking_data.get('customer_phone', '')}">{booking_data.get('customer_phone', 'N/A')}</a></td>
                    </tr>
                </table>
                
                <h3 style="color: #333; margin-top: 20px;">Locatie</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Adres:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">{booking_data.get('address', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Postcode:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">{booking_data.get('postal_code', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Plaats:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">{booking_data.get('city', 'N/A')}</td>
                    </tr>
                </table>
                
                <h3 style="color: #333; margin-top: 20px;">Afspraak</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Datum:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">{booking_data.get('preferred_date', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Tijd:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">{booking_data.get('preferred_time', 'N/A')}</td>
                    </tr>
                </table>
                
                <h3 style="color: #333; margin-top: 20px;">Probleemomschrijving</h3>
                <div style="background-color: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
                    <p style="margin: 0; white-space: pre-wrap;">{booking_data.get('description', 'Geen omschrijving')}</p>
                </div>
            </div>
            
            <div style="background-color: #333; padding: 15px; text-align: center;">
                <p style="color: #999; margin: 0; font-size: 12px;">Dit is een automatisch gegenereerd bericht van SpoedDienst24.nl</p>
            </div>
        </body>
        </html>
        """
        
        # Create message
        message = MIMEMultipart("alternative")
        message["From"] = SMTP_FROM
        message["To"] = "Spoeddienst26@gmail.com"
        message["Subject"] = f"{'🚨 SPOED - ' if booking_data.get('is_emergency') else ''}Nieuwe Boeking: {service_name} - {booking_data.get('customer_name', 'Klant')}"
        
        # Add HTML content
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        # Send email
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            use_tls=True
        )
        logging.info(f"Booking email sent successfully for booking {booking_data.get('id')}")
        return True
    except Exception as e:
        logging.error(f"Failed to send booking email: {str(e)}")
        return False

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

async def send_vakman_registration_email(vakman_data: dict, base_url: str):
    """Send vakman registration email to Spoeddienst26@gmail.com for approval"""
    try:
        service_names = {
            "elektricien": "Elektricien",
            "loodgieter": "Loodgieter", 
            "slotenmaker": "Slotenmaker"
        }
        service_name = service_names.get(vakman_data.get("service_type", ""), vakman_data.get("service_type", "Onbekend"))
        vakman_id = vakman_data.get("id")
        
        # Create approval and rejection URLs
        approve_url = f"{base_url}/api/vakman/{vakman_id}/approve?action=approve"
        reject_url = f"{base_url}/api/vakman/{vakman_id}/approve?action=reject"
        
        # Plain text version for better deliverability
        text_content = f"""
Nieuwe Vakman Aanmelding - SpoedDienst24

Naam: {vakman_data.get('name', 'N/A')}
E-mail: {vakman_data.get('email', 'N/A')}
Telefoon: {vakman_data.get('phone', 'N/A')}
Vakgebied: {service_name}
Werkgebied: {vakman_data.get('location', 'N/A')}
Uurtarief: EUR {vakman_data.get('hourly_rate', 'N/A')}

Beschrijving:
{vakman_data.get('description', 'Geen beschrijving')}

Goedkeuren: {approve_url}
Afwijzen: {reject_url}

Met vriendelijke groet,
SpoedDienst24
        """
        
        html_content = f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #FF4500; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">SpoedDienst24</h1>
        <p style="color: white; margin: 5px 0;">Nieuwe Vakman Aanmelding</p>
    </div>
    
    <div style="padding: 20px; background-color: #f8f9fa; border: 1px solid #ddd;">
        <h2 style="color: #333; border-bottom: 2px solid #FF4500; padding-bottom: 10px; margin-top: 0;">Gegevens</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Naam:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{vakman_data.get('name', 'N/A')}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>E-mail:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{vakman_data.get('email', 'N/A')}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Telefoon:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{vakman_data.get('phone', 'N/A')}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Vakgebied:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{service_name}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Werkgebied:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{vakman_data.get('location', 'N/A')}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Uurtarief:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">EUR {vakman_data.get('hourly_rate', 'N/A')}</td></tr>
        </table>
        
        <h3 style="color: #333; margin-top: 20px;">Beschrijving</h3>
        <div style="background-color: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
            <p style="margin: 0;">{vakman_data.get('description', 'Geen beschrijving')}</p>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
            <a href="{approve_url}" style="display: inline-block; background-color: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 5px;">GOEDKEUREN</a>
            <a href="{reject_url}" style="display: inline-block; background-color: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 5px;">AFWIJZEN</a>
        </div>
    </div>
    
    <div style="padding: 15px; text-align: center; color: #666; font-size: 12px;">
        <p>SpoedDienst24.nl - 085 333 2847</p>
    </div>
</body>
</html>
        """
        
        message = MIMEMultipart("alternative")
        message["From"] = f"SpoedDienst24 <{SMTP_FROM}>"
        message["To"] = "Spoeddienst26@gmail.com"
        message["Subject"] = f"Vakman Aanmelding: {vakman_data.get('name', 'Vakman')} ({service_name})"
        message["Reply-To"] = SMTP_FROM
        
        # Add plain text first, then HTML (email clients prefer the last part)
        text_part = MIMEText(text_content, "plain", "utf-8")
        html_part = MIMEText(html_content, "html", "utf-8")
        message.attach(text_part)
        message.attach(html_part)
        
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            use_tls=True
        )
        logging.info(f"Vakman registration email sent successfully for {vakman_data.get('name')}")
        return True
    except Exception as e:
        logging.error(f"Failed to send vakman registration email: {str(e)}")
        return False

@api_router.post("/vakman/register")
async def register_vakman(vakman: VakmanCreate, request: Request):
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
    
    # Send email notification for approval
    base_url = str(request.base_url).rstrip('/')
    # Use the frontend URL for the approval links
    frontend_url = os.environ.get('FRONTEND_URL', base_url.replace(':8001', ':3000'))
    await send_vakman_registration_email(vakman_dict, base_url)
    
    return {"token": token, "user": {"id": vakman_obj.id, "email": vakman_obj.email, "name": vakman_obj.name, "role": "vakman", "is_approved": False}}

@api_router.get("/vakman/{vakman_id}/approve")
async def approve_or_reject_vakman(vakman_id: str, action: str):
    """Approve or reject a vakman registration via email link"""
    vakman = await db.vakmannen.find_one({"id": vakman_id})
    if not vakman:
        return {"status": "error", "message": "Vakman niet gevonden"}
    
    if action == "approve":
        await db.vakmannen.update_one(
            {"id": vakman_id}, 
            {"$set": {"is_approved": True, "is_available": True}}
        )
        return {"status": "success", "message": f"✅ {vakman['name']} is goedgekeurd als vakman!", "action": "approved"}
    elif action == "reject":
        await db.vakmannen.delete_one({"id": vakman_id})
        return {"status": "success", "message": f"❌ Aanmelding van {vakman['name']} is afgewezen en verwijderd.", "action": "rejected"}
    else:
        return {"status": "error", "message": "Ongeldige actie"}

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
    
    # Send email notification to Spoeddienst26@gmail.com
    await send_booking_email(response_booking)
    
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

async def send_review_email(review_data: dict):
    """Send review notification email to Spoeddienst26@gmail.com for approval"""
    try:
        stars = "⭐" * review_data.get("rating", 5)
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #FF4500; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">⭐ SpoedDienst24</h1>
                <p style="color: white; margin: 5px 0;">Nieuwe Review Ontvangen</p>
            </div>
            
            <div style="padding: 20px; background-color: #f8f9fa;">
                <h2 style="color: #333; border-bottom: 2px solid #FF4500; padding-bottom: 10px;">Review Details</h2>
                
                <div style="background-color: #fff8e6; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                    <p style="font-size: 24px; margin: 0;">{stars}</p>
                    <p style="font-size: 18px; font-weight: bold; color: #333; margin: 5px 0;">{review_data.get('rating', 5)} van 5 sterren</p>
                </div>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Klant:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">{review_data.get('customer_name', 'Anoniem')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Plaats:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">{review_data.get('city', 'Niet opgegeven')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Dienst:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">{review_data.get('service', 'Niet opgegeven')}</td>
                    </tr>
                </table>
                
                <h3 style="color: #333; margin-top: 20px;">Review Tekst</h3>
                <div style="background-color: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd; border-left: 4px solid #FF4500;">
                    <p style="margin: 0; font-style: italic; color: #555;">"{review_data.get('comment', 'Geen tekst')}"</p>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background-color: #e8f5e9; border-radius: 8px;">
                    <p style="margin: 0; color: #2e7d32;"><strong>Status:</strong> Wacht op goedkeuring</p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Deze review wordt pas getoond op de website na uw goedkeuring.</p>
                </div>
            </div>
            
            <div style="background-color: #333; padding: 15px; text-align: center;">
                <p style="color: #999; margin: 0; font-size: 12px;">Dit is een automatisch gegenereerd bericht van SpoedDienst24.nl</p>
            </div>
        </body>
        </html>
        """
        
        message = MIMEMultipart("alternative")
        message["From"] = SMTP_FROM
        message["To"] = "Spoeddienst26@gmail.com"
        message["Subject"] = f"⭐ Nieuwe Review: {review_data.get('rating', 5)} sterren van {review_data.get('customer_name', 'Klant')}"
        
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            use_tls=True
        )
        logging.info(f"Review email sent successfully for review from {review_data.get('customer_name')}")
        return True
    except Exception as e:
        logging.error(f"Failed to send review email: {str(e)}")
        return False

@api_router.post("/reviews/public")
async def create_public_review(review: PublicReviewCreate):
    """Allow customers to submit reviews without login - sends email for approval"""
    review_obj = {
        "id": str(uuid.uuid4()),
        "customer_name": review.customer_name,
        "city": review.city,
        "service": review.service,
        "rating": review.rating,
        "comment": review.comment,
        "status": "pending",  # needs approval before showing on website
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.public_reviews.insert_one(review_obj)
    
    # Send email notification for approval
    await send_review_email(review_obj)
    
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

# ==================== ADMIN DASHBOARD ROUTES (PUBLIC FOR NOW) ====================

@api_router.get("/admin/bookings")
async def get_all_bookings():
    """Get all bookings for admin dashboard"""
    bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return bookings

@api_router.get("/admin/vakmannen")
async def get_all_vakmannen():
    """Get all vakmannen for admin dashboard"""
    vakmannen = await db.vakmannen.find({}, {"_id": 0, "password": 0}).sort("created_at", -1).to_list(500)
    return vakmannen

@api_router.get("/admin/reviews")
async def get_all_reviews():
    """Get all reviews for admin dashboard"""
    reviews = await db.public_reviews.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return reviews

@api_router.get("/admin/stats")
async def get_admin_stats():
    """Get statistics for admin dashboard"""
    total_bookings = await db.bookings.count_documents({})
    active_vakmannen = await db.vakmannen.count_documents({"is_approved": True})
    pending_vakmannen = await db.vakmannen.count_documents({"is_approved": False})
    total_reviews = await db.public_reviews.count_documents({})
    pending_reviews = await db.public_reviews.count_documents({"status": "pending"})
    
    # Calculate estimated revenue
    bookings = await db.bookings.find({}, {"_id": 0, "price": 1}).to_list(1000)
    total_revenue = sum([b.get("price", 0) for b in bookings])
    
    return {
        "total_bookings": total_bookings,
        "active_vakmannen": active_vakmannen,
        "pending_vakmannen": pending_vakmannen,
        "total_reviews": total_reviews,
        "pending_reviews": pending_reviews,
        "total_revenue": round(total_revenue, 2)
    }

@api_router.post("/admin/vakman/{vakman_id}/approve")
async def approve_vakman_admin(vakman_id: str):
    """Approve a vakman registration"""
    result = await db.vakmannen.update_one(
        {"id": vakman_id}, 
        {"$set": {"is_approved": True, "is_available": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Vakman niet gevonden")
    return {"message": "Vakman goedgekeurd"}

@api_router.post("/admin/vakman/{vakman_id}/reject")
async def reject_vakman_admin(vakman_id: str):
    """Reject and delete a vakman registration"""
    result = await db.vakmannen.delete_one({"id": vakman_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vakman niet gevonden")
    return {"message": "Vakman afgewezen"}

@api_router.post("/admin/review/{review_id}/approve")
async def approve_review_admin(review_id: str):
    """Approve a review"""
    result = await db.public_reviews.update_one(
        {"id": review_id}, 
        {"$set": {"status": "approved"}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Review niet gevonden")
    return {"message": "Review goedgekeurd"}

@api_router.post("/admin/review/{review_id}/reject")
async def reject_review_admin(review_id: str):
    """Reject and delete a review"""
    result = await db.public_reviews.delete_one({"id": review_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review niet gevonden")
    return {"message": "Review verwijderd"}

@api_router.put("/admin/booking/{booking_id}/status")
async def update_booking_status_admin(booking_id: str, status_update: dict):
    """Update booking status"""
    status = status_update.get("status")
    if status not in ["pending", "confirmed", "in_progress", "completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Ongeldige status")
    
    result = await db.bookings.update_one(
        {"id": booking_id}, 
        {"$set": {"status": status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Boeking niet gevonden")
    return {"message": f"Status gewijzigd naar {status}"}

@api_router.get("/admin/financial")
async def get_financial_stats(period: str = "month"):
    """Get financial statistics for admin dashboard"""
    from datetime import timedelta
    
    # Calculate date range
    now = datetime.now(timezone.utc)
    if period == "day":
        start_date = now - timedelta(days=1)
    elif period == "week":
        start_date = now - timedelta(weeks=1)
    elif period == "month":
        start_date = now - timedelta(days=30)
    elif period == "year":
        start_date = now - timedelta(days=365)
    else:
        start_date = now - timedelta(days=30)
    
    # Get all bookings
    all_bookings = await db.bookings.find({}, {"_id": 0}).to_list(1000)
    
    # Filter by date (handle both string and datetime formats)
    filtered_bookings = []
    for b in all_bookings:
        try:
            created = b.get("created_at", "")
            if isinstance(created, str):
                booking_date = datetime.fromisoformat(created.replace("Z", "+00:00"))
            else:
                booking_date = created
            if booking_date >= start_date:
                filtered_bookings.append(b)
        except:
            filtered_bookings.append(b)  # Include if date parsing fails
    
    # Calculate statistics
    total_revenue = sum([b.get("price", 0) for b in filtered_bookings])
    paid_revenue = sum([b.get("price", 0) for b in filtered_bookings if b.get("payment_status") == "paid"])
    pending_revenue = sum([b.get("price", 0) for b in filtered_bookings if b.get("payment_status") != "paid"])
    
    # Revenue by service type
    revenue_by_service = {}
    for b in filtered_bookings:
        service = b.get("service_type", "other")
        revenue_by_service[service] = revenue_by_service.get(service, 0) + b.get("price", 0)
    
    # Bookings by status
    bookings_by_status = {}
    for b in filtered_bookings:
        status = b.get("status", "pending")
        bookings_by_status[status] = bookings_by_status.get(status, 0) + 1
    
    # Daily revenue for chart (last 7 days)
    daily_revenue = []
    for i in range(7):
        day = now - timedelta(days=6-i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        day_bookings = [b for b in all_bookings if _booking_in_range(b, day_start, day_end)]
        day_total = sum([b.get("price", 0) for b in day_bookings])
        daily_revenue.append({
            "date": day_start.strftime("%d/%m"),
            "revenue": day_total,
            "bookings": len(day_bookings)
        })
    
    # Payment status breakdown
    payment_status = {
        "paid": len([b for b in filtered_bookings if b.get("payment_status") == "paid"]),
        "unpaid": len([b for b in filtered_bookings if b.get("payment_status") != "paid"])
    }
    
    return {
        "period": period,
        "total_revenue": round(total_revenue, 2),
        "paid_revenue": round(paid_revenue, 2),
        "pending_revenue": round(pending_revenue, 2),
        "total_bookings": len(filtered_bookings),
        "revenue_by_service": revenue_by_service,
        "bookings_by_status": bookings_by_status,
        "daily_revenue": daily_revenue,
        "payment_status": payment_status,
        "average_order_value": round(total_revenue / len(filtered_bookings), 2) if filtered_bookings else 0
    }

def _booking_in_range(booking, start, end):
    """Helper to check if booking is in date range"""
    try:
        created = booking.get("created_at", "")
        if isinstance(created, str):
            booking_date = datetime.fromisoformat(created.replace("Z", "+00:00"))
        else:
            booking_date = created
        return start <= booking_date < end
    except:
        return False

@api_router.get("/admin/marketing")
async def get_marketing_stats():
    """Get marketing statistics for admin dashboard"""
    
    # Get all bookings
    all_bookings = await db.bookings.find({}, {"_id": 0}).to_list(1000)
    
    # Bookings by service (for pie chart)
    bookings_by_service = {}
    for b in all_bookings:
        service = b.get("service_type", "other")
        bookings_by_service[service] = bookings_by_service.get(service, 0) + 1
    
    # Emergency vs regular bookings
    emergency_bookings = len([b for b in all_bookings if b.get("is_emergency")])
    regular_bookings = len(all_bookings) - emergency_bookings
    
    # Bookings by city (top 5)
    bookings_by_city = {}
    for b in all_bookings:
        city = b.get("city", "Onbekend")
        if city:
            bookings_by_city[city] = bookings_by_city.get(city, 0) + 1
    top_cities = sorted(bookings_by_city.items(), key=lambda x: x[1], reverse=True)[:5]
    
    # Conversion rate simulation (pending → completed)
    completed = len([b for b in all_bookings if b.get("status") == "completed"])
    conversion_rate = (completed / len(all_bookings) * 100) if all_bookings else 0
    
    # Time slot popularity
    time_slots = {}
    for b in all_bookings:
        time = b.get("preferred_time", "Onbekend")
        time_slots[time] = time_slots.get(time, 0) + 1
    
    # Revenue by service for chart
    revenue_by_service = {}
    for b in all_bookings:
        service = b.get("service_type", "other")
        revenue_by_service[service] = revenue_by_service.get(service, 0) + b.get("price", 0)
    
    return {
        "total_bookings": len(all_bookings),
        "bookings_by_service": bookings_by_service,
        "emergency_vs_regular": {
            "emergency": emergency_bookings,
            "regular": regular_bookings
        },
        "top_cities": dict(top_cities),
        "conversion_rate": round(conversion_rate, 1),
        "time_slots": time_slots,
        "revenue_by_service": revenue_by_service,
        "service_performance": [
            {"service": k, "bookings": bookings_by_service.get(k, 0), "revenue": round(v, 2)}
            for k, v in revenue_by_service.items()
        ]
    }

@api_router.get("/admin/export/bookings")
async def export_bookings_csv():
    """Export bookings data as CSV"""
    import io
    import csv
    from fastapi.responses import StreamingResponse
    
    bookings = await db.bookings.find({}, {"_id": 0}).to_list(1000)
    
    # Create CSV
    output = io.StringIO()
    if bookings:
        writer = csv.DictWriter(output, fieldnames=bookings[0].keys())
        writer.writeheader()
        writer.writerows(bookings)
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=boekingen_export.csv"}
    )

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
