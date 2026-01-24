"""Email service for SpoedDienst24"""
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
import os

# SMTP Config
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.transip.email')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 465))
SMTP_USER = os.environ.get('SMTP_USER', 'info@spoeddienst24.nl')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
SMTP_FROM = os.environ.get('SMTP_FROM', 'info@spoeddienst24.nl')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://spoeddienst24.nl')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'Spoeddienst26@gmail.com')


async def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """Generic email sender"""
    try:
        message = MIMEMultipart("alternative")
        message["From"] = SMTP_FROM
        message["To"] = to_email
        message["Subject"] = subject
        
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
        logging.info(f"Email sent to {to_email}")
        return True
    except Exception as e:
        logging.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


async def send_booking_email(booking_data: dict):
    """Send new booking notification to admin"""
    service_names = {
        "elektricien": "Elektricien",
        "loodgieter": "Loodgieter",
        "slotenmaker": "Slotenmaker"
    }
    service_name = service_names.get(booking_data.get("service_type", ""), booking_data.get("service_type", ""))
    
    is_spoed = "🚨 SPOEDKLUS" if booking_data.get('is_emergency') else "Reguliere klus"
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: {'#FF4500' if booking_data.get('is_emergency') else '#22c55e'}; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">⚡ Nieuwe Boeking!</h1>
            <p style="color: white; margin: 5px 0;">{is_spoed}</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa;">
            <h2 style="color: #333;">📋 Boekingsdetails</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Dienst:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">{service_name}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Klant:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">{booking_data.get('customer_name', 'N/A')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Telefoon:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><a href="tel:{booking_data.get('customer_phone', '')}">{booking_data.get('customer_phone', 'N/A')}</a></td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><a href="mailto:{booking_data.get('customer_email', '')}">{booking_data.get('customer_email', 'N/A')}</a></td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Adres:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">{booking_data.get('address', 'N/A')}, {booking_data.get('postal_code', '')} {booking_data.get('city', '')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Gewenste datum:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">{booking_data.get('preferred_date', 'N/A')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Gewenste tijd:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">{booking_data.get('preferred_time', 'N/A')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Prijs:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">€{booking_data.get('price', 0)},-</td>
                </tr>
            </table>
            
            <h3 style="color: #333; margin-top: 20px;">📝 Omschrijving:</h3>
            <p style="background-color: #fff; padding: 15px; border-radius: 5px; border-left: 4px solid #FF4500;">
                {booking_data.get('description', 'Geen omschrijving')}
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="{FRONTEND_URL}/beheer" style="display: inline-block; background-color: #FF4500; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Bekijk in Dashboard →
                </a>
            </div>
        </div>
        
        <div style="background-color: #333; padding: 15px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">SpoedDienst24 - Admin Notificatie</p>
        </div>
    </body>
    </html>
    """
    
    subject = f"{'🚨 SPOED: ' if booking_data.get('is_emergency') else ''}Nieuwe {service_name} boeking - {booking_data.get('city', 'N/A')}"
    return await send_email(ADMIN_EMAIL, subject, html_content)


async def send_customer_confirmation_email(booking_data: dict):
    """Send booking confirmation to customer"""
    service_names = {
        "elektricien": "Elektricien",
        "loodgieter": "Loodgieter",
        "slotenmaker": "Slotenmaker"
    }
    service_name = service_names.get(booking_data.get("service_type", ""), booking_data.get("service_type", ""))
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #22c55e; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Boeking Ontvangen!</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">Beste {booking_data.get('customer_name', 'Klant')},</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Bedankt voor je boeking bij SpoedDienst24! We hebben je aanvraag voor een <strong>{service_name}</strong> ontvangen 
                en gaan direct aan de slag om een vakman voor je te vinden.
            </p>
            
            <div style="background-color: #fff; border-radius: 10px; padding: 20px; margin: 25px 0; border: 1px solid #e5e7eb;">
                <h3 style="color: #FF4500; margin-top: 0;">📋 Jouw Boeking</h3>
                <table style="width: 100%;">
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Dienst:</td>
                        <td style="padding: 8px 0; font-weight: bold;">{service_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Datum:</td>
                        <td style="padding: 8px 0; font-weight: bold;">{booking_data.get('preferred_date', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Tijd:</td>
                        <td style="padding: 8px 0; font-weight: bold;">{booking_data.get('preferred_time', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Adres:</td>
                        <td style="padding: 8px 0; font-weight: bold;">{booking_data.get('address', '')}, {booking_data.get('postal_code', '')} {booking_data.get('city', '')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Geschatte prijs:</td>
                        <td style="padding: 8px 0; font-weight: bold; color: #FF4500; font-size: 18px;">€{booking_data.get('price', 0)},-</td>
                    </tr>
                </table>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 10px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e;">
                    <strong>💳 Betaling:</strong> Je betaalt direct aan de vakman na afloop van de klus. Wij accepteren contant en pin.
                </p>
            </div>
            
            <h3 style="color: #333; margin-top: 25px;">📞 Wat gebeurt er nu?</h3>
            <ol style="color: #666; line-height: 1.8;">
                <li>Wij zoeken de beste beschikbare vakman in jouw regio</li>
                <li>De vakman neemt binnen 30 minuten contact met je op</li>
                <li>De vakman komt langs op de afgesproken datum en tijd</li>
                <li>Na de klus betaal je direct aan de vakman</li>
            </ol>
            
            <p style="color: #666; margin-top: 25px;">
                Vragen? Neem contact met ons op via <a href="tel:085 333 2847" style="color: #FF4500;">085 333 2847</a> 
                of mail naar <a href="mailto:info@spoeddienst24.nl" style="color: #FF4500;">info@spoeddienst24.nl</a>
            </p>
        </div>
        
        <div style="background-color: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
                SpoedDienst24 - 24/7 Vakmannen aan huis<br>
                <a href="{FRONTEND_URL}" style="color: #FF4500;">www.spoeddienst24.nl</a>
            </p>
        </div>
    </body>
    </html>
    """
    
    customer_email = booking_data.get('customer_email')
    if not customer_email:
        return False
    
    subject = f"✅ Boeking bevestigd - {service_name} op {booking_data.get('preferred_date', 'N/A')}"
    return await send_email(customer_email, subject, html_content)


async def send_vakman_notification_email(booking_data: dict, db):
    """Send new job notification to available vakmannen"""
    try:
        service_type = booking_data.get("service_type", "")
        vakmannen = await db.vakmannen.find({
            "service_type": service_type,
            "is_approved": True,
            "is_available": True
        }, {"_id": 0, "password": 0}).to_list(50)
        
        if not vakmannen:
            logging.warning(f"No available vakmannen for service type: {service_type}")
            return False
        
        service_names = {
            "elektricien": "Elektricien",
            "loodgieter": "Loodgieter",
            "slotenmaker": "Slotenmaker"
        }
        service_name = service_names.get(service_type, service_type)
        is_spoed = "🚨 SPOEDKLUS" if booking_data.get('is_emergency') else "Nieuwe Klus"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: {'#FF4500' if booking_data.get('is_emergency') else '#22c55e'}; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">⚡ {is_spoed}!</h1>
                <p style="color: white; margin: 5px 0;">Er is een nieuwe klus in jouw regio</p>
            </div>
            
            <div style="padding: 20px; background-color: #f8f9fa;">
                <div style="background-color: #fff; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
                    <p style="color: #666; margin: 0;">Geschatte verdiensten</p>
                    <p style="font-size: 32px; font-weight: bold; color: #22c55e; margin: 10px 0;">€{booking_data.get('price', 0)},-</p>
                </div>
                
                <h3 style="color: #333;">📍 Locatie</h3>
                <p style="color: #666;">{booking_data.get('city', 'N/A')} - {booking_data.get('postal_code', '')}</p>
                
                <h3 style="color: #333;">📅 Gewenste Tijd</h3>
                <p style="color: #666;">{booking_data.get('preferred_date', 'N/A')} - {booking_data.get('preferred_time', 'N/A')}</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{FRONTEND_URL}/vakman/dashboard" style="display: inline-block; background-color: #FF4500; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Bekijk Klus →
                    </a>
                </div>
            </div>
        </body>
        </html>
        """
        
        subject = f"{'🚨 SPOED: ' if booking_data.get('is_emergency') else ''}Nieuwe {service_name} klus in {booking_data.get('city', 'jouw regio')} - €{booking_data.get('price', 0)},-"
        
        emails_sent = 0
        for vakman in vakmannen:
            vakman_email = vakman.get('email')
            if vakman_email:
                try:
                    await send_email(vakman_email, subject, html_content)
                    emails_sent += 1
                except Exception as e:
                    logging.error(f"Failed to send email to vakman {vakman_email}: {str(e)}")
        
        logging.info(f"Vakman notification emails sent to {emails_sent} vakmannen")
        return emails_sent > 0
    except Exception as e:
        logging.error(f"Failed to send vakman notification emails: {str(e)}")
        return False


async def send_specific_vakman_notification_email(booking_data: dict, vakman_id: str, db):
    """Send new job notification to a specific selected vakman"""
    try:
        vakman = await db.vakmannen.find_one({"id": vakman_id}, {"_id": 0, "password": 0})
        if not vakman:
            logging.warning(f"Vakman with id {vakman_id} not found")
            return False
        
        vakman_email = vakman.get('email')
        if not vakman_email:
            return False
        
        service_names = {
            "elektricien": "Elektricien",
            "loodgieter": "Loodgieter",
            "slotenmaker": "Slotenmaker"
        }
        service_name = service_names.get(booking_data.get("service_type", ""), booking_data.get("service_type", ""))
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
                    <h2 style="color: #22c55e; margin-top: 0;">✅ Er is een opdracht aan u toegewezen!</h2>
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
                    <p style="color: #666; margin-bottom: 15px;">Log in op je dashboard om deze klus te accepteren of af te wijzen:</p>
                    <a href="{FRONTEND_URL}/vakman/dashboard" style="display: inline-block; background-color: #FF4500; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Bekijk Klus →
                    </a>
                </div>
            </div>
            
            <div style="background-color: #333; padding: 15px; text-align: center;">
                <p style="color: #999; margin: 0; font-size: 12px;">Deze klus is aan u toegewezen door de admin.</p>
            </div>
        </body>
        </html>
        """
        
        subject = f"{'🚨 SPOED: ' if booking_data.get('is_emergency') else '✅ '}Opdracht toegewezen! {service_name} klus in {booking_data.get('city', 'jouw regio')} - €{booking_data.get('price', 0)},-"
        return await send_email(vakman_email, subject, html_content)
    except Exception as e:
        logging.error(f"Failed to send specific vakman notification email: {str(e)}")
        return False


async def send_vakman_rejection_notification_email(booking_data: dict, vakman_name: str):
    """Send notification to admin when a vakman rejects an assigned booking"""
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
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;"><strong>Locatie:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">{booking_data.get('city', '')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;"><strong>Prijs:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">€{booking_data.get('price', 0)},-</td>
                </tr>
            </table>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{FRONTEND_URL}/beheer" style="display: inline-block; background-color: #FF4500; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Ga naar Dashboard →
                </a>
            </div>
        </div>
    </body>
    </html>
    """
    
    subject = f"⚠️ Opdracht afgewezen door {vakman_name} - {booking_data.get('city', '')} - Actie vereist"
    return await send_email(ADMIN_EMAIL, subject, html_content)


async def send_vakman_approval_email(vakman_data: dict):
    """Send approval confirmation email to vakman"""
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
                Je aanmelding als <strong>{service_name}</strong> bij SpoedDienst24 is goedgekeurd. 
                Je kunt nu klussen ontvangen in jouw regio.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{FRONTEND_URL}/vakman/dashboard" style="display: inline-block; background-color: #FF4500; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Ga naar Dashboard →
                </a>
            </div>
        </div>
    </body>
    </html>
    """
    
    subject = f"✅ Je SpoedDienst24 account is goedgekeurd!"
    return await send_email(vakman_email, subject, html_content)


async def send_vakman_rejection_email(vakman_data: dict):
    """Send rejection email to vakman"""
    vakman_email = vakman_data.get('email')
    if not vakman_email:
        return False
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ef4444; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Aanmelding Afgewezen</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">Beste {vakman_data.get('name', 'Vakman')},</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Helaas kunnen wij je aanmelding op dit moment niet goedkeuren.
            </p>
            
            <p style="color: #666;">
                Neem contact op via <a href="mailto:info@spoeddienst24.nl" style="color: #FF4500;">info@spoeddienst24.nl</a>
            </p>
        </div>
    </body>
    </html>
    """
    
    subject = f"SpoedDienst24 - Aanmelding niet goedgekeurd"
    return await send_email(vakman_email, subject, html_content)


async def send_password_reset_email(user_data: dict, reset_token: str):
    """Send password reset email"""
    user_email = user_data.get('email')
    if not user_email:
        return False
    
    reset_url = f"{FRONTEND_URL}/reset-wachtwoord?token={reset_token}"
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #FF4500; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">🔐 Wachtwoord Resetten</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f8f9fa;">
            <p style="color: #666; font-size: 16px;">
                Je hebt een verzoek ingediend om je wachtwoord te resetten. 
                Klik op de onderstaande knop om een nieuw wachtwoord in te stellen.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_url}" style="display: inline-block; background-color: #FF4500; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Reset Wachtwoord
                </a>
            </div>
            
            <p style="color: #999; font-size: 12px;">
                Deze link is 1 uur geldig. Als je geen wachtwoord reset hebt aangevraagd, kun je deze email negeren.
            </p>
        </div>
    </body>
    </html>
    """
    
    subject = "🔐 SpoedDienst24 - Wachtwoord Resetten"
    return await send_email(user_email, subject, html_content)
