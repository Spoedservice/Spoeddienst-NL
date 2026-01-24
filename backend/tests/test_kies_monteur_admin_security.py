"""
Test suite for:
1. Kies een monteur feature - GET /api/vakmannen/available endpoint
2. Kies een monteur feature - POST /api/bookings with assigned_vakman_id
3. Admin security - Admin endpoints should return 401 without auth
4. Admin security - Admin endpoints should return 403 with non-admin token
5. Admin security - Admin endpoints should return 200 with admin token
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@spoeddienst24.nl"
ADMIN_PASSWORD = "Admin2024!"
CUSTOMER_EMAIL = "klant@test.nl"
CUSTOMER_PASSWORD = "Test1234"
VAKMAN_EMAIL = "monteur@test.nl"
VAKMAN_PASSWORD = "Test1234"


class TestKiesMonteurFeature:
    """Tests for the 'Kies een monteur' (Choose a technician) feature"""
    
    def test_get_available_vakmannen_elektricien(self):
        """Test GET /api/vakmannen/available?service_type=elektricien returns available vakmannen"""
        response = requests.get(f"{BASE_URL}/api/vakmannen/available?service_type=elektricien")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Verify each vakman has required fields
        if len(data) > 0:
            vakman = data[0]
            assert "id" in vakman, "Vakman should have id"
            assert "name" in vakman, "Vakman should have name"
            assert "location" in vakman, "Vakman should have location"
            assert "hourly_rate" in vakman, "Vakman should have hourly_rate"
            assert "rating" in vakman, "Vakman should have rating"
            assert "total_reviews" in vakman, "Vakman should have total_reviews"
            assert vakman.get("is_approved") == True, "Vakman should be approved"
            assert vakman.get("is_available") == True, "Vakman should be available"
            assert vakman.get("service_type") == "elektricien", "Vakman should be elektricien"
            print(f"✓ Found {len(data)} available elektriciens")
    
    def test_get_available_vakmannen_loodgieter(self):
        """Test GET /api/vakmannen/available?service_type=loodgieter"""
        response = requests.get(f"{BASE_URL}/api/vakmannen/available?service_type=loodgieter")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ Found {len(data)} available loodgieters")
    
    def test_get_available_vakmannen_slotenmaker(self):
        """Test GET /api/vakmannen/available?service_type=slotenmaker"""
        response = requests.get(f"{BASE_URL}/api/vakmannen/available?service_type=slotenmaker")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ Found {len(data)} available slotenmakers")
    
    def test_create_booking_with_assigned_vakman(self):
        """Test POST /api/bookings with assigned_vakman_id and assigned_vakman_name"""
        # First get an available vakman
        vakmannen_response = requests.get(f"{BASE_URL}/api/vakmannen/available?service_type=elektricien")
        assert vakmannen_response.status_code == 200
        vakmannen = vakmannen_response.json()
        
        if len(vakmannen) == 0:
            pytest.skip("No available vakmannen to test with")
        
        selected_vakman = vakmannen[0]
        unique_id = str(uuid.uuid4())[:8]
        
        booking_data = {
            "service_type": "elektricien",
            "is_emergency": False,
            "description": f"Test booking with assigned vakman {unique_id}",
            "address": "Teststraat 123",
            "postal_code": "1234 AB",
            "city": "Amsterdam",
            "preferred_date": "2026-02-01",
            "preferred_time": "10:00 - 12:00",
            "customer_name": f"Test Klant {unique_id}",
            "customer_email": f"test.{unique_id}@example.com",
            "customer_phone": "0612345678",
            "assigned_vakman_id": selected_vakman["id"],
            "assigned_vakman_name": selected_vakman["name"]
        }
        
        response = requests.post(f"{BASE_URL}/api/bookings", json=booking_data)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "booking" in data, "Response should contain booking"
        booking = data["booking"]
        
        # Verify vakman assignment
        assert booking.get("vakman_id") == selected_vakman["id"], "Booking should have assigned vakman_id"
        assert booking.get("vakman_name") == selected_vakman["name"], "Booking should have assigned vakman_name"
        
        print(f"✓ Created booking with assigned vakman: {selected_vakman['name']}")
    
    def test_create_booking_without_assigned_vakman(self):
        """Test POST /api/bookings without assigned_vakman_id (should still work)"""
        unique_id = str(uuid.uuid4())[:8]
        
        booking_data = {
            "service_type": "loodgieter",
            "is_emergency": True,
            "description": f"Test booking without assigned vakman {unique_id}",
            "address": "Teststraat 456",
            "postal_code": "5678 CD",
            "city": "Rotterdam",
            "preferred_date": "2026-02-02",
            "preferred_time": "14:00 - 16:00",
            "customer_name": f"Test Klant {unique_id}",
            "customer_email": f"test.{unique_id}@example.com",
            "customer_phone": "0687654321"
            # No assigned_vakman_id or assigned_vakman_name
        }
        
        response = requests.post(f"{BASE_URL}/api/bookings", json=booking_data)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "booking" in data, "Response should contain booking"
        booking = data["booking"]
        
        # Verify no vakman assigned
        assert booking.get("vakman_id") is None, "Booking should not have vakman_id"
        assert booking.get("vakman_name") is None, "Booking should not have vakman_name"
        
        print(f"✓ Created booking without assigned vakman")


class TestAdminSecurityNoAuth:
    """Tests for admin endpoints without authentication - should return 401"""
    
    def test_admin_bookings_no_auth(self):
        """Admin bookings endpoint should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/bookings")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ /api/admin/bookings returns 401 without auth")
    
    def test_admin_vakmannen_no_auth(self):
        """Admin vakmannen endpoint should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/vakmannen")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ /api/admin/vakmannen returns 401 without auth")
    
    def test_admin_reviews_no_auth(self):
        """Admin reviews endpoint should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/reviews")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ /api/admin/reviews returns 401 without auth")
    
    def test_admin_stats_no_auth(self):
        """Admin stats endpoint should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ /api/admin/stats returns 401 without auth")
    
    def test_admin_financial_no_auth(self):
        """Admin financial endpoint should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/financial")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ /api/admin/financial returns 401 without auth")
    
    def test_admin_marketing_no_auth(self):
        """Admin marketing endpoint should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/marketing")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ /api/admin/marketing returns 401 without auth")


class TestAdminSecurityNonAdminToken:
    """Tests for admin endpoints with non-admin token - should return 403"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get a non-admin token (vakman or customer)"""
        # Try vakman login first
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": VAKMAN_EMAIL,
            "password": VAKMAN_PASSWORD
        })
        
        if response.status_code == 200:
            self.token = response.json().get("token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
            print(f"✓ Logged in as vakman: {VAKMAN_EMAIL}")
        else:
            # Create a test customer if vakman login fails
            unique_id = str(uuid.uuid4())[:8]
            register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
                "email": f"test.customer.{unique_id}@test.nl",
                "password": "Test1234",
                "name": f"Test Customer {unique_id}",
                "phone": "0612345678"
            })
            if register_response.status_code == 200:
                self.token = register_response.json().get("token")
                self.headers = {"Authorization": f"Bearer {self.token}"}
                print(f"✓ Registered test customer")
            else:
                pytest.skip("Could not get non-admin token")
    
    def test_admin_bookings_non_admin(self):
        """Admin bookings endpoint should return 403 with non-admin token"""
        response = requests.get(f"{BASE_URL}/api/admin/bookings", headers=self.headers)
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        print("✓ /api/admin/bookings returns 403 with non-admin token")
    
    def test_admin_vakmannen_non_admin(self):
        """Admin vakmannen endpoint should return 403 with non-admin token"""
        response = requests.get(f"{BASE_URL}/api/admin/vakmannen", headers=self.headers)
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        print("✓ /api/admin/vakmannen returns 403 with non-admin token")
    
    def test_admin_stats_non_admin(self):
        """Admin stats endpoint should return 403 with non-admin token"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=self.headers)
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        print("✓ /api/admin/stats returns 403 with non-admin token")
    
    def test_admin_financial_non_admin(self):
        """Admin financial endpoint should return 403 with non-admin token"""
        response = requests.get(f"{BASE_URL}/api/admin/financial", headers=self.headers)
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        print("✓ /api/admin/financial returns 403 with non-admin token")
    
    def test_admin_approve_vakman_non_admin(self):
        """Admin approve vakman endpoint should return 403 with non-admin token"""
        response = requests.post(f"{BASE_URL}/api/admin/vakman/fake-id/approve", headers=self.headers)
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        print("✓ /api/admin/vakman/{id}/approve returns 403 with non-admin token")


class TestAdminSecurityWithAdminToken:
    """Tests for admin endpoints with admin token - should return 200"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if response.status_code != 200:
            pytest.skip(f"Could not login as admin: {response.text}")
        
        self.token = response.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
        print(f"✓ Logged in as admin: {ADMIN_EMAIL}")
    
    def test_admin_bookings_with_admin(self):
        """Admin bookings endpoint should return 200 with admin token"""
        response = requests.get(f"{BASE_URL}/api/admin/bookings", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ /api/admin/bookings returns 200 with admin token ({len(data)} bookings)")
    
    def test_admin_vakmannen_with_admin(self):
        """Admin vakmannen endpoint should return 200 with admin token"""
        response = requests.get(f"{BASE_URL}/api/admin/vakmannen", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ /api/admin/vakmannen returns 200 with admin token ({len(data)} vakmannen)")
    
    def test_admin_reviews_with_admin(self):
        """Admin reviews endpoint should return 200 with admin token"""
        response = requests.get(f"{BASE_URL}/api/admin/reviews", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ /api/admin/reviews returns 200 with admin token ({len(data)} reviews)")
    
    def test_admin_stats_with_admin(self):
        """Admin stats endpoint should return 200 with admin token"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "total_bookings" in data, "Response should contain total_bookings"
        assert "active_vakmannen" in data, "Response should contain active_vakmannen"
        print(f"✓ /api/admin/stats returns 200 with admin token")
    
    def test_admin_financial_with_admin(self):
        """Admin financial endpoint should return 200 with admin token"""
        response = requests.get(f"{BASE_URL}/api/admin/financial", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "total_revenue" in data, "Response should contain total_revenue"
        print(f"✓ /api/admin/financial returns 200 with admin token")
    
    def test_admin_marketing_with_admin(self):
        """Admin marketing endpoint should return 200 with admin token"""
        response = requests.get(f"{BASE_URL}/api/admin/marketing", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "total_bookings" in data, "Response should contain total_bookings"
        print(f"✓ /api/admin/marketing returns 200 with admin token")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
