import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load your trained model and scaler
model = joblib.load("data/als_model.pkl")
scaler = joblib.load("data/als_scaler.pkl")

# Define expected column order based on training (keep the same names used in training)
expected_columns = [
    'pis_score', 
    'ls2slct', 
    'ls3-mpss', 
    'ls4-lcs', 
    'ls5-uss', 
    'ls6-dc',
    'ls1-totalEnglish', 
    'ls1-totalFilipino', 
    'flt-overall-score'
]

@app.route("/api/prediction", methods=["POST"])
def predict():
    data = request.get_json()
    try:
        print("Received data:", data)

        # Mapping from frontend field names to model-trained feature names
        mapped_data = {
            "pis_score": int(data["pis_score"]),
            "ls2slct": int(data["ls2_slct"]),
            "ls3-mpss": int(data["ls3_mpss"]),
            "ls4-lcs": int(data["ls4_lcs"]),
            "ls5-uss": int(data["ls5_uss"]),
            "ls6-dc": int(data["ls6_dc"]),
            "ls1-totalEnglish": int(data["ls1_total_english"]),
            "ls1-totalFilipino": int(data["ls1_total_filipino"])
        }

        # Calculate flt-overall-score and include in data
        flt_score = sum(mapped_data.values())
        mapped_data["flt-overall-score"] = flt_score
        print(f"Calculated flt-overall-score: {flt_score}")

        # Create a DataFrame with the correct feature names and order (ensure order matches the model training)
        df = pd.DataFrame([mapped_data], columns=expected_columns)
        print("Prepared DataFrame:\n", df)

        # Scale the features using the same scaler used during training
        features_scaled = scaler.transform(df)
        print("Features after scaling:", features_scaled)

        # Make prediction
        prediction = model.predict(features_scaled)[0]
        print("Prediction result:", prediction)

        # Return the prediction result (1 = ready, 0 = not ready)
        return jsonify({"ready": int(prediction) == 1})  # 1 = ready

    except KeyError as e:
        print(f"Missing field: {e}")
        return jsonify({"error": f"Invalid or missing field: {e}"}), 400
    except Exception as e:
        print("Prediction error:", e)
        return jsonify({"error": f"Prediction failed: {e}"}), 500


if __name__ == "__main__":
    app.run(debug=True)
