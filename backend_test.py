import requests
import sys
import json
from datetime import datetime

class SpoedKlusAPITester:
    def __init__(self, base_url="https://emergency-hub-85.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f", Expected: {expected_status}"
                try:
                    error_data = response.json()
                    details += f", Response: {error_data}"
                except:
                    details += f", Response: {response.text[:200]}"

            self.log_test(name, success, details)
            return success, response.json() if success and response.content else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_public_endpoints(self):
        """Test public endpoints that don't require authentication"""
        print("\n🔍 Testing Public Endpoints...")
        
        # Test root endpoint
        self.run_test("Root API", "GET", "", 200)
        
        # Test services endpoint
        success, services = self.run_test("Get Services", "GET", "services", 200)
        if success and services:
            print(f"   Found {len(services)} services")
            for service in services:
                print(f"   - {service.get('name', 'Unknown')}: €{service.get('base_price', 0)} / €{service.get('emergency_price', 0)} (emergency)")
        
        # Test public stats
        success, stats = self.run_test("Get Public Stats", "GET", "stats/public", 200)
        if success and stats:
            print(f"   Stats: {stats.get('total_bookings', 0)} bookings, {stats.get('total_vakmannen', 0)} vakmannen")
        
        # Test latest reviews
        success, reviews = self.run_test("Get Latest Reviews", "GET", "reviews/latest", 200)
        if success and reviews:
            print(f"   Found {len(reviews)} reviews")

    def test_customer_registration(self):
        """Test customer registration"""
        print("\n🔍 Testing Customer Registration...")
        
        timestamp = datetime.now().strftime('%H%M%S')
        test_customer = {
            "name": f"Test Customer {timestamp}",
            "email": f"customer{timestamp}@test.nl",
            "phone": "06 12345678",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "Customer Registration",
            "POST",
            "auth/register",
            200,
            data=test_customer
        )
        
        if success and 'token' in response:
            self.customer_token = response['token']
            print(f"   Customer registered with ID: {response.get('user', {}).get('id', 'Unknown')}")
            return test_customer
        return None

    def test_vakman_registration(self):
        """Test vakman registration"""
        print("\n🔍 Testing Vakman Registration...")
        
        timestamp = datetime.now().strftime('%H%M%S')
        test_vakman = {
            "name": f"Test Vakman {timestamp}",
            "email": f"vakman{timestamp}@test.nl",
            "phone": "06 87654321",
            "password": "TestPass123!",
            "service_type": "elektricien",
            "description": "Ervaren elektricien met 10 jaar ervaring",
            "hourly_rate": 65.0,
            "location": "Amsterdam"
        }
        
        success, response = self.run_test(
            "Vakman Registration",
            "POST",
            "vakman/register",
            200,
            data=test_vakman
        )
        
        if success and 'token' in response:
            self.vakman_token = response['token']
            print(f"   Vakman registered with ID: {response.get('user', {}).get('id', 'Unknown')}")
            return test_vakman
        return None

    def test_login(self, email, password, user_type="customer"):
        """Test login functionality"""
        print(f"\n🔍 Testing {user_type.title()} Login...")
        
        login_data = {
            "email": email,
            "password": password
        }
        
        success, response = self.run_test(
            f"{user_type.title()} Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Logged in as: {response.get('user', {}).get('name', 'Unknown')}")
            return True
        return False

    def test_booking_creation(self):
        """Test booking creation"""
        print("\n🔍 Testing Booking Creation...")
        
        booking_data = {
            "service_type": "elektricien",
            "is_emergency": False,
            "description": "Stopcontact werkt niet meer in de keuken",
            "address": "Teststraat 123",
            "postal_code": "1234 AB",
            "city": "Amsterdam",
            "preferred_date": "2024-12-20",
            "preferred_time": "10:00 - 12:00",
            "customer_name": "Test Customer",
            "customer_email": "test@example.nl",
            "customer_phone": "06 12345678"
        }
        
        success, response = self.run_test(
            "Create Booking",
            "POST",
            "bookings",
            200,
            data=booking_data
        )
        
        if success and 'booking' in response:
            booking_id = response['booking'].get('id')
            print(f"   Booking created with ID: {booking_id}")
            print(f"   Price: €{response['booking'].get('price', 0)}")
            return booking_id
        return None

    def test_service_specific_endpoints(self):
        """Test service-specific endpoints"""
        print("\n🔍 Testing Service-Specific Endpoints...")
        
        services = ["elektricien", "loodgieter", "slotenmaker"]
        for service in services:
            self.run_test(
                f"Get {service.title()} Service",
                "GET",
                f"services/{service}",
                200
            )

    def test_authenticated_endpoints(self):
        """Test endpoints that require authentication"""
        if not self.token:
            print("\n⚠️  Skipping authenticated tests - no token available")
            return
            
        print("\n🔍 Testing Authenticated Endpoints...")
        
        # Test get current user
        self.run_test("Get Current User", "GET", "auth/me", 200)
        
        # Test get bookings
        self.run_test("Get User Bookings", "GET", "bookings", 200)

    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting SpoedKlus API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Test public endpoints first
        self.test_public_endpoints()
        
        # Test service-specific endpoints
        self.test_service_specific_endpoints()
        
        # Test registration
        customer = self.test_customer_registration()
        vakman = self.test_vakman_registration()
        
        # Test login if registration worked
        if customer:
            self.test_login(customer['email'], customer['password'], "customer")
            
        # Test booking creation
        booking_id = self.test_booking_creation()
        
        # Test authenticated endpoints
        self.test_authenticated_endpoints()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.tests_passed < self.tests_run:
            print("\n❌ Failed tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = SpoedKlusAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())