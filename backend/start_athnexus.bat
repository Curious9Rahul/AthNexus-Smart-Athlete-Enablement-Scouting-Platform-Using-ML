#!/bin/bash
# ============================================================
# ATHNEXUS — Full Stack Startup Script
# Starts both Node.js Backend and Python ML API
# ============================================================

echo "🚀 Starting AthNexus Full Stack..."
echo ""

# Set directories
BACKEND_DIR="d:\new_\backend"
ML_DIR="d:\new_\backend\ml"
PYTHON_EXE="d:/new_/.venv/Scripts/python.exe"

# Start ML API in background
echo "📊 Starting ML API (Python Flask)..."
cd "$ML_DIR"
start "ML API" cmd /k "$PYTHON_EXE inference_api.py"
echo "   ✅ ML API started on http://localhost:5001"
echo ""

# Wait a bit for ML API to start
timeout /t 3 /nobreak

# Start Node.js Backend
echo "🔌 Starting Node.js Backend (Express)..."
cd "$BACKEND_DIR"
start "Backend Server" cmd /k "npm run dev"
echo "   ✅ Backend started on http://localhost:5000"
echo ""

echo "================================"
echo "✅ AthNexus is running!"
echo "================================"
echo ""
echo "📍 Frontend:  http://localhost:5173"
echo "📍 Backend:   http://localhost:5000"
echo "📍 ML API:    http://localhost:5001"
echo ""
echo "Available ML Endpoints:"
echo "  POST /api/ml/predict          - Single athlete prediction"
echo "  POST /api/ml/predict_batch    - Batch predictions"
echo "  POST /api/ml/recommend_athletes - Event-based recommendations"
echo "  GET  /api/ml/feature_importance - Model insights"
echo "  GET  /api/ml/health           - Health check"
echo ""
