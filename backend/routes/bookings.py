"""Booking routes for SpoedDienst24"""
from fastapi import APIRouter, HTTPException, Depends

from config.database import db, get_current_user
from models.schemas import BookingCreate, Booking
from services.email import send_booking_email, send_customer_confirmation_email, send_vakman_rejection_notification_email

router = APIRouter(prefix="/bookings", tags=["bookings"])

# Service data for pricing
SERVICES = [
    {
        "id": "elektricien",
        "title": "Elektricien",
        "base_price": 69.0,
        "emergency_price": 129.0
    },
    {
        "id": "loodgieter",
        "title": "Loodgieter",
        "base_price": 69.0,
        "emergency_price": 129.0
    },
    {
        "id": "slotenmaker",
        "title": "Slotenmaker",
        "base_price": 79.0,
        "emergency_price": 149.0
    }
]


@router.post("")
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
    
    response_booking = booking_dict.copy()
    
    await db.bookings.insert_one(booking_dict)
    
    # Send email notifications
    await send_booking_email(response_booking)
    await send_customer_confirmation_email(response_booking)
    
    return {"booking": response_booking, "message": "Booking created successfully"}


@router.get("")
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


@router.get("/{booking_id}")
async def get_booking(booking_id: str):
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


@router.put("/{booking_id}/status")
async def update_booking_status(booking_id: str, status: str, current_user: dict = Depends(get_current_user)):
    valid_statuses = ["pending", "accepted", "in_progress", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    await db.bookings.update_one({"id": booking_id}, {"$set": {"status": status}})
    return {"message": "Status updated"}


@router.post("/{booking_id}/vakman-accept")
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


@router.post("/{booking_id}/vakman-reject")
async def vakman_reject_booking(booking_id: str, current_user: dict = Depends(get_current_user)):
    """Vakman rejects an assigned booking - notifies admin to reassign"""
    if current_user["role"] != "vakman":
        raise HTTPException(status_code=403, detail="Only vakman can reject bookings")
    
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Boeking niet gevonden")
    
    if booking.get("vakman_id") != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Deze boeking is niet aan jou toegewezen")
    
    vakman = await db.vakmannen.find_one({"id": current_user["user_id"]}, {"_id": 0, "name": 1})
    vakman_name = vakman.get("name", "Vakman") if vakman else "Vakman"
    
    await db.bookings.update_one(
        {"id": booking_id}, 
        {"$set": {"vakman_id": None, "vakman_name": None, "status": "pending"}}
    )
    
    await send_vakman_rejection_notification_email(booking, vakman_name)
    
    return {"message": "Opdracht afgewezen. Admin is op de hoogte gesteld."}


@router.put("/{booking_id}/assign")
async def assign_vakman(booking_id: str, vakman_id: str, current_user: dict = Depends(get_current_user)):
    await db.bookings.update_one({"id": booking_id}, {"$set": {"vakman_id": vakman_id, "status": "accepted"}})
    return {"message": "Vakman assigned"}
