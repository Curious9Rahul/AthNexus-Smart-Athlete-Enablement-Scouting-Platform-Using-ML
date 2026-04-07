# 🚀 Quick Start

## 1. Install Dependencies
```bash
pip install -r requirements.txt
```

## 2. Train Model (One Time)
```bash
python train_model.py
```
⏱️ Takes ~30-60 seconds. Generates:
- `athlete_selector.pkl`
- `model_features.pkl`

## 3. Start ML API
```bash
python inference_api.py
```
✅ Available at `http://localhost:5001`

## 4. Test Integration
```bash
python test_api.py
```
Should see: `🎉 All tests passed!`

## 5. Frontend Integration
Frontend is already integrated!
- Calls: `http://localhost:5000/api/ml/*`
- Backend proxies to Python ML API
- No additional setup needed

---

## 📊 Model Files
- `athlete_selector.pkl` (100+ MB) — Use for inference
- `model_features.pkl` (50 KB) — Feature column mapping

**Keep these files safe!** They're needed for predictions.

---

## ⚡ API Endpoints

### Predict Single Athlete
```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"Age": 21, "OverallScore": 82, ...}'
```

### Predict Multiple Athletes
```bash
curl -X POST http://localhost:5001/predict_batch \
  -H "Content-Type: application/json" \
  -d '{"athletes": [{"Age": 21, ...}, ...]}'
```

### Get Top Features
```bash
curl http://localhost:5001/feature_importance
```

---

👉 See `INTEGRATION_GUIDE.md` for detailed documentation
