#!/usr/bin/env python3
"""
Cosmic Blueprint Backend API Test Suite
Tests all critical endpoints at the preview URL
"""

import requests
import json
import re
from urllib.parse import urlparse, parse_qs

# Base URL from .env
BASE_URL = "https://cosmic-blueprint-dev.preview.emergentagent.com/api"

# Admin credentials
ADMIN_EMAIL = "admin@cosmicblueprint.com"
ADMIN_PASSWORD = "Admin@2026"

# Test data
BIRTH_DATA = {
    "name": "Test User",
    "date": "1990-05-21",
    "time": "14:30",
    "lat": 51.5,
    "lng": -0.1,
    "tzOffsetHours": 1
}

def print_test(name):
    print(f"\n{'='*80}")
    print(f"TEST: {name}")
    print('='*80)

def print_pass(msg):
    print(f"✅ PASS: {msg}")

def print_fail(msg):
    print(f"❌ FAIL: {msg}")

def print_info(msg):
    print(f"ℹ️  INFO: {msg}")

# Test 1: GET /api - Health check
def test_health_check():
    print_test("GET /api - Health Check")
    try:
        resp = requests.get(BASE_URL, timeout=10)
        print_info(f"Status: {resp.status_code}")
        print_info(f"Response: {resp.text[:200]}")
        
        if resp.status_code == 200:
            data = resp.json()
            if 'message' in data and 'version' in data:
                print_pass(f"Health check passed: {data}")
                return True
            else:
                print_fail(f"Missing message or version in response: {data}")
                return False
        else:
            print_fail(f"Expected 200, got {resp.status_code}")
            return False
    except Exception as e:
        print_fail(f"Exception: {e}")
        return False

# Test 2: GET /api/report-types
def test_report_types():
    print_test("GET /api/report-types")
    try:
        resp = requests.get(f"{BASE_URL}/report-types", timeout=10)
        print_info(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            reports = data.get('reports', [])
            bundle = data.get('bundle')
            print_info(f"Found {len(reports)} reports")
            
            if len(reports) == 13 and bundle:
                print_pass(f"Report types correct: 13 reports + bundle")
                return True
            else:
                print_fail(f"Expected 13 reports + bundle, got {len(reports)} reports, bundle={bundle is not None}")
                return False
        else:
            print_fail(f"Expected 200, got {resp.status_code}")
            return False
    except Exception as e:
        print_fail(f"Exception: {e}")
        return False

# Test 3: POST /api/geocode
def test_geocode():
    print_test("POST /api/geocode")
    try:
        resp = requests.post(f"{BASE_URL}/geocode", 
                           json={"location": "London, UK"}, 
                           timeout=15)
        print_info(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            results = data.get('results', [])
            if results and len(results) > 0:
                first = results[0]
                if 'lat' in first and 'lng' in first:
                    print_pass(f"Geocoding works: {first.get('display_name', '')[:50]}... lat={first['lat']}, lng={first['lng']}")
                    return True
                else:
                    print_fail(f"Missing lat/lng in results: {first}")
                    return False
            else:
                print_fail(f"No results returned")
                return False
        else:
            print_fail(f"Expected 200, got {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        print_fail(f"Exception: {e}")
        return False

# Test 4: POST /api/chart
def test_chart():
    print_test("POST /api/chart - Natal Chart Computation")
    try:
        chart_data = {
            "date": "1990-05-21",
            "time": "14:30",
            "lat": 51.5,
            "lng": -0.1,
            "tzOffsetHours": 1
        }
        resp = requests.post(f"{BASE_URL}/chart", json=chart_data, timeout=10)
        print_info(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            chart = data.get('chart', {})
            planets = chart.get('planets', [])
            ascendant = chart.get('ascendant')
            midheaven = chart.get('midheaven')
            houses = chart.get('houses', [])
            aspects = chart.get('aspects', [])
            
            print_info(f"Planets: {len(planets)}, Houses: {len(houses)}, Aspects: {len(aspects)}")
            
            if len(planets) == 10 and len(houses) == 12 and ascendant and midheaven:
                print_pass(f"Chart computation correct: 10 planets, 12 houses, ascendant, midheaven, {len(aspects)} aspects")
                return True
            else:
                print_fail(f"Chart incomplete: planets={len(planets)}, houses={len(houses)}, asc={ascendant}, mc={midheaven}")
                return False
        else:
            print_fail(f"Expected 200, got {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        print_fail(f"Exception: {e}")
        return False

# Test 5: POST /api/chart without time
def test_chart_no_time():
    print_test("POST /api/chart - Without Time (Edge Case)")
    try:
        chart_data = {
            "date": "1990-05-21",
            "lat": 51.5,
            "lng": -0.1,
            "tzOffsetHours": 1
        }
        resp = requests.post(f"{BASE_URL}/chart", json=chart_data, timeout=10)
        print_info(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            chart = data.get('chart', {})
            planets = chart.get('planets', [])
            ascendant = chart.get('ascendant')
            
            if len(planets) == 10:
                print_pass(f"Chart without time works: 10 planets, ascendant={ascendant}")
                return True
            else:
                print_fail(f"Expected 10 planets, got {len(planets)}")
                return False
        else:
            print_fail(f"Expected 200, got {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        print_fail(f"Exception: {e}")
        return False

# Test 6: POST /api/demo-chart
def test_demo_chart():
    print_test("POST /api/demo-chart - Celebrity Charts")
    try:
        resp = requests.post(f"{BASE_URL}/demo-chart", json={"id": "beyonce"}, timeout=10)
        print_info(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            celebrity = data.get('celebrity')
            chart = data.get('chart')
            
            if celebrity and chart and 'planets' in chart:
                print_pass(f"Demo chart works: {celebrity.get('name', 'Unknown')}")
                return True
            else:
                print_fail(f"Missing celebrity or chart data")
                return False
        else:
            print_fail(f"Expected 200, got {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        print_fail(f"Exception: {e}")
        return False

# Test 7: POST /api/auth/admin/login - Correct password
def test_admin_login_success():
    print_test("POST /api/auth/admin/login - Correct Password")
    try:
        resp = requests.post(f"{BASE_URL}/auth/admin/login", 
                           json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                           timeout=10)
        print_info(f"Status: {resp.status_code}")
        print_info(f"Response: {resp.text[:200]}")
        
        if resp.status_code == 200:
            data = resp.json()
            user = data.get('user')
            cookies = resp.cookies
            
            if user and user.get('role') == 'admin' and 'cosmic_session' in cookies:
                print_pass(f"Admin login successful: {user.get('email')}, role={user.get('role')}")
                return True, cookies
            else:
                print_fail(f"Missing user data or session cookie: user={user}, cookies={dict(cookies)}")
                return False, None
        else:
            print_fail(f"Expected 200, got {resp.status_code}: {resp.text}")
            return False, None
    except Exception as e:
        print_fail(f"Exception: {e}")
        return False, None

# Test 8: POST /api/auth/admin/login - Wrong password
def test_admin_login_fail():
    print_test("POST /api/auth/admin/login - Wrong Password")
    try:
        resp = requests.post(f"{BASE_URL}/auth/admin/login", 
                           json={"email": ADMIN_EMAIL, "password": "WrongPassword123"},
                           timeout=10)
        print_info(f"Status: {resp.status_code}")
        
        if resp.status_code == 401:
            print_pass(f"Correctly rejected wrong password with 401")
            return True
        else:
            print_fail(f"Expected 401, got {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        print_fail(f"Exception: {e}")
        return False

# Test 9: GET /api/auth/me - With session
def test_auth_me(cookies):
    print_test("GET /api/auth/me - Verify Session")
    try:
        resp = requests.get(f"{BASE_URL}/auth/me", cookies=cookies, timeout=10)
        print_info(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            user = data.get('user')
            
            if user and user.get('role') == 'admin':
                print_pass(f"Auth/me works: {user.get('email')}, role={user.get('role')}")
                return True
            else:
                print_fail(f"User data incorrect: {user}")
                return False
        else:
            print_fail(f"Expected 200, got {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        print_fail(f"Exception: {e}")
        return False

# Test 10: POST /api/auth/magic/request
def test_magic_request():
    print_test("POST /api/auth/magic/request - Magic Link")
    try:
        test_email = "new-tester@example.com"
        resp = requests.post(f"{BASE_URL}/auth/magic/request", 
                           json={"email": test_email},
                           timeout=10)
        print_info(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            dev_link = data.get('devLink')
            
            if data.get('ok') and dev_link:
                print_pass(f"Magic link request successful, devLink: {dev_link[:50]}...")
                # Extract token from devLink
                parsed = urlparse(dev_link)
                token = parse_qs(parsed.query).get('token', [None])[0]
                return True, token
            else:
                print_fail(f"Missing ok or devLink: {data}")
                return False, None
        else:
            print_fail(f"Expected 200, got {resp.status_code}: {resp.text}")
            return False, None
    except Exception as e:
        print_fail(f"Exception: {e}")
        return False, None

# Test 11: POST /api/auth/magic/consume - First use
def test_magic_consume_first(token):
    print_test("POST /api/auth/magic/consume - First Use")
    try:
        resp = requests.post(f"{BASE_URL}/auth/magic/consume", 
                           json={"token": token},
                           timeout=10)
        print_info(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            user = data.get('user')
            cookies = resp.cookies
            
            if user and user.get('role') == 'user' and 'cosmic_session' in cookies:
                print_pass(f"Magic consume successful: {user.get('email')}, role={user.get('role')}")
                return True, cookies
            else:
                print_fail(f"Missing user or session: user={user}, cookies={dict(cookies)}")
                return False, None
        else:
            print_fail(f"Expected 200, got {resp.status_code}: {resp.text}")
            return False, None
    except Exception as e:
        print_fail(f"Exception: {e}")
        return False, None

# Test 12: POST /api/auth/magic/consume - Second use (should fail)
def test_magic_consume_reuse(token):
    print_test("POST /api/auth/magic/consume - Reuse Token (Should Fail)")
    try:
        resp = requests.post(f"{BASE_URL}/auth/magic/consume", 
                           json={"token": token},
                           timeout=10)
        print_info(f"Status: {resp.status_code}")
        
        if resp.status_code == 400:
            print_pass(f"Correctly rejected reused token with 400")
            return True
        else:
            print_fail(f"Expected 400, got {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        print_fail(f"Exception: {e}")
        return False

# Test 13: GET /api/auth/me - Regular user
def test_auth_me_regular(cookies):
    print_test("GET /api/auth/me - Regular User Session")
    try:
        resp = requests.get(f"{BASE_URL}/auth/me", cookies=cookies, timeout=10)
        print_info(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            user = data.get('user')
            
            if user and user.get('role') == 'user':
                print_pass(f"Regular user session works: {user.get('email')}, role={user.get('role')}")
                return True
            else:
                print_fail(f"User data incorrect: {user}")
                return False
        else:
            print_fail(f"Expected 200, got {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        print_fail(f"Exception: {e}")
        return False

# Test 14: POST /api/stripe/checkout - Admin bypass
def test_stripe_checkout_admin(admin_cookies):
    print_test("POST /api/stripe/checkout - Admin Bypass")
    try:
        resp = requests.post(f"{BASE_URL}/stripe/checkout",
                           json={"reportType": "natal-chart", "birthData": BIRTH_DATA},
                           cookies=admin_cookies,
                           timeout=10)
        print_info(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            url = data.get('url', '')
            
            if 'source=admin' in url:
                print_pass(f"Admin bypass works: {url}")
                return True
            else:
                print_fail(f"URL doesn't contain source=admin: {url}")
                return False
        else:
            print_fail(f"Expected 200, got {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        print_fail(f"Exception: {e}")
        return False

# Test 15: GET /api/purchases - Admin sees all paid
def test_purchases_admin(admin_cookies):
    print_test("GET /api/purchases - Admin View")
    try:
        resp = requests.get(f"{BASE_URL}/purchases", cookies=admin_cookies, timeout=10)
        print_info(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            purchases = data.get('purchases', [])
            
            if len(purchases) > 0:
                print_pass(f"Admin purchases view works: {len(purchases)} purchases")
                return True
            else:
                print_fail(f"No purchases returned for admin")
                return False
        else:
            print_fail(f"Expected 200, got {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        print_fail(f"Exception: {e}")
        return False

# Test 16: POST /api/reports/generate - Admin with purchase
def test_generate_report_admin(admin_cookies):
    print_test("POST /api/reports/generate - Admin User")
    try:
        resp = requests.post(f"{BASE_URL}/reports/generate",
                           json={"reportType": "natal-chart", "birthData": BIRTH_DATA},
                           cookies=admin_cookies,
                           timeout=30)
        print_info(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            content = data.get('content', '')
            chart = data.get('chart')
            report_id = data.get('id')
            
            word_count = len(content.split())
            print_info(f"Report ID: {report_id}, Word count: {word_count}")
            
            if report_id and chart and 800 <= word_count <= 1400:
                print_pass(f"Report generation works: {word_count} words, has chart")
                return True
            else:
                print_fail(f"Report incomplete: id={report_id}, chart={chart is not None}, words={word_count}")
                return False
        else:
            print_fail(f"Expected 200, got {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        print_fail(f"Exception: {e}")
        return False

# Test 17: POST /api/reports/generate - Regular user without purchase
def test_generate_report_no_purchase(user_cookies):
    print_test("POST /api/reports/generate - Regular User Without Purchase")
    try:
        resp = requests.post(f"{BASE_URL}/reports/generate",
                           json={"reportType": "love-romance", "birthData": BIRTH_DATA},
                           cookies=user_cookies,
                           timeout=10)
        print_info(f"Status: {resp.status_code}")
        
        if resp.status_code == 402:
            print_pass(f"Correctly rejected unpaid user with 402")
            return True
        else:
            print_fail(f"Expected 402, got {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        print_fail(f"Exception: {e}")
        return False

# Test 18: POST /api/stripe/checkout - Regular user (should return Stripe URL)
def test_stripe_checkout_regular(user_cookies):
    print_test("POST /api/stripe/checkout - Regular User")
    try:
        resp = requests.post(f"{BASE_URL}/stripe/checkout",
                           json={"reportType": "love-romance", "birthData": BIRTH_DATA},
                           cookies=user_cookies,
                           timeout=10)
        print_info(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            url = data.get('url', '')
            
            if 'checkout.stripe.com' in url:
                print_pass(f"Stripe checkout URL returned: {url[:50]}...")
                return True
            else:
                print_fail(f"URL doesn't contain checkout.stripe.com: {url}")
                return False
        else:
            print_fail(f"Expected 200, got {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        print_fail(f"Exception: {e}")
        return False

# Test 19: POST /api/stripe/checkout - Without auth
def test_stripe_checkout_no_auth():
    print_test("POST /api/stripe/checkout - Without Auth (Should Fail)")
    try:
        resp = requests.post(f"{BASE_URL}/stripe/checkout",
                           json={"reportType": "natal-chart", "birthData": BIRTH_DATA},
                           timeout=10)
        print_info(f"Status: {resp.status_code}")
        
        if resp.status_code == 401:
            print_pass(f"Correctly rejected unauthenticated request with 401")
            return True
        else:
            print_fail(f"Expected 401, got {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        print_fail(f"Exception: {e}")
        return False

# Test 20: POST /api/subscribe
def test_subscribe():
    print_test("POST /api/subscribe")
    try:
        resp = requests.post(f"{BASE_URL}/subscribe",
                           json={"email": "sub@example.com", "name": "Sub User", "birthData": BIRTH_DATA},
                           timeout=10)
        print_info(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            if data.get('ok'):
                print_pass(f"Subscribe works: {data}")
                return True
            else:
                print_fail(f"Subscribe didn't return ok: {data}")
                return False
        else:
            print_fail(f"Expected 200, got {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        print_fail(f"Exception: {e}")
        return False

# Test 21: POST /api/auth/logout
def test_logout(cookies):
    print_test("POST /api/auth/logout")
    try:
        resp = requests.post(f"{BASE_URL}/auth/logout", cookies=cookies, timeout=10)
        print_info(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            # Verify session is cleared
            me_resp = requests.get(f"{BASE_URL}/auth/me", cookies=resp.cookies, timeout=10)
            me_data = me_resp.json()
            
            if me_data.get('user') is None:
                print_pass(f"Logout works: session cleared")
                return True
            else:
                print_fail(f"Session not cleared after logout: {me_data}")
                return False
        else:
            print_fail(f"Expected 200, got {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        print_fail(f"Exception: {e}")
        return False

# Main test runner
def main():
    print("\n" + "="*80)
    print("COSMIC BLUEPRINT BACKEND API TEST SUITE")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Admin: {ADMIN_EMAIL}")
    print("="*80)
    
    results = {}
    
    # Basic endpoints
    results['health_check'] = test_health_check()
    results['report_types'] = test_report_types()
    results['geocode'] = test_geocode()
    results['chart'] = test_chart()
    results['chart_no_time'] = test_chart_no_time()
    results['demo_chart'] = test_demo_chart()
    
    # Admin auth flow
    results['admin_login_success'], admin_cookies = test_admin_login_success()
    results['admin_login_fail'] = test_admin_login_fail()
    
    if admin_cookies:
        results['auth_me_admin'] = test_auth_me(admin_cookies)
        results['stripe_checkout_admin'] = test_stripe_checkout_admin(admin_cookies)
        results['purchases_admin'] = test_purchases_admin(admin_cookies)
        results['generate_report_admin'] = test_generate_report_admin(admin_cookies)
    
    # Magic link flow
    results['magic_request'], magic_token = test_magic_request()
    
    if magic_token:
        results['magic_consume_first'], user_cookies = test_magic_consume_first(magic_token)
        results['magic_consume_reuse'] = test_magic_consume_reuse(magic_token)
        
        if user_cookies:
            results['auth_me_regular'] = test_auth_me_regular(user_cookies)
            results['generate_report_no_purchase'] = test_generate_report_no_purchase(user_cookies)
            results['stripe_checkout_regular'] = test_stripe_checkout_regular(user_cookies)
            results['logout'] = test_logout(user_cookies)
    
    # Other tests
    results['stripe_checkout_no_auth'] = test_stripe_checkout_no_auth()
    results['subscribe'] = test_subscribe()
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for v in results.values() if v is True)
    failed = sum(1 for v in results.values() if v is False)
    skipped = sum(1 for v in results.values() if v is None)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result is True else ("❌ FAIL" if result is False else "⏭️  SKIP")
        print(f"{status}: {test_name}")
    
    print("="*80)
    print(f"Total: {total} | Passed: {passed} | Failed: {failed} | Skipped: {skipped}")
    print("="*80)
    
    return passed, failed, skipped

if __name__ == "__main__":
    main()
