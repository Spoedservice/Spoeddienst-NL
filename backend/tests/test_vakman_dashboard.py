"""
Backend tests for Vakman Dashboard endpoints
Tests for SpoedDienst24.nl vakman dashboard features
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_VAKMAN_EMAIL = "test.vakman@demo.nl"
TEST_VAKMAN_PASSWORD = "test123"


class TestVakmanAuth:
    """Vakman authentication tests"""
    
    def test_vakman_login_success(self):
        """Test vakman can login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_VAKMAN_EMAIL,
            "password": TEST_VAKMAN_PASSWORD
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["role"] == "vakman"
        assert data["user"]["email"] == TEST_VAKMAN_EMAIL
        
    def test_vakman_login_invalid_password(self):
        """Test vakman login fails with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_VAKMAN_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        
    def test_vakman_login_invalid_email(self):
        """Test vakman login fails with non-existent email"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "anypassword"
        })
        assert response.status_code == 401


@pytest.fixture
def vakman_token():
    """Get authentication token for test vakman"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_VAKMAN_EMAIL,
        "password": TEST_VAKMAN_PASSWORD
    })
    if response.status_code == 200:
        return response.json()["token"]
    pytest.skip("Could not authenticate test vakman")


class TestVakmanDashboard:
    """Vakman dashboard endpoint tests"""
    
    def test_dashboard_requires_auth(self):
        """Test dashboard endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/vakman/dashboard")
        assert response.status_code == 401
        
    def test_dashboard_returns_200_with_auth(self, vakman_token):
        """Test dashboard returns 200 with valid token"""
        response = requests.get(
            f"{BASE_URL}/api/vakman/dashboard",
            headers={"Authorization": f"Bearer {vakman_token}"}
        )
        assert response.status_code == 200
        
    def test_dashboard_response_structure(self, vakman_token):
        """Test dashboard response has correct structure"""
        response = requests.get(
            f"{BASE_URL}/api/vakman/dashboard",
            headers={"Authorization": f"Bearer {vakman_token}"}
        )
        data = response.json()
        
        # Required top-level fields
        assert "vakman" in data
        assert "bookings" in data
        assert "stats" in data
        
    def test_dashboard_vakman_info(self, vakman_token):
        """Test vakman info in dashboard response"""
        response = requests.get(
            f"{BASE_URL}/api/vakman/dashboard",
            headers={"Authorization": f"Bearer {vakman_token}"}
        )
        data = response.json()
        vakman = data["vakman"]
        
        # Required vakman fields
        required_fields = [
            "id", "email", "name", "phone", "service_type",
            "description", "hourly_rate", "location",
            "is_approved", "is_available", "rating", "total_reviews"
        ]
        
        for field in required_fields:
            assert field in vakman, f"Missing vakman field: {field}"
            
        # Password should not be exposed
        assert "password" not in vakman
        
    def test_dashboard_stats_structure(self, vakman_token):
        """Test stats in dashboard response"""
        response = requests.get(
            f"{BASE_URL}/api/vakman/dashboard",
            headers={"Authorization": f"Bearer {vakman_token}"}
        )
        data = response.json()
        stats = data["stats"]
        
        # Required stats fields
        assert "total_jobs" in stats
        assert "completed_jobs" in stats
        assert "pending_jobs" in stats
        assert "earnings" in stats
        
        # Verify data types
        assert isinstance(stats["total_jobs"], int)
        assert isinstance(stats["completed_jobs"], int)
        assert isinstance(stats["pending_jobs"], int)
        assert isinstance(stats["earnings"], (int, float))
        
    def test_dashboard_bookings_is_list(self, vakman_token):
        """Test bookings in dashboard is a list"""
        response = requests.get(
            f"{BASE_URL}/api/vakman/dashboard",
            headers={"Authorization": f"Bearer {vakman_token}"}
        )
        data = response.json()
        
        assert isinstance(data["bookings"], list)


class TestVakmanAvailability:
    """Vakman availability toggle tests"""
    
    def test_availability_requires_auth(self):
        """Test availability endpoint requires authentication"""
        response = requests.put(f"{BASE_URL}/api/vakman/availability?is_available=true")
        assert response.status_code == 401
        
    def test_availability_toggle_on(self, vakman_token):
        """Test setting availability to true"""
        response = requests.put(
            f"{BASE_URL}/api/vakman/availability?is_available=true",
            headers={"Authorization": f"Bearer {vakman_token}"}
        )
        assert response.status_code == 200
        
        # Verify change persisted
        dashboard = requests.get(
            f"{BASE_URL}/api/vakman/dashboard",
            headers={"Authorization": f"Bearer {vakman_token}"}
        )
        assert dashboard.json()["vakman"]["is_available"] == True
        
    def test_availability_toggle_off(self, vakman_token):
        """Test setting availability to false"""
        response = requests.put(
            f"{BASE_URL}/api/vakman/availability?is_available=false",
            headers={"Authorization": f"Bearer {vakman_token}"}
        )
        assert response.status_code == 200
        
        # Verify change persisted
        dashboard = requests.get(
            f"{BASE_URL}/api/vakman/dashboard",
            headers={"Authorization": f"Bearer {vakman_token}"}
        )
        assert dashboard.json()["vakman"]["is_available"] == False
        
        # Reset to true for other tests
        requests.put(
            f"{BASE_URL}/api/vakman/availability?is_available=true",
            headers={"Authorization": f"Bearer {vakman_token}"}
        )


class TestVakmanAuthMe:
    """Vakman /auth/me endpoint tests"""
    
    def test_auth_me_requires_auth(self):
        """Test /auth/me requires authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        
    def test_auth_me_returns_vakman_info(self, vakman_token):
        """Test /auth/me returns vakman info"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {vakman_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["email"] == TEST_VAKMAN_EMAIL
        assert data["role"] == "vakman"
        assert "password" not in data


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
