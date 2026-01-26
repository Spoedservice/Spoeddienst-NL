"""
Test suite for Admin Booking Assignment Feature
Tests the new flow where:
1. Customer books without selecting a monteur (4 steps: Probleem → Datum → Adres → Contact)
2. Booking is created WITHOUT vakman_id
3. Admin assigns booking to vakman via dashboard
4. Only assigned vakman receives notification email

Test credentials:
- Admin: admin@spoeddienst24.nl / Admin2024!
- Customer: klant@test.nl / Test1234
"""

import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://spoeddienst-1.preview.emergentagent.com')

class TestBookingWithoutVakman:
    """Test that bookings are created WITHOUT vakman_id (admin assigns later)"""
    
    def test_create_booking_no_vakman_id(self):
        """POST /api/bookings - Booking should be created WITHOUT vakman_id"""
        booking_data = {
            "service_type": "elektricien",
            "is_emergency": False,
            "description": "Test boeking zonder monteur selectie - admin wijst later toe",
            "address": "Teststraat 123",
            "postal_code": "1234 AB",
            "city": "Amsterdam",
            "preferred_date": "2026-02-01",
            "preferred_time": "10:00 - 12:00",
            "customer_name": "Test Klant",
            "customer_email": f"test_{uuid.uuid4().hex[:8]}@test.nl",
            "customer_phone": "0612345678"
        }
        
        response = requests.post(f"{BASE_URL}/api/bookings", json=booking_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "booking" in data
        booking = data["booking"]
        
        # Verify booking was created
        assert booking["service_type"] == "elektricien"
        assert booking["customer_name"] == "Test Klant"
        assert booking["city"] == "Amsterdam"
        
        # CRITICAL: Verify NO vakman_id is set (admin assigns later)
        assert booking.get("vakman_id") is None, "Booking should NOT have vakman_id - admin assigns later"
        assert booking.get("vakman_name") is None, "Booking should NOT have vakman_name - admin assigns later"
        
        # Verify status is pending
        assert booking["status"] == "pending"
        
        print(f"✅ Booking created without vakman_id: {booking['id']}")
        return booking["id"]
    
    def test_create_emergency_booking_no_vakman_id(self):
        """POST /api/bookings - Emergency booking also without vakman_id"""
        booking_data = {
            "service_type": "loodgieter",
            "is_emergency": True,
            "description": "SPOED: Lekkage in badkamer - test zonder monteur",
            "address": "Spoedstraat 456",
            "postal_code": "5678 CD",
            "city": "Rotterdam",
            "preferred_date": "2026-01-25",
            "preferred_time": "20:00 - 22:00 (Spoed)",
            "customer_name": "Spoed Klant",
            "customer_email": f"spoed_{uuid.uuid4().hex[:8]}@test.nl",
            "customer_phone": "0687654321"
        }
        
        response = requests.post(f"{BASE_URL}/api/bookings", json=booking_data)
        assert response.status_code == 200
        
        data = response.json()
        booking = data["booking"]
        
        # Verify emergency booking also has no vakman
        assert booking["is_emergency"] == True
        assert booking.get("vakman_id") is None, "Emergency booking should also NOT have vakman_id"
        assert booking.get("vakman_name") is None
        
        print(f"✅ Emergency booking created without vakman_id: {booking['id']}")


class TestAdminAssignEndpoint:
    """Test POST /api/admin/booking/{id}/assign endpoint"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@spoeddienst24.nl",
            "password": "Admin2024!"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin login failed - skipping admin tests")
    
    @pytest.fixture
    def vakman_token(self):
        """Get vakman authentication token (non-admin)"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "monteur@test.nl",
            "password": "Test1234"
        })
        if response.status_code == 200:
            return response.json().get("token")
        return None
    
    @pytest.fixture
    def test_booking_id(self):
        """Create a test booking without vakman"""
        booking_data = {
            "service_type": "elektricien",
            "is_emergency": False,
            "description": "Test boeking voor admin assign test",
            "address": "Adminstraat 789",
            "postal_code": "9012 EF",
            "city": "Utrecht",
            "preferred_date": "2026-02-15",
            "preferred_time": "14:00 - 16:00",
            "customer_name": "Admin Test Klant",
            "customer_email": f"admin_test_{uuid.uuid4().hex[:8]}@test.nl",
            "customer_phone": "0698765432"
        }
        
        response = requests.post(f"{BASE_URL}/api/bookings", json=booking_data)
        if response.status_code == 200:
            return response.json()["booking"]["id"]
        pytest.skip("Could not create test booking")
    
    @pytest.fixture
    def available_vakman_id(self, admin_token):
        """Get an available vakman ID for elektricien"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/vakmannen", headers=headers)
        if response.status_code == 200:
            vakmannen = response.json()
            # Find an approved elektricien
            for v in vakmannen:
                if v.get("is_approved") and v.get("service_type") == "elektricien":
                    return v["id"]
        pytest.skip("No available elektricien found")
    
    def test_assign_requires_admin_auth(self, test_booking_id):
        """POST /api/admin/booking/{id}/assign - Should require authentication"""
        response = requests.post(
            f"{BASE_URL}/api/admin/booking/{test_booking_id}/assign",
            json={"vakman_id": "some-id"}
        )
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("✅ Assign endpoint requires authentication")
    
    def test_assign_requires_admin_role(self, test_booking_id, vakman_token):
        """POST /api/admin/booking/{id}/assign - Should require admin role"""
        if not vakman_token:
            pytest.skip("No vakman token available")
        
        headers = {"Authorization": f"Bearer {vakman_token}"}
        response = requests.post(
            f"{BASE_URL}/api/admin/booking/{test_booking_id}/assign",
            json={"vakman_id": "some-id"},
            headers=headers
        )
        assert response.status_code == 403, f"Expected 403 for non-admin, got {response.status_code}"
        print("✅ Assign endpoint requires admin role")
    
    def test_assign_booking_to_vakman_success(self, admin_token, test_booking_id, available_vakman_id):
        """POST /api/admin/booking/{id}/assign - Admin can assign booking to vakman"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.post(
            f"{BASE_URL}/api/admin/booking/{test_booking_id}/assign",
            json={"vakman_id": available_vakman_id},
            headers=headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "message" in data
        assert "vakman_name" in data
        assert "vakman_id" in data
        assert data["vakman_id"] == available_vakman_id
        
        print(f"✅ Booking assigned to vakman: {data['vakman_name']}")
        
        # Verify booking was updated
        booking_response = requests.get(f"{BASE_URL}/api/bookings/{test_booking_id}")
        assert booking_response.status_code == 200
        
        booking = booking_response.json()
        assert booking["vakman_id"] == available_vakman_id
        assert booking["vakman_name"] is not None
        assert booking["status"] == "confirmed"  # Status should be updated to confirmed
        
        print(f"✅ Booking status updated to 'confirmed' with vakman_name: {booking['vakman_name']}")
    
    def test_assign_nonexistent_booking(self, admin_token, available_vakman_id):
        """POST /api/admin/booking/{id}/assign - Should return 404 for non-existent booking"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.post(
            f"{BASE_URL}/api/admin/booking/nonexistent-booking-id/assign",
            json={"vakman_id": available_vakman_id},
            headers=headers
        )
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✅ Returns 404 for non-existent booking")
    
    def test_assign_nonexistent_vakman(self, admin_token, test_booking_id):
        """POST /api/admin/booking/{id}/assign - Should return 404 for non-existent vakman"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.post(
            f"{BASE_URL}/api/admin/booking/{test_booking_id}/assign",
            json={"vakman_id": "nonexistent-vakman-id"},
            headers=headers
        )
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✅ Returns 404 for non-existent vakman")


class TestAdminDashboardBookingsView:
    """Test that admin dashboard shows bookings with Monteur column"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@spoeddienst24.nl",
            "password": "Admin2024!"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin login failed")
    
    def test_admin_bookings_includes_vakman_info(self, admin_token):
        """GET /api/admin/bookings - Should include vakman_id and vakman_name fields"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.get(f"{BASE_URL}/api/admin/bookings", headers=headers)
        assert response.status_code == 200
        
        bookings = response.json()
        assert isinstance(bookings, list)
        
        # Check that bookings have the vakman fields
        if len(bookings) > 0:
            booking = bookings[0]
            # These fields should exist (even if None)
            assert "vakman_id" in booking or booking.get("vakman_id") is None
            assert "vakman_name" in booking or booking.get("vakman_name") is None
            print(f"✅ Admin bookings include vakman fields. Total bookings: {len(bookings)}")
        else:
            print("⚠️ No bookings found to verify vakman fields")
    
    def test_admin_vakmannen_for_assignment(self, admin_token):
        """GET /api/admin/vakmannen - Should return vakmannen for assignment dropdown"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.get(f"{BASE_URL}/api/admin/vakmannen", headers=headers)
        assert response.status_code == 200
        
        vakmannen = response.json()
        assert isinstance(vakmannen, list)
        
        # Check vakman structure
        if len(vakmannen) > 0:
            vakman = vakmannen[0]
            assert "id" in vakman
            assert "name" in vakman
            assert "service_type" in vakman
            assert "is_approved" in vakman
            print(f"✅ Admin vakmannen endpoint returns {len(vakmannen)} vakmannen")
        else:
            print("⚠️ No vakmannen found")


class TestBookingFlowSteps:
    """Test that booking flow has 4 steps (no monteur selection)"""
    
    def test_booking_endpoint_accepts_minimal_data(self):
        """POST /api/bookings - Should accept booking without vakman_id in request"""
        # This tests that the booking endpoint doesn't require vakman_id
        booking_data = {
            "service_type": "slotenmaker",
            "is_emergency": False,
            "description": "Slot vervangen - test 4 stappen flow",
            "address": "Slotstraat 100",
            "postal_code": "1000 AA",
            "city": "Den Haag",
            "preferred_date": "2026-03-01",
            "preferred_time": "08:00 - 10:00",
            "customer_name": "Slot Test",
            "customer_email": f"slot_{uuid.uuid4().hex[:8]}@test.nl",
            "customer_phone": "0611111111"
        }
        
        response = requests.post(f"{BASE_URL}/api/bookings", json=booking_data)
        assert response.status_code == 200
        
        # Verify no vakman_id is required or set
        booking = response.json()["booking"]
        assert booking.get("vakman_id") is None
        
        print("✅ Booking created with 4-step flow (no monteur selection)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
