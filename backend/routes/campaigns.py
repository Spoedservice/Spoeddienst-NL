"""Campaign Planner routes for SpoedDienst24 - Google Ads campaigns"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel
import uuid

from config.database import db, get_current_user

router = APIRouter(prefix="/admin/campaigns", tags=["campaigns"])


# Dependency for admin-only routes
async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# Pydantic models
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


# Keyword suggestions
KEYWORD_SUGGESTIONS = {
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


@router.get("")
async def get_campaigns(current_user: dict = Depends(get_admin_user)):
    """Get all campaigns"""
    campaigns = await db.campaigns.find({}, {"_id": 0}).to_list(100)
    return campaigns


@router.post("")
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
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user["user_id"]
    }
    await db.campaigns.insert_one(campaign_data)
    return {"message": "Campagne aangemaakt", "campaign": {k: v for k, v in campaign_data.items() if k != "_id"}}


@router.put("/{campaign_id}")
async def update_campaign(campaign_id: str, campaign: CampaignUpdate, current_user: dict = Depends(get_admin_user)):
    """Update a campaign"""
    update_data = {k: v for k, v in campaign.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.campaigns.update_one(
        {"id": campaign_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Campagne niet gevonden")
    
    return {"message": "Campagne bijgewerkt"}


@router.delete("/{campaign_id}")
async def delete_campaign(campaign_id: str, current_user: dict = Depends(get_admin_user)):
    """Delete a campaign"""
    result = await db.campaigns.delete_one({"id": campaign_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Campagne niet gevonden")
    
    return {"message": "Campagne verwijderd"}


@router.get("/suggestions")
async def get_campaign_suggestions(service_type: str = None, current_user: dict = Depends(get_admin_user)):
    """Get keyword suggestions for campaigns"""
    if service_type and service_type in KEYWORD_SUGGESTIONS:
        return KEYWORD_SUGGESTIONS[service_type]
    return KEYWORD_SUGGESTIONS
