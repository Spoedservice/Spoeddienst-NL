"""
Bulk Email Campaign Service for SpoedDienst24
Features:
- Regional Segmentation (NL/BE)
- A/B Testing for subject lines
- Throttled sending (spam prevention)
- CSV import functionality
- Campaign analytics
"""

import csv
import io
import random
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Optional
import uuid

# Regional Configuration
REGIONAL_CONFIG = {
    "NL": {
        "name": "Nederland",
        "phone": "085 333 2847",
        "phone_link": "+31853332847",
        "email": "info@spoeddienst24.nl",
        "coverage_text": "Landelijke dekking in heel Nederland",
        "tagline": "24/7 beschikbaar in heel Nederland",
        "domain": "spoeddienst24.nl"
    },
    "BE": {
        "name": "België",
        "phone": "+31 85 333 2847",  # NL number with country code for BE
        "phone_link": "+31853332847",
        "email": "info@spoeddienst24.be",
        "coverage_text": "Nu ook actief in heel Vlaanderen en Brussel",
        "tagline": "24/7 beschikbaar in Vlaanderen en Brussel",
        "domain": "spoeddienst24.be"
    }
}

# A/B Test Subject Lines
AB_TEST_SUBJECTS = {
    "A": {
        "subject": "Noodgeval? 🔧 Uw lokale vakman is binnen 20 min. ter plaatse",
        "description": "Urgentie + snelheid focus"
    },
    "B": {
        "subject": "Lekkage of buitensluiting? 🔑 Sla dit nummer op",
        "description": "Probleem herkenning + actie"
    }
}

# Throttling Configuration (Spam Prevention)
THROTTLE_CONFIG = {
    "enabled": True,
    "total_days": 5,  # Spread over 5 days
    "daily_batches": 4,  # 4 batches per day
    "batch_interval_hours": 2,  # Hours between batches
    "preferred_hours": [9, 11, 14, 16],  # Best send times (CET)
    "max_per_day": {
        "week_1": 500,    # IP warming week 1
        "week_2": 1000,
        "week_3": 2500,
        "week_4": 5000,
        "established": 10000
    }
}


class BulkCampaignService:
    def __init__(self, db, email_marketing_service):
        self.db = db
        self.email_service = email_marketing_service
        self.campaigns_collection = db.bulk_campaigns
        self.recipients_collection = db.campaign_recipients
        self.ab_results_collection = db.ab_test_results
    
    # ==================== CSV IMPORT ====================
    
    async def import_csv(self, csv_content: str, country: str, campaign_id: str, delimiter: str = ";") -> dict:
        """Import contacts from CSV file"""
        reader = csv.DictReader(io.StringIO(csv_content), delimiter=delimiter)
        
        imported = 0
        skipped = 0
        errors = []
        
        for row in reader:
            try:
                # Map CSV columns to our format
                email = row.get("email", "").strip().lower()
                if not email or "@" not in email:
                    skipped += 1
                    continue
                
                firstname = row.get("Firstname", row.get("firstname", "")).strip()
                lastname = row.get("Lastname", row.get("lastname", "")).strip()
                gender = row.get("Gender", row.get("gender", "")).strip().lower()
                
                # Check if already exists
                existing = await self.recipients_collection.find_one({
                    "email": email,
                    "campaign_id": campaign_id
                })
                
                if existing:
                    skipped += 1
                    continue
                
                # Assign A/B test group randomly (50/50 split)
                ab_group = "A" if random.random() < 0.5 else "B"
                
                recipient = {
                    "id": str(uuid.uuid4()),
                    "campaign_id": campaign_id,
                    "email": email,
                    "firstname": firstname,
                    "lastname": lastname,
                    "full_name": f"{firstname} {lastname}".strip() or "Klant",
                    "gender": gender,
                    "country": country,
                    "ab_group": ab_group,
                    "status": "pending",  # pending, scheduled, sent, failed, bounced
                    "scheduled_at": None,
                    "sent_at": None,
                    "opened_at": None,
                    "clicked_at": None,
                    "created_at": datetime.now(timezone.utc)
                }
                
                await self.recipients_collection.insert_one(recipient)
                imported += 1
                
            except Exception as e:
                errors.append(str(e))
                skipped += 1
        
        return {
            "imported": imported,
            "skipped": skipped,
            "errors": errors[:10],  # Limit error messages
            "total_processed": imported + skipped
        }
    
    # ==================== CAMPAIGN MANAGEMENT ====================
    
    async def create_campaign(
        self,
        name: str,
        country: str,
        template_type: str = "marketing",
        ab_test_enabled: bool = True
    ) -> dict:
        """Create a new bulk email campaign"""
        campaign_id = str(uuid.uuid4())
        campaign = {
            "id": campaign_id,
            "name": name,
            "country": country,
            "template_type": template_type,
            "ab_test_enabled": ab_test_enabled,
            "status": "draft",  # draft, scheduled, running, paused, completed
            "regional_config": REGIONAL_CONFIG.get(country, REGIONAL_CONFIG["NL"]),
            "throttle_config": THROTTLE_CONFIG.copy(),
            "stats": {
                "total_recipients": 0,
                "sent": 0,
                "opened": 0,
                "clicked": 0,
                "bounced": 0,
                "unsubscribed": 0
            },
            "ab_stats": {
                "A": {"sent": 0, "opened": 0, "clicked": 0},
                "B": {"sent": 0, "opened": 0, "clicked": 0}
            },
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "started_at": None,
            "completed_at": None
        }
        
        await self.campaigns_collection.insert_one(campaign)
        
        # Return without _id
        return {"campaign_id": campaign_id, "message": "Campagne aangemaakt", "country": country}
    
    async def get_campaign(self, campaign_id: str) -> Optional[dict]:
        """Get campaign by ID"""
        campaign = await self.campaigns_collection.find_one(
            {"id": campaign_id},
            {"_id": 0}
        )
        return campaign
    
    async def list_campaigns(self) -> List[dict]:
        """List all campaigns"""
        campaigns = await self.campaigns_collection.find(
            {},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        return campaigns
    
    # ==================== THROTTLED SCHEDULING ====================
    
    async def schedule_campaign(self, campaign_id: str, start_date: datetime = None) -> dict:
        """
        Schedule campaign with throttling over multiple days.
        Distributes emails to prevent spam filtering.
        """
        campaign = await self.get_campaign(campaign_id)
        if not campaign:
            return {"error": "Campaign not found"}
        
        if start_date is None:
            # Start tomorrow at 9:00 CET
            start_date = datetime.now(timezone.utc).replace(
                hour=8, minute=0, second=0, microsecond=0
            ) + timedelta(days=1)
        
        # Get all pending recipients
        recipients = await self.recipients_collection.find({
            "campaign_id": campaign_id,
            "status": "pending"
        }).to_list(200000)  # Max 200k per campaign
        
        total = len(recipients)
        if total == 0:
            return {"error": "No pending recipients"}
        
        # Calculate batches over multiple days
        days = THROTTLE_CONFIG["total_days"]
        batches_per_day = THROTTLE_CONFIG["daily_batches"]
        preferred_hours = THROTTLE_CONFIG["preferred_hours"]
        
        # Distribute recipients across time slots
        recipients_per_day = total // days
        recipients_per_batch = recipients_per_day // batches_per_day
        
        scheduled_count = 0
        current_date = start_date
        recipient_index = 0
        
        for day in range(days):
            for batch_idx, hour in enumerate(preferred_hours[:batches_per_day]):
                if recipient_index >= total:
                    break
                
                # Calculate batch time
                batch_time = current_date.replace(hour=hour, minute=0, second=0)
                
                # Schedule batch of recipients
                batch_size = min(recipients_per_batch, total - recipient_index)
                batch_recipients = recipients[recipient_index:recipient_index + batch_size]
                
                for recipient in batch_recipients:
                    await self.recipients_collection.update_one(
                        {"id": recipient["id"]},
                        {
                            "$set": {
                                "status": "scheduled",
                                "scheduled_at": batch_time,
                                "batch_number": day * batches_per_day + batch_idx + 1
                            }
                        }
                    )
                    scheduled_count += 1
                
                recipient_index += batch_size
            
            current_date += timedelta(days=1)
        
        # Update campaign status
        await self.campaigns_collection.update_one(
            {"id": campaign_id},
            {
                "$set": {
                    "status": "scheduled",
                    "stats.total_recipients": total,
                    "scheduled_start": start_date,
                    "scheduled_end": current_date,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        return {
            "scheduled": scheduled_count,
            "total_recipients": total,
            "start_date": start_date.isoformat(),
            "end_date": current_date.isoformat(),
            "days": days,
            "batches_per_day": batches_per_day,
            "avg_per_batch": recipients_per_batch,
            "message": f"Campagne verspreid over {days} dagen om spam filters te voorkomen"
        }
    
    # ==================== A/B TESTING ====================
    
    def get_ab_subject(self, ab_group: str, country: str) -> str:
        """Get subject line based on A/B group"""
        base_subject = AB_TEST_SUBJECTS.get(ab_group, AB_TEST_SUBJECTS["A"])["subject"]
        return base_subject
    
    async def get_ab_test_results(self, campaign_id: str) -> dict:
        """Get A/B test results for a campaign"""
        campaign = await self.get_campaign(campaign_id)
        if not campaign:
            return {"error": "Campaign not found"}
        
        ab_stats = campaign.get("ab_stats", {})
        
        # Calculate rates
        results = {}
        for group in ["A", "B"]:
            stats = ab_stats.get(group, {"sent": 0, "opened": 0, "clicked": 0})
            sent = stats.get("sent", 0)
            opened = stats.get("opened", 0)
            clicked = stats.get("clicked", 0)
            
            results[group] = {
                "subject": AB_TEST_SUBJECTS[group]["subject"],
                "description": AB_TEST_SUBJECTS[group]["description"],
                "sent": sent,
                "opened": opened,
                "clicked": clicked,
                "open_rate": round(opened / sent * 100, 2) if sent > 0 else 0,
                "click_rate": round(clicked / sent * 100, 2) if sent > 0 else 0,
                "click_to_open_rate": round(clicked / opened * 100, 2) if opened > 0 else 0
            }
        
        # Determine winner
        winner = None
        if results["A"]["open_rate"] > results["B"]["open_rate"] + 2:
            winner = "A"
        elif results["B"]["open_rate"] > results["A"]["open_rate"] + 2:
            winner = "B"
        
        return {
            "campaign_id": campaign_id,
            "results": results,
            "winner": winner,
            "recommendation": f"Variant {winner} presteert beter (significant verschil)" if winner else "Nog geen significant verschil - blijf testen"
        }
    
    # ==================== REGIONAL EMAIL TEMPLATE ====================
    
    def generate_regional_email(self, recipient: dict, campaign: dict) -> dict:
        """Generate email content based on region and A/B group"""
        country = recipient.get("country", "NL")
        ab_group = recipient.get("ab_group", "A")
        regional = REGIONAL_CONFIG.get(country, REGIONAL_CONFIG["NL"])
        
        firstname = recipient.get("firstname", "").strip()
        if not firstname:
            firstname = "Beste klant" if country == "BE" else "Hallo"
        
        subject = self.get_ab_subject(ab_group, country)
        
        html_template = f"""<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #FF4500 0%, #E03E00 100%); padding: 30px 40px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td>
                                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">SpoedDienst24</h1>
                                        <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.9); font-size: 13px;">{regional['coverage_text']}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 22px; font-weight: 600;">
                                {'Beste' if country == 'BE' else 'Hallo'} {firstname},
                            </h2>
                            
                            <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.7;">
                                Heeft u weleens te maken gehad met een <strong>lekkage, kapotte CV-ketel of buitensluiting</strong>? 
                                Dan weet u hoe stressvol dat kan zijn.
                            </p>
                            
                            <p style="margin: 0 0 25px 0; color: #4a4a4a; font-size: 16px; line-height: 1.7;">
                                Met <strong>SpoedDienst24</strong> heeft u binnen 20-30 minuten een gecertificeerde vakman aan de deur. 
                                {regional['tagline']}.
                            </p>
                            
                            <!-- Phone CTA -->
                            <div style="background-color: #1a1a1a; border-radius: 10px; padding: 25px; margin: 25px 0; text-align: center;">
                                <p style="margin: 0 0 10px 0; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">24/7 Spoednummer</p>
                                <a href="tel:{regional['phone_link']}" style="color: #FF4500; font-size: 28px; font-weight: 700; text-decoration: none;">
                                    {regional['phone']}
                                </a>
                                <p style="margin: 10px 0 0 0; color: #666666; font-size: 13px;">Sla dit nummer op in uw telefoon!</p>
                            </div>
                            
                            <!-- Services -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 25px 0;">
                                <tr>
                                    <td width="33%" style="padding: 0 5px 0 0; text-align: center;">
                                        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; border: 1px solid #e9ecef;">
                                            <p style="margin: 0; font-size: 24px;">🔧</p>
                                            <p style="margin: 8px 0 0 0; color: #1a1a1a; font-weight: 600; font-size: 13px;">Loodgieter</p>
                                        </div>
                                    </td>
                                    <td width="33%" style="padding: 0 5px; text-align: center;">
                                        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; border: 1px solid #e9ecef;">
                                            <p style="margin: 0; font-size: 24px;">🔑</p>
                                            <p style="margin: 8px 0 0 0; color: #1a1a1a; font-weight: 600; font-size: 13px;">Slotenmaker</p>
                                        </div>
                                    </td>
                                    <td width="33%" style="padding: 0 0 0 5px; text-align: center;">
                                        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; border: 1px solid #e9ecef;">
                                            <p style="margin: 0; font-size: 24px;">⚡</p>
                                            <p style="margin: 8px 0 0 0; color: #1a1a1a; font-weight: 600; font-size: 13px;">Elektricien</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Benefits -->
                            <div style="border-left: 4px solid #FF4500; padding-left: 20px; margin: 25px 0;">
                                <p style="margin: 0 0 8px 0; color: #4a4a4a; font-size: 14px;">✓ Binnen 20-30 minuten ter plaatse</p>
                                <p style="margin: 0 0 8px 0; color: #4a4a4a; font-size: 14px;">✓ Vaste, transparante prijzen</p>
                                <p style="margin: 0 0 8px 0; color: #4a4a4a; font-size: 14px;">✓ 100% tevredenheidsgarantie</p>
                                <p style="margin: 0; color: #4a4a4a; font-size: 14px;">✓ Betaling pas na de klus</p>
                            </div>
                            
                            <!-- CTA Button -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="https://{regional['domain']}/boek" style="display: inline-block; background: linear-gradient(135deg, #FF4500 0%, #E03E00 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                            Direct Online Boeken
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 25px 0 0 0; color: #6a6a6a; font-size: 14px; line-height: 1.6;">
                                Met vriendelijke groet,<br>
                                <strong style="color: #1a1a1a;">Het SpoedDienst24 Team</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1a1a1a; padding: 25px 40px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td>
                                        <p style="margin: 0; color: #888888; font-size: 12px;">
                                            SpoedDienst24 | {regional['email']} | {regional['phone']}
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top: 15px;">
                                        <p style="margin: 0; color: #666666; font-size: 11px;">
                                            <a href="https://{regional['domain']}/uitschrijven?email={recipient.get('email', '')}&token=UNSUBSCRIBE_TOKEN" style="color: #888888; text-decoration: underline;">Uitschrijven</a>
                                            &nbsp;|&nbsp;
                                            <a href="https://{regional['domain']}/privacy" style="color: #888888; text-decoration: underline;">Privacy</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>"""
        
        return {
            "subject": subject,
            "html": html_template,
            "to": recipient.get("email"),
            "ab_group": ab_group
        }
    
    # ==================== CAMPAIGN STATS ====================
    
    async def get_campaign_stats(self, campaign_id: str) -> dict:
        """Get detailed campaign statistics"""
        campaign = await self.get_campaign(campaign_id)
        if not campaign:
            return {"error": "Campaign not found"}
        
        # Count by status
        pipeline = [
            {"$match": {"campaign_id": campaign_id}},
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]
        status_counts = await self.recipients_collection.aggregate(pipeline).to_list(10)
        
        status_dict = {s["_id"]: s["count"] for s in status_counts}
        
        # Count by country
        country_pipeline = [
            {"$match": {"campaign_id": campaign_id}},
            {"$group": {"_id": "$country", "count": {"$sum": 1}}}
        ]
        country_counts = await self.recipients_collection.aggregate(country_pipeline).to_list(10)
        country_dict = {c["_id"]: c["count"] for c in country_counts}
        
        # Scheduled batches
        batch_pipeline = [
            {"$match": {"campaign_id": campaign_id, "status": "scheduled"}},
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$scheduled_at"}},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        batch_counts = await self.recipients_collection.aggregate(batch_pipeline).to_list(30)
        
        return {
            "campaign_id": campaign_id,
            "campaign_name": campaign.get("name"),
            "status": campaign.get("status"),
            "by_status": status_dict,
            "by_country": country_dict,
            "scheduled_batches": [{"date": b["_id"], "count": b["count"]} for b in batch_counts],
            "ab_test_enabled": campaign.get("ab_test_enabled", False),
            "throttle_config": campaign.get("throttle_config", {}),
            "total_recipients": sum(status_dict.values())
        }


# Singleton instance - will be initialized in server.py
bulk_campaign_service = None
