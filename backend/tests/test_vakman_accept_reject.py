"""
Test Vakman Accept/Reject Flow
Tests for:
1. POST /api/bookings/{id}/vakman-accept - Vakman accepts assigned booking
2. POST /api/bookings/{id}/vakman-reject - Vakman rejects assigned booking
3. Booking status changes correctly
4. Admin notification on rejection
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@spoeddienst24.nl"
ADMIN_PASSWORD = "Admin2024!"
MONTEUR_EMAIL = "monteur@test.nl"
MONTEUR_PASSWORD = "Test1234"


class TestVakmanAcceptRejectFlow:
    """Test vakman accept/reject booking flow"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
    def get_admin_token(self):
        """Get admin authentication token"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        return None
    
    def get_monteur_token(self):
        """Get monteur/vakman authentication token"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": MONTEUR_EMAIL,
            "password": MONTEUR_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        return None
    
    def create_test_booking(self, admin_token):
        """Create a test booking"""
        booking_data = {
            "service_type": "elektricien",
            "is_emergency": False,
            "description": f"TEST_vakman_flow_{uuid.uuid4().hex[:8]}",
            "address": "Teststraat 123",
            "postal_code": "1234AB",
            "city": "Amsterdam",
            "preferred_date": "2026-02-15",
            "preferred_time": "10:00-12:00",
            "customer_name": "Test Klant",
            "customer_email": "test@example.com",
            "customer_phone": "0612345678"
        }
        response = self.session.post(f"{BASE_URL}/api/bookings", json=booking_data)
        if response.status_code in [200, 201]:
            data = response.json()
            # Booking is returned inside "booking" key
            return data.get("booking", data)
        return None
    
    def get_vakman_id(self, admin_token):
        """Get the monteur vakman ID"""
        response = self.session.get(
            f"{BASE_URL}/api/admin/vakmannen",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        if response.status_code == 200:
            vakmannen = response.json()
            for v in vakmannen:
                if v.get("email") == MONTEUR_EMAIL:
                    return v.get("id")
        return None
    
    def assign_booking_to_vakman(self, booking_id, vakman_id, admin_token):
        """Admin assigns booking to vakman"""
        response = self.session.post(
            f"{BASE_URL}/api/admin/booking/{booking_id}/assign",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"vakman_id": vakman_id}
        )
        return response
    
    # ==================== VAKMAN-ACCEPT TESTS ====================
    
    def test_vakman_accept_requires_auth(self):
        """Test that vakman-accept requires authentication"""
        response = self.session.post(f"{BASE_URL}/api/bookings/fake-id/vakman-accept")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ vakman-accept requires authentication")
    
    def test_vakman_accept_requires_vakman_role(self):
        """Test that only vakman role can accept"""
        admin_token = self.get_admin_token()
        if not admin_token:
            pytest.skip("Could not get admin token")
        
        response = self.session.post(
            f"{BASE_URL}/api/bookings/fake-id/vakman-accept",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ vakman-accept requires vakman role (admin gets 403)")
    
    def test_vakman_accept_booking_not_found(self):
        """Test vakman-accept with non-existent booking"""
        monteur_token = self.get_monteur_token()
        if not monteur_token:
            pytest.skip("Could not get monteur token")
        
        response = self.session.post(
            f"{BASE_URL}/api/bookings/nonexistent-booking-id/vakman-accept",
            headers={"Authorization": f"Bearer {monteur_token}"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ vakman-accept returns 404 for non-existent booking")
    
    def test_vakman_accept_not_assigned_to_vakman(self):
        """Test vakman cannot accept booking not assigned to them"""
        admin_token = self.get_admin_token()
        monteur_token = self.get_monteur_token()
        
        if not admin_token or not monteur_token:
            pytest.skip("Could not get tokens")
        
        # Create booking without assigning to this vakman
        booking = self.create_test_booking(admin_token)
        if not booking:
            pytest.skip("Could not create test booking")
        
        booking_id = booking.get("id")
        
        # Try to accept without being assigned
        response = self.session.post(
            f"{BASE_URL}/api/bookings/{booking_id}/vakman-accept",
            headers={"Authorization": f"Bearer {monteur_token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ vakman cannot accept booking not assigned to them")
    
    def test_vakman_accept_success(self):
        """Test successful vakman accept flow"""
        admin_token = self.get_admin_token()
        monteur_token = self.get_monteur_token()
        
        if not admin_token or not monteur_token:
            pytest.skip("Could not get tokens")
        
        # Create booking
        booking = self.create_test_booking(admin_token)
        if not booking:
            pytest.skip("Could not create test booking")
        
        booking_id = booking.get("id")
        
        # Get vakman ID
        vakman_id = self.get_vakman_id(admin_token)
        if not vakman_id:
            pytest.skip("Could not find vakman ID")
        
        # Admin assigns booking to vakman
        assign_response = self.assign_booking_to_vakman(booking_id, vakman_id, admin_token)
        assert assign_response.status_code == 200, f"Failed to assign booking: {assign_response.text}"
        
        # Verify booking status is 'confirmed' after assignment
        get_response = self.session.get(
            f"{BASE_URL}/api/admin/bookings",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        bookings = get_response.json()
        assigned_booking = next((b for b in bookings if b.get("id") == booking_id), None)
        assert assigned_booking is not None, "Booking not found after assignment"
        assert assigned_booking.get("status") == "confirmed", f"Expected status 'confirmed', got {assigned_booking.get('status')}"
        assert assigned_booking.get("vakman_id") == vakman_id, "Vakman ID not set correctly"
        
        # Vakman accepts the booking
        accept_response = self.session.post(
            f"{BASE_URL}/api/bookings/{booking_id}/vakman-accept",
            headers={"Authorization": f"Bearer {monteur_token}"}
        )
        assert accept_response.status_code == 200, f"Expected 200, got {accept_response.status_code}: {accept_response.text}"
        
        # Verify status changed to 'accepted'
        get_response2 = self.session.get(
            f"{BASE_URL}/api/admin/bookings",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        bookings2 = get_response2.json()
        accepted_booking = next((b for b in bookings2 if b.get("id") == booking_id), None)
        assert accepted_booking is not None, "Booking not found after accept"
        assert accepted_booking.get("status") == "accepted", f"Expected status 'accepted', got {accepted_booking.get('status')}"
        
        print("✓ Vakman accept flow works correctly (status: confirmed -> accepted)")
    
    # ==================== VAKMAN-REJECT TESTS ====================
    
    def test_vakman_reject_requires_auth(self):
        """Test that vakman-reject requires authentication"""
        response = self.session.post(f"{BASE_URL}/api/bookings/fake-id/vakman-reject")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ vakman-reject requires authentication")
    
    def test_vakman_reject_requires_vakman_role(self):
        """Test that only vakman role can reject"""
        admin_token = self.get_admin_token()
        if not admin_token:
            pytest.skip("Could not get admin token")
        
        response = self.session.post(
            f"{BASE_URL}/api/bookings/fake-id/vakman-reject",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ vakman-reject requires vakman role (admin gets 403)")
    
    def test_vakman_reject_booking_not_found(self):
        """Test vakman-reject with non-existent booking"""
        monteur_token = self.get_monteur_token()
        if not monteur_token:
            pytest.skip("Could not get monteur token")
        
        response = self.session.post(
            f"{BASE_URL}/api/bookings/nonexistent-booking-id/vakman-reject",
            headers={"Authorization": f"Bearer {monteur_token}"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ vakman-reject returns 404 for non-existent booking")
    
    def test_vakman_reject_not_assigned_to_vakman(self):
        """Test vakman cannot reject booking not assigned to them"""
        admin_token = self.get_admin_token()
        monteur_token = self.get_monteur_token()
        
        if not admin_token or not monteur_token:
            pytest.skip("Could not get tokens")
        
        # Create booking without assigning to this vakman
        booking = self.create_test_booking(admin_token)
        if not booking:
            pytest.skip("Could not create test booking")
        
        booking_id = booking.get("id")
        
        # Try to reject without being assigned
        response = self.session.post(
            f"{BASE_URL}/api/bookings/{booking_id}/vakman-reject",
            headers={"Authorization": f"Bearer {monteur_token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ vakman cannot reject booking not assigned to them")
    
    def test_vakman_reject_success(self):
        """Test successful vakman reject flow - booking returns to pending, vakman removed"""
        admin_token = self.get_admin_token()
        monteur_token = self.get_monteur_token()
        
        if not admin_token or not monteur_token:
            pytest.skip("Could not get tokens")
        
        # Create booking
        booking = self.create_test_booking(admin_token)
        if not booking:
            pytest.skip("Could not create test booking")
        
        booking_id = booking.get("id")
        
        # Get vakman ID
        vakman_id = self.get_vakman_id(admin_token)
        if not vakman_id:
            pytest.skip("Could not find vakman ID")
        
        # Admin assigns booking to vakman
        assign_response = self.assign_booking_to_vakman(booking_id, vakman_id, admin_token)
        assert assign_response.status_code == 200, f"Failed to assign booking: {assign_response.text}"
        
        # Verify booking is assigned
        get_response = self.session.get(
            f"{BASE_URL}/api/admin/bookings",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        bookings = get_response.json()
        assigned_booking = next((b for b in bookings if b.get("id") == booking_id), None)
        assert assigned_booking.get("vakman_id") == vakman_id, "Vakman not assigned correctly"
        
        # Vakman rejects the booking
        reject_response = self.session.post(
            f"{BASE_URL}/api/bookings/{booking_id}/vakman-reject",
            headers={"Authorization": f"Bearer {monteur_token}"}
        )
        assert reject_response.status_code == 200, f"Expected 200, got {reject_response.status_code}: {reject_response.text}"
        
        # Verify response message
        reject_data = reject_response.json()
        assert "Admin is op de hoogte gesteld" in reject_data.get("message", ""), "Expected admin notification message"
        
        # Verify booking status changed to 'pending' and vakman removed
        get_response2 = self.session.get(
            f"{BASE_URL}/api/admin/bookings",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        bookings2 = get_response2.json()
        rejected_booking = next((b for b in bookings2 if b.get("id") == booking_id), None)
        assert rejected_booking is not None, "Booking not found after reject"
        assert rejected_booking.get("status") == "pending", f"Expected status 'pending', got {rejected_booking.get('status')}"
        assert rejected_booking.get("vakman_id") is None, f"Expected vakman_id to be None, got {rejected_booking.get('vakman_id')}"
        assert rejected_booking.get("vakman_name") is None, f"Expected vakman_name to be None, got {rejected_booking.get('vakman_name')}"
        
        print("✓ Vakman reject flow works correctly (status: confirmed -> pending, vakman removed)")


class TestVakmanDashboardStatus:
    """Test vakman dashboard shows correct status labels"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def get_monteur_token(self):
        """Get monteur/vakman authentication token"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": MONTEUR_EMAIL,
            "password": MONTEUR_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        return None
    
    def test_vakman_dashboard_returns_bookings(self):
        """Test vakman dashboard endpoint returns bookings"""
        monteur_token = self.get_monteur_token()
        if not monteur_token:
            pytest.skip("Could not get monteur token")
        
        response = self.session.get(
            f"{BASE_URL}/api/vakman/dashboard",
            headers={"Authorization": f"Bearer {monteur_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "vakman" in data, "Response should contain vakman data"
        assert "bookings" in data, "Response should contain bookings"
        assert "stats" in data, "Response should contain stats"
        
        print("✓ Vakman dashboard endpoint returns correct structure")
    
    def test_vakman_dashboard_stats(self):
        """Test vakman dashboard stats calculation"""
        monteur_token = self.get_monteur_token()
        if not monteur_token:
            pytest.skip("Could not get monteur token")
        
        response = self.session.get(
            f"{BASE_URL}/api/vakman/dashboard",
            headers={"Authorization": f"Bearer {monteur_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        stats = data.get("stats", {})
        
        # Verify stats structure
        assert "total_jobs" in stats, "Stats should contain total_jobs"
        assert "completed_jobs" in stats, "Stats should contain completed_jobs"
        assert "pending_jobs" in stats, "Stats should contain pending_jobs"
        assert "earnings" in stats, "Stats should contain earnings"
        
        print("✓ Vakman dashboard stats have correct structure")


class TestAdminRejectedBookingVisibility:
    """Test that rejected bookings are visible in admin dashboard without vakman"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def get_admin_token(self):
        """Get admin authentication token"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        return None
    
    def test_admin_sees_pending_bookings_without_vakman(self):
        """Test admin can see pending bookings that need assignment"""
        admin_token = self.get_admin_token()
        if not admin_token:
            pytest.skip("Could not get admin token")
        
        response = self.session.get(
            f"{BASE_URL}/api/admin/bookings",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        bookings = response.json()
        
        # Check for pending bookings without vakman
        pending_without_vakman = [b for b in bookings if b.get("status") == "pending" and b.get("vakman_id") is None]
        
        print(f"✓ Admin can see {len(pending_without_vakman)} pending bookings without vakman assigned")
        print(f"  Total bookings: {len(bookings)}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
