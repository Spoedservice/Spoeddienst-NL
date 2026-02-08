from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
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
JWT_SECRET = os.environ.get('JWT_SECRET')
if not JWT_SECRET:
    raise ValueError("JWT_SECRET environment variable is required")
JWT_ALGORITHM = "HS256"

# Stripe Config
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

# SMTP Config
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.transip.email')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 465))
SMTP_USER = os.environ.get('SMTP_USER', 'info@spoeddienst24.nl')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
SMTP_FROM = os.environ.get('SMTP_FROM', 'info@spoeddienst24.nl')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://spoeddienst24.nl')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'Spoeddienst26@gmail.com')
ADMIN_EMAIL_BE = os.environ.get('ADMIN_EMAIL_BE', 'info@spoeddienst24.be')  # Belgian admin email

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint for Kubernetes (without /api prefix)
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "spoeddienst24-backend"}

@api_router.get("/health")
async def api_health_check():
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
    kvk_nummer: str  # KVK nummer
    btw_nummer: Optional[str] = ""  # BTW nummer (optioneel voor kleine ondernemers)
    verzekering: str  # Type verzekering
    verzekering_maatschappij: Optional[str] = ""  # Verzekeringsmaatschappij

class Vakman(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str = "vakman"
    service_type: str
    description: str
    hourly_rate: float
    location: str
    kvk_nummer: str = ""
    btw_nummer: str = ""
    verzekering: str = ""
    verzekering_maatschappij: str = ""
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
    photo_url: Optional[str] = None
    country: Optional[str] = "NL"  # NL or BE - determines which admin receives the booking

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
    photo_url: Optional[str] = None
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

async def get_admin_user(request: Request):
    """Verify user is authenticated AND has admin role"""
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

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
                
                {"" if not booking_data.get('photo_url') else f'''
                <h3 style="color: #333; margin-top: 20px;">📷 Foto van het probleem</h3>
                <div style="background-color: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd; text-align: center;">
                    <a href="{FRONTEND_URL.rstrip("/")}{booking_data.get("photo_url")}" target="_blank" style="display: inline-block; background-color: #FF4500; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        📷 Bekijk Foto
                    </a>
                    <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Klik om de foto te openen</p>
                </div>
                '''}
            </div>
            
            <div style="background-color: #333; padding: 15px; text-align: center;">
                <p style="color: #999; margin: 0; font-size: 12px;">Dit is een automatisch gegenereerd bericht van SpoedDienst24.nl</p>
            </div>
        </body>
        </html>
        """
        
        # Determine recipient based on country
        country = booking_data.get('country', 'NL')
        recipient_email = ADMIN_EMAIL_BE if country == 'BE' else "info@spoeddienst24.nl"
        
        # Create message
        message = MIMEMultipart("alternative")
        message["From"] = SMTP_FROM
        message["To"] = recipient_email
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

async def send_customer_confirmation_email(booking_data: dict):
    """Send booking confirmation email to customer"""
    try:
        service_names = {
            "elektricien": "Elektricien",
            "loodgieter": "Loodgieter",
            "slotenmaker": "Slotenmaker"
        }
        service_name = service_names.get(booking_data.get("service_type", ""), booking_data.get("service_type", "Onbekend"))
        customer_email = booking_data.get('customer_email')
        
        if not customer_email:
            logging.warning("No customer email provided")
            return False
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #FF4500; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">⚡ SpoedDienst24</h1>
                <p style="color: white; margin: 5px 0;">Uw Boeking is Bevestigd!</p>
            </div>
            
            <div style="padding: 20px; background-color: #f8f9fa;">
                <h2 style="color: #333;">Beste {booking_data.get('customer_name', 'Klant')},</h2>
                <p style="color: #666; font-size: 16px;">Bedankt voor uw boeking bij SpoedDienst24. Hieronder vindt u de details van uw afspraak.</p>
                
                <div style="background-color: white; padding: 20px; border-radius: 10px; border-left: 4px solid #FF4500; margin: 20px 0;">
                    <h3 style="color: #FF4500; margin-top: 0;">📋 Boekingsdetails</h3>
                    <table style="width: 100%;">
                        <tr><td style="padding: 8px 0; color: #666;">Boeking ID:</td><td style="padding: 8px 0; font-weight: bold;">{booking_data.get('id', 'N/A')}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666;">Dienst:</td><td style="padding: 8px 0; font-weight: bold;">{service_name}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666;">Prijs:</td><td style="padding: 8px 0; font-weight: bold; color: #FF4500;">€{booking_data.get('price', 0)},-</td></tr>
                    </table>
                </div>
                
                <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">📅 Afspraak</h3>
                    <p style="font-size: 18px; margin: 0;"><strong>{booking_data.get('preferred_date', 'N/A')}</strong> om <strong>{booking_data.get('preferred_time', 'N/A')}</strong></p>
                </div>
                
                <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">📍 Locatie</h3>
                    <p style="margin: 0;">{booking_data.get('address', 'N/A')}<br>{booking_data.get('postal_code', '')} {booking_data.get('city', '')}</p>
                </div>
                
                <div style="background-color: #fff3e6; padding: 15px; border-radius: 10px; margin: 20px 0;">
                    <h4 style="color: #FF4500; margin-top: 0;">💳 Betaling</h4>
                    <p style="margin: 0; color: #666;">U betaalt direct aan de monteur na afloop van de klus. Wij accepteren contant en pin.</p>
                </div>
                
                <p style="color: #666;">Heeft u vragen? Neem gerust contact met ons op:</p>
                <p style="margin: 0;"><strong>📞 Telefoon:</strong> <a href="tel:+31201234567" style="color: #FF4500;">020-123 4567</a></p>
                <p style="margin: 0;"><strong>✉️ Email:</strong> <a href="mailto:info@spoeddienst24.nl" style="color: #FF4500;">info@spoeddienst24.nl</a></p>
            </div>
            
            <div style="background-color: #333; padding: 15px; text-align: center;">
                <p style="color: #999; margin: 0; font-size: 12px;">© 2024 SpoedDienst24.nl - 24/7 Vakmannen aan uw deur</p>
            </div>
        </body>
        </html>
        """
        
        message = MIMEMultipart("alternative")
        message["From"] = SMTP_FROM
        message["To"] = customer_email
        message["Subject"] = f"✅ Bevestiging: Uw {service_name} afspraak op {booking_data.get('preferred_date', '')}"
        
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
        logging.info(f"Customer confirmation email sent to {customer_email}")
        return True
    except Exception as e:
        logging.error(f"Failed to send customer confirmation email: {str(e)}")
        return False

async def send_vakman_notification_email(booking_data: dict):
    """Send new job notification to available vakmannen"""
    try:
        service_type = booking_data.get("service_type", "")
        service_names = {
            "elektricien": "Elektricien",
            "loodgieter": "Loodgieter",
            "slotenmaker": "Slotenmaker"
        }
        service_name = service_names.get(service_type, service_type)
        
        # Find available and approved vakmannen for this service type
        vakmannen = await db.vakmannen.find({
            "service_type": service_type,
            "is_approved": True,
            "is_available": True
        }, {"_id": 0}).to_list(50)
        
        if not vakmannen:
            logging.warning(f"No available vakmannen found for {service_type}")
            return False
        
        is_spoed = "🚨 SPOEDKLUS" if booking_data.get('is_emergency') else "Nieuwe Klus"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: {'#FF4500' if booking_data.get('is_emergency') else '#2563eb'}; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">⚡ SpoedDienst24</h1>
                <p style="color: white; margin: 5px 0; font-size: 18px;">{is_spoed}</p>
            </div>
            
            <div style="padding: 20px; background-color: #f8f9fa;">
                <div style="background-color: {'#fff3e6' if booking_data.get('is_emergency') else '#e6f2ff'}; padding: 20px; border-radius: 10px; border-left: 4px solid {'#FF4500' if booking_data.get('is_emergency') else '#2563eb'}; margin-bottom: 20px;">
                    <h2 style="color: {'#FF4500' if booking_data.get('is_emergency') else '#2563eb'}; margin-top: 0;">
                        {'🚨 SPOED - ' if booking_data.get('is_emergency') else ''}Nieuwe {service_name} Klus!
                    </h2>
                    <p style="font-size: 24px; font-weight: bold; color: #333; margin: 0;">€{booking_data.get('price', 0)},-</p>
                </div>
                
                <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">📍 Locatie</h3>
                    <p style="font-size: 16px; margin: 0;"><strong>{booking_data.get('city', 'N/A')}</strong></p>
                    <p style="color: #666; margin: 5px 0 0 0;">{booking_data.get('address', 'N/A')}, {booking_data.get('postal_code', '')}</p>
                </div>
                
                <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">📅 Gewenste Tijd</h3>
                    <p style="font-size: 18px; margin: 0;"><strong>{booking_data.get('preferred_date', 'N/A')}</strong> - {booking_data.get('preferred_time', 'N/A')}</p>
                </div>
                
                <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">🔧 Probleemomschrijving</h3>
                    <p style="color: #666; white-space: pre-wrap;">{booking_data.get('description', 'Geen omschrijving')}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <p style="color: #666; margin-bottom: 15px;">Log in op je dashboard om deze klus te accepteren:</p>
                    <a href="{FRONTEND_URL}/vakman/dashboard" style="display: inline-block; background-color: #FF4500; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Bekijk Klus →
                    </a>
                </div>
            </div>
            
            <div style="background-color: #333; padding: 15px; text-align: center;">
                <p style="color: #999; margin: 0; font-size: 12px;">Je ontvangt dit bericht omdat je beschikbaar bent voor klussen in deze categorie.</p>
            </div>
        </body>
        </html>
        """
        
        emails_sent = 0
        for vakman in vakmannen:
            try:
                vakman_email = vakman.get('email')
                if not vakman_email:
                    continue
                    
                message = MIMEMultipart("alternative")
                message["From"] = SMTP_FROM
                message["To"] = vakman_email
                message["Subject"] = f"{'🚨 SPOED: ' if booking_data.get('is_emergency') else ''}Nieuwe {service_name} klus in {booking_data.get('city', 'jouw regio')} - €{booking_data.get('price', 0)},-"
                
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
                emails_sent += 1
            except Exception as e:
                logging.error(f"Failed to send email to vakman {vakman.get('email')}: {str(e)}")
                continue
        
        logging.info(f"Vakman notification emails sent to {emails_sent} vakmannen")
        return emails_sent > 0
    except Exception as e:
        logging.error(f"Failed to send vakman notification emails: {str(e)}")
        return False

async def send_specific_vakman_notification_email(booking_data: dict, vakman_id: str):
    """Send new job notification to a specific selected vakman"""
    try:
        # Find the specific vakman
        vakman = await db.vakmannen.find_one({"id": vakman_id}, {"_id": 0, "password": 0})
        if not vakman:
            logging.warning(f"Vakman with id {vakman_id} not found")
            return False
        
        vakman_email = vakman.get('email')
        if not vakman_email:
            logging.warning(f"No email for vakman {vakman_id}")
            return False
        
        service_type = booking_data.get("service_type", "")
        service_names = {
            "elektricien": "Elektricien",
            "loodgieter": "Loodgieter",
            "slotenmaker": "Slotenmaker"
        }
        service_name = service_names.get(service_type, service_type)
        
        is_spoed = "🚨 SPOEDKLUS - DIRECT VOOR U" if booking_data.get('is_emergency') else "Nieuwe Klus - Direct voor u"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: {'#FF4500' if booking_data.get('is_emergency') else '#22c55e'}; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">⚡ SpoedDienst24</h1>
                <p style="color: white; margin: 5px 0; font-size: 18px;">{is_spoed}</p>
            </div>
            
            <div style="padding: 20px; background-color: #f8f9fa;">
                <div style="background-color: #dcfce7; padding: 20px; border-radius: 10px; border-left: 4px solid #22c55e; margin-bottom: 20px;">
                    <h2 style="color: #22c55e; margin-top: 0;">
                        ✅ De klant heeft u specifiek geselecteerd!
                    </h2>
                    <p style="font-size: 24px; font-weight: bold; color: #333; margin: 0;">€{booking_data.get('price', 0)},-</p>
                </div>
                
                <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">📍 Locatie</h3>
                    <p style="font-size: 16px; margin: 0;"><strong>{booking_data.get('city', 'N/A')}</strong></p>
                    <p style="color: #666; margin: 5px 0 0 0;">{booking_data.get('address', 'N/A')}, {booking_data.get('postal_code', '')}</p>
                </div>
                
                <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">📅 Gewenste Tijd</h3>
                    <p style="font-size: 18px; margin: 0;"><strong>{booking_data.get('preferred_date', 'N/A')}</strong> - {booking_data.get('preferred_time', 'N/A')}</p>
                </div>
                
                <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">🔧 Probleemomschrijving</h3>
                    <p style="color: #666; white-space: pre-wrap;">{booking_data.get('description', 'Geen omschrijving')}</p>
                </div>
                
                <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">👤 Klantgegevens</h3>
                    <p style="margin: 5px 0;"><strong>Naam:</strong> {booking_data.get('customer_name', 'N/A')}</p>
                    <p style="margin: 5px 0;"><strong>Telefoon:</strong> <a href="tel:{booking_data.get('customer_phone', '')}">{booking_data.get('customer_phone', 'N/A')}</a></p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:{booking_data.get('customer_email', '')}">{booking_data.get('customer_email', 'N/A')}</a></p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <p style="color: #666; margin-bottom: 15px;">Log in op je dashboard om deze klus te accepteren:</p>
                    <a href="{FRONTEND_URL}/vakman/dashboard" style="display: inline-block; background-color: #FF4500; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Bekijk Klus →
                    </a>
                </div>
            </div>
            
            <div style="background-color: #333; padding: 15px; text-align: center;">
                <p style="color: #999; margin: 0; font-size: 12px;">Deze klus is specifiek aan u toegewezen door de klant.</p>
            </div>
        </body>
        </html>
        """
        
        message = MIMEMultipart("alternative")
        message["From"] = SMTP_FROM
        message["To"] = vakman_email
        message["Subject"] = f"{'🚨 SPOED: ' if booking_data.get('is_emergency') else '✅ '}Klant heeft u gekozen! {service_name} klus in {booking_data.get('city', 'jouw regio')} - €{booking_data.get('price', 0)},-"
        
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
        logging.info(f"Specific vakman notification email sent to {vakman_email}")
        return True
    except Exception as e:
        logging.error(f"Failed to send specific vakman notification email: {str(e)}")
        return False

async def send_vakman_rejection_notification_email(booking_data: dict, vakman_name: str):
    """Send notification to admin when a vakman rejects an assigned booking"""
    try:
        service_names = {
            "elektricien": "Elektricien",
            "loodgieter": "Loodgieter",
            "slotenmaker": "Slotenmaker"
        }
        service_name = service_names.get(booking_data.get("service_type", ""), booking_data.get("service_type", ""))
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #FF4500; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">⚠️ Opdracht Afgewezen</h1>
                <p style="color: white; margin: 5px 0 0 0;">Een vakman heeft een opdracht afgewezen</p>
            </div>
            
            <div style="padding: 20px; background-color: #fef2f2;">
                <div style="background-color: #fee2e2; padding: 15px; border-radius: 10px; border-left: 4px solid #ef4444; margin-bottom: 20px;">
                    <h3 style="color: #991b1b; margin: 0 0 10px 0;">❌ {vakman_name} heeft deze opdracht afgewezen</h3>
                    <p style="color: #991b1b; margin: 0;">Deze boeking moet opnieuw worden toegewezen aan een andere vakman.</p>
                </div>
                
                <h3 style="color: #333; margin-top: 20px;">📋 Boekingsdetails</h3>
                
                <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;"><strong>Dienst:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">{service_name} {'🚨 SPOED' if booking_data.get('is_emergency') else ''}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;"><strong>Klant:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">{booking_data.get('customer_name', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;"><strong>Telefoon:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><a href="tel:{booking_data.get('customer_phone', '')}">{booking_data.get('customer_phone', 'N/A')}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;"><strong>Locatie:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">{booking_data.get('address', 'N/A')}, {booking_data.get('postal_code', '')} {booking_data.get('city', '')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;"><strong>Datum:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">{booking_data.get('preferred_date', 'N/A')} - {booking_data.get('preferred_time', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;"><strong>Prijs:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">€{booking_data.get('price', 0)},-</td>
                    </tr>
                </table>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{FRONTEND_URL}/beheer" style="display: inline-block; background-color: #FF4500; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Ga naar Admin Dashboard →
                    </a>
                </div>
            </div>
            
            <div style="background-color: #333; padding: 15px; text-align: center;">
                <p style="color: #999; margin: 0; font-size: 12px;">SpoedDienst24 - Admin Notificatie</p>
            </div>
        </body>
        </html>
        """
        
        message = MIMEMultipart("alternative")
        message["From"] = SMTP_FROM
        message["To"] = ADMIN_EMAIL
        message["Subject"] = f"⚠️ Opdracht afgewezen door {vakman_name} - {booking_data.get('city', '')} - Actie vereist"
        
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
        logging.info(f"Vakman rejection notification sent to admin for booking in {booking_data.get('city', 'unknown')}")
        return True
    except Exception as e:
        logging.error(f"Failed to send vakman rejection notification: {str(e)}")
        return False

async def send_vakman_approval_email(vakman_data: dict):
    """Send approval confirmation email to vakman"""
    try:
        vakman_email = vakman_data.get('email')
        if not vakman_email:
            return False
        
        service_names = {
            "elektricien": "Elektricien",
            "loodgieter": "Loodgieter",
            "slotenmaker": "Slotenmaker"
        }
        service_name = service_names.get(vakman_data.get("service_type", ""), vakman_data.get("service_type", ""))
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #22c55e; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Gefeliciteerd!</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">Je account is goedgekeurd!</p>
            </div>
            
            <div style="padding: 30px; background-color: #f8f9fa;">
                <h2 style="color: #333; margin-top: 0;">Beste {vakman_data.get('name', 'Vakman')},</h2>
                
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    Geweldig nieuws! Je aanmelding als <strong>{service_name}</strong> bij SpoedDienst24 is goedgekeurd. 
                    Je kunt nu direct aan de slag en klussen ontvangen in jouw regio.
                </p>
                
                <div style="background-color: #dcfce7; padding: 20px; border-radius: 10px; border-left: 4px solid #22c55e; margin: 25px 0;">
                    <h3 style="color: #22c55e; margin-top: 0;">✅ Wat kun je nu doen?</h3>
                    <ul style="color: #666; margin: 0; padding-left: 20px;">
                        <li style="margin-bottom: 8px;">Log in op je vakman dashboard</li>
                        <li style="margin-bottom: 8px;">Zet je beschikbaarheid aan</li>
                        <li style="margin-bottom: 8px;">Ontvang direct nieuwe klussen</li>
                        <li style="margin-bottom: 8px;">Accepteer opdrachten en verdien geld</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{FRONTEND_URL}/login" style="display: inline-block; background-color: #FF4500; color: white; padding: 15px 50px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">
                        Naar mijn Dashboard →
                    </a>
                </div>
                
                <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 25px 0;">
                    <h3 style="color: #333; margin-top: 0;">📋 Je Profiel</h3>
                    <table style="width: 100%;">
                        <tr><td style="padding: 8px 0; color: #666;">Naam:</td><td style="padding: 8px 0; font-weight: bold;">{vakman_data.get('name', 'N/A')}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666;">Vakgebied:</td><td style="padding: 8px 0; font-weight: bold;">{service_name}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666;">Werkgebied:</td><td style="padding: 8px 0; font-weight: bold;">{vakman_data.get('location', 'N/A')}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666;">Uurtarief:</td><td style="padding: 8px 0; font-weight: bold;">€{vakman_data.get('hourly_rate', 0)},-</td></tr>
                    </table>
                </div>
                
                <p style="color: #666;">Succes met je eerste klussen!</p>
                <p style="color: #666; margin: 0;">Met vriendelijke groet,<br><strong>Team SpoedDienst24</strong></p>
            </div>
            
            <div style="background-color: #333; padding: 20px; text-align: center;">
                <p style="color: #999; margin: 0; font-size: 12px;">© 2024 SpoedDienst24.nl - 24/7 Vakmannen aan uw deur</p>
            </div>
        </body>
        </html>
        """
        
        message = MIMEMultipart("alternative")
        message["From"] = SMTP_FROM
        message["To"] = vakman_email
        message["Subject"] = "🎉 Gefeliciteerd! Je SpoedDienst24 account is goedgekeurd"
        
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
        logging.info(f"Approval email sent to vakman {vakman_email}")
        return True
    except Exception as e:
        logging.error(f"Failed to send approval email: {str(e)}")
        return False

async def send_vakman_rejection_email(vakman_data: dict):
    """Send rejection notification email to vakman"""
    try:
        vakman_email = vakman_data.get('email')
        if not vakman_email:
            return False
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #64748b; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">⚡ SpoedDienst24</h1>
            </div>
            
            <div style="padding: 30px; background-color: #f8f9fa;">
                <h2 style="color: #333; margin-top: 0;">Beste {vakman_data.get('name', 'Vakman')},</h2>
                
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    Bedankt voor je interesse in SpoedDienst24. Helaas kunnen we je aanmelding op dit moment niet goedkeuren.
                </p>
                
                <div style="background-color: #fef2f2; padding: 20px; border-radius: 10px; border-left: 4px solid #ef4444; margin: 25px 0;">
                    <h3 style="color: #ef4444; margin-top: 0;">Mogelijke redenen</h3>
                    <ul style="color: #666; margin: 0; padding-left: 20px;">
                        <li style="margin-bottom: 8px;">Onvolledige bedrijfsgegevens (KVK/BTW)</li>
                        <li style="margin-bottom: 8px;">Ontbrekende verzekeringsinformatie</li>
                        <li style="margin-bottom: 8px;">Werkgebied buiten ons servicegebied</li>
                    </ul>
                </div>
                
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    Je kunt je opnieuw aanmelden met volledige gegevens. Heb je vragen? Neem dan contact met ons op.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{FRONTEND_URL}/vakman/register" style="display: inline-block; background-color: #FF4500; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Opnieuw Aanmelden
                    </a>
                </div>
                
                <p style="color: #666;">
                    <strong>Contact:</strong><br>
                    📧 info@spoeddienst24.nl<br>
                    📞 020-123 4567
                </p>
                
                <p style="color: #666; margin: 0;">Met vriendelijke groet,<br><strong>Team SpoedDienst24</strong></p>
            </div>
            
            <div style="background-color: #333; padding: 20px; text-align: center;">
                <p style="color: #999; margin: 0; font-size: 12px;">© 2024 SpoedDienst24.nl</p>
            </div>
        </body>
        </html>
        """
        
        message = MIMEMultipart("alternative")
        message["From"] = SMTP_FROM
        message["To"] = vakman_email
        message["Subject"] = "SpoedDienst24 - Update over je aanmelding"
        
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
        logging.info(f"Rejection email sent to vakman {vakman_email}")
        return True
    except Exception as e:
        logging.error(f"Failed to send rejection email: {str(e)}")
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
    
    # Send welcome email (async, don't wait)
    if email_marketing_service:
        asyncio.create_task(email_marketing_service.send_welcome_customer({
            "id": user_obj.id,
            "name": user.name,
            "email": user.email
        }))
    
    return {"token": token, "user": {"id": user_obj.id, "email": user_obj.email, "name": user_obj.name, "role": "customer"}}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        user = await db.vakmannen.find_one({"email": credentials.email}, {"_id": 0})
    
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Ongeldige inloggegevens")
    
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

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@api_router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Send password reset email"""
    email = request.email.lower().strip()
    
    # Check in both users and vakmannen collections
    user = await db.users.find_one({"email": email}, {"_id": 0})
    user_type = "user"
    
    if not user:
        user = await db.vakmannen.find_one({"email": email}, {"_id": 0})
        user_type = "vakman"
    
    if not user:
        # Don't reveal if email exists or not for security
        return {"message": "Als dit e-mailadres bij ons bekend is, ontvang je een reset link."}
    
    # Create reset token (valid for 1 hour)
    reset_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    # Store reset token in database
    await db.password_resets.insert_one({
        "email": email,
        "token": reset_token,
        "user_type": user_type,
        "expires_at": expires_at.isoformat(),
        "used": False
    })
    
    # Send reset email
    await send_password_reset_email(user, reset_token)
    
    return {"message": "Als dit e-mailadres bij ons bekend is, ontvang je een reset link."}

@api_router.post("/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password with token"""
    # Find valid reset token
    reset_record = await db.password_resets.find_one({
        "token": request.token,
        "used": False
    })
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Ongeldige of verlopen reset link")
    
    # Check if token is expired
    expires_at = datetime.fromisoformat(reset_record["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Reset link is verlopen")
    
    # Update password in the right collection
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
    
    # Mark token as used
    await db.password_resets.update_one(
        {"token": request.token},
        {"$set": {"used": True}}
    )
    
    return {"message": "Wachtwoord succesvol gewijzigd"}

async def send_password_reset_email(user_data: dict, reset_token: str):
    """Send password reset email to user"""
    try:
        user_email = user_data.get('email')
        user_name = user_data.get('name', 'Gebruiker')
        
        reset_url = f"{FRONTEND_URL}/reset-wachtwoord?token={reset_token}"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #FF4500; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">⚡ SpoedDienst24</h1>
                <p style="color: white; margin: 5px 0;">Wachtwoord Reset</p>
            </div>
            
            <div style="padding: 30px; background-color: #f8f9fa;">
                <h2 style="color: #333; margin-top: 0;">Beste {user_name},</h2>
                
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    Je hebt aangegeven je wachtwoord te willen resetten. Klik op de onderstaande knop om een nieuw wachtwoord in te stellen.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_url}" style="display: inline-block; background-color: #FF4500; color: white; padding: 15px 50px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">
                        Wachtwoord Resetten
                    </a>
                </div>
                
                <div style="background-color: #fff3e6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="color: #92400e; margin: 0; font-size: 14px;">
                        <strong>⚠️ Let op:</strong> Deze link is 1 uur geldig. Heb je deze email niet aangevraagd? Dan kun je deze negeren.
                    </p>
                </div>
                
                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    Werkt de knop niet? Kopieer dan deze link:<br>
                    <a href="{reset_url}" style="color: #FF4500; word-break: break-all;">{reset_url}</a>
                </p>
            </div>
            
            <div style="background-color: #333; padding: 15px; text-align: center;">
                <p style="color: #999; margin: 0; font-size: 12px;">© 2024 SpoedDienst24.nl</p>
            </div>
        </body>
        </html>
        """
        
        message = MIMEMultipart("alternative")
        message["From"] = SMTP_FROM
        message["To"] = user_email
        message["Subject"] = "🔐 Wachtwoord resetten - SpoedDienst24"
        
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
        logging.info(f"Password reset email sent to {user_email}")
        return True
    except Exception as e:
        logging.error(f"Failed to send password reset email: {str(e)}")
        return False

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
    # Normalize email
    email = vakman.email.lower().strip()
    
    # Check if email already exists in vakmannen
    existing_vakman = await db.vakmannen.find_one({"email": email})
    if existing_vakman:
        raise HTTPException(status_code=400, detail="Dit e-mailadres is al geregistreerd als vakman. Probeer in te loggen of gebruik een ander e-mailadres.")
    
    # Also check in users collection
    existing_user = await db.users.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Dit e-mailadres is al geregistreerd. Gebruik een ander e-mailadres.")
    
    vakman_obj = Vakman(
        email=email,
        name=vakman.name,
        phone=vakman.phone,
        service_type=vakman.service_type,
        description=vakman.description,
        hourly_rate=vakman.hourly_rate,
        location=vakman.location,
        kvk_nummer=vakman.kvk_nummer,
        btw_nummer=vakman.btw_nummer or "",
        verzekering=vakman.verzekering,
        verzekering_maatschappij=vakman.verzekering_maatschappij or ""
    )
    vakman_dict = vakman_obj.model_dump()
    vakman_dict["password"] = hash_password(vakman.password)
    vakman_dict["created_at"] = vakman_dict["created_at"].isoformat()
    
    await db.vakmannen.insert_one(vakman_dict)
    token = create_token(vakman_obj.id, "vakman")
    
    # Send email notification for approval
    base_url = str(request.base_url).rstrip('/')
    await send_vakman_registration_email(vakman_dict, base_url)
    
    # Send welcome email to vakman (async, don't wait)
    if email_marketing_service:
        asyncio.create_task(email_marketing_service.send_welcome_vakman({
            "id": vakman_obj.id,
            "name": vakman.name,
            "email": email,
            "service_type": vakman.service_type
        }))
    
    return {"token": token, "user": {"id": vakman_obj.id, "email": email, "name": vakman_obj.name, "role": "vakman", "is_approved": False}}

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
        # Send approval email
        vakman_data = {"_id": 0, "password": 0}
        vakman_clean = {k: v for k, v in vakman.items() if k not in ["_id", "password"]}
        await send_vakman_approval_email(vakman_clean)
        return {"status": "success", "message": f"✅ {vakman['name']} is goedgekeurd als vakman!", "action": "approved"}
    elif action == "reject":
        # Send rejection email before deleting
        vakman_clean = {k: v for k, v in vakman.items() if k not in ["_id", "password"]}
        await send_vakman_rejection_email(vakman_clean)
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

@api_router.get("/vakmannen/available")
async def get_available_vakmannen(service_type: str):
    """Get available and approved vakmannen for a specific service type"""
    query = {
        "service_type": service_type,
        "is_approved": True,
        "is_available": True
    }
    
    vakmannen = await db.vakmannen.find(
        query, 
        {"_id": 0, "password": 0}
    ).sort("rating", -1).to_list(50)
    
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
        "pending_jobs": len([b for b in bookings if b["status"] in ["confirmed", "pending"]]),  # Confirmed = toegewezen, wacht op vakman actie
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

@api_router.post("/upload/photo")
async def upload_photo(request: Request):
    """Upload a photo for a booking - stores as base64 in MongoDB"""
    import base64
    
    try:
        body = await request.json()
        photo_data = body.get("photo")  # base64 encoded image
        
        if not photo_data:
            raise HTTPException(status_code=400, detail="No photo data provided")
        
        # Generate unique filename
        photo_id = str(uuid.uuid4())
        
        # Store in MongoDB
        await db.photos.insert_one({
            "id": photo_id,
            "data": photo_data,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Return URL to retrieve the photo
        photo_url = f"/api/photos/{photo_id}"
        
        return {"photo_url": photo_url, "photo_id": photo_id}
    except Exception as e:
        logging.error(f"Photo upload error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to upload photo")

@api_router.get("/photos/{photo_id}")
async def get_photo(photo_id: str):
    """Retrieve a photo by ID"""
    from fastapi.responses import Response
    import base64
    
    photo = await db.photos.find_one({"id": photo_id}, {"_id": 0})
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    # Decode base64 and return as image
    try:
        photo_data = photo["data"]
        # Remove data URL prefix if present
        if "," in photo_data:
            photo_data = photo_data.split(",")[1]
        
        image_bytes = base64.b64decode(photo_data)
        return Response(content=image_bytes, media_type="image/jpeg")
    except Exception as e:
        logging.error(f"Photo decode error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to decode photo")

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
        photo_url=booking.photo_url,
        price=price
    )
    
    booking_dict = booking_obj.model_dump()
    booking_dict["created_at"] = booking_dict["created_at"].isoformat()
    
    # Store the original dict before MongoDB adds _id
    response_booking = booking_dict.copy()
    
    await db.bookings.insert_one(booking_dict)
    
    # Send email notifications
    # 1. Admin notification (Spoeddienst26@gmail.com) - Admin wijst later toe aan vakman
    await send_booking_email(response_booking)
    
    # 2. Customer confirmation email
    await send_customer_confirmation_email(response_booking)
    
    # Note: Vakman notification is NOT sent here - admin assigns the booking via dashboard
    
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

@api_router.post("/bookings/{booking_id}/vakman-accept")
async def vakman_accept_booking(booking_id: str, current_user: dict = Depends(get_current_user)):
    """Vakman accepts an assigned booking"""
    if current_user["role"] != "vakman":
        raise HTTPException(status_code=403, detail="Only vakman can accept bookings")
    
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Boeking niet gevonden")
    
    if booking.get("vakman_id") != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Deze boeking is niet aan jou toegewezen")
    
    await db.bookings.update_one(
        {"id": booking_id}, 
        {"$set": {"status": "accepted"}}
    )
    
    return {"message": "Opdracht geaccepteerd"}

@api_router.post("/bookings/{booking_id}/vakman-reject")
async def vakman_reject_booking(booking_id: str, current_user: dict = Depends(get_current_user)):
    """Vakman rejects an assigned booking - notifies admin to reassign"""
    if current_user["role"] != "vakman":
        raise HTTPException(status_code=403, detail="Only vakman can reject bookings")
    
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Boeking niet gevonden")
    
    if booking.get("vakman_id") != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Deze boeking is niet aan jou toegewezen")
    
    # Get vakman name for email
    vakman = await db.vakmannen.find_one({"id": current_user["user_id"]}, {"_id": 0, "name": 1})
    vakman_name = vakman.get("name", "Vakman") if vakman else "Vakman"
    
    # Reset the booking - remove vakman assignment so admin can reassign
    await db.bookings.update_one(
        {"id": booking_id}, 
        {"$set": {"vakman_id": None, "vakman_name": None, "status": "pending"}}
    )
    
    # Send notification to admin
    await send_vakman_rejection_notification_email(booking, vakman_name)
    
    return {"message": "Opdracht afgewezen. Admin is op de hoogte gesteld."}

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

# ==================== ADMIN DASHBOARD ROUTES (SECURED) ====================

@api_router.get("/admin/bookings")
async def get_all_bookings(admin: dict = Depends(get_admin_user)):
    """Get all bookings for admin dashboard"""
    bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return bookings

@api_router.get("/admin/vakmannen")
async def get_all_vakmannen(admin: dict = Depends(get_admin_user)):
    """Get all vakmannen for admin dashboard"""
    vakmannen = await db.vakmannen.find({}, {"_id": 0, "password": 0}).sort("created_at", -1).to_list(500)
    return vakmannen

@api_router.get("/admin/reviews")
async def get_all_reviews(admin: dict = Depends(get_admin_user)):
    """Get all reviews for admin dashboard"""
    reviews = await db.public_reviews.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return reviews

@api_router.get("/admin/stats")
async def get_admin_stats(admin: dict = Depends(get_admin_user)):
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
async def approve_vakman_admin(vakman_id: str, admin: dict = Depends(get_admin_user)):
    """Approve a vakman registration"""
    # First get the vakman data for the email
    vakman = await db.vakmannen.find_one({"id": vakman_id}, {"_id": 0, "password": 0})
    if not vakman:
        raise HTTPException(status_code=404, detail="Vakman niet gevonden")
    
    result = await db.vakmannen.update_one(
        {"id": vakman_id}, 
        {"$set": {"is_approved": True, "is_available": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Vakman niet gevonden")
    
    # Send approval email to vakman
    await send_vakman_approval_email(vakman)
    
    return {"message": "Vakman goedgekeurd en email verstuurd"}

@api_router.post("/admin/vakman/{vakman_id}/reject")
async def reject_vakman_admin(vakman_id: str, admin: dict = Depends(get_admin_user)):
    """Reject and delete a vakman registration"""
    # First get the vakman data for the email
    vakman = await db.vakmannen.find_one({"id": vakman_id}, {"_id": 0, "password": 0})
    if not vakman:
        raise HTTPException(status_code=404, detail="Vakman niet gevonden")
    
    # Send rejection email before deleting
    await send_vakman_rejection_email(vakman)
    
    result = await db.vakmannen.delete_one({"id": vakman_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vakman niet gevonden")
    
    return {"message": "Vakman afgewezen en email verstuurd"}

@api_router.post("/admin/review/{review_id}/approve")
async def approve_review_admin(review_id: str, admin: dict = Depends(get_admin_user)):
    """Approve a review"""
    result = await db.public_reviews.update_one(
        {"id": review_id}, 
        {"$set": {"status": "approved"}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Review niet gevonden")
    return {"message": "Review goedgekeurd"}

@api_router.post("/admin/review/{review_id}/reject")
async def reject_review_admin(review_id: str, admin: dict = Depends(get_admin_user)):
    """Reject and delete a review"""
    result = await db.public_reviews.delete_one({"id": review_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review niet gevonden")
    return {"message": "Review verwijderd"}

@api_router.put("/admin/booking/{booking_id}/status")
async def update_booking_status_admin(booking_id: str, status_update: dict, admin: dict = Depends(get_admin_user)):
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
    
    # If status is completed, queue review reminder email
    if status == "completed" and email_marketing_service:
        booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
        if booking:
            asyncio.create_task(email_marketing_service.queue_review_reminder(booking))
    
    return {"message": f"Status gewijzigd naar {status}"}

class AssignVakmanRequest(BaseModel):
    vakman_id: str

@api_router.post("/admin/booking/{booking_id}/assign")
async def assign_booking_to_vakman(booking_id: str, assign_request: AssignVakmanRequest, admin: dict = Depends(get_admin_user)):
    """Assign a booking to a specific vakman and send notification email"""
    
    # Get the booking
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Boeking niet gevonden")
    
    # Get the vakman
    vakman = await db.vakmannen.find_one({"id": assign_request.vakman_id}, {"_id": 0, "password": 0})
    if not vakman:
        raise HTTPException(status_code=404, detail="Vakman niet gevonden")
    
    # Update the booking with vakman assignment
    result = await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {
            "vakman_id": vakman["id"],
            "vakman_name": vakman["name"],
            "status": "confirmed"
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Kon boeking niet bijwerken")
    
    # Update booking data for email
    booking["vakman_id"] = vakman["id"]
    booking["vakman_name"] = vakman["name"]
    
    # Send notification email to the assigned vakman
    await send_specific_vakman_notification_email(booking, vakman["id"])
    
    return {
        "message": f"Boeking toegewezen aan {vakman['name']} en notificatie verstuurd",
        "vakman_name": vakman["name"],
        "vakman_id": vakman["id"]
    }

@api_router.get("/admin/financial")
async def get_financial_stats(period: str = "month", admin: dict = Depends(get_admin_user)):
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
async def get_marketing_stats(admin: dict = Depends(get_admin_user)):
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
async def export_bookings_csv(token: Optional[str] = None, request: Request = None):
    """Export bookings data as CSV"""
    import io
    import csv
    from fastapi.responses import StreamingResponse
    
    # Support both header and query param auth for download links
    auth_token = token
    if not auth_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            auth_token = auth_header.split(" ")[1]
    
    if not auth_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = jwt.decode(auth_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
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

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Ensure admin user exists on startup"""
    try:
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@spoeddienst24.nl')
        admin_password = os.environ.get('ADMIN_PASSWORD')
        
        # Skip admin setup if no password is configured
        if not admin_password:
            logger.warning("ADMIN_PASSWORD not set - skipping admin user setup")
            return
        
        existing_admin = await db.users.find_one({"email": admin_email})
        
        if not existing_admin:
            # Create admin user
            admin_user = {
                "id": str(uuid.uuid4()),
                "email": admin_email,
                "name": "Administrator",
                "phone": "",
                "password": bcrypt.hashpw(admin_password.encode(), bcrypt.gensalt()).decode(),
                "role": "admin",
                "created_at": datetime.now(timezone.utc)
            }
            await db.users.insert_one(admin_user)
            logger.info("Admin user created successfully")
        else:
            # Update admin password to ensure it's correct
            new_hash = bcrypt.hashpw(admin_password.encode(), bcrypt.gensalt()).decode()
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"password": new_hash, "role": "admin"}}
            )
            logger.info("Admin user password updated")
    except Exception as e:
        logger.error(f"Error setting up admin user: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# ==================== SEO PAGES: PROBLEMS ====================

PROBLEM_PAGES = {
    # Loodgieter problemen
    "lekkage-spoed": {
        "slug": "lekkage-spoed",
        "title": "Spoed Lekkage Service",
        "service_type": "loodgieter",
        "h1": "Lekkage Spoed - 24/7 Loodgieter",
        "description": "Direct hulp bij lekkage? Onze spoed loodgieters zijn 24/7 beschikbaar. Binnen 30 minuten ter plaatse voor waterlekkage, leidingbreuk en meer.",
        "keywords": ["lekkage spoed", "waterlekkage", "leiding lek", "gesprongen waterleiding", "lekkage repareren"],
        "problems": ["Waterlekkage in huis", "Gesprongen waterleiding", "Lekkende kraan", "Lekkage badkamer/keuken", "Lekkage plafond of muur"],
        "meta_title": "Lekkage Spoed | 24/7 Spoed Loodgieter - Binnen 30 min ter plaatse",
        "meta_description": "Waterlekkage? Bel direct onze 24/7 spoed loodgieter. Binnen 30 minuten ter plaatse. Vaste prijzen, geen verrassingen."
    },
    "wc-verstopt-spoed": {
        "slug": "wc-verstopt-spoed",
        "title": "WC Verstopt Spoed Service",
        "service_type": "loodgieter",
        "h1": "WC Verstopt - 24/7 Ontstoppingsdienst",
        "description": "Toilet verstopt? Onze ontstoppingsdienst is 24/7 bereikbaar. Snel en professioneel uw WC ontstoppen.",
        "keywords": ["wc verstopt", "toilet verstopt", "wc ontstoppen", "toilet ontstoppen spoed", "wc verstopping"],
        "problems": ["WC volledig verstopt", "Water loopt niet weg", "WC loopt over", "Terugkomend water", "Stankoverlast toilet"],
        "meta_title": "WC Verstopt | 24/7 Ontstoppingsdienst - Direct Geholpen",
        "meta_description": "WC verstopt? Direct hulp van onze 24/7 ontstoppingsdienst. Professioneel ontstoppen, vaste prijs, snel ter plaatse."
    },
    "riool-verstopt": {
        "slug": "riool-verstopt",
        "title": "Riool Verstopt 24/7",
        "service_type": "loodgieter",
        "h1": "Riool Verstopt - 24/7 Rioolontstopping",
        "description": "Riool verstopt? Onze rioolontstoppers zijn 24/7 beschikbaar met professionele apparatuur.",
        "keywords": ["riool verstopt", "rioolontstopping", "riool ontstoppen", "hoofdriool verstopt", "rioolstank"],
        "problems": ["Hoofdriool verstopt", "Rioolstank in huis", "Alle afvoeren verstopt", "Rioolput vol", "Borrelend geluid afvoer"],
        "meta_title": "Riool Verstopt | 24/7 Rioolontstopping - Professionele Service",
        "meta_description": "Riool verstopt? 24/7 professionele rioolontstopping. Snel ter plaatse met camera-inspectie en hogedruk reiniging."
    },
    "afvoer-verstopt": {
        "slug": "afvoer-verstopt",
        "title": "Afvoer Verstopt Service",
        "service_type": "loodgieter",
        "h1": "Afvoer Verstopt - Snel Ontstoppen",
        "description": "Afvoer verstopt in keuken, badkamer of douche? Wij ontstoppen snel en vakkundig alle afvoeren.",
        "keywords": ["afvoer verstopt", "gootsteen verstopt", "douche afvoer verstopt", "afvoer ontstoppen", "verstopping afvoer"],
        "problems": ["Gootsteen verstopt", "Douche afvoer verstopt", "Wastafel verstopt", "Water blijft staan", "Langzaam weglopend water"],
        "meta_title": "Afvoer Verstopt | Snel Ontstoppen - 24/7 Beschikbaar",
        "meta_description": "Afvoer verstopt? Snel en professioneel ontstoppen van gootsteen, douche en wastafel. 24/7 bereikbaar."
    },
    # Slotenmaker problemen
    "buitengesloten": {
        "slug": "buitengesloten",
        "title": "Buitengesloten Spoed Service",
        "service_type": "slotenmaker",
        "h1": "Buitengesloten - 24/7 Slotenmaker",
        "description": "Buitengesloten? Onze spoed slotenmakers openen uw deur schadevrij, 24/7 beschikbaar.",
        "keywords": ["buitengesloten", "deur openen", "buitengesloten slotenmaker", "sleutel vergeten", "deur dichtgevallen"],
        "problems": ["Sleutel vergeten binnen", "Deur dichtgevallen", "Sleutel kwijt", "Deur zit op slot", "Niet meer naar binnen"],
        "meta_title": "Buitengesloten | 24/7 Slotenmaker - Schadevrij Deur Openen",
        "meta_description": "Buitengesloten? Onze 24/7 slotenmakers openen uw deur schadevrij. Binnen 30 minuten ter plaatse, vaste prijs."
    },
    "sleutel-afgebroken": {
        "slug": "sleutel-afgebroken",
        "title": "Sleutel Afgebroken in Slot",
        "service_type": "slotenmaker",
        "h1": "Sleutel Afgebroken - Spoed Slotenmaker",
        "description": "Sleutel afgebroken in het slot? Wij verwijderen de afgebroken sleutel en vervangen indien nodig het slot.",
        "keywords": ["sleutel afgebroken", "sleutel zit vast", "sleutel in slot afgebroken", "cilinder kapot", "slot draait niet"],
        "problems": ["Sleutel afgebroken in slot", "Sleutel zit vast", "Slot draait niet meer", "Cilinder geblokkeerd", "Halve sleutel in slot"],
        "meta_title": "Sleutel Afgebroken | Spoed Slotenmaker - Direct Hulp",
        "meta_description": "Sleutel afgebroken in het slot? Onze slotenmakers verwijderen de sleutel en repareren uw slot. 24/7 service."
    },
    "slot-vervangen": {
        "slug": "slot-vervangen",
        "title": "Slot Vervangen Service",
        "service_type": "slotenmaker",
        "h1": "Slot Vervangen - Alle Merken",
        "description": "Slot vervangen of upgraden? Wij plaatsen alle soorten sloten, van cilinder tot meerpuntssluiting.",
        "keywords": ["slot vervangen", "cilinder vervangen", "nieuw slot plaatsen", "slot upgraden", "veilig slot"],
        "problems": ["Oud slot vervangen", "Slot na inbraak vervangen", "Cilinder vervangen", "Slot upgraden", "Extra veilig slot"],
        "meta_title": "Slot Vervangen | Alle Merken - Snel Geplaatst",
        "meta_description": "Slot vervangen? Wij plaatsen alle soorten sloten snel en vakkundig. Vraag vrijblijvend advies. 24/7 bereikbaar."
    },
    "inbraakschade": {
        "slug": "inbraakschade",
        "title": "Inbraakschade Herstellen",
        "service_type": "slotenmaker",
        "h1": "Inbraakschade - Spoed Reparatie",
        "description": "Inbraakschade aan deur of slot? Wij herstellen de schade en maken uw woning weer veilig.",
        "keywords": ["inbraakschade", "inbraak slot reparatie", "deur na inbraak", "slot na inbraak", "inbraakpreventie"],
        "problems": ["Deur geforceerd", "Slot kapot na inbraak", "Kozijn beschadigd", "Deur sluit niet meer", "Direct weer veilig"],
        "meta_title": "Inbraakschade Herstellen | Spoed Slotenmaker - Direct Veilig",
        "meta_description": "Inbraakschade? Onze slotenmakers herstellen de schade en maken uw woning direct weer veilig. 24/7 spoed service."
    },
    # Elektricien problemen
    "stroomstoring": {
        "slug": "stroomstoring",
        "title": "Stroomstoring Spoed Service",
        "service_type": "elektricien",
        "h1": "Stroomstoring - 24/7 Elektricien",
        "description": "Stroomstoring in huis? Onze spoed elektriciens zijn 24/7 beschikbaar om uw stroom te herstellen.",
        "keywords": ["stroomstoring", "geen stroom", "stroom uitgevallen", "elektricien spoed", "stroomuitval"],
        "problems": ["Geen stroom in huis", "Stroom uitgevallen", "Gedeeltelijk geen stroom", "Stroom valt steeds uit", "Hoofdschakelaar valt uit"],
        "meta_title": "Stroomstoring | 24/7 Spoed Elektricien - Snel Stroom Terug",
        "meta_description": "Stroomstoring? Onze 24/7 spoed elektriciens herstellen uw stroom snel. Binnen 30 minuten ter plaatse."
    },
    "kortsluiting": {
        "slug": "kortsluiting",
        "title": "Kortsluiting Spoed Service",
        "service_type": "elektricien",
        "h1": "Kortsluiting - Direct Hulp",
        "description": "Kortsluiting in huis? Dit kan gevaarlijk zijn. Onze elektriciens komen direct om het probleem veilig op te lossen.",
        "keywords": ["kortsluiting", "kortsluiting spoed", "vonken elektra", "brandlucht elektra", "elektra gevaarlijk"],
        "problems": ["Kortsluiting in huis", "Vonken uit stopcontact", "Brandlucht elektra", "Zekering springt steeds", "Rook uit meterkast"],
        "meta_title": "Kortsluiting | Spoed Elektricien - Veilig & Snel Opgelost",
        "meta_description": "Kortsluiting? Bel direct onze 24/7 spoed elektricien. Veilig en snel opgelost. Voorkom brandgevaar!"
    },
    "groepenkast-storing": {
        "slug": "groepenkast-storing",
        "title": "Groepenkast Storing Service",
        "service_type": "elektricien",
        "h1": "Groepenkast Storing - Spoed Reparatie",
        "description": "Storing in de groepenkast? Automaat die uitvalt? Onze elektriciens lossen het snel op.",
        "keywords": ["groepenkast storing", "automaat valt uit", "groep springt", "meterkast probleem", "zekering kapot"],
        "problems": ["Automaat valt steeds uit", "Groep springt eruit", "Aardlekschakelaar defect", "Zekering kapot", "Oververhitte groepenkast"],
        "meta_title": "Groepenkast Storing | 24/7 Elektricien - Direct Gerepareerd",
        "meta_description": "Groepenkast storing? Automaat of aardlek valt uit? Onze elektriciens repareren het snel. 24/7 service."
    },
    "aardlekschakelaar": {
        "slug": "aardlekschakelaar",
        "title": "Aardlekschakelaar Valt Uit",
        "service_type": "elektricien",
        "h1": "Aardlekschakelaar Valt Uit - Hulp",
        "description": "Aardlekschakelaar valt steeds uit? Wij vinden de oorzaak en lossen het probleem op.",
        "keywords": ["aardlekschakelaar", "aardlek valt uit", "aardlekschakelaar defect", "geen stroom aardlek", "aardlek blijft uitvallen"],
        "problems": ["Aardlek valt steeds uit", "Aardlek blijft uitvallen", "Oorzaak aardlek onbekend", "Aardlekschakelaar defect", "Isolatiefout"],
        "meta_title": "Aardlekschakelaar Valt Uit | Elektricien - Oorzaak Vinden",
        "meta_description": "Aardlekschakelaar valt steeds uit? Onze elektriciens vinden de oorzaak en lossen het op. 24/7 bereikbaar."
    }
}

# Dutch cities for SEO pages
DUTCH_CITIES = [
    {"slug": "amsterdam", "name": "Amsterdam", "province": "Noord-Holland"},
    {"slug": "rotterdam", "name": "Rotterdam", "province": "Zuid-Holland"},
    {"slug": "den-haag", "name": "Den Haag", "province": "Zuid-Holland"},
    {"slug": "utrecht", "name": "Utrecht", "province": "Utrecht"},
    {"slug": "eindhoven", "name": "Eindhoven", "province": "Noord-Brabant"},
    {"slug": "tilburg", "name": "Tilburg", "province": "Noord-Brabant"},
    {"slug": "groningen", "name": "Groningen", "province": "Groningen"},
    {"slug": "almere", "name": "Almere", "province": "Flevoland"},
    {"slug": "breda", "name": "Breda", "province": "Noord-Brabant"},
    {"slug": "nijmegen", "name": "Nijmegen", "province": "Gelderland"},
    {"slug": "enschede", "name": "Enschede", "province": "Overijssel"},
    {"slug": "arnhem", "name": "Arnhem", "province": "Gelderland"},
    {"slug": "haarlem", "name": "Haarlem", "province": "Noord-Holland"},
    {"slug": "amersfoort", "name": "Amersfoort", "province": "Utrecht"},
    {"slug": "zaanstad", "name": "Zaanstad", "province": "Noord-Holland"},
    {"slug": "apeldoorn", "name": "Apeldoorn", "province": "Gelderland"},
    {"slug": "s-hertogenbosch", "name": "'s-Hertogenbosch", "province": "Noord-Brabant"},
    {"slug": "maastricht", "name": "Maastricht", "province": "Limburg"},
    {"slug": "leiden", "name": "Leiden", "province": "Zuid-Holland"},
    {"slug": "dordrecht", "name": "Dordrecht", "province": "Zuid-Holland"},
    {"slug": "zwolle", "name": "Zwolle", "province": "Overijssel"},
    {"slug": "ede", "name": "Ede", "province": "Gelderland"},
    {"slug": "zoetermeer", "name": "Zoetermeer", "province": "Zuid-Holland"},
    {"slug": "leeuwarden", "name": "Leeuwarden", "province": "Friesland"},
    {"slug": "alkmaar", "name": "Alkmaar", "province": "Noord-Holland"},
    {"slug": "delft", "name": "Delft", "province": "Zuid-Holland"},
    {"slug": "venlo", "name": "Venlo", "province": "Limburg"},
    {"slug": "deventer", "name": "Deventer", "province": "Overijssel"},
    {"slug": "helmond", "name": "Helmond", "province": "Noord-Brabant"},
    {"slug": "hengelo", "name": "Hengelo", "province": "Overijssel"},
    {"slug": "gouda", "name": "Gouda", "province": "Zuid-Holland"},
    {"slug": "hilversum", "name": "Hilversum", "province": "Noord-Holland"},
    {"slug": "purmerend", "name": "Purmerend", "province": "Noord-Holland"},
    {"slug": "vlaardingen", "name": "Vlaardingen", "province": "Zuid-Holland"},
    {"slug": "roosendaal", "name": "Roosendaal", "province": "Noord-Brabant"},
    {"slug": "hoorn", "name": "Hoorn", "province": "Noord-Holland"},
    {"slug": "assen", "name": "Assen", "province": "Drenthe"},
    {"slug": "middelburg", "name": "Middelburg", "province": "Zeeland"},
    {"slug": "emmen", "name": "Emmen", "province": "Drenthe"},
    {"slug": "den-bosch", "name": "Den Bosch", "province": "Noord-Brabant"},
]

SERVICE_INFO = {
    "loodgieter": {
        "name": "Loodgieter",
        "slug": "loodgieter",
        "description": "lekkages, verstoppingen en sanitair problemen",
        "keywords": ["spoed loodgieter", "24/7 loodgieter", "loodgieter nooddienst"],
        "problems": ["Lekkage", "WC verstopt", "Riool verstopt", "Geen warm water", "Afvoer verstopt"]
    },
    "slotenmaker": {
        "name": "Slotenmaker", 
        "slug": "slotenmaker",
        "description": "buitensluitingen, slot vervangingen en inbraakschade",
        "keywords": ["spoed slotenmaker", "24/7 slotenmaker", "slotenmaker nooddienst"],
        "problems": ["Buitengesloten", "Sleutel afgebroken", "Slot vervangen", "Inbraakschade", "Cilinder vervangen"]
    },
    "elektricien": {
        "name": "Elektricien",
        "slug": "elektricien", 
        "description": "stroomstoringen, kortsluiting en groepenkast problemen",
        "keywords": ["spoed elektricien", "24/7 elektricien", "elektricien storingsdienst"],
        "problems": ["Stroomstoring", "Kortsluiting", "Groepenkast storing", "Aardlek valt uit", "Stopcontact defect"]
    }
}

@api_router.get("/seo/problems")
async def get_all_problems():
    """Get all problem pages for SEO"""
    return list(PROBLEM_PAGES.values())

@api_router.get("/seo/problems/{slug}")
async def get_problem_page(slug: str):
    """Get specific problem page data"""
    if slug not in PROBLEM_PAGES:
        raise HTTPException(status_code=404, detail="Probleem pagina niet gevonden")
    return PROBLEM_PAGES[slug]

@api_router.get("/seo/cities")
async def get_all_cities():
    """Get all city pages for SEO"""
    return DUTCH_CITIES

@api_router.get("/seo/cities/{city_slug}/{service_type}")
async def get_city_service_page(city_slug: str, service_type: str):
    """Get city-specific service page data"""
    city = next((c for c in DUTCH_CITIES if c["slug"] == city_slug), None)
    if not city:
        raise HTTPException(status_code=404, detail="Stad niet gevonden")
    
    service = SERVICE_INFO.get(service_type)
    if not service:
        raise HTTPException(status_code=404, detail="Service niet gevonden")
    
    return {
        "city": city,
        "service": service,
        "title": f"Spoed {service['name']} {city['name']}",
        "h1": f"Spoed {service['name']} {city['name']} - 24/7",
        "description": f"Direct een spoed {service['name'].lower()} nodig in {city['name']}? Wij zijn 24/7 bereikbaar voor {service['description']}. Binnen 30 minuten ter plaatse in {city['name']} en omgeving.",
        "meta_title": f"Spoed {service['name']} {city['name']} | 24/7 Beschikbaar - Snel Ter Plaatse",
        "meta_description": f"Spoed {service['name'].lower()} nodig in {city['name']}? 24/7 bereikbaar, binnen 30 min ter plaatse. Bel nu voor directe hulp!"
    }

@api_router.get("/seo/services")
async def get_services_info():
    """Get all services info for SEO"""
    return SERVICE_INFO

# ==================== GOOGLE ADS CAMPAIGN PLANNER ====================

class CampaignCreate(BaseModel):
    name: str
    service_type: str
    cities: List[str]
    keywords: List[str]
    daily_budget: float
    status: str = "draft"
    notes: Optional[str] = ""

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    cities: Optional[List[str]] = None
    keywords: Optional[List[str]] = None
    daily_budget: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None

@api_router.get("/admin/campaigns")
async def get_campaigns(current_user: dict = Depends(get_admin_user)):
    """Get all campaigns"""
    campaigns = await db.campaigns.find({}, {"_id": 0}).to_list(100)
    return campaigns

@api_router.post("/admin/campaigns")
async def create_campaign(campaign: CampaignCreate, current_user: dict = Depends(get_admin_user)):
    """Create a new campaign"""
    campaign_data = {
        "id": str(uuid.uuid4()),
        "name": campaign.name,
        "service_type": campaign.service_type,
        "cities": campaign.cities,
        "keywords": campaign.keywords,
        "daily_budget": campaign.daily_budget,
        "status": campaign.status,
        "notes": campaign.notes,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "created_by": current_user["user_id"]
    }
    await db.campaigns.insert_one(campaign_data)
    return {"message": "Campagne aangemaakt", "campaign": {k: v for k, v in campaign_data.items() if k != "_id"}}

@api_router.put("/admin/campaigns/{campaign_id}")
async def update_campaign(campaign_id: str, campaign: CampaignUpdate, current_user: dict = Depends(get_admin_user)):
    """Update a campaign"""
    update_data = {k: v for k, v in campaign.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.campaigns.update_one(
        {"id": campaign_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Campagne niet gevonden")
    
    return {"message": "Campagne bijgewerkt"}

@api_router.delete("/admin/campaigns/{campaign_id}")
async def delete_campaign(campaign_id: str, current_user: dict = Depends(get_admin_user)):
    """Delete a campaign"""
    result = await db.campaigns.delete_one({"id": campaign_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Campagne niet gevonden")
    
    return {"message": "Campagne verwijderd"}

@api_router.get("/admin/campaigns/suggestions")
async def get_campaign_suggestions(service_type: str = None, current_user: dict = Depends(get_admin_user)):
    """Get keyword suggestions for campaigns"""
    suggestions = {
        "loodgieter": {
            "keywords": [
                "spoed loodgieter", "loodgieter 24/7", "24 uurs loodgieter", "loodgieter nooddienst",
                "lekkage spoed", "wc verstopt", "riool verstopt", "afvoer verstopt",
                "waterlekkage", "gesprongen leiding", "loodgieter weekend", "loodgieter nacht"
            ],
            "negative_keywords": ["vacature", "opleiding", "cursus", "salaris"]
        },
        "slotenmaker": {
            "keywords": [
                "spoed slotenmaker", "slotenmaker 24/7", "24 uurs slotenmaker", "buitengesloten",
                "deur openen", "slot vervangen", "cilinder vervangen", "sleutel afgebroken",
                "inbraakschade", "slotenmaker nacht", "slotenmaker weekend"
            ],
            "negative_keywords": ["vacature", "opleiding", "cursus", "sleutelmaker"]
        },
        "elektricien": {
            "keywords": [
                "spoed elektricien", "elektricien 24/7", "24 uurs elektricien", "stroomstoring",
                "kortsluiting", "groepenkast storing", "aardlekschakelaar", "geen stroom",
                "elektricien storingsdienst", "elektricien nacht", "elektricien weekend"
            ],
            "negative_keywords": ["vacature", "opleiding", "cursus", "stage"]
        }
    }
    
    if service_type and service_type in suggestions:
        return suggestions[service_type]
    return suggestions

# ==================== EMAIL MARKETING ENDPOINTS ====================

from services.email_marketing import EmailMarketingService, EMAIL_TYPES

# Initialize email marketing service
email_marketing_service = None

@app.on_event("startup")
async def init_email_marketing():
    global email_marketing_service
    smtp_config = {
        "host": SMTP_HOST,
        "port": SMTP_PORT,
        "user": SMTP_USER,
        "password": SMTP_PASSWORD,
        "from": SMTP_FROM
    }
    email_marketing_service = EmailMarketingService(db, smtp_config, FRONTEND_URL)
    await email_marketing_service.initialize_default_templates()
    await email_marketing_service.initialize_default_campaigns()
    logger.info("Email marketing service initialized")

# Pydantic models for email marketing
class EmailTemplateUpdate(BaseModel):
    subject: Optional[str] = None
    html_template: Optional[str] = None
    is_active: Optional[bool] = None

class EmailCampaignUpdate(BaseModel):
    delay_days: Optional[int] = None
    delay_hours: Optional[int] = None
    is_active: Optional[bool] = None

class ManualEmailRequest(BaseModel):
    to_emails: List[str]
    subject: str
    html_content: str
    email_type: str = "manual"

class SeasonalCampaignRequest(BaseModel):
    season: str  # winter, spring, summer, autumn

@api_router.get("/admin/email-marketing/statistics")
async def get_email_statistics(current_user: dict = Depends(get_admin_user)):
    """Get email marketing statistics"""
    if not email_marketing_service:
        raise HTTPException(status_code=500, detail="Email marketing service not initialized")
    
    stats = await email_marketing_service.get_statistics()
    return stats

@api_router.get("/admin/email-marketing/recent")
async def get_recent_emails(limit: int = 50, current_user: dict = Depends(get_admin_user)):
    """Get recent sent emails"""
    if not email_marketing_service:
        raise HTTPException(status_code=500, detail="Email marketing service not initialized")
    
    emails = await email_marketing_service.get_recent_emails(limit)
    return {"emails": emails}

@api_router.get("/admin/email-marketing/templates")
async def get_email_templates(current_user: dict = Depends(get_admin_user)):
    """Get all email templates"""
    templates = await db.email_templates.find({}, {"_id": 0}).to_list(50)
    return {"templates": templates, "email_types": EMAIL_TYPES}

@api_router.put("/admin/email-marketing/templates/{template_type}")
async def update_email_template(template_type: str, update: EmailTemplateUpdate, current_user: dict = Depends(get_admin_user)):
    """Update an email template"""
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.email_templates.update_one(
        {"type": template_type},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Template not found")
    
    updated = await db.email_templates.find_one({"type": template_type}, {"_id": 0})
    return {"message": "Template updated", "template": updated}

@api_router.get("/admin/email-marketing/campaigns")
async def get_email_campaigns(current_user: dict = Depends(get_admin_user)):
    """Get all campaign settings"""
    campaigns = await db.email_campaigns.find({}, {"_id": 0}).to_list(50)
    return {"campaigns": campaigns}

@api_router.put("/admin/email-marketing/campaigns/{campaign_type}")
async def update_email_campaign(campaign_type: str, update: EmailCampaignUpdate, current_user: dict = Depends(get_admin_user)):
    """Update campaign settings"""
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.email_campaigns.update_one(
        {"type": campaign_type},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    updated = await db.email_campaigns.find_one({"type": campaign_type}, {"_id": 0})
    return {"message": "Campaign updated", "campaign": updated}

@api_router.post("/admin/email-marketing/send-manual")
async def send_manual_email(request: ManualEmailRequest, current_user: dict = Depends(get_admin_user)):
    """Send a manual email to selected recipients"""
    if not email_marketing_service:
        raise HTTPException(status_code=500, detail="Email marketing service not initialized")
    
    sent_count = 0
    failed_count = 0
    
    for email in request.to_emails:
        # Add unsubscribe link to the content
        unsubscribe_token = email_marketing_service.generate_unsubscribe_token(email)
        html_with_unsubscribe = request.html_content + f'''
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
            <p style="color: #999; font-size: 11px;">
                <a href="{FRONTEND_URL}/uitschrijven?email={email}&token={unsubscribe_token}" style="color: #999;">
                    Uitschrijven van marketing emails
                </a>
            </p>
        </div>
        '''
        
        success = await email_marketing_service.send_email(
            email,
            request.subject,
            html_with_unsubscribe,
            request.email_type
        )
        
        if success:
            sent_count += 1
        else:
            failed_count += 1
    
    return {
        "message": f"Emails verstuurd: {sent_count}, Mislukt: {failed_count}",
        "sent_count": sent_count,
        "failed_count": failed_count
    }

@api_router.post("/admin/email-marketing/send-seasonal")
async def send_seasonal_campaign(request: SeasonalCampaignRequest, current_user: dict = Depends(get_admin_user)):
    """Send a seasonal campaign to all customers"""
    if not email_marketing_service:
        raise HTTPException(status_code=500, detail="Email marketing service not initialized")
    
    valid_seasons = ["winter", "spring", "summer", "autumn"]
    if request.season not in valid_seasons:
        raise HTTPException(status_code=400, detail=f"Invalid season. Must be one of: {valid_seasons}")
    
    sent_count = await email_marketing_service.send_seasonal_campaign(request.season)
    return {
        "message": f"Seizoenscampagne '{request.season}' verstuurd naar {sent_count} klanten",
        "sent_count": sent_count
    }

class TestEmailRequest(BaseModel):
    test_email: str = "info@spoeddienst24.nl"
    test_name: str = "TestName"
    template_type: str  # "welcome_customer" or "welcome_vakman"

@api_router.post("/admin/email-marketing/send-test")
async def send_test_email(request: TestEmailRequest, current_user: dict = Depends(get_admin_user)):
    """Send a test email to verify personalization and segmentation"""
    if not email_marketing_service:
        raise HTTPException(status_code=500, detail="Email marketing service not initialized")
    
    valid_types = ["welcome_customer", "welcome_vakman"]
    if request.template_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid template_type. Must be one of: {valid_types}")
    
    # Get the template
    template = await db.email_templates.find_one({"type": request.template_type}, {"_id": 0})
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Prepare test variables
    if request.template_type == "welcome_customer":
        variables = {
            "customer_name": request.test_name,
            "first_name": request.test_name,
            "full_name": request.test_name,
            "name": request.test_name,
            "customer_email": request.test_email,
            "email": request.test_email,
            "frontend_url": FRONTEND_URL,
            "unsubscribe_token": "TEST_TOKEN_12345"
        }
    else:  # welcome_vakman
        variables = {
            "vakman_name": request.test_name,
            "first_name": request.test_name,
            "full_name": request.test_name,
            "name": request.test_name,
            "vakman_email": request.test_email,
            "email": request.test_email,
            "service_type": "Loodgieter",
            "frontend_url": FRONTEND_URL,
            "unsubscribe_token": "TEST_TOKEN_12345"
        }
    
    # Render template
    subject = email_marketing_service.render_template(template["subject"], variables)
    html_content = email_marketing_service.render_template(template["html_template"], variables)
    
    # Add TEST indicator to subject
    subject = f"[TEST] {subject}"
    
    # Send the test email
    success = await email_marketing_service.send_email(
        request.test_email,
        subject,
        html_content,
        f"test_{request.template_type}",
        "test_email"
    )
    
    if success:
        return {
            "message": f"Test email ({request.template_type}) succesvol verstuurd naar {request.test_email}",
            "template_type": request.template_type,
            "test_name_used": request.test_name,
            "sent_to": request.test_email
        }
    else:
        raise HTTPException(status_code=500, detail="Kon test email niet versturen. Controleer SMTP instellingen.")

@api_router.post("/admin/email-marketing/process-queue")
async def process_email_queue(current_user: dict = Depends(get_admin_user)):
    """Manually trigger processing of the email queue"""
    if not email_marketing_service:
        raise HTTPException(status_code=500, detail="Email marketing service not initialized")
    
    await email_marketing_service.process_email_queue()
    return {"message": "Email queue processed"}

@api_router.get("/admin/email-marketing/queue")
async def get_email_queue(current_user: dict = Depends(get_admin_user)):
    """Get pending emails in the queue"""
    queue = await db.email_queue.find(
        {"status": "pending"},
        {"_id": 0}
    ).sort("send_at", 1).to_list(100)
    return {"queue": queue}


# ==================== IP WARMING & RATE LIMITING ====================

@api_router.get("/admin/email-marketing/ip-warming")
async def get_ip_warming_status(current_user: dict = Depends(get_admin_user)):
    """Get current IP warming status and daily limits"""
    if not email_marketing_service:
        raise HTTPException(status_code=500, detail="Service unavailable")
    
    status = await email_marketing_service.get_ip_warming_status()
    return status

@api_router.post("/admin/email-marketing/ip-warming/toggle")
async def toggle_ip_warming(enabled: bool = True, current_user: dict = Depends(get_admin_user)):
    """Enable or disable IP warming limits"""
    await db.email_rate_limits.update_one(
        {"type": "ip_warming"},
        {"$set": {"enabled": enabled}},
        upsert=True
    )
    return {"message": f"IP warming {'ingeschakeld' if enabled else 'uitgeschakeld'}", "enabled": enabled}


# ==================== COUNTRY SEGMENTATION ====================

class CountryRequest(BaseModel):
    email: str
    country: str  # "NL" or "BE"

@api_router.post("/admin/email-marketing/set-country")
async def set_user_country(request: CountryRequest, current_user: dict = Depends(get_admin_user)):
    """Set user's country for segmentation"""
    if not email_marketing_service:
        raise HTTPException(status_code=500, detail="Service unavailable")
    
    if request.country not in ["NL", "BE"]:
        raise HTTPException(status_code=400, detail="Country must be 'NL' or 'BE'")
    
    success = await email_marketing_service.set_user_country(request.email, request.country)
    return {"message": f"Land ingesteld op {request.country} voor {request.email}", "success": success}

@api_router.get("/admin/email-marketing/users-by-country/{country}")
async def get_users_by_country(country: str, exclude_vakman: bool = True, current_user: dict = Depends(get_admin_user)):
    """Get all users from a specific country"""
    if not email_marketing_service:
        raise HTTPException(status_code=500, detail="Service unavailable")
    
    if country not in ["NL", "BE"]:
        raise HTTPException(status_code=400, detail="Country must be 'NL' or 'BE'")
    
    users = await email_marketing_service.get_users_by_country(country, exclude_vakman)
    return {
        "country": country,
        "count": len(users),
        "users": users[:100],  # Limit response size
        "total": len(users)
    }

@api_router.get("/admin/email-marketing/country-stats")
async def get_country_stats(current_user: dict = Depends(get_admin_user)):
    """Get email list statistics by country"""
    nl_count = await db.email_preferences.count_documents({"country": "NL"})
    be_count = await db.email_preferences.count_documents({"country": "BE"})
    unknown_count = await db.email_preferences.count_documents({"country": {"$exists": False}})
    
    from services.email_marketing import COUNTRY_CONFIG
    return {
        "statistics": {
            "NL": {"count": nl_count, "config": COUNTRY_CONFIG["NL"]},
            "BE": {"count": be_count, "config": COUNTRY_CONFIG["BE"]},
            "unknown": {"count": unknown_count}
        },
        "total": nl_count + be_count + unknown_count,
        "note": "Belgen: beleefdere toon, Nederlanders: directe communicatie"
    }


# ==================== OPTIMAL SEND TIMING ====================

@api_router.get("/admin/email-marketing/optimal-timing")
async def get_optimal_timing(current_user: dict = Depends(get_admin_user)):
    """Get optimal email send timing information"""
    if not email_marketing_service:
        raise HTTPException(status_code=500, detail="Service unavailable")
    
    is_optimal, timing_info = email_marketing_service.is_optimal_send_time()
    next_optimal = email_marketing_service.get_next_optimal_send_time()
    
    return {
        "current_timing": timing_info,
        "next_optimal_time": next_optimal.isoformat(),
        "next_optimal_formatted": next_optimal.strftime("%A %d %B om %H:%M CET"),
        "recommendation": "Voor spoeddiensten werken dinsdag- en donderdagochtend (09:00-11:00) goed, evenals vrijdagmiddag (14:00-16:00)."
    }


# ==================== UNSUBSCRIBE VERIFICATION ====================

# Public unsubscribe endpoint (no auth required) - GDPR compliant
@api_router.get("/uitschrijven")
async def unsubscribe_email(email: str, token: str):
    """Unsubscribe from marketing emails - GDPR/AVG compliant"""
    if not email_marketing_service:
        raise HTTPException(status_code=500, detail="Service unavailable")
    
    success = await email_marketing_service.unsubscribe(email, token)
    if success:
        return {"message": "U bent succesvol uitgeschreven van marketing emails."}
    else:
        raise HTTPException(status_code=400, detail="Ongeldige uitschrijflink")

@api_router.get("/admin/email-marketing/unsubscribe-stats")
async def get_unsubscribe_stats(current_user: dict = Depends(get_admin_user)):
    """Get unsubscribe statistics for GDPR compliance monitoring"""
    total_unsubscribed = await db.email_preferences.count_documents({"unsubscribed": True})
    total_subscribed = await db.email_preferences.count_documents({"unsubscribed": {"$ne": True}})
    
    # Recent unsubscribes (last 30 days)
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    recent_unsubscribes = await db.email_preferences.count_documents({
        "unsubscribed": True,
        "unsubscribed_at": {"$gte": thirty_days_ago}
    })
    
    return {
        "total_unsubscribed": total_unsubscribed,
        "total_subscribed": total_subscribed,
        "recent_unsubscribes_30_days": recent_unsubscribes,
        "unsubscribe_rate": round(total_unsubscribed / (total_subscribed + total_unsubscribed) * 100, 2) if (total_subscribed + total_unsubscribed) > 0 else 0,
        "gdpr_compliant": True,
        "note": "Alle marketing emails bevatten een werkende afmeldlink conform AVG/GDPR wetgeving."
    }


# ==================== USER TAG MANAGEMENT ====================

class TagRequest(BaseModel):
    email: str
    tag: str

class BulkTagRequest(BaseModel):
    emails: List[str]
    tag: str

# ==================== BULK CAMPAIGN SERVICE ====================
from services.bulk_campaign import BulkCampaignService, REGIONAL_CONFIG, AB_TEST_SUBJECTS, THROTTLE_CONFIG

bulk_campaign_service = None

@api_router.on_event("startup")
async def init_bulk_campaign_service():
    global bulk_campaign_service
    if db is not None and email_marketing_service is not None:
        bulk_campaign_service = BulkCampaignService(db, email_marketing_service)

# Campaign Management Endpoints
class CreateCampaignRequest(BaseModel):
    name: str
    country: str  # "NL" or "BE"
    ab_test_enabled: bool = True

@api_router.post("/admin/bulk-campaigns")
async def create_bulk_campaign(request: CreateCampaignRequest, current_user: dict = Depends(get_admin_user)):
    """Create a new bulk email campaign"""
    global bulk_campaign_service
    if not bulk_campaign_service:
        # Initialize if not done yet
        bulk_campaign_service = BulkCampaignService(db, email_marketing_service)
    
    result = await bulk_campaign_service.create_campaign(
        name=request.name,
        country=request.country,
        ab_test_enabled=request.ab_test_enabled
    )
    return result

@api_router.get("/admin/bulk-campaigns")
async def list_bulk_campaigns(current_user: dict = Depends(get_admin_user)):
    """List all bulk campaigns"""
    global bulk_campaign_service
    if not bulk_campaign_service:
        bulk_campaign_service = BulkCampaignService(db, email_marketing_service)
    
    campaigns = await bulk_campaign_service.list_campaigns()
    return {"campaigns": campaigns}

@api_router.get("/admin/bulk-campaigns/{campaign_id}")
async def get_bulk_campaign(campaign_id: str, current_user: dict = Depends(get_admin_user)):
    """Get campaign details"""
    global bulk_campaign_service
    if not bulk_campaign_service:
        bulk_campaign_service = BulkCampaignService(db, email_marketing_service)
    
    campaign = await bulk_campaign_service.get_campaign(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@api_router.get("/admin/bulk-campaigns/{campaign_id}/stats")
async def get_campaign_stats(campaign_id: str, current_user: dict = Depends(get_admin_user)):
    """Get detailed campaign statistics"""
    if not bulk_campaign_service:
        global bulk_campaign_service
        bulk_campaign_service = BulkCampaignService(db, email_marketing_service)
    
    stats = await bulk_campaign_service.get_campaign_stats(campaign_id)
    return stats

# CSV Import Endpoint
@api_router.post("/admin/bulk-campaigns/{campaign_id}/import-csv")
async def import_csv_to_campaign(
    campaign_id: str,
    country: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_admin_user)
):
    """Import contacts from CSV file"""
    if not bulk_campaign_service:
        global bulk_campaign_service
        bulk_campaign_service = BulkCampaignService(db, email_marketing_service)
    
    if country not in ["NL", "BE"]:
        raise HTTPException(status_code=400, detail="Country must be 'NL' or 'BE'")
    
    # Read CSV content
    content = await file.read()
    csv_content = content.decode("utf-8")
    
    # Detect delimiter
    delimiter = ";" if ";" in csv_content[:500] else ","
    
    result = await bulk_campaign_service.import_csv(
        csv_content=csv_content,
        country=country,
        campaign_id=campaign_id,
        delimiter=delimiter
    )
    
    return result

# Scheduling Endpoint
@api_router.post("/admin/bulk-campaigns/{campaign_id}/schedule")
async def schedule_campaign(campaign_id: str, current_user: dict = Depends(get_admin_user)):
    """Schedule campaign with throttling (spread over 5 days)"""
    if not bulk_campaign_service:
        global bulk_campaign_service
        bulk_campaign_service = BulkCampaignService(db, email_marketing_service)
    
    result = await bulk_campaign_service.schedule_campaign(campaign_id)
    return result

# A/B Test Results
@api_router.get("/admin/bulk-campaigns/{campaign_id}/ab-results")
async def get_ab_test_results(campaign_id: str, current_user: dict = Depends(get_admin_user)):
    """Get A/B test results for a campaign"""
    if not bulk_campaign_service:
        global bulk_campaign_service
        bulk_campaign_service = BulkCampaignService(db, email_marketing_service)
    
    results = await bulk_campaign_service.get_ab_test_results(campaign_id)
    return results

# Regional and A/B Config Info
@api_router.get("/admin/bulk-campaigns/config/regional")
async def get_regional_config(current_user: dict = Depends(get_admin_user)):
    """Get regional configuration for NL and BE"""
    return {
        "regions": REGIONAL_CONFIG,
        "note": "NL: directe toon, BE: beleefdere toon"
    }

@api_router.get("/admin/bulk-campaigns/config/ab-subjects")
async def get_ab_subjects(current_user: dict = Depends(get_admin_user)):
    """Get A/B test subject lines"""
    return {
        "subjects": AB_TEST_SUBJECTS,
        "note": "50/50 split - meet open rates en click rates"
    }

@api_router.get("/admin/bulk-campaigns/config/throttle")
async def get_throttle_config(current_user: dict = Depends(get_admin_user)):
    """Get throttling configuration for spam prevention"""
    return {
        "config": THROTTLE_CONFIG,
        "note": "Emails worden verspreid over 5 dagen om spam filters te voorkomen"
    }


@api_router.get("/admin/email-marketing/tags")
async def get_available_tags(current_user: dict = Depends(get_admin_user)):
    """Get available user tags for segmentation"""
    from services.email_marketing import USER_TAGS
    return {"tags": USER_TAGS}

@api_router.post("/admin/email-marketing/tags/add")
async def add_user_tag(request: TagRequest, current_user: dict = Depends(get_admin_user)):
    """Add a tag to a user"""
    if not email_marketing_service:
        raise HTTPException(status_code=500, detail="Service unavailable")
    
    success = await email_marketing_service.add_user_tag(request.email, request.tag)
    return {"message": f"Tag '{request.tag}' toegevoegd aan {request.email}", "success": success}

@api_router.post("/admin/email-marketing/tags/remove")
async def remove_user_tag(request: TagRequest, current_user: dict = Depends(get_admin_user)):
    """Remove a tag from a user"""
    if not email_marketing_service:
        raise HTTPException(status_code=500, detail="Service unavailable")
    
    success = await email_marketing_service.remove_user_tag(request.email, request.tag)
    return {"message": f"Tag '{request.tag}' verwijderd van {request.email}", "success": success}

@api_router.post("/admin/email-marketing/tags/bulk-add")
async def bulk_add_tag(request: BulkTagRequest, current_user: dict = Depends(get_admin_user)):
    """Add a tag to multiple users"""
    if not email_marketing_service:
        raise HTTPException(status_code=500, detail="Service unavailable")
    
    success_count = 0
    for email in request.emails:
        if await email_marketing_service.add_user_tag(email, request.tag):
            success_count += 1
    
    return {"message": f"Tag '{request.tag}' toegevoegd aan {success_count}/{len(request.emails)} gebruikers"}

@api_router.get("/admin/email-marketing/tags/users/{tag}")
async def get_users_by_tag(tag: str, exclude_vakman: bool = False, current_user: dict = Depends(get_admin_user)):
    """Get all users with a specific tag"""
    if not email_marketing_service:
        raise HTTPException(status_code=500, detail="Service unavailable")
    
    exclude_tags = ["vakman"] if exclude_vakman else None
    users = await email_marketing_service.get_users_by_tag(tag, exclude_tags)
    return {"users": users, "count": len(users)}

@api_router.get("/admin/email-marketing/user-preferences/{email}")
async def get_user_preferences(email: str, current_user: dict = Depends(get_admin_user)):
    """Get email preferences and tags for a user"""
    pref = await db.email_preferences.find_one({"email": email.lower()}, {"_id": 0})
    return {"preferences": pref or {"email": email, "tags": [], "unsubscribed": False}}


# ==================== GOOGLE ADS MOCK API ====================
# Mock service for Google Ads integration - will be swapped for real API when Developer Token is approved

from services.google_ads_mock import google_ads_mock_service

@api_router.get("/admin/google-ads/campaigns")
async def get_google_ads_campaigns(
    date_range: str = "LAST_30_DAYS",
    service_type: Optional[str] = None,
    current_user: dict = Depends(get_admin_user)
):
    """
    Get campaign performance report from Google Ads (MOCK DATA).
    Standard Google Ads API response structure.
    """
    return google_ads_mock_service.get_campaign_performance_report(
        date_range=date_range,
        service_type=service_type
    )

@api_router.get("/admin/google-ads/keywords")
async def get_google_ads_keywords(
    campaign_id: Optional[str] = None,
    date_range: str = "LAST_30_DAYS",
    current_user: dict = Depends(get_admin_user)
):
    """
    Get keyword performance report from Google Ads (MOCK DATA).
    """
    return google_ads_mock_service.get_keyword_performance_report(
        campaign_id=campaign_id,
        date_range=date_range
    )

@api_router.get("/admin/google-ads/geographic")
async def get_google_ads_geographic(
    date_range: str = "LAST_30_DAYS",
    current_user: dict = Depends(get_admin_user)
):
    """
    Get geographic performance report from Google Ads (MOCK DATA).
    Shows performance per Belgian city.
    """
    return google_ads_mock_service.get_geographic_performance_report(date_range=date_range)

@api_router.get("/admin/google-ads/summary")
async def get_google_ads_summary(
    current_user: dict = Depends(get_admin_user)
):
    """
    Get account summary with overall performance metrics (MOCK DATA).
    Includes recommendations.
    """
    return google_ads_mock_service.get_account_summary()

@api_router.post("/admin/google-ads/refresh")
async def refresh_google_ads_data(
    current_user: dict = Depends(get_admin_user)
):
    """
    Refresh mock data with new random values.
    In production, this would trigger a cache refresh from the real API.
    """
    return google_ads_mock_service.refresh_data()


# Include the router in the main app (must be after all route definitions)
app.include_router(api_router)
