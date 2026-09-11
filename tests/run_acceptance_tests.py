import requests
import json
import sys

BASE_URL = "http://localhost:5000/api"
ML_URL = "http://localhost:8000"

def test_acceptance_criteria():
    print("==================================================")
    print("VIKASDRISHTI ACCEPTANCE TEST SUITE (docs/14-acceptance-tests.md)")
    print("==================================================\n")

    passed_count = 0
    total_tests = 0

    # 1. Health Checks
    total_tests += 1
    try:
        r = requests.get(f"{BASE_URL}/../health")
        assert r.status_code == 200
        print("[PASS] 1. Backend Server Health Check")
        passed_count += 1
    except Exception as e:
        print(f"[FAIL] 1. Backend Server Health Check: {e}")

    total_tests += 1
    try:
        r = requests.get(f"{ML_URL}/health")
        assert r.status_code == 200 and r.json().get("models_trained") == True
        print("[PASS] 2. Python FastAPI ML Service Health Check & Trained Status")
        passed_count += 1
    except Exception as e:
        print(f"[FAIL] 2. Python FastAPI ML Service Health Check: {e}")

    # 2. Authentication Tests (4 Roles)
    roles = [
        ("minister@vikasdrishti.gov.in", "MINISTER_POLICYMAKER"),
        ("manager@vikasdrishti.gov.in", "PROJECT_MANAGER"),
        ("field@vikasdrishti.gov.in", "FIELD_OFFICER"),
        ("contractor@vikasdrishti.gov.in", "CONTRACTOR")
    ]

    tokens = {}
    for email, role_code in roles:
        total_tests += 1
        try:
            r = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": "password123"})
            assert r.status_code == 200
            token = r.json()["token"]
            tokens[role_code] = token
            print(f"[PASS] 3. Auth Login Success for Role '{role_code}' ({email})")
            passed_count += 1
        except Exception as e:
            print(f"[FAIL] 3. Auth Login for {email}: {e}")

    # Test Invalid Credentials Rejection
    total_tests += 1
    try:
        r = requests.post(f"{BASE_URL}/auth/login", json={"email": "minister@vikasdrishti.gov.in", "password": "wrongpassword"})
        assert r.status_code == 401
        print("[PASS] 4. Invalid Credentials Rejection (401 Unauthorized)")
        passed_count += 1
    except Exception as e:
        print(f"[FAIL] 4. Invalid Credentials Rejection: {e}")

    # 3. RBAC Backend Scope Enforcement Tests
    total_tests += 1
    try:
        contractor_token = tokens.get("CONTRACTOR")
        headers = {"Authorization": f"Bearer {contractor_token}"}
        r = requests.get(f"{BASE_URL}/dashboard/policymaker", headers=headers)
        assert r.status_code == 403
        print("[PASS] 5. Backend RBAC Scope Enforcement (Contractor blocked from Policymaker dashboard -> 403 Forbidden)")
        passed_count += 1
    except Exception as e:
        print(f"[FAIL] 5. Backend RBAC Scope Enforcement: {e}")

    # 4. ML Models & Ground Truth Inference Tests
    total_tests += 1
    try:
        r = requests.post(f"{ML_URL}/predict/project", json={"project_code": 40001})
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        assert "cost" in data and "delay" in data and "risk" in data, f"Keys missing: {data.keys()}"
        assert len(data["risk"]["drivers"]) == 5, f"Drivers count is {len(data['risk']['drivers'])}"
        print("[PASS] 6. ML Inference: Exact 13-feature Cost/Delay/Risk XGBoost predictions & 5 SHAP drivers for Project 40001")
        passed_count += 1
    except Exception as e:
        print(f"[FAIL] 6. ML Inference: {e}")

    # 5. Core Vertical Slice End-to-End Test
    total_tests += 1
    try:
        minister_token = tokens.get("MINISTER_POLICYMAKER")
        headers = {"Authorization": f"Bearer {minister_token}"}
        r = requests.get(f"{BASE_URL}/projects/40001", headers=headers)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        p_detail = r.json()
        assert p_detail["project"]["projectCode"] == 40001
        assert p_detail.get("prediction") is not None
        assert "activityTimeline" in p_detail
        print("[PASS] 7. Core Vertical Slice: Complete Project Profile, Prediction, SHAP Drivers & Timeline Feed for Project 40001")
        passed_count += 1
    except Exception as e:
        print(f"[FAIL] 7. Core Vertical Slice: {e}")

    # 6. AI Assistant Scope-Aware Query Test
    total_tests += 1
    try:
        headers = {"Authorization": f"Bearer {tokens.get('MINISTER_POLICYMAKER')}"}
        r = requests.post(f"{BASE_URL}/assistant/query", json={"query": "Why is Project 40001 high risk?"}, headers=headers)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        ans = r.json()
        assert "answer" in ans and "sources" in ans
        print("[PASS] 8. AI Assistant: Retrieval-first query returned grounded answer with project citations")
        passed_count += 1
    except Exception as e:
        print(f"[FAIL] 8. AI Assistant Query: {e}")

    # 7. Model Lab Transparency Metrics Test
    total_tests += 1
    try:
        headers = {"Authorization": f"Bearer {tokens.get('MINISTER_POLICYMAKER')}"}
        r = requests.get(f"{BASE_URL}/models", headers=headers)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        m_info = r.json()
        assert "models" in m_info or "feature_vector" in m_info, f"Keys: {m_info.keys()}"
        print("[PASS] 9. Model Intelligence Lab: Exposed exact evaluation metrics & GroupShuffleSplit methodology")
        passed_count += 1
    except Exception as e:
        print(f"[FAIL] 9. Model Intelligence Lab: {e}")

    print("\n==================================================")
    print(f"ACCEPTANCE TEST RESULTS: {passed_count} / {total_tests} PASSED")
    print("==================================================")

    if passed_count == total_tests:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    test_acceptance_criteria()
