#!/usr/bin/env python3
"""
Complete API Connection Test Suite
Verifies the entire request-response flow for AthNexus RAG Chatbot
"""

import json
import requests
import time
import sys
from pathlib import Path

# Configuration
API_URL = "http://localhost:8000"
API_ENDPOINTS = {
    "health": f"{API_URL}/api/health",
    "rag_info": f"{API_URL}/api/rag/info",
    "vector_stats": f"{API_URL}/api/vector-db/stats",
    "chat": f"{API_URL}/api/chat",
    "vector_search": f"{API_URL}/api/vector-db/search",
    "documents": f"{API_URL}/api/documents/list",
}

# Test queries grouped by collection
TEST_QUERIES = {
    "college_academics": [
        "What are NCAA GPA requirements for Division 1 athletes?",
        "How do I balance athletics and academics?",
        "What scholarships are available?",
    ],
    "sports_events": [
        "What upcoming basketball championships are there?",
        "Tell me about the Maharashtra football trials",
        "What sports events are available for swimmers?",
    ],
    "training_guides": [
        "What are HIIT exercises and how do I do them?",
        "Can you explain strength training for athletes?",
        "What agility drills are good for football?",
    ],
    "nutrition_advice": [
        "What should I eat before competition?",
        "What's the best post-workout recovery meal?",
        "How much water should I drink during exercise?",
    ],
}

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def print_section(title):
    """Print a formatted section header"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*70}")
    print(f"{title.center(70)}")
    print(f"{'='*70}{Colors.ENDC}\n")


def print_success(message):
    """Print success message"""
    print(f"{Colors.OKGREEN}✓ {message}{Colors.ENDC}")


def print_error(message):
    """Print error message"""
    print(f"{Colors.FAIL}✗ {message}{Colors.ENDC}")


def print_info(message):
    """Print info message"""
    print(f"{Colors.OKCYAN}→ {message}{Colors.ENDC}")


def print_warning(message):
    """Print warning message"""
    print(f"{Colors.WARNING}⚠ {message}{Colors.ENDC}")


def test_endpoint_connectivity():
    """Test if backend API is reachable"""
    print_section("1. ENDPOINT CONNECTIVITY TEST")
    
    try:
        response = requests.get(API_URL, timeout=5)
        print_success(f"Backend is running at {API_URL}")
        print_info(f"Response: {response.json()}")
        return True
    except requests.exceptions.ConnectionError:
        print_error(f"Cannot connect to backend at {API_URL}")
        print_warning("Make sure backend is running: python main.py")
        return False
    except Exception as e:
        print_error(f"Connection error: {e}")
        return False


def test_health_endpoint():
    """Test health check endpoint"""
    print_section("2. HEALTH CHECK TEST")
    
    try:
        response = requests.get(API_ENDPOINTS["health"], timeout=5)
        data = response.json()
        
        print_success(f"Health endpoint responds with status: {data.get('status', 'unknown')}")
        print_info(f"Provider connected: {data.get('provider_connected', False)}")
        print_info(f"Document count: {data.get('document_count', 0)}")
        print_info(f"Vector DB ready: {data.get('vector_db_ready', False)}")
        
        if data.get('provider_connected') and data.get('document_count', 0) > 0:
            print_success("All systems operational!")
            return True
        else:
            print_warning("Some systems may not be fully initialized")
            return False
            
    except Exception as e:
        print_error(f"Failed to check health: {e}")
        return False


def test_vector_db_stats():
    """Test vector database statistics"""
    print_section("3. VECTOR DATABASE STATISTICS")
    
    try:
        response = requests.get(API_ENDPOINTS["vector_stats"], timeout=5)
        data = response.json()
        
        collections = data.get('collections', {})
        for collection_name, stats in collections.items():
            doc_count = stats.get('document_count', 0)
            status = "✓" if doc_count > 0 else "✗"
            print_info(f"{status} {collection_name}: {doc_count} documents")
        
        total_docs = sum(
            stats.get('document_count', 0) 
            for stats in collections.values()
        )
        
        if total_docs > 0:
            print_success(f"Vector database ready with {total_docs} documents")
            return True
        else:
            print_warning("Vector database has no documents")
            print_info("Run: python setup_vector_db.py")
            return False
            
    except Exception as e:
        print_error(f"Failed to get vector DB stats: {e}")
        return False


def test_vector_search():
    """Test direct vector search"""
    print_section("4. VECTOR SEARCH TEST")
    
    test_query = "college GPA requirements"
    
    try:
        response = requests.post(
            API_ENDPOINTS["vector_search"],
            json={"query": test_query, "top_k": 3},
            timeout=10
        )
        data = response.json()
        
        results = data.get('results', [])
        print_success(f"Search for '{test_query}' returned {len(results)} results")
        
        if results:
            for i, result in enumerate(results[:2], 1):
                score = result.get('similarity_score', 0)
                collection = result.get('collection', 'unknown')
                print_info(f"{i}. [{collection}] Score: {score:.4f}")
                print(f"   {result.get('content', '')[:100]}...")
            return True
        else:
            print_warning("No search results found")
            return False
            
    except Exception as e:
        print_error(f"Vector search failed: {e}")
        return False


def test_chat_endpoint(query):
    """Test the chat endpoint with a query"""
    print_info(f"Testing query: '{query}'")
    
    try:
        start_time = time.time()
        response = requests.post(
            API_ENDPOINTS["chat"],
            json={"question": query},
            timeout=30
        )
        elapsed = time.time() - start_time
        
        if response.status_code != 200:
            print_error(f"Chat failed with status {response.status_code}")
            print_info(f"Response: {response.json()}")
            return False
            
        data = response.json()
        answer = data.get('answer', '')
        sources = data.get('sources', [])
        confidence = data.get('confidence', 0)
        retrieval_time = data.get('retrieval_time_ms', 0)
        
        print_success(f"Response received in {elapsed:.2f}s (retrieval: {retrieval_time}ms)")
        print_info(f"Confidence score: {confidence:.4f}")
        print_info(f"Sources found: {len(sources)}")
        print(f"\nAnswer:\n{answer[:200]}...")
        
        return True
        
    except requests.exceptions.Timeout:
        print_error("Request timed out after 30 seconds")
        return False
    except Exception as e:
        print_error(f"Chat request failed: {e}")
        return False


def test_all_collections():
    """Test queries across all collections"""
    print_section("5. COLLECTION-SPECIFIC QUERY TESTS")
    
    results = {}
    for collection, queries in TEST_QUERIES.items():
        print_info(f"\nTesting {collection} collection:")
        success_count = 0
        
        for query in queries[:1]:  # Test first query per collection
            if test_chat_endpoint(query):
                success_count += 1
        
        results[collection] = success_count > 0
    
    return all(results.values())


def test_error_handling():
    """Test error handling"""
    print_section("6. ERROR HANDLING TEST")
    
    tests_passed = 0
    tests_total = 2
    
    # Test empty query
    print_info("Testing empty query error handling...")
    try:
        response = requests.post(
            API_ENDPOINTS["chat"],
            json={"question": ""},
            timeout=5
        )
        if response.status_code == 422:
            print_success("Empty query properly rejected with 422 error")
            tests_passed += 1
        else:
            print_error(f"Expected 422, got {response.status_code}")
    except Exception as e:
        print_error(f"Test failed: {e}")
    
    # Test invalid endpoint
    print_info("Testing invalid endpoint...")
    try:
        response = requests.get(f"{API_URL}/api/invalid", timeout=5)
        if response.status_code == 404:
            print_success("Invalid endpoint properly returned 404")
            tests_passed += 1
        else:
            print_warning(f"Got status {response.status_code}, expected 404")
    except Exception as e:
        print_error(f"Test failed: {e}")
    
    return tests_passed == tests_total


def print_summary(results):
    """Print test results summary"""
    print_section("TEST SUMMARY")
    
    all_passed = all(results.values())
    
    for test_name, passed in results.items():
        status = f"{Colors.OKGREEN}✓ PASSED{Colors.ENDC}" if passed else f"{Colors.FAIL}✗ FAILED{Colors.ENDC}"
        print(f"{status} - {test_name}")
    
    print()
    if all_passed:
        print(f"{Colors.OKGREEN}{Colors.BOLD}ALL TESTS PASSED!{Colors.ENDC}")
        print(f"\n✓ Frontend → Backend API connection is properly configured")
        print(f"✓ Vector database is initialized and functional")
        print(f"✓ RAG chatbot is ready to process user queries")
        print(f"✓ Response flow is complete and working\n")
    else:
        print(f"{Colors.FAIL}{Colors.BOLD}SOME TESTS FAILED{Colors.ENDC}")
        print(f"\nPlease check the errors above and fix any issues.")
        print(f"Common solutions:")
        print(f"  1. Ensure backend is running: python main.py")
        print(f"  2. Initialize vector database: python setup_vector_db.py")
        print(f"  3. Set GROQ_API_KEY in backend/.env\n")
    
    return all_passed


def main():
    """Run all tests"""
    print(f"{Colors.BOLD}AthNexus RAG Chatbot - API Connection Test Suite{Colors.ENDC}")
    print(f"Testing endpoint: {API_URL}\n")
    
    results = {
        "Endpoint Connectivity": False,
        "Health Check": False,
        "Vector DB Statistics": False,
        "Vector Search": False,
        "Collection Queries": False,
        "Error Handling": False,
    }
    
    # Run tests in sequence
    if test_endpoint_connectivity():
        results["Endpoint Connectivity"] = True
        
        if test_health_endpoint():
            results["Health Check"] = True
        
        if test_vector_db_stats():
            results["Vector DB Statistics"] = True
            
            if test_vector_search():
                results["Vector Search"] = True
            
            if test_all_collections():
                results["Collection Queries"] = True
        
        if test_error_handling():
            results["Error Handling"] = True
    
    # Print summary
    all_passed = print_summary(results)
    
    # Exit with appropriate code
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.WARNING}Tests interrupted by user{Colors.ENDC}")
        sys.exit(0)
    except Exception as e:
        print(f"{Colors.FAIL}Unexpected error: {e}{Colors.ENDC}")
        sys.exit(1)
