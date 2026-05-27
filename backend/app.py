from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

model  = joblib.load('model/student_model.pkl')
scaler = joblib.load('model/scaler.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    required = ['attendance','test1','test2','assignment','study_hours']
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    features = [[
        float(data['attendance']),
        float(data['test1']),
        float(data['test2']),
        float(data['assignment']),
        float(data['study_hours'])
    ]]

    scaled     = scaler.transform(features)
    prediction = model.predict(scaled)[0]
    probability = model.predict_proba(scaled)[0]

    result = "PASS" if prediction == 1 else "FAIL"
    confidence = round(float(max(probability)) * 100, 1)

    return jsonify({
        "prediction":  result,
        "confidence":  confidence
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(debug=True)