# ============================================================
# ATHNEXUS — Model Inference API
# Flask API for Real-time Athlete Selection Predictions
# ============================================================

from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os

app = Flask(__name__)

# =============================
# Load Pre-trained Model
# =============================

MODEL_PATH = "athlete_selector.pkl"
FEATURES_PATH = "model_features.pkl"

if not os.path.exists(MODEL_PATH) or not os.path.exists(FEATURES_PATH):
    raise FileNotFoundError(f"Model files not found. Run train_model.py first.")

model = joblib.load(MODEL_PATH)
feature_cols = joblib.load(FEATURES_PATH)


# =============================
# Health Check Endpoint
# =============================

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "Model API is running"}), 200


# =============================
# Prediction Endpoint
# =============================

@app.route("/predict", methods=["POST"])
def predict():
    """
    Predict athlete selection probability
    
    Expected JSON:
    {
        "Age": 21,
        "exp_years": 4,
        "medals": 3,
        "bmi": 23,
        "sprint": 12.6,
        "pushups": 30,
        "sport": "Football",
        "position": "Forward"
    }
    """
    
    try:
        player_data = request.get_json()
        
        if not player_data:
            return jsonify({"error": "No data provided"}), 400
        
        # Convert to dataframe
        input_df = pd.DataFrame([player_data])
        
        # Encode categorical features
        input_df = pd.get_dummies(input_df)
        
        # Align with training features
        input_df = input_df.reindex(columns=feature_cols, fill_value=0)
        
        # Make prediction
        probability = model.predict_proba(input_df)[0][1]
        prediction = model.predict(input_df)[0]
        
        return jsonify({
            "selection_probability": round(probability * 100, 2),
            "selected": bool(prediction),
            "confidence": round(max(model.predict_proba(input_df)[0]) * 100, 2)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# =============================
# Batch Prediction Endpoint
# =============================

@app.route("/predict_batch", methods=["POST"])
def predict_batch():
    """
    Predict for multiple athletes
    
    Expected JSON:
    {
        "athletes": [
            {"Age": 21, "exp_years": 4, ...},
            {"Age": 20, "exp_years": 3, ...}
        ]
    }
    """
    
    try:
        data = request.get_json()
        athletes = data.get("athletes", [])
        
        if not athletes:
            return jsonify({"error": "No athletes provided"}), 400
        
        results = []
        
        for athlete in athletes:
            input_df = pd.DataFrame([athlete])
            input_df = pd.get_dummies(input_df)
            input_df = input_df.reindex(columns=feature_cols, fill_value=0)
            
            probability = model.predict_proba(input_df)[0][1]
            prediction = model.predict(input_df)[0]
            
            results.append({
                "athlete": athlete,
                "selection_probability": round(probability * 100, 2),
                "selected": bool(prediction)
            })
        
        return jsonify({"predictions": results}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# =============================
# Feature Importance Endpoint
# =============================

@app.route("/feature_importance", methods=["GET"])
def feature_importance():
    """
    Get top important features for model decisions
    """
    
    try:
        importance_dict = {col: importance for col, importance in zip(feature_cols, model.feature_importances_)}
        top_features = sorted(importance_dict.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return jsonify({
            "top_features": [{"feature": f[0], "importance": round(f[1], 4)} for f in top_features]
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# =============================
# Run Server
# =============================

if __name__ == "__main__":
    print("Starting AthNexus ML Inference API...")
    print("Available endpoints:")
    print("  GET  /health                 - Health check")
    print("  POST /predict                - Single prediction")
    print("  POST /predict_batch          - Batch predictions")
    print("  GET  /feature_importance     - Top important features")
    
    app.run(host="0.0.0.0", port=5001, debug=True)
