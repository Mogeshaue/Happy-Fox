#!/usr/bin/env python3
"""
Integration Test Script for Happy Fox LMS
Tests all three flows: Admin, Student, and Mentor
"""

import requests
import json
import sys
from typing import Dict, Any

BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(endpoint: str, method: str = "GET", data: Dict[Any, Any] = None) -> bool:
    """Test a single endpoint and return success status"""
    try:
        url = f"{BASE_URL}{endpoint}"
        
        if method.upper() == "GET":
            response = requests.get(url, timeout=5)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, timeout=5)
        else:
            print(f"❌ Unsupported method: {method}")
            return False
            
        print(f"✅ {method} {endpoint} - Status: {response.status_code}")
        return response.status_code < 400
        
    except requests.exceptions.ConnectionError:
        print(f"❌ {method} {endpoint} - Connection Error (Server not running?)")
        return False
    except requests.exceptions.Timeout:
        print(f"❌ {method} {endpoint} - Timeout")
        return False
    except Exception as e:
        print(f"❌ {method} {endpoint} - Error: {str(e)}")
        return False

def main():
    """Run integration tests for all LMS flows"""
    print("🦊 Happy Fox LMS Integration Test")
    print("=" * 50)
    
    # Test basic API endpoints
    print("\n📡 Testing Basic API Endpoints:")
    basic_tests = [
        "/api/hello/",
        "/api/data/",
    ]
    
    basic_results = []
    for endpoint in basic_tests:
        basic_results.append(test_endpoint(endpoint))
    
    # Test Student Flow endpoints
    print("\n🎓 Testing Student Flow Endpoints:")
    student_tests = [
        "/student-flow/api/dashboard/",
        "/student-flow/api/profile/",
        "/student-flow/api/enrollments/",
        "/student-flow/api/study-groups/",
        "/student-flow/api/goals/",
        "/student-flow/api/resources/",
        "/student-flow/api/analytics/",
        "/student-flow/api/achievements/",
        "/student-flow/api/notifications/",
    ]
    
    student_results = []
    for endpoint in student_tests:
        student_results.append(test_endpoint(endpoint))
    
    # Test Admin Flow endpoints
    print("\n👨‍💼 Testing Admin Flow Endpoints:")
    admin_tests = [
        "/admin-flow/api/dashboard/",
        "/admin-flow/api/users/",
        "/admin-flow/api/organizations/",
        "/admin-flow/api/content/",
        "/admin-flow/api/analytics/",
        "/admin-flow/api/courses/",
        "/admin-flow/api/notifications/",
    ]
    
    admin_results = []
    for endpoint in admin_tests:
        admin_results.append(test_endpoint(endpoint))
    
    # Test Mentor Flow endpoints
    print("\n👨‍🏫 Testing Mentor Flow Endpoints:")
    mentor_tests = [
        "/mentor/",  # Basic mentor endpoint
    ]
    
    mentor_results = []
    for endpoint in mentor_tests:
        mentor_results.append(test_endpoint(endpoint))
    
    # Summary
    print("\n📊 Test Results Summary:")
    print("=" * 50)
    
    basic_success = sum(basic_results)
    basic_total = len(basic_results)
    print(f"Basic API: {basic_success}/{basic_total} endpoints working")
    
    student_success = sum(student_results)
    student_total = len(student_results)
    print(f"Student Flow: {student_success}/{student_total} endpoints working")
    
    admin_success = sum(admin_results)
    admin_total = len(admin_results)
    print(f"Admin Flow: {admin_success}/{admin_total} endpoints working")
    
    mentor_success = sum(mentor_results)
    mentor_total = len(mentor_results)
    print(f"Mentor Flow: {mentor_success}/{mentor_total} endpoints working")
    
    total_success = basic_success + student_success + admin_success + mentor_success
    total_tests = basic_total + student_total + admin_total + mentor_total
    
    print(f"\n🎯 Overall: {total_success}/{total_tests} endpoints working")
    
    if total_success == total_tests:
        print("🎉 All systems operational! LMS integration successful!")
        return 0
    else:
        print("⚠️  Some endpoints failed. Check server logs for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
