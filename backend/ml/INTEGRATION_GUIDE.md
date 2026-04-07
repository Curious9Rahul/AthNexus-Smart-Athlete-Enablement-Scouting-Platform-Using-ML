# 🚀 ML Backend Integration Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│              http://localhost:5173                      │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Node.js Express Backend                    │
│              http://localhost:5000                      │
│         (/api/ml/* routes proxy to Python)              │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│            Python ML API (Flask)                        │
│              http://localhost:5001                      │
│     (Random Forest Model - athlete_selector.pkl)        │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Step 1: Train the ML Model (One Time)
```bash
cd backend/ml
d:/new_/.venv/Scripts/python.exe train_model.py
```

This generates:
- `athlete_selector.pkl` — Trained Random Forest model
- `model_features.pkl` — Feature columns used in training

### Step 2: Start ML API
```bash
cd backend/ml
d:/new_/.venv/Scripts/python.exe inference_api.py
```

Output:
```
Starting AthNexus ML Inference API...
Available endpoints:
  GET  /health                 - Health check
  POST /predict                - Single prediction
  POST /predict_batch          - Batch predictions
  GET  /feature_importance     - Top important features

 * Running on http://localhost:5001
```

### Step 3: Start Node.js Backend
```bash
cd backend
npm run dev
```

### Step 4: Frontend connects to backend at `http://localhost:5000`

---

## 🔌 API Endpoints

### 1️⃣ Health Check Your ML Integration
```bash
curl http://localhost:5000/api/ml/health
```

**Response:**
```json
{
  "status": "ML API is connected",
  "mlStatus": {
    "status": "Model API is running"
  }
}
```

---

### 2️⃣ Predict Selection for Single Athlete
```bash
curl -X POST http://localhost:5000/api/ml/predict \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

**Response:**
```json
{
  "success": true,
  "selectionProbability": 87.45,
  "selected": true,
  "confidence": 91.23,
  "athleteData": {
    "Age": 21,
    "Height_cm": 180,
    ...
  }
}
```

---

### 3️⃣ Batch Predictions for Multiple Athletes
```bash
curl -X POST http://localhost:5000/api/ml/predict_batch \
  -H "Content-Type: application/json" \
  -d '{
    "athletes": [
      {
        "Age": 21, "Height_cm": 180, "Weight_kg": 75,
        "BMI": 23.1, "OverallScore": 82
      },
      {
        "Age": 20, "Height_cm": 178, "Weight_kg": 72,
        "BMI": 22.7, "OverallScore": 78
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "totalAthletes": 2,
  "predictions": [
    {
      "athlete": { ... },
      "selection_probability": 87.45,
      "selected": true,
      "selectionThreshold": 75,
      "recommendation": "RECOMMENDED"
    },
    {
      "athlete": { ... },
      "selection_probability": 72.30,
      "selected": false,
      "selectionThreshold": 75,
      "recommendation": "REVIEW"
    }
  ],
  "summary": {
    "recommended": 1,
    "needsReview": 1
  }
}
```

---

### 4️⃣ Get Model Feature Importance
```bash
curl http://localhost:5000/api/ml/feature_importance
```

**Response:**
```json
{
  "success": true,
  "topFeatures": [
    {
      "feature": "OverallScore",
      "importance": 0.2017
    },
    {
      "feature": "ConsistencyScore",
      "importance": 0.1012
    },
    {
      "feature": "MentalStrength",
      "importance": 0.0820
    }
  ],
  "description": "Top 10 features that influence athlete selection predictions"
}
```

---

### 5️⃣ Get Athlete Recommendations for an Event
```bash
curl -X POST http://localhost:5000/api/ml/recommend_athletes \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "Football Championship",
    "athletes": [
      { "Age": 21, "Height_cm": 180, ... },
      { "Age": 20, "Height_cm": 178, ... },
      { "Age": 22, "Height_cm": 182, ... }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "eventType": "Football Championship",
  "totalAthletes": 3,
  "recommendations": [
    {
      "rank": 1,
      "athlete": { ... },
      "selection_probability": 89.54,
      "selected": true
    },
    {
      "rank": 2,
      "athlete": { ... },
      "selection_probability": 87.23,
      "selected": true
    }
  ],
  "topCandidates": [...],
  "message": "Top 10 athletes ranked for Football Championship"
}
```

---

## 🔗 Frontend Integration Example

### Using React/Fetch

```jsx
// File: src/hooks/usePredictions.ts

export const usePredictions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Single prediction
  const predictAthlete = async (athleteData) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/ml/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(athleteData)
      });
      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Batch predictions
  const predictAthletes = async (athletesData) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/ml/predict_batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ athletes: athletesData })
      });
      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Get recommendations
  const recommendAthletes = async (eventType, athletesData) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/ml/recommend_athletes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          eventType, 
          athletes: athletesData 
        })
      });
      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return { predictAthlete, predictAthletes, recommendAthletes, loading, error };
};
```

### Using in a Component

```jsx
// File: src/pages/dashboard/EventDetailPage.tsx

import { usePredictions } from '../../hooks/usePredictions';

export const EventDetailPage = ({ eventId }) => {
  const { recommendAthletes, loading } = usePredictions();
  const [recommendations, setRecommendations] = useState(null);

  const handleGetRecommendations = async () => {
    const athletes = await fetchAthletes(); 
    const result = await recommendAthletes('Football Championship', athletes);
    setRecommendations(result.topCandidates);
  };

  return (
    <div>
      <button onClick={handleGetRecommendations} disabled={loading}>
        {loading ? 'Getting Recommendations...' : 'Get AI Recommendations'}
      </button>
      
      {recommendations?.map((rec, idx) => (
        <div key={idx}>
          <h3>#{rec.rank} - {rec.athlete.athleteName}</h3>
          <p>Selection Probability: {rec.selection_probability.toFixed(2)}%</p>
          <p>Status: {rec.selected ? '✅ Recommended' : '⚠️ Review'}</p>
        </div>
      ))}
    </div>
  );
};
```

---

## 📊 Model Performance

**Dataset:** 92,000 athletes
**Algorithm:** Random Forest (300 trees)
**Features:** 81 (including encoded categorical features)

**Results:**
- **Overall Accuracy:** 87%
- **Precision (Selected):** 89%
- **Recall (Selected):** 80%
- **F1-Score:** 0.84

**Top Predictive Features:**
1. OverallScore (20.2%)
2. ConsistencyScore (10.1%)
3. MentalStrength (8.2%)
4. DisciplineScore (8.0%)
5. GrowthScore (7.4%)

---

## 🚨 Troubleshooting

### ML API not connecting?

1. Make sure Python ML API is running:
```bash
cd backend/ml
d:/new_/.venv/Scripts/python.exe inference_api.py
```

2. Check if port 5001 is available:
```powershell
netstat -ano | findstr :5001
```

3. Verify .pkl files exist:
```bash
ls backend/ml/athlete_selector.pkl
ls backend/ml/model_features.pkl
```

### Model accuracy too low?

- Retrain with fresh data: `python train_model.py`
- Check dataset quality and missing values
- Verify feature scaling in preprocessing

### Predictions seem biased?

- Check feature importance: `GET /api/ml/feature_importance`
- Review model training logs for class imbalance
- Implement fairness checks in Frontend

---

## 📝 Next Steps

- [ ] Add model versioning and A/B testing
- [ ] Implement prediction caching for performance
- [ ] Add explainability features (SHAP values)
- [ ] Deploy ML API to cloud (AWS Lambda, GCP Cloud Run)
- [ ] Create monitoring dashboard for model drift
- [ ] Add retraining pipeline (automated daily/weekly)

