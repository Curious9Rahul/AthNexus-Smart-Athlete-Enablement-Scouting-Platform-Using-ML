import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Load the dataset
data = pd.read_csv("../../app/public/athlete_dataset_v3_92k.csv")

# Clean target and drop useless text columns for simple ML
data.fillna(0, inplace=True)
data["Selected"] = data["Selected"].astype(int)

features = data.drop(["Selected", "AthleteID", "StrengthText", "WeaknessText"], axis=1, errors="ignore")
target = data["Selected"]

# One-hot encode categorical features
new_features = pd.get_dummies(features)

# Train Test Split
x_train, x_test, y_train, y_test = train_test_split(new_features.values, target)

# Initialize and Train Model
model = DecisionTreeClassifier(criterion="entropy")
model.fit(x_train, y_train)

# Classification Report
cr = classification_report(y_test, model.predict(x_test))
print(cr)

# Save processed features to CSV
df = pd.DataFrame(new_features)
df.to_csv("Processed_Athlete_Data.csv")

# Example Prediction using the first row of test features
result = model.predict([x_test[0]])
print("\nPrediction for test sample:", result[0])
