"""Admin routes for SpoedDienst24"""
from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel

from config.database import db, get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])


# Dependency for admin-only routes
async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# ==================== DASHBOARD STATS ====================

@router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_admin_user)):
    """Get admin dashboard statistics"""
    # Count bookings by status
    all_bookings = await db.bookings.find({}, {"_id": 0}).to_list(1000)
    total_bookings = len(all_bookings)
    pending = len([b for b in all_bookings if b.get("status") == "pending"])
    confirmed = len([b for b in all_bookings if b.get("status") == "confirmed"])
    completed = len([b for b in all_bookings if b.get("status") == "completed"])
    cancelled = len([b for b in all_bookings if b.get("status") == "cancelled"])
    
    # Count vakmannen
    total_vakmannen = await db.vakmannen.count_documents({})
    pending_vakmannen = await db.vakmannen.count_documents({"is_approved": False})
    
    # Count reviews
    total_reviews = await db.reviews.count_documents({})
    pending_reviews = await db.reviews.count_documents({"approved": False})
    
    # Calculate completion rate
    completion_rate = (completed / len(all_bookings) * 100) if all_bookings else 0
    
    return {
        "bookings": {
            "total": total_bookings,
            "pending": pending,
            "confirmed": confirmed,
            "completed": completed,
            "cancelled": cancelled,
            "completion_rate": round(completion_rate, 1)
        },
        "vakmannen": {
            "total": total_vakmannen,
            "pending_approval": pending_vakmannen
        },
        "reviews": {
            "total": total_reviews,
            "pending_approval": pending_reviews
        }
    }


# ==================== BOOKINGS MANAGEMENT ====================

@router.get("/bookings")
async def get_all_bookings(
    status: Optional[str] = None,
    service_type: Optional[str] = None,
    limit: int = Query(default=100, le=500),
    current_user: dict = Depends(get_admin_user)
):
    """Get all bookings with optional filters"""
    query = {}
    if status:
        query["status"] = status
    if service_type:
        query["service_type"] = service_type
    
    bookings = await db.bookings.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return {"bookings": bookings}


@router.put("/booking/{booking_id}/status")
async def update_booking_status(
    booking_id: str, 
    status_update: dict, 
    admin: dict = Depends(get_admin_user)
):
    """Update booking status"""
    status = status_update.get("status")
    if status not in ["pending", "confirmed", "in_progress", "completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Ongeldige status")
    
    result = await db.bookings.update_one(
        {"id": booking_id}, 
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Boeking niet gevonden")
    
    # Queue review reminder if completed
    if status == "completed":
        booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
        if booking:
            # Note: email_marketing_service should be imported and used here
            pass
    
    return {"message": f"Status gewijzigd naar {status}"}


# ==================== VAKMANNEN MANAGEMENT ====================

@router.get("/vakmannen")
async def get_all_vakmannen(current_user: dict = Depends(get_admin_user)):
    """Get all vakmannen"""
    vakmannen = await db.vakmannen.find({}, {"_id": 0, "password": 0}).to_list(500)
    return {"vakmannen": vakmannen}


@router.post("/vakman/{vakman_id}/approve")
async def approve_vakman(vakman_id: str, current_user: dict = Depends(get_admin_user)):
    """Approve a vakman"""
    result = await db.vakmannen.update_one(
        {"id": vakman_id},
        {"$set": {"is_approved": True, "approved_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Vakman niet gevonden")
    return {"message": "Vakman goedgekeurd"}


@router.post("/vakman/{vakman_id}/reject")
async def reject_vakman(vakman_id: str, current_user: dict = Depends(get_admin_user)):
    """Reject a vakman"""
    result = await db.vakmannen.update_one(
        {"id": vakman_id},
        {"$set": {"is_approved": False, "rejected_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Vakman niet gevonden")
    return {"message": "Vakman afgewezen"}


# ==================== REVIEWS MANAGEMENT ====================

@router.get("/reviews")
async def get_all_reviews(
    approved: Optional[bool] = None,
    current_user: dict = Depends(get_admin_user)
):
    """Get all reviews"""
    query = {}
    if approved is not None:
        query["approved"] = approved
    
    reviews = await db.reviews.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"reviews": reviews}


@router.post("/review/{review_id}/approve")
async def approve_review(review_id: str, current_user: dict = Depends(get_admin_user)):
    """Approve a review"""
    result = await db.reviews.update_one(
        {"id": review_id},
        {"$set": {"approved": True, "approved_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Review niet gevonden")
    return {"message": "Review goedgekeurd"}


@router.post("/review/{review_id}/reject")
async def reject_review(review_id: str, current_user: dict = Depends(get_admin_user)):
    """Reject a review"""
    result = await db.reviews.update_one(
        {"id": review_id},
        {"$set": {"approved": False, "rejected_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Review niet gevonden")
    return {"message": "Review afgewezen"}


# ==================== BOOKING ASSIGNMENT ====================

@router.get("/vakmannen/available")
async def get_available_vakmannen(
    service_type: str,
    current_user: dict = Depends(get_admin_user)
):
    """Get available vakmannen for a service type"""
    vakmannen = await db.vakmannen.find(
        {"service_type": service_type, "is_approved": True},
        {"_id": 0, "password": 0}
    ).to_list(100)
    
    # Get their booking counts
    for vakman in vakmannen:
        active_bookings = await db.bookings.count_documents({
            "assigned_vakman_id": vakman["id"],
            "status": {"$in": ["confirmed", "in_progress"]}
        })
        vakman["active_bookings"] = active_bookings
    
    return {"vakmannen": vakmannen}


@router.post("/booking/{booking_id}/assign")
async def assign_booking(
    booking_id: str, 
    assignment: dict, 
    current_user: dict = Depends(get_admin_user)
):
    """Assign a booking to a vakman"""
    vakman_id = assignment.get("vakman_id")
    if not vakman_id:
        raise HTTPException(status_code=400, detail="Vakman ID is verplicht")
    
    vakman = await db.vakmannen.find_one({"id": vakman_id}, {"_id": 0})
    if not vakman:
        raise HTTPException(status_code=404, detail="Vakman niet gevonden")
    
    result = await db.bookings.update_one(
        {"id": booking_id},
        {
            "$set": {
                "assigned_vakman_id": vakman_id,
                "vakman_name": vakman["name"],
                "vakman_phone": vakman["phone"],
                "status": "confirmed",
                "assigned_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Boeking niet gevonden")
    
    return {"message": f"Boeking toegewezen aan {vakman['name']}"}
