# 🤖 AthNexus ML Model - Athlete Selection Predictor

## Overview
A **Random Forest-based machine learning model** that predicts athlete selection probability based on their performance metrics, experience, and physical attributes.

---

## 📁 Files

- **`train_model.py`** — Training script. Loads athlete data, trains the Random Forest model, and saves it.
- **`inference_api.py`** — Flask API server for real-time predictions.
- **`requirements.txt`** — Python dependencies.

---

## 🚀 Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Prepare Your Data
Place your athlete dataset in CSV format. Expected columns:
- `Age`
- `ExperienceYears` (or `exp_years`)
- `MedalsWon` (or `medals`)
- `Sprint_100m` (or `sprint`)
- `Pushups`
- `BMI`
- `TalentScore`
- `Sport`
- `Position`

### 3. Train the Model
```bash
python train_model.py
```

**Output:**
- `athlete_selector.pkl` — Trained Random Forest model
- `model_features.pkl` — Feature columns used during training

---

## 🔮 Usage

### Option 1: Direct Python Function
```python
from train_model import predict_selection

player = {
    "Age": 21,
    "exp_years": 4,
    "medals": 3,
    "bmi": 23,
    "sprint": 12.6,
    "pushups": 30,
    "sport_Football": 1,
    "position_Forward": 1
}

prob = predict_selection(player)
print(f"Selection Probability: {prob * 100:.2f}%")
```

### Option 2: REST API (Recommended for Backend Integration)
```bash
python inference_api.py
```

**Available Endpoints:**

#### 1. Health Check
```bash
GET /health
```
Response: `{"status": "Model API is running"}`

#### 2. Single Prediction
```bash
POST /predict

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
```

Response:
```json
{
    "selection_probability": 82.45,
    "selected": true,
    "confidence": 92.15
}
```

#### 3. Batch Predictions
```bash
POST /predict_batch

{
    "athletes": [
        {"Age": 21, "exp_years": 4, ...},
        {"Age": 20, "exp_years": 3, ...}
    ]
}
```

#### 4. Feature Importance
```bash
GET /feature_importance
```

Response:
```json
{
    "top_features": [
        {"feature": "talent_score", "importance": 0.2541},
        {"feature": "medals", "importance": 0.1853}
    ]
}
```

---

## 📊 Model Details

- **Algorithm:** Random Forest Classifier (300 trees)
- **Features:** 50+ (including interaction features)
- **Target:** Binary classification (Selected = 1, Not Selected = 0)
- **Threshold:** Talent Score ≥ 75 → Selected
- **Train/Test Split:** 80/20

---

## 🔗 Integration with Node.js Backend

To call the ML API from your Express server:

```javascript
const axios = require('axios');

app.post('/api/athletes/predict', async (req, res) => {
    try {
        const prediction = await axios.post('http://localhost:5000/predict', {
            Age: req.body.age,
            exp_years: req.body.experience,
            medals: req.body.medals,
            bmi: req.body.bmi,
            sprint: req.body.sprint,
            pushups: req.body.pushups,
            sport: req.body.sport,
            position: req.body.position
        });
        
        res.json(prediction.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

---

## 📝 Model Training Output Example

```
===== MODEL EVALUATION =====
              precision    recall  f1-score   support

           0       0.87      0.92      0.89      1245
           1       0.83      0.73      0.78       568

    accuracy                           0.85      1813
    
===== TOP IMPORTANT FEATURES =====
Feature                    Importance
talent_score              0.254102
medals                    0.185341
sprint                    0.142567
bmi_x_sport_Football      0.098234
```

---

## 🎯 Next Steps

- [ ] Integrate with Node.js backend API
- [ ] Add cross-validation for model robustness
- [ ] Implement feature scaling for better predictions
- [ ] Add model versioning/tracking
- [ ] Deploy to production (Docker/AWS)

---

## 📚 Expected Results

When your model is trained with the athlete dataset:
- **Accuracy:** 82-88%
- **F1-Score:** 0.78-0.85
- **Precision:** 0.83-0.90
- **Recall:** 0.70-0.80

