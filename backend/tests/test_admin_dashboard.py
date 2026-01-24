"""
Backend tests for Admin Dashboard - Financial and Marketing endpoints
Tests for SpoedDienst24.nl admin dashboard features
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAdminStats:
    """Admin statistics endpoint tests"""
    
    def test_admin_stats_returns_200(self):
        """Test admin stats endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 200
        
    def test_admin_stats_structure(self):
        """Test admin stats response has correct structure"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        data = response.json()
        
        # Verify all required fields exist
        assert "total_bookings" in data
        assert "active_vakmannen" in data
        assert "pending_vakmannen" in data
        assert "total_reviews" in data
        assert "pending_reviews" in data
        assert "total_revenue" in data
        
        # Verify data types
        assert isinstance(data["total_bookings"], int)
        assert isinstance(data["active_vakmannen"], int)
        assert isinstance(data["total_revenue"], (int, float))


class TestAdminFinancial:
    """Admin financial endpoint tests"""
    
    def test_financial_default_period(self):
        """Test financial endpoint with default period (month)"""
        response = requests.get(f"{BASE_URL}/api/admin/financial")
        assert response.status_code == 200
        data = response.json()
        assert data["period"] == "month"
        
    def test_financial_day_period(self):
        """Test financial endpoint with day period"""
        response = requests.get(f"{BASE_URL}/api/admin/financial?period=day")
        assert response.status_code == 200
        data = response.json()
        assert data["period"] == "day"
        
    def test_financial_week_period(self):
        """Test financial endpoint with week period"""
        response = requests.get(f"{BASE_URL}/api/admin/financial?period=week")
        assert response.status_code == 200
        data = response.json()
        assert data["period"] == "week"
        
    def test_financial_year_period(self):
        """Test financial endpoint with year period"""
        response = requests.get(f"{BASE_URL}/api/admin/financial?period=year")
        assert response.status_code == 200
        data = response.json()
        assert data["period"] == "year"
        
    def test_financial_response_structure(self):
        """Test financial response has all required fields"""
        response = requests.get(f"{BASE_URL}/api/admin/financial?period=month")
        data = response.json()
        
        # Required fields
        required_fields = [
            "period", "total_revenue", "paid_revenue", "pending_revenue",
            "total_bookings", "revenue_by_service", "bookings_by_status",
            "daily_revenue", "payment_status", "average_order_value"
        ]
        
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
            
    def test_financial_daily_revenue_structure(self):
        """Test daily revenue array has correct structure"""
        response = requests.get(f"{BASE_URL}/api/admin/financial?period=month")
        data = response.json()
        
        assert "daily_revenue" in data
        assert isinstance(data["daily_revenue"], list)
        assert len(data["daily_revenue"]) == 7  # Last 7 days
        
        # Check each day entry
        for day in data["daily_revenue"]:
            assert "date" in day
            assert "revenue" in day
            assert "bookings" in day
            
    def test_financial_payment_status_structure(self):
        """Test payment status has paid/unpaid breakdown"""
        response = requests.get(f"{BASE_URL}/api/admin/financial?period=month")
        data = response.json()
        
        assert "payment_status" in data
        assert "paid" in data["payment_status"]
        assert "unpaid" in data["payment_status"]


class TestAdminMarketing:
    """Admin marketing endpoint tests"""
    
    def test_marketing_returns_200(self):
        """Test marketing endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/admin/marketing")
        assert response.status_code == 200
        
    def test_marketing_response_structure(self):
        """Test marketing response has all required fields"""
        response = requests.get(f"{BASE_URL}/api/admin/marketing")
        data = response.json()
        
        required_fields = [
            "total_bookings", "bookings_by_service", "emergency_vs_regular",
            "top_cities", "conversion_rate", "time_slots", 
            "revenue_by_service", "service_performance"
        ]
        
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
            
    def test_marketing_emergency_vs_regular(self):
        """Test emergency vs regular breakdown"""
        response = requests.get(f"{BASE_URL}/api/admin/marketing")
        data = response.json()
        
        assert "emergency_vs_regular" in data
        assert "emergency" in data["emergency_vs_regular"]
        assert "regular" in data["emergency_vs_regular"]
        
        # Total should match
        total = data["emergency_vs_regular"]["emergency"] + data["emergency_vs_regular"]["regular"]
        assert total == data["total_bookings"]
        
    def test_marketing_service_performance(self):
        """Test service performance array structure"""
        response = requests.get(f"{BASE_URL}/api/admin/marketing")
        data = response.json()
        
        assert "service_performance" in data
        assert isinstance(data["service_performance"], list)
        
        for service in data["service_performance"]:
            assert "service" in service
            assert "bookings" in service
            assert "revenue" in service
            
    def test_marketing_top_cities(self):
        """Test top cities is a dictionary"""
        response = requests.get(f"{BASE_URL}/api/admin/marketing")
        data = response.json()
        
        assert "top_cities" in data
        assert isinstance(data["top_cities"], dict)


class TestAdminExportCSV:
    """Admin CSV export endpoint tests"""
    
    def test_export_csv_returns_200(self):
        """Test CSV export returns 200"""
        response = requests.get(f"{BASE_URL}/api/admin/export/bookings")
        assert response.status_code == 200
        
    def test_export_csv_content_type(self):
        """Test CSV export has correct content type"""
        response = requests.get(f"{BASE_URL}/api/admin/export/bookings")
        assert "text/csv" in response.headers.get("content-type", "")
        
    def test_export_csv_has_headers(self):
        """Test CSV export has header row"""
        response = requests.get(f"{BASE_URL}/api/admin/export/bookings")
        content = response.text
        
        # Check for expected CSV headers
        expected_headers = ["id", "service_type", "customer_name", "customer_email", "status", "price"]
        first_line = content.split('\n')[0]
        
        for header in expected_headers:
            assert header in first_line, f"Missing CSV header: {header}"
            
    def test_export_csv_content_disposition(self):
        """Test CSV export has download filename"""
        response = requests.get(f"{BASE_URL}/api/admin/export/bookings")
        content_disposition = response.headers.get("content-disposition", "")
        assert "attachment" in content_disposition
        assert "filename=" in content_disposition


class TestAdminBookings:
    """Admin bookings list endpoint tests"""
    
    def test_admin_bookings_returns_200(self):
        """Test admin bookings endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/admin/bookings")
        assert response.status_code == 200
        
    def test_admin_bookings_is_list(self):
        """Test admin bookings returns a list"""
        response = requests.get(f"{BASE_URL}/api/admin/bookings")
        data = response.json()
        assert isinstance(data, list)
        
    def test_admin_bookings_structure(self):
        """Test booking objects have required fields"""
        response = requests.get(f"{BASE_URL}/api/admin/bookings")
        data = response.json()
        
        if len(data) > 0:
            booking = data[0]
            required_fields = [
                "id", "service_type", "customer_name", "customer_email",
                "customer_phone", "address", "city", "status", "price"
            ]
            for field in required_fields:
                assert field in booking, f"Missing field: {field}"


class TestAdminVakmannen:
    """Admin vakmannen list endpoint tests"""
    
    def test_admin_vakmannen_returns_200(self):
        """Test admin vakmannen endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/admin/vakmannen")
        assert response.status_code == 200
        
    def test_admin_vakmannen_is_list(self):
        """Test admin vakmannen returns a list"""
        response = requests.get(f"{BASE_URL}/api/admin/vakmannen")
        data = response.json()
        assert isinstance(data, list)
        
    def test_admin_vakmannen_no_password(self):
        """Test vakmannen response excludes password"""
        response = requests.get(f"{BASE_URL}/api/admin/vakmannen")
        data = response.json()
        
        for vakman in data:
            assert "password" not in vakman, "Password should not be exposed"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
