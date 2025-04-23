import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# Database configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '0000',
    'database': 'eals'
}

# Load trained model and scaler
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

# Fetch student scores 
def fetch_student_scores(student_id):
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT 
            score_id,
            pis_score,
            ls2_slct,
            ls3_mpss,
            ls4_lcs,
            ls5_uss,
            ls6_dc,
            ls1_total_english,
            ls1_total_filipino,
            flt_score
        FROM assessment_scores
        WHERE user_id = %s
        ORDER BY score_id DESC
        LIMIT 1
    """
    cursor.execute(query, (student_id,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()

    if not result:
        raise Exception("Student scores not found")
    return result

# Fetch Learning Materials
def get_learning_materials(ls_ids):
    
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT ls_id, material_title, 
        description, file_url
        FROM learning_materials
        WHERE ls_id IN (%s)
    """ % ",".join(["%s"] * len(ls_ids))

    cursor.execute(query, ls_ids)
    materials = cursor.fetchall()

    conn.close()

    # Group by ls_id
    grouped = {}
    for mat in materials:
        ls_id = mat["ls_id"]
        if ls_id not in grouped:
            grouped[ls_id] = []
        grouped[ls_id].append({
            "title": mat["material_title"],
            "url": mat["file_url"]
        })

    return grouped

#Prediction
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
        # Identify weak strands (example: below threshold)
        weak_strands = []
        if data['ls2_slct'] < 10: weak_strands.append(3)
        if data['ls3_mpss'] < 10: weak_strands.append(4)
        if data['ls4_lcs'] < 7: weak_strands.append(5)
        if data['ls5_uss'] < 7: weak_strands.append(6)
        if data['ls6_dc'] < 7: weak_strands.append(7)
        if data['ls1_total_english'] < 12: weak_strands.append(1)
        if data['ls1_total_filipino'] < 12: weak_strands.append(2)
        
        print(f"Identified weak strands: {weak_strands}")  # Debugging line

        materials = get_learning_materials(weak_strands) if prediction == 0 else {}

        return jsonify({
            "ready": int(prediction) == 1,
            "weakStrands": materials
        })

    except KeyError as e:
        print(f"Missing field: {e}")
        return jsonify({"error": f"Invalid or missing field: {e}"}), 400
    except Exception as e:
        print("Prediction error:", e)
        return jsonify({"error": f"Prediction failed: {e}"}), 500


# RECOMMENDATION ROUTE 
@app.route("/api/recommendations", methods=["POST"])
def recommend_materials():
    data = request.get_json()
    student_id = data.get("student_id")
    print("Received student_id:", student_id)


    if not student_id:
        return jsonify({"error": "Missing student_id"}), 400

    try:
        student_scores = fetch_student_scores(student_id)
        print("Student Scores:", student_scores)  # Debug log

        benchmarks = {
            "ls1_total_english": 9,
            "ls1_total_filipino": 9,
            "ls2_slct": 8,
            "ls3_mpss": 9,
            "ls4_lcs": 7,
            "ls5_uss": 8,
            "ls6_dc": 6
        }

        field_to_lsid = {
            "ls1_total_english": 1,
            "ls1_total_filipino": 2,
            "ls2_slct": 3,
            "ls3_mpss": 4,
            "ls4_lcs": 5,
            "ls5_uss": 6,
            "ls6_dc": 7
        }

        weak_ls_ids = []
        for field, benchmark in benchmarks.items():
            if student_scores.get(field, 0) < benchmark:
                weak_ls_ids.append(field_to_lsid[field])

        print("Weak LS IDs from scores:", weak_ls_ids)  # Debug log

        if not weak_ls_ids:
            return jsonify({"ready": True, "weak_areas": []})

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        # Fetch strand data based on the weak LS IDs
        format_strings = ','.join(['%s'] * len(weak_ls_ids))
        cursor.execute(f"SELECT strand_id AS id, strand_name AS name FROM learning_strands WHERE strand_id IN ({format_strings})", tuple(weak_ls_ids))
        strand_data = cursor.fetchall()

        print("Strand Data:", strand_data)  # Debug log

        strand_titles = {s["id"]: s["name"] for s in strand_data}

        cursor.execute(f"SELECT * FROM learning_materials WHERE ls_id IN ({format_strings})", tuple(weak_ls_ids))
        materials = cursor.fetchall()

        grouped = {}
        for mat in materials:
            ls_id = mat["ls_id"]
            if ls_id not in grouped:
                grouped[ls_id] = {
                    "id": ls_id,
                    "title": strand_titles.get(ls_id, f"Strand {ls_id}"),
                    "materials": []
                }
            grouped[ls_id]["materials"].append(mat)

        weak_areas = list(grouped.values())

        cursor.close()
        conn.close()

        return jsonify({
            "ready": False,
            "weak_areas": weak_areas
        })

    except Exception as e:
        print("Error in recommendation:", e)
        
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
