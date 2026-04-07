#!/usr/bin/env python3
# ============================================================
# ATHNEXUS — ML API Test Suite
# Tests all prediction endpoints
# ============================================================

import requests
import json
import time

# Configuration
ML_API_URL = "http://localhost:5001"
BACKEND_API_URL = "http://localhost:5000"

def print_section(title):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_ml_health():
    """Test if ML API is running"""
    print_section("1️⃣ Testing ML API Health")
    
    try:
        response = requests.get(f"{ML_API_URL}/health")
        print(f"✅ ML API Health: {response.status_code}")
        print(f"   Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ ML API Connection Failed: {e}")
        return False

def test_single_prediction():
    """Test single athlete prediction"""
    print_section("2️⃣ Testing Single Athlete Prediction")
    
    athlete_data = {
        "Age": 21,
        "Height_cm": 180,
        "Weight_kg": 75,
        "BMI": 23.1,
        "MatchExperience": 15,
        "Consistency": 85,
        "MentalStrength": 80,
        "PhysicalReadiness": 82,
        "DisciplineScore": 75,
        "ConsistencyScore": 80,
        "GrowthScore": 78,
        "OverallScore": 82,
        "SleepHours": 8,
        "EnduranceLevel": 85
    }
    
    try:
        response = requests.post(
            f"{ML_API_URL}/predict",
            json=athlete_data,
            timeout=10
        )
        print(f"✅ Prediction Status: {response.status_code}")
        data = response.json()
        print(f"   Selection Probability: {data['selection_probability']:.2f}%")
        print(f"   Selected: {data['selected']}")
        print(f"   Confidence: {data['confidence']:.2f}%")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Prediction Failed: {e}")
        return False

def test_batch_prediction():
    """Test batch athlete predictions"""
    print_section("3️⃣ Testing Batch Predictions")
    
    athletes = [
        {
            "Age": 21, "Height_cm": 180, "Weight_kg": 75, "BMI": 23.1,
            "MatchExperience": 15, "Consistency": 85, "MentalStrength": 80,
            "PhysicalReadiness": 82, "DisciplineScore": 75, "ConsistencyScore": 80,
            "GrowthScore": 78, "OverallScore": 82
        },
        {
            "Age": 20, "Height_cm": 178, "Weight_kg": 72, "BMI": 22.7,
            "MatchExperience": 10, "Consistency": 75, "MentalStrength": 70,
            "PhysicalReadiness": 75, "DisciplineScore": 70, "ConsistencyScore": 72,
            "GrowthScore": 68, "OverallScore": 72
        },
        {
            "Age": 22, "Height_cm": 182, "Weight_kg": 78, "BMI": 23.5,
            "MatchExperience": 20, "Consistency": 90, "MentalStrength": 85,
            "PhysicalReadiness": 88, "DisciplineScore": 85, "ConsistencyScore": 88,
            "GrowthScore": 85, "OverallScore": 88
        }
    ]
    
    try:
        response = requests.post(
            f"{ML_API_URL}/predict_batch",
            json={"athletes": athletes},
            timeout=30
        )
        print(f"✅ Batch Prediction Status: {response.status_code}")
        data = response.json()
        print(f"   Total Athletes: {len(athletes)}")
        print(f"   Predictions per athlete:")
        for i, pred in enumerate(data['predictions'], 1):
            print(f"     {i}. Probability: {pred['selection_probability']:.2f}% | Selected: {pred['selected']}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Batch Prediction Failed: {e}")
        return False

def test_feature_importance():
    """Test feature importance endpoint"""
    print_section("4️⃣ Testing Feature Importance")
    
    try:
        response = requests.get(f"{ML_API_URL}/feature_importance", timeout=10)
        print(f"✅ Feature Importance Status: {response.status_code}")
        data = response.json()
        print(f"   Top 5 Features:")
        for i, feature in enumerate(data['top_features'][:5], 1):
            print(f"     {i}. {feature['feature']}: {feature['importance']:.4f}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Feature Importance Failed: {e}")
        return False

def test_backend_integration():
    """Test Node.js backend integration"""
    print_section("5️⃣ Testing Backend Integration")
    
    athlete_data = {
        "Age": 21,
        "Height_cm": 180,
        "Weight_kg": 75,
        "BMI": 23.1,
        "MatchExperience": 15,
        "Consistency": 85,
        "MentalStrength": 80,
        "PhysicalReadiness": 82,
        "DisciplineScore": 75,
        "ConsistencyScore": 80,
        "GrowthScore": 78,
        "OverallScore": 82
    }
    
    try:
        response = requests.post(
            f"{BACKEND_API_URL}/api/ml/predict",
            json=athlete_data,
            timeout=10
        )
        print(f"✅ Backend Integration Status: {response.status_code}")
        data = response.json()
        print(f"   Success: {data['success']}")
        print(f"   Selection Probability: {data['selectionProbability']:.2f}%")
        print(f"   Confidence: {data['confidence']:.2f}%")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Backend Integration Failed: {e}")
        print(f"   Make sure Node.js backend is running on {BACKEND_API_URL}")
        return False

def run_all_tests():
    """Run all tests"""
    print("\n")
    print("╔════════════════════════════════════════════════════════════╗")
    print("║  AthNexus ML API Test Suite                             ║")
    print("╚════════════════════════════════════════════════════════════╝")
    
    results = []
    
    # Test ML API directly
    if test_ml_health():
        results.append(("ML API Health", True))
        time.sleep(1)
        
        results.append(("Single Prediction", test_single_prediction()))
        time.sleep(1)
        
        results.append(("Batch Predictions", test_batch_prediction()))
        time.sleep(1)
        
        results.append(("Feature Importance", test_feature_importance()))
        time.sleep(1)
    else:
        print("\n⚠️ ML API not running. Skipping ML tests.")
        print("   Start it with: python backend/ml/inference_api.py")
        results.append(("ML API Health", False))
    
    # Test backend integration
    try:
        results.append(("Backend Integration", test_backend_integration()))
    except:
        print("\n⚠️ Backend not running. Skipping backend tests.")
        print("   Start it with: npm run dev (from backend directory)")
        results.append(("Backend Integration", False))
    
    # Print summary
    print_section("📊 Test Summary")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}  | {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Your ML integration is working correctly!")
    else:
        print(f"\n⚠️ {total - passed} test(s) failed. Check the logs above.")
    
    return passed == total

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
