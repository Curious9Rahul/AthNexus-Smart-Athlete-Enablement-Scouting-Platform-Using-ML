# ============================================================
# ATHNEXUS — Athlete Selection ML Model
# Random Forest Based Player Selection Predictor
# ============================================================

# =============================
# Import Libraries
# =============================

import pandas as pd                      # Data handling
import numpy as np                       # Numerical operations
from sklearn.model_selection import train_test_split   # Split dataset
from sklearn.ensemble import RandomForestClassifier    # ML model
from sklearn.metrics import classification_report      # Evaluation
import joblib                            # Save model


# =============================
# 1️⃣ Load Dataset
# =============================

print("\nLoading dataset...")

# Path to athlete dataset
dataset_path = "../../app/public/athlete_dataset_v3_92k.csv"

df = pd.read_csv(dataset_path)       # Load your CSV file

df.columns = df.columns.str.strip()     # Remove spaces in column names

print("Dataset Loaded Successfully")
print("Shape:", df.shape)
print("Columns:", list(df.columns))


# =============================
# 2️⃣ Prepare Data
# =============================

# Check if target column exists
if "Selected" not in df.columns:
    raise ValueError("'Selected' target column missing in dataset")

# Handle missing values
df.fillna(0, inplace=True)

# Ensure target is integer (0 or 1)
df["Selected"] = df["Selected"].astype(int)


# =============================
# 3️⃣ One Hot Encode Categorical Data
# =============================

# Identify categorical columns
categorical_cols = df.select_dtypes(include=['object']).columns.tolist()

# Drop text description columns for training
text_cols_to_drop = ['StrengthText', 'WeaknessText', 'AthleteID', 'Name']
categorical_cols = [col for col in categorical_cols if col not in text_cols_to_drop]

print(f"Categorical columns to encode: {categorical_cols}")

# One-hot encode categorical features
df_encoded = pd.get_dummies(df, columns=categorical_cols, drop_first=True)


# =============================
# 4️⃣ Feature Selection
# =============================

# Drop non-numeric identifiers and target variable
cols_to_drop = ['Selected', 'AthleteID', 'StrengthText', 'WeaknessText']
cols_to_drop = [col for col in cols_to_drop if col in df_encoded.columns]

X = df_encoded.drop(columns=cols_to_drop, errors='ignore')
y = df_encoded["Selected"]

print(f"\nTotal Features: {len(X.columns)}")
print(f"Feature list: {list(X.columns)[:10]}...")  # Show first 10 features
print(f"\nTarget distribution:\n{y.value_counts()}")


# =============================
# 5️⃣ Train-Test Split
# =============================

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print(f"\nTrain set size: {len(X_train)}")
print(f"Test set size: {len(X_test)}")


# =============================
# 6️⃣ Train Random Forest Model
# =============================

print("\nTraining model...")

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=None,
    random_state=42
)

model.fit(X_train, y_train)

print("Model training complete!")


# =============================
# 7️⃣ Evaluate Model
# =============================

preds = model.predict(X_test)

print("\n===== MODEL EVALUATION =====")
print(classification_report(y_test, preds, target_names=["Not Selected", "Selected"]))


# =============================
# 8️⃣ Feature Importance
# =============================

importance_df = pd.DataFrame({
    "Feature": X.columns,
    "Importance": model.feature_importances_
}).sort_values(by="Importance", ascending=False)

print("\n===== TOP IMPORTANT FEATURES =====")
print(importance_df.head(10))


# =============================
# 9️⃣ Save Model
# =============================

joblib.dump(model, "athlete_selector.pkl")
joblib.dump(X.columns, "model_features.pkl")

print("\n✅ Model saved successfully!")
print("   - athlete_selector.pkl")
print("   - model_features.pkl")


# =============================
# 🔟 Prediction Function
# =============================

def predict_selection(player_dict):

    # Load saved model
    model = joblib.load("athlete_selector.pkl")

    # Load feature columns
    feature_cols = joblib.load("model_features.pkl")

    # Convert input to dataframe
    input_df = pd.DataFrame([player_dict])

    # Encode categorical features
    input_df = pd.get_dummies(input_df)

    # Align with training features
    input_df = input_df.reindex(columns=feature_cols, fill_value=0)

    # Predict probability
    prob = model.predict_proba(input_df)[0][1]

    return prob


# =============================
# 1️⃣1️⃣ Example Prediction
# =============================

if __name__ == "__main__":

    new_player = {
        "Age": 21,
        "Height_cm": 180,
        "Weight_kg": 75,
        "BMI": 23.1,
        "MatchExperience": 15,
        "Consistency": 85,
        "MentalStrength": 80,
        "PhysicalReadiness": 82
    }

    probability = predict_selection(new_player)

    print("\n" + "="*50)
    print("PREDICTION RESULT")
    print("="*50)
    print(f"Selection Probability: {round(probability * 100, 2)}%")
    print("="*50)
