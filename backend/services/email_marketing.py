# Email Marketing Service for SpoedDienst24
# Handles automated emails: welcome, review reminders, seasonal campaigns, reactivation

import os
import logging
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, List
from motor.motor_asyncio import AsyncIOMotorClient
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import uuid

logger = logging.getLogger(__name__)

# Email Template Types
EMAIL_TYPES = {
    "welcome_customer": "Welkomstmail Klant",
    "welcome_customer_be": "Welkomstmail Klant (België)",
    "welcome_vakman": "Welkomstmail Vakman",
    "welcome_vakman_be": "Welkomstmail Vakman (België)",
    "review_reminder": "Review Herinnering",
    "seasonal_winter": "Seizoenstips Winter",
    "seasonal_spring": "Seizoenstips Voorjaar",
    "seasonal_summer": "Seizoenstips Zomer",
    "seasonal_autumn": "Seizoenstips Herfst",
    "reactivation": "Inactieve Klant Heractivatie",
    "manual": "Handmatige Mail"
}

# User Tags for Segmentation
USER_TAGS = {
    "customer": "Klant",
    "vakman": "Vakman",
    "premium_customer": "Premium Klant",
    "premium_vakman": "Premium Vakman",
    "inactive": "Inactief",
    "newsletter": "Nieuwsbrief",
    "country_nl": "Nederland",
    "country_be": "België"
}

# Country-specific configuration
COUNTRY_CONFIG = {
    "NL": {
        "name": "Nederland",
        "domain": "spoeddienst24.nl",
        "email": "info@spoeddienst24.nl",
        "phone": "085 333 2847",
        "tone": "direct",  # Nederlanders houden van directheid
        "greeting": "Hallo",
        "formal_greeting": "Beste"
    },
    "BE": {
        "name": "België",
        "domain": "spoeddienst24.be",
        "email": "info@spoeddienst24.be",
        "phone": "03 808 47 47",
        "tone": "polite",  # Belgen houden van een beleefdere toon
        "greeting": "Geachte",
        "formal_greeting": "Beste"
    }
}

# IP Warming Configuration - Start slow, build up reputation
IP_WARMING_CONFIG = {
    "enabled": True,
    "daily_limits": {
        "day_1_7": 500,      # Week 1: 500/dag
        "day_8_14": 1000,    # Week 2: 1000/dag
        "day_15_21": 2500,   # Week 3: 2500/dag
        "day_22_28": 5000,   # Week 4: 5000/dag
        "day_29_plus": 10000 # Week 5+: 10000/dag (max)
    },
    "start_date": None  # Will be set on first bulk send
}

# Optimal Send Times for Spoeddiensten
OPTIMAL_SEND_TIMES = {
    "best_days": [1, 3, 4],  # Tuesday (1), Thursday (3), Friday (4) - Monday=0
    "best_hours": {
        "morning": (9, 11),   # 09:00-11:00 - Dinsdag/Donderdag ochtend
        "afternoon": (14, 16) # 14:00-16:00 - Vrijdagmiddag
    }
}

# Default templates
DEFAULT_TEMPLATES = {
    "welcome_customer": {
        "subject": "Welkom bij SpoedDienst24! ⚡",
        "html_template": """
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5;">
            <div style="background: linear-gradient(135deg, #FF4500 0%, #CC3700 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">⚡ SpoedDienst24</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">24/7 Vakmannen aan uw deur</p>
            </div>
            
            <div style="padding: 30px; background-color: white;">
                <h2 style="color: #333; margin-top: 0;">Welkom bij SpoedDienst24, {{customer_name}}!</h2>
                
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    Bedankt voor uw registratie! U kunt nu gebruik maken van onze 24/7 spoeddiensten voor:
                </p>
                
                <div style="display: flex; gap: 10px; margin: 20px 0;">
                    <div style="flex: 1; background-color: #e3f2fd; padding: 15px; border-radius: 8px; text-align: center;">
                        <span style="font-size: 24px;">🔧</span>
                        <p style="margin: 5px 0 0 0; font-weight: bold; color: #1976d2;">Loodgieter</p>
                    </div>
                    <div style="flex: 1; background-color: #fff3e0; padding: 15px; border-radius: 8px; text-align: center;">
                        <span style="font-size: 24px;">🔑</span>
                        <p style="margin: 5px 0 0 0; font-weight: bold; color: #f57c00;">Slotenmaker</p>
                    </div>
                    <div style="flex: 1; background-color: #fff8e1; padding: 15px; border-radius: 8px; text-align: center;">
                        <span style="font-size: 24px;">⚡</span>
                        <p style="margin: 5px 0 0 0; font-weight: bold; color: #fbc02d;">Elektricien</p>
                    </div>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #FF4500; margin-top: 0;">🎁 Wat u kunt verwachten:</h3>
                    <ul style="color: #666; padding-left: 20px;">
                        <li>Reactie binnen 15 minuten bij spoedgevallen</li>
                        <li>Gecertificeerde en betrouwbare vakmannen</li>
                        <li>Vaste, transparante prijzen</li>
                        <li>Betaling pas na de klus</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{frontend_url}}/boek" style="display: inline-block; background-color: #FF4500; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Boek Nu een Vakman →
                    </a>
                </div>
                
                <p style="color: #999; font-size: 14px; text-align: center;">
                    Vragen? Bel ons op <a href="tel:0853332847" style="color: #FF4500;">085 333 2847</a>
                </p>
            </div>
            
            <div style="background-color: #333; padding: 20px; text-align: center;">
                <p style="color: #999; margin: 0 0 10px 0; font-size: 12px;">© 2024 SpoedDienst24.nl - Alle rechten voorbehouden</p>
                <p style="margin: 0;">
                    <a href="{{frontend_url}}/uitschrijven?email={{customer_email}}&token={{unsubscribe_token}}" style="color: #999; font-size: 11px;">Uitschrijven van marketing emails</a>
                </p>
            </div>
        </body>
        </html>
        """
    },
    "welcome_vakman": {
        "subject": "Welkom bij het SpoedDienst24 team! 🛠️",
        "html_template": """
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">⚡ SpoedDienst24</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Vakman Partnership</p>
            </div>
            
            <div style="padding: 30px; background-color: #f8f9fa;">
                <h2 style="color: #333; margin-top: 0;">Welkom bij het team, {{vakman_name}}!</h2>
                
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    Bedankt voor je aanmelding als {{service_type}} bij SpoedDienst24. Je profiel wordt momenteel beoordeeld door ons team.
                </p>
                
                <div style="background-color: white; padding: 20px; border-radius: 10px; border-left: 4px solid #2563eb; margin: 20px 0;">
                    <h3 style="color: #2563eb; margin-top: 0;">📋 Volgende stappen:</h3>
                    <ol style="color: #666; padding-left: 20px;">
                        <li style="margin-bottom: 10px;">Je ontvangt binnen 24 uur bericht over je goedkeuring</li>
                        <li style="margin-bottom: 10px;">Na goedkeuring kun je direct klussen ontvangen</li>
                        <li style="margin-bottom: 10px;">Je krijgt een notificatie bij elke nieuwe klus in jouw regio</li>
                    </ol>
                </div>
                
                <div style="background-color: #fff3e6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #FF4500; margin-top: 0;">💰 Verdien meer met Premium</h3>
                    <p style="color: #666; margin: 0;">
                        Met een Premium lidmaatschap krijg je voorrang bij klussen en betaal je lagere commissie. 
                        Bekijk de voordelen in je dashboard!
                    </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{frontend_url}}/vakman/dashboard" style="display: inline-block; background-color: #2563eb; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Ga naar je Dashboard →
                    </a>
                </div>
            </div>
            
            <div style="background-color: #333; padding: 20px; text-align: center;">
                <p style="color: #999; margin: 0 0 10px 0; font-size: 12px;">© 2024 SpoedDienst24.nl</p>
                <p style="margin: 0;">
                    <a href="{{frontend_url}}/uitschrijven?email={{vakman_email}}&token={{unsubscribe_token}}" style="color: #999; font-size: 11px;">Uitschrijven</a>
                </p>
            </div>
        </body>
        </html>
        """
    },
    "review_reminder": {
        "subject": "Hoe was uw ervaring met {{vakman_name}}? ⭐",
        "html_template": """
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #FF4500 0%, #CC3700 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">⚡ SpoedDienst24</h1>
            </div>
            
            <div style="padding: 30px; background-color: #f8f9fa;">
                <h2 style="color: #333; margin-top: 0;">Beste {{customer_name}},</h2>
                
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    Onlangs heeft {{vakman_name}} een {{service_type}} klus voor u uitgevoerd. 
                    We zijn benieuwd naar uw ervaring!
                </p>
                
                <div style="background-color: white; padding: 25px; border-radius: 10px; text-align: center; margin: 25px 0;">
                    <p style="color: #333; font-size: 18px; margin: 0 0 20px 0;">Hoe zou u {{vakman_name}} beoordelen?</p>
                    <div style="font-size: 36px;">
                        ⭐⭐⭐⭐⭐
                    </div>
                    <a href="{{frontend_url}}/review/{{booking_id}}" style="display: inline-block; background-color: #FF4500; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">
                        Schrijf een Review →
                    </a>
                </div>
                
                <div style="background-color: #fff3e6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="color: #666; margin: 0; font-size: 14px;">
                        💡 <strong>Tip:</strong> Uw review helpt andere klanten bij hun keuze én motiveert onze vakmannen om het beste te geven!
                    </p>
                </div>
                
                <p style="color: #999; font-size: 14px; text-align: center;">
                    Het schrijven van een review duurt slechts 1 minuut.
                </p>
            </div>
            
            <div style="background-color: #333; padding: 20px; text-align: center;">
                <p style="color: #999; margin: 0 0 10px 0; font-size: 12px;">© 2024 SpoedDienst24.nl</p>
                <p style="margin: 0;">
                    <a href="{{frontend_url}}/uitschrijven?email={{customer_email}}&token={{unsubscribe_token}}" style="color: #999; font-size: 11px;">Uitschrijven van marketing emails</a>
                </p>
            </div>
        </body>
        </html>
        """
    },
    "seasonal_winter": {
        "subject": "❄️ Winterklaar? Tips om problemen te voorkomen",
        "html_template": """
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0d2137 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">❄️ Wintertips van SpoedDienst24</h1>
            </div>
            
            <div style="padding: 30px; background-color: #f8f9fa;">
                <h2 style="color: #333; margin-top: 0;">Beste {{customer_name}},</h2>
                
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    De winter komt eraan! Voorkom dure reparaties met deze tips van onze experts:
                </p>
                
                <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #1e3a5f; margin-top: 0;">🔧 Loodgieter Tips:</h3>
                    <ul style="color: #666; padding-left: 20px;">
                        <li>Isoleer buitenkranen en leidingen tegen vorst</li>
                        <li>Laat de CV-ketel onderhouden voor de koude maanden</li>
                        <li>Controleer dakgoten op bladeren en verstoppingen</li>
                    </ul>
                </div>
                
                <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #1e3a5f; margin-top: 0;">⚡ Elektricien Tips:</h3>
                    <ul style="color: #666; padding-left: 20px;">
                        <li>Controleer of alle rookmelders werken</li>
                        <li>Laat de meterkast nakijken bij oudere woningen</li>
                        <li>Voorkom overbelasting door kachels op aparte groepen</li>
                    </ul>
                </div>
                
                <div style="background-color: #fff3e6; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
                    <h3 style="color: #FF4500; margin-top: 0;">🎁 Actie: 10% korting op winterchecks!</h3>
                    <p style="color: #666;">Boek deze maand een onderhoudsbeurt en ontvang 10% korting.</p>
                    <a href="{{frontend_url}}/boek" style="display: inline-block; background-color: #FF4500; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">
                        Boek Nu →
                    </a>
                </div>
            </div>
            
            <div style="background-color: #333; padding: 20px; text-align: center;">
                <p style="color: #999; margin: 0 0 10px 0; font-size: 12px;">© 2024 SpoedDienst24.nl</p>
                <p style="margin: 0;">
                    <a href="{{frontend_url}}/uitschrijven?email={{customer_email}}&token={{unsubscribe_token}}" style="color: #999; font-size: 11px;">Uitschrijven</a>
                </p>
            </div>
        </body>
        </html>
        """
    },
    "seasonal_spring": {
        "subject": "🌷 Voorjaar! Tijd voor een grote schoonmaak",
        "html_template": """
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">🌷 Voorjaarstips van SpoedDienst24</h1>
            </div>
            
            <div style="padding: 30px; background-color: #f8f9fa;">
                <h2 style="color: #333; margin-top: 0;">Beste {{customer_name}},</h2>
                
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    Het voorjaar is de perfecte tijd om uw huis weer in topconditie te brengen!
                </p>
                
                <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #22c55e; margin-top: 0;">🔧 Voorjaarschecklist:</h3>
                    <ul style="color: #666; padding-left: 20px;">
                        <li>Laat de dakgoten schoonmaken na de winter</li>
                        <li>Controleer alle kranen op lekkages</li>
                        <li>Test de buitenverlichting en stopcontacten</li>
                        <li>Laat de sloten smeren voor soepele werking</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{frontend_url}}/boek" style="display: inline-block; background-color: #FF4500; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Plan een Onderhoudsbeurt →
                    </a>
                </div>
            </div>
            
            <div style="background-color: #333; padding: 20px; text-align: center;">
                <p style="color: #999; margin: 0 0 10px 0; font-size: 12px;">© 2024 SpoedDienst24.nl</p>
                <p style="margin: 0;">
                    <a href="{{frontend_url}}/uitschrijven?email={{customer_email}}&token={{unsubscribe_token}}" style="color: #999; font-size: 11px;">Uitschrijven</a>
                </p>
            </div>
        </body>
        </html>
        """
    },
    "reactivation": {
        "subject": "We missen je! 👋 Speciale aanbieding voor jou",
        "html_template": """
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #FF4500 0%, #CC3700 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">⚡ SpoedDienst24</h1>
            </div>
            
            <div style="padding: 30px; background-color: #f8f9fa;">
                <h2 style="color: #333; margin-top: 0;">Hallo {{customer_name}}, we missen je!</h2>
                
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    Het is al een tijdje geleden dat je een klus bij ons hebt geboekt. 
                    We willen je graag welkom heten met een speciale aanbieding!
                </p>
                
                <div style="background-color: #FF4500; color: white; padding: 25px; border-radius: 10px; text-align: center; margin: 25px 0;">
                    <p style="margin: 0; font-size: 14px;">EXCLUSIEVE AANBIEDING</p>
                    <h2 style="margin: 10px 0; font-size: 36px;">€15 KORTING</h2>
                    <p style="margin: 0;">Op je volgende boeking</p>
                    <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">Code: WELKOMTERUG</p>
                </div>
                
                <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Waarom SpoedDienst24?</h3>
                    <ul style="color: #666; padding-left: 20px;">
                        <li>✅ 24/7 beschikbaar, ook in het weekend</li>
                        <li>✅ Gecertificeerde vakmannen</li>
                        <li>✅ Vaste prijzen, geen verrassingen</li>
                        <li>✅ Snelle service, binnen 30 minuten ter plaatse</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{frontend_url}}/boek" style="display: inline-block; background-color: #FF4500; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Boek Nu met Korting →
                    </a>
                </div>
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                    Deze aanbieding is geldig tot {{expiry_date}}.
                </p>
            </div>
            
            <div style="background-color: #333; padding: 20px; text-align: center;">
                <p style="color: #999; margin: 0 0 10px 0; font-size: 12px;">© 2024 SpoedDienst24.nl</p>
                <p style="margin: 0;">
                    <a href="{{frontend_url}}/uitschrijven?email={{customer_email}}&token={{unsubscribe_token}}" style="color: #999; font-size: 11px;">Uitschrijven van marketing emails</a>
                </p>
            </div>
        </body>
        </html>
        """
    }
}


class EmailMarketingService:
    def __init__(self, db, smtp_config: dict, frontend_url: str):
        self.db = db
        self.smtp_config = smtp_config
        self.frontend_url = frontend_url
        self.collections = {
            "templates": db.email_templates,
            "campaigns": db.email_campaigns,
            "sent": db.sent_emails,
            "preferences": db.email_preferences,
            "queue": db.email_queue,
            "rate_limits": db.email_rate_limits
        }
    
    # ==================== IP WARMING & RATE LIMITING ====================
    
    async def get_daily_send_count(self) -> int:
        """Get number of emails sent today"""
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        count = await self.collections["sent"].count_documents({
            "sent_at": {"$gte": today_start},
            "status": "sent"
        })
        return count
    
    async def get_ip_warming_limit(self) -> int:
        """Get current daily limit based on IP warming schedule"""
        # Get or create warming start date
        config = await self.collections["rate_limits"].find_one({"type": "ip_warming"})
        
        if not config:
            # First time - create config
            config = {
                "type": "ip_warming",
                "start_date": datetime.now(timezone.utc),
                "enabled": True
            }
            await self.collections["rate_limits"].insert_one(config)
        
        if not config.get("enabled", True):
            return 999999  # No limit if disabled
        
        # Calculate days since start
        start_date = config.get("start_date", datetime.now(timezone.utc))
        days_active = (datetime.now(timezone.utc) - start_date).days + 1
        
        # Return appropriate limit based on warming schedule
        if days_active <= 7:
            return IP_WARMING_CONFIG["daily_limits"]["day_1_7"]
        elif days_active <= 14:
            return IP_WARMING_CONFIG["daily_limits"]["day_8_14"]
        elif days_active <= 21:
            return IP_WARMING_CONFIG["daily_limits"]["day_15_21"]
        elif days_active <= 28:
            return IP_WARMING_CONFIG["daily_limits"]["day_22_28"]
        else:
            return IP_WARMING_CONFIG["daily_limits"]["day_29_plus"]
    
    async def can_send_email(self) -> tuple:
        """Check if we can send more emails today (IP warming)"""
        daily_count = await self.get_daily_send_count()
        daily_limit = await self.get_ip_warming_limit()
        
        can_send = daily_count < daily_limit
        remaining = max(0, daily_limit - daily_count)
        
        return can_send, remaining, daily_limit
    
    async def get_ip_warming_status(self) -> dict:
        """Get current IP warming status"""
        daily_count = await self.get_daily_send_count()
        daily_limit = await self.get_ip_warming_limit()
        config = await self.collections["rate_limits"].find_one({"type": "ip_warming"})
        
        start_date = config.get("start_date") if config else datetime.now(timezone.utc)
        days_active = (datetime.now(timezone.utc) - start_date).days + 1
        
        return {
            "enabled": config.get("enabled", True) if config else True,
            "days_active": days_active,
            "current_daily_limit": daily_limit,
            "emails_sent_today": daily_count,
            "remaining_today": max(0, daily_limit - daily_count),
            "percentage_used": round(daily_count / daily_limit * 100, 1) if daily_limit > 0 else 0,
            "start_date": start_date.isoformat() if start_date else None,
            "schedule": IP_WARMING_CONFIG["daily_limits"]
        }
    
    # ==================== COUNTRY SEGMENTATION ====================
    
    async def set_user_country(self, email: str, country: str) -> bool:
        """Set user's country for segmentation (NL or BE)"""
        if country not in ["NL", "BE"]:
            return False
        
        # Remove old country tag and add new one
        await self.remove_user_tag(email, "country_nl")
        await self.remove_user_tag(email, "country_be")
        await self.add_user_tag(email, f"country_{country.lower()}")
        
        # Also store country directly
        await self.collections["preferences"].update_one(
            {"email": email.lower()},
            {"$set": {"country": country}},
            upsert=True
        )
        
        logger.info(f"Set country {country} for {email}")
        return True
    
    async def get_user_country(self, email: str) -> str:
        """Get user's country (default: NL)"""
        pref = await self.collections["preferences"].find_one({"email": email.lower()})
        return pref.get("country", "NL") if pref else "NL"
    
    async def get_users_by_country(self, country: str, exclude_vakman: bool = True) -> List[dict]:
        """Get all users from a specific country"""
        query = {"country": country}
        if exclude_vakman:
            query["tags"] = {"$nin": ["vakman"]}
        
        users = await self.collections["preferences"].find(
            query,
            {"_id": 0}
        ).to_list(10000)
        return users
    
    def get_country_config(self, country: str) -> dict:
        """Get country-specific configuration"""
        return COUNTRY_CONFIG.get(country, COUNTRY_CONFIG["NL"])
    
    def get_country_greeting(self, country: str, formal: bool = False) -> str:
        """Get appropriate greeting based on country and formality"""
        config = self.get_country_config(country)
        return config["formal_greeting"] if formal else config["greeting"]
    
    # ==================== OPTIMAL SEND TIMING ====================
    
    def is_optimal_send_time(self) -> tuple:
        """Check if current time is optimal for sending marketing emails"""
        now = datetime.now(timezone.utc)
        # Adjust for CET/CEST (UTC+1 or UTC+2)
        local_hour = (now.hour + 1) % 24  # Simplified CET
        weekday = now.weekday()
        
        is_best_day = weekday in OPTIMAL_SEND_TIMES["best_days"]
        
        morning_start, morning_end = OPTIMAL_SEND_TIMES["best_hours"]["morning"]
        afternoon_start, afternoon_end = OPTIMAL_SEND_TIMES["best_hours"]["afternoon"]
        
        is_morning = morning_start <= local_hour < morning_end
        is_afternoon = afternoon_start <= local_hour < afternoon_end
        is_best_hour = is_morning or is_afternoon
        
        recommendation = None
        if not is_best_day:
            recommendation = "Beste dagen: dinsdag, donderdag, vrijdag"
        elif not is_best_hour:
            recommendation = "Beste uren: 09:00-11:00 of 14:00-16:00"
        
        return is_best_day and is_best_hour, {
            "is_optimal": is_best_day and is_best_hour,
            "current_day": ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"][weekday],
            "current_hour": local_hour,
            "is_best_day": is_best_day,
            "is_best_hour": is_best_hour,
            "recommendation": recommendation,
            "best_times": "Dinsdag/Donderdag 09:00-11:00, Vrijdag 14:00-16:00"
        }
    
    def get_next_optimal_send_time(self) -> datetime:
        """Calculate the next optimal send time"""
        now = datetime.now(timezone.utc)
        
        # Find next Tuesday, Thursday, or Friday at 09:00 CET
        days_ahead = 0
        while days_ahead < 7:
            check_date = now + timedelta(days=days_ahead)
            if check_date.weekday() in OPTIMAL_SEND_TIMES["best_days"]:
                # Set to 09:00 CET (08:00 UTC)
                optimal_time = check_date.replace(hour=8, minute=0, second=0, microsecond=0)
                if optimal_time > now:
                    return optimal_time
            days_ahead += 1
        
        # Fallback: next Tuesday at 09:00
        days_until_tuesday = (1 - now.weekday()) % 7
        if days_until_tuesday == 0:
            days_until_tuesday = 7
        return (now + timedelta(days=days_until_tuesday)).replace(hour=8, minute=0, second=0, microsecond=0)
    
    # ==================== END NEW FEATURES ====================
    
    async def initialize_default_templates(self):
        """Initialize default email templates if they don't exist"""
        for template_type, template_data in DEFAULT_TEMPLATES.items():
            existing = await self.collections["templates"].find_one({"type": template_type})
            if not existing:
                await self.collections["templates"].insert_one({
                    "id": str(uuid.uuid4()),
                    "type": template_type,
                    "name": EMAIL_TYPES.get(template_type, template_type),
                    "subject": template_data["subject"],
                    "html_template": template_data["html_template"],
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc)
                })
                logger.info(f"Created default template: {template_type}")
    
    async def initialize_default_campaigns(self):
        """Initialize default campaign settings"""
        default_campaigns = [
            {
                "type": "welcome_customer",
                "name": "Welkomstmail Klant",
                "trigger": "on_registration",
                "delay_days": 0,
                "delay_hours": 0,
                "is_active": True
            },
            {
                "type": "welcome_vakman",
                "name": "Welkomstmail Vakman",
                "trigger": "on_vakman_registration",
                "delay_days": 0,
                "delay_hours": 0,
                "is_active": True
            },
            {
                "type": "review_reminder",
                "name": "Review Herinnering",
                "trigger": "after_booking_completed",
                "delay_days": 3,
                "delay_hours": 0,
                "is_active": True
            },
            {
                "type": "reactivation",
                "name": "Inactieve Klant Heractivatie",
                "trigger": "inactive_customer",
                "delay_days": 90,
                "delay_hours": 0,
                "is_active": True
            }
        ]
        
        for campaign in default_campaigns:
            existing = await self.collections["campaigns"].find_one({"type": campaign["type"]})
            if not existing:
                campaign["id"] = str(uuid.uuid4())
                campaign["created_at"] = datetime.now(timezone.utc)
                campaign["updated_at"] = datetime.now(timezone.utc)
                await self.collections["campaigns"].insert_one(campaign)
                logger.info(f"Created default campaign: {campaign['type']}")
    
    # ==================== TAG MANAGEMENT ====================
    
    async def add_user_tag(self, email: str, tag: str) -> bool:
        """Add a tag to a user for segmentation"""
        if not email:
            return False
        await self.collections["preferences"].update_one(
            {"email": email.lower()},
            {
                "$set": {"email": email.lower()},
                "$addToSet": {"tags": tag},
                "$setOnInsert": {"created_at": datetime.now(timezone.utc)}
            },
            upsert=True
        )
        logger.info(f"Added tag '{tag}' to {email}")
        return True
    
    async def remove_user_tag(self, email: str, tag: str) -> bool:
        """Remove a tag from a user"""
        if not email:
            return False
        await self.collections["preferences"].update_one(
            {"email": email.lower()},
            {"$pull": {"tags": tag}}
        )
        logger.info(f"Removed tag '{tag}' from {email}")
        return True
    
    async def get_user_tags(self, email: str) -> List[str]:
        """Get all tags for a user"""
        pref = await self.collections["preferences"].find_one({"email": email.lower()})
        return pref.get("tags", []) if pref else []
    
    async def has_tag(self, email: str, tag: str) -> bool:
        """Check if user has a specific tag"""
        tags = await self.get_user_tags(email)
        return tag in tags
    
    async def get_users_by_tag(self, tag: str, exclude_tags: List[str] = None) -> List[dict]:
        """Get all users with a specific tag, optionally excluding other tags"""
        query = {"tags": tag}
        if exclude_tags:
            query["tags"] = {"$all": [tag], "$nin": exclude_tags}
        
        users = await self.collections["preferences"].find(
            query,
            {"_id": 0, "email": 1, "tags": 1}
        ).to_list(10000)
        return users
    
    async def is_vakman(self, email: str) -> bool:
        """Check if user is tagged as vakman (for exclusion from customer flows)"""
        return await self.has_tag(email, "vakman")
    
    # ==================== END TAG MANAGEMENT ====================
    
    def generate_unsubscribe_token(self, email: str) -> str:
        """Generate a simple unsubscribe token"""
        import hashlib
        secret = self.smtp_config.get("password", "secret")
        return hashlib.sha256(f"{email}{secret}".encode()).hexdigest()[:32]
    
    def render_template(self, template: str, variables: dict) -> str:
        """Replace template variables with actual values"""
        result = template
        for key, value in variables.items():
            result = result.replace(f"{{{{{key}}}}}", str(value))
        return result
    
    async def is_unsubscribed(self, email: str) -> bool:
        """Check if email is unsubscribed"""
        pref = await self.collections["preferences"].find_one({"email": email.lower()})
        return pref.get("unsubscribed", False) if pref else False
    
    async def send_email(self, to_email: str, subject: str, html_content: str, email_type: str, reference_id: str = None) -> bool:
        """Send an email and log it"""
        # Check if unsubscribed
        if await self.is_unsubscribed(to_email):
            logger.info(f"Email to {to_email} skipped - unsubscribed")
            return False
        
        try:
            message = MIMEMultipart("alternative")
            message["From"] = self.smtp_config["from"]
            message["To"] = to_email
            message["Subject"] = subject
            
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            await aiosmtplib.send(
                message,
                hostname=self.smtp_config["host"],
                port=self.smtp_config["port"],
                username=self.smtp_config["user"],
                password=self.smtp_config["password"],
                use_tls=True
            )
            
            # Log sent email
            await self.collections["sent"].insert_one({
                "id": str(uuid.uuid4()),
                "to_email": to_email,
                "subject": subject,
                "email_type": email_type,
                "reference_id": reference_id,
                "status": "sent",
                "sent_at": datetime.now(timezone.utc)
            })
            
            logger.info(f"Marketing email sent to {to_email}: {email_type}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send marketing email to {to_email}: {str(e)}")
            
            # Log failed email
            await self.collections["sent"].insert_one({
                "id": str(uuid.uuid4()),
                "to_email": to_email,
                "subject": subject,
                "email_type": email_type,
                "reference_id": reference_id,
                "status": "failed",
                "error": str(e),
                "sent_at": datetime.now(timezone.utc)
            })
            return False
    
    async def send_welcome_customer(self, customer_data: dict) -> bool:
        """Send welcome email to new customer"""
        campaign = await self.collections["campaigns"].find_one({"type": "welcome_customer"})
        if not campaign or not campaign.get("is_active"):
            return False
        
        template = await self.collections["templates"].find_one({"type": "welcome_customer"})
        if not template or not template.get("is_active"):
            return False
        
        # Detect country from data (default to NL)
        country = customer_data.get("country", "NL").upper()
        if country not in ["NL", "BE"]:
            country = "NL"
        
        # Set user country for segmentation
        customer_email = customer_data.get("email", "")
        await self.set_user_country(customer_email, country)
        
        # Add 'customer' tag to user for segmentation
        await self.add_user_tag(customer_email, "customer")
        
        # Get the customer's first name (handle various input formats)
        full_name = customer_data.get("name", "") or customer_data.get("customer_name", "") or "Klant"
        first_name = full_name.split()[0] if full_name and full_name.strip() else "Klant"
        
        # Get country-specific greeting (Belgen: beleefder, Nederlanders: directer)
        country_config = self.get_country_config(country)
        greeting = country_config["greeting"] if country == "NL" else country_config["formal_greeting"]
        
        variables = {
            "customer_name": first_name,
            "first_name": first_name,
            "full_name": full_name,
            "name": first_name,
            "customer_email": customer_email,
            "email": customer_email,
            "greeting": greeting,
            "country": country,
            "frontend_url": self.frontend_url,
            "unsubscribe_token": self.generate_unsubscribe_token(customer_email)
        }
        
        subject = self.render_template(template["subject"], variables)
        html_content = self.render_template(template["html_template"], variables)
        
        return await self.send_email(
            customer_data.get("email"),
            subject,
            html_content,
            "welcome_customer",
            customer_data.get("id")
        )
    
    async def send_welcome_vakman(self, vakman_data: dict) -> bool:
        """Send welcome email to new vakman"""
        campaign = await self.collections["campaigns"].find_one({"type": "welcome_vakman"})
        if not campaign or not campaign.get("is_active"):
            return False
        
        template = await self.collections["templates"].find_one({"type": "welcome_vakman"})
        if not template or not template.get("is_active"):
            return False
        
        # Detect country from data (default to NL)
        country = vakman_data.get("country", "NL").upper()
        if country not in ["NL", "BE"]:
            country = "NL"
        
        vakman_email = vakman_data.get("email", "")
        
        # Set user country for segmentation
        await self.set_user_country(vakman_email, country)
        
        # Add 'vakman' tag to user for segmentation - EXCLUDE from customer marketing
        await self.add_user_tag(vakman_email, "vakman")
        # Remove customer tag if accidentally added
        await self.remove_user_tag(vakman_email, "customer")
        
        service_names = {
            "elektricien": "Elektricien",
            "loodgieter": "Loodgieter",
            "slotenmaker": "Slotenmaker"
        }
        
        # Get the vakman's first name (handle various input formats)
        full_name = vakman_data.get("name", "") or vakman_data.get("vakman_name", "") or "Vakman"
        first_name = full_name.split()[0] if full_name and full_name.strip() else "Vakman"
        
        # Get country-specific greeting
        country_config = self.get_country_config(country)
        greeting = country_config["greeting"] if country == "NL" else country_config["formal_greeting"]
        
        variables = {
            "vakman_name": first_name,
            "first_name": first_name,
            "full_name": full_name,
            "name": first_name,
            "vakman_email": vakman_email,
            "email": vakman_email,
            "service_type": service_names.get(vakman_data.get("service_type", ""), "Vakman"),
            "greeting": greeting,
            "country": country,
            "frontend_url": self.frontend_url,
            "unsubscribe_token": self.generate_unsubscribe_token(vakman_email)
        }
        
        subject = self.render_template(template["subject"], variables)
        html_content = self.render_template(template["html_template"], variables)
        
        return await self.send_email(
            vakman_email,
            subject,
            html_content,
            "welcome_vakman",
            vakman_data.get("id")
        )
    
    async def queue_review_reminder(self, booking_data: dict):
        """Queue a review reminder email"""
        campaign = await self.collections["campaigns"].find_one({"type": "review_reminder"})
        if not campaign or not campaign.get("is_active"):
            return
        
        delay_days = campaign.get("delay_days", 3)
        send_at = datetime.now(timezone.utc) + timedelta(days=delay_days)
        
        await self.collections["queue"].insert_one({
            "id": str(uuid.uuid4()),
            "type": "review_reminder",
            "booking_id": booking_data.get("id"),
            "customer_email": booking_data.get("customer_email"),
            "customer_name": booking_data.get("customer_name"),
            "vakman_name": booking_data.get("vakman_name", "de vakman"),
            "service_type": booking_data.get("service_type"),
            "send_at": send_at,
            "status": "pending",
            "created_at": datetime.now(timezone.utc)
        })
        logger.info(f"Queued review reminder for booking {booking_data.get('id')}")
    
    async def process_email_queue(self):
        """Process pending emails in the queue"""
        now = datetime.now(timezone.utc)
        
        # Find pending emails that should be sent
        pending_emails = await self.collections["queue"].find({
            "status": "pending",
            "send_at": {"$lte": now}
        }).to_list(100)
        
        for queued_email in pending_emails:
            try:
                if queued_email["type"] == "review_reminder":
                    # Check if review already exists
                    existing_review = await self.db.reviews.find_one({
                        "booking_id": queued_email["booking_id"]
                    })
                    
                    if existing_review:
                        # Review already written, skip
                        await self.collections["queue"].update_one(
                            {"id": queued_email["id"]},
                            {"$set": {"status": "skipped", "reason": "review_exists"}}
                        )
                        continue
                    
                    # Send review reminder
                    template = await self.collections["templates"].find_one({"type": "review_reminder"})
                    if template and template.get("is_active"):
                        service_names = {
                            "elektricien": "elektricien",
                            "loodgieter": "loodgieter",
                            "slotenmaker": "slotenmaker"
                        }
                        
                        variables = {
                            "customer_name": queued_email.get("customer_name", "Klant"),
                            "customer_email": queued_email.get("customer_email", ""),
                            "vakman_name": queued_email.get("vakman_name", "de vakman"),
                            "service_type": service_names.get(queued_email.get("service_type", ""), ""),
                            "booking_id": queued_email.get("booking_id", ""),
                            "frontend_url": self.frontend_url,
                            "unsubscribe_token": self.generate_unsubscribe_token(queued_email.get("customer_email", ""))
                        }
                        
                        subject = self.render_template(template["subject"], variables)
                        html_content = self.render_template(template["html_template"], variables)
                        
                        success = await self.send_email(
                            queued_email.get("customer_email"),
                            subject,
                            html_content,
                            "review_reminder",
                            queued_email.get("booking_id")
                        )
                        
                        status = "sent" if success else "failed"
                        await self.collections["queue"].update_one(
                            {"id": queued_email["id"]},
                            {"$set": {"status": status, "processed_at": now}}
                        )
                
            except Exception as e:
                logger.error(f"Error processing queued email {queued_email['id']}: {str(e)}")
                await self.collections["queue"].update_one(
                    {"id": queued_email["id"]},
                    {"$set": {"status": "error", "error": str(e)}}
                )
    
    async def check_inactive_customers(self):
        """Check for inactive customers and queue reactivation emails"""
        campaign = await self.collections["campaigns"].find_one({"type": "reactivation"})
        if not campaign or not campaign.get("is_active"):
            return
        
        inactive_days = campaign.get("delay_days", 90)
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=inactive_days)
        
        # Find customers who haven't booked in X days
        # This is a simplified check - in production you'd want more sophisticated logic
        customers = await self.db.users.find({
            "role": "customer",
            "last_booking_date": {"$lt": cutoff_date}
        }, {"_id": 0}).to_list(100)
        
        for customer in customers:
            # Check if we already sent a reactivation email recently
            recent_email = await self.collections["sent"].find_one({
                "to_email": customer.get("email"),
                "email_type": "reactivation",
                "sent_at": {"$gte": cutoff_date}
            })
            
            if recent_email:
                continue
            
            # Send reactivation email
            template = await self.collections["templates"].find_one({"type": "reactivation"})
            if template and template.get("is_active"):
                expiry_date = (datetime.now(timezone.utc) + timedelta(days=30)).strftime("%d-%m-%Y")
                
                variables = {
                    "customer_name": customer.get("name", "Klant"),
                    "customer_email": customer.get("email", ""),
                    "expiry_date": expiry_date,
                    "frontend_url": self.frontend_url,
                    "unsubscribe_token": self.generate_unsubscribe_token(customer.get("email", ""))
                }
                
                subject = self.render_template(template["subject"], variables)
                html_content = self.render_template(template["html_template"], variables)
                
                await self.send_email(
                    customer.get("email"),
                    subject,
                    html_content,
                    "reactivation",
                    customer.get("id")
                )
    
    async def send_seasonal_campaign(self, season: str):
        """Send seasonal campaign to all customers (excludes vakmannen)"""
        template_type = f"seasonal_{season}"
        template = await self.collections["templates"].find_one({"type": template_type})
        
        if not template or not template.get("is_active"):
            logger.warning(f"Seasonal template {template_type} not found or inactive")
            return 0
        
        # Get all customers
        customers = await self.db.users.find({"role": "customer"}, {"_id": 0}).to_list(1000)
        sent_count = 0
        
        for customer in customers:
            customer_email = customer.get("email", "")
            
            # Skip if user is tagged as vakman (segmentation exclusion)
            if await self.is_vakman(customer_email):
                logger.info(f"Skipping {customer_email} - tagged as vakman")
                continue
            
            # Get first name for personalization
            full_name = customer.get("name", "Klant")
            first_name = full_name.split()[0] if full_name and full_name.strip() else "Klant"
            
            variables = {
                "customer_name": first_name,
                "first_name": first_name,
                "full_name": full_name,
                "name": first_name,
                "customer_email": customer_email,
                "email": customer_email,
                "frontend_url": self.frontend_url,
                "unsubscribe_token": self.generate_unsubscribe_token(customer.get("email", ""))
            }
            
            subject = self.render_template(template["subject"], variables)
            html_content = self.render_template(template["html_template"], variables)
            
            if await self.send_email(customer.get("email"), subject, html_content, template_type):
                sent_count += 1
        
        return sent_count
    
    async def get_statistics(self) -> dict:
        """Get email marketing statistics"""
        now = datetime.now(timezone.utc)
        last_7_days = now - timedelta(days=7)
        last_30_days = now - timedelta(days=30)
        
        # Total sent
        total_sent = await self.collections["sent"].count_documents({})
        
        # Sent last 7 days
        sent_7_days = await self.collections["sent"].count_documents({
            "sent_at": {"$gte": last_7_days}
        })
        
        # Sent last 30 days
        sent_30_days = await self.collections["sent"].count_documents({
            "sent_at": {"$gte": last_30_days}
        })
        
        # By type
        pipeline = [
            {"$group": {"_id": "$email_type", "count": {"$sum": 1}}}
        ]
        by_type = await self.collections["sent"].aggregate(pipeline).to_list(50)
        
        # Success rate
        total_success = await self.collections["sent"].count_documents({"status": "sent"})
        total_failed = await self.collections["sent"].count_documents({"status": "failed"})
        success_rate = (total_success / (total_success + total_failed) * 100) if (total_success + total_failed) > 0 else 0
        
        # Unsubscribed count
        unsubscribed = await self.collections["preferences"].count_documents({"unsubscribed": True})
        
        # Pending in queue
        pending_queue = await self.collections["queue"].count_documents({"status": "pending"})
        
        return {
            "total_sent": total_sent,
            "sent_last_7_days": sent_7_days,
            "sent_last_30_days": sent_30_days,
            "by_type": {item["_id"]: item["count"] for item in by_type},
            "success_rate": round(success_rate, 1),
            "total_success": total_success,
            "total_failed": total_failed,
            "unsubscribed_count": unsubscribed,
            "pending_in_queue": pending_queue
        }
    
    async def get_recent_emails(self, limit: int = 50) -> list:
        """Get recent sent emails"""
        emails = await self.collections["sent"].find(
            {},
            {"_id": 0}
        ).sort("sent_at", -1).limit(limit).to_list(limit)
        return emails
    
    async def unsubscribe(self, email: str, token: str) -> bool:
        """Unsubscribe an email from marketing"""
        expected_token = self.generate_unsubscribe_token(email)
        if token != expected_token:
            return False
        
        await self.collections["preferences"].update_one(
            {"email": email.lower()},
            {
                "$set": {
                    "email": email.lower(),
                    "unsubscribed": True,
                    "unsubscribed_at": datetime.now(timezone.utc)
                }
            },
            upsert=True
        )
        logger.info(f"Email {email} unsubscribed from marketing")
        return True
    
    async def resubscribe(self, email: str) -> bool:
        """Resubscribe an email to marketing"""
        await self.collections["preferences"].update_one(
            {"email": email.lower()},
            {
                "$set": {
                    "unsubscribed": False,
                    "resubscribed_at": datetime.now(timezone.utc)
                }
            }
        )
        return True
