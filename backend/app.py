from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

model = joblib.load('model/student_model.pkl')
scaler = joblib.load('model/scaler.pkl')

@app.route('/predict', methods=['POST'])
def predict():

    data = request.json

    features = [[
        data['attendance'],
        data['test1'],
        data['test2'],
        data['assignment'],
        data['study_hours']
    ]]

    scaled = scaler.transform(features)

    prediction = model.predict(scaled)[0]

    result = "PASS" if prediction == 1 else "FAIL"

    return jsonify({
        "prediction": result
    })

if __name__ == '__main__':
    app.run(debug=True)