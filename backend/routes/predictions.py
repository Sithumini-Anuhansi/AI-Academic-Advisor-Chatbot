from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.db import db
from database.models import Prediction
import joblib
import numpy as np

predictions_bp = Blueprint("predictions", __name__)

model  = joblib.load("model/student_model.pkl")
scaler = joblib.load("model/scaler.pkl")


@predictions_bp.route("/predict", methods=["POST"])
@jwt_required()
def predict():
    user_id = int(get_jwt_identity())
    data    = request.get_json()

    required = ["attendance", "test1", "test2", "assignment", "study_hours"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    features = [[
        float(data["attendance"]),
        float(data["test1"]),
        float(data["test2"]),
        float(data["assignment"]),
        float(data["study_hours"]),
    ]]

    scaled      = scaler.transform(features)
    pred        = model.predict(scaled)[0]
    probability = model.predict_proba(scaled)[0]
    result      = "PASS" if pred == 1 else "FAIL"
    confidence  = round(float(max(probability)) * 100, 1)

    record = Prediction(
        user_id     = user_id,
        attendance  = float(data["attendance"]),
        test1       = float(data["test1"]),
        test2       = float(data["test2"]),
        assignment  = float(data["assignment"]),
        study_hours = float(data["study_hours"]),
        prediction  = result,
        confidence  = confidence,
    )
    db.session.add(record)
    db.session.commit()

    return jsonify({"prediction": result, "confidence": confidence})


@predictions_bp.route("/predictions/history", methods=["GET"])
@jwt_required()
def history():
    user_id = int(get_jwt_identity())
    records = Prediction.query.filter_by(user_id=user_id) \
                .order_by(Prediction.created_at.desc()).all()
    return jsonify({"predictions": [r.to_dict() for r in records]})


@predictions_bp.route("/predictions/analytics", methods=["GET"])
@jwt_required()
def analytics():
    user_id = int(get_jwt_identity())
    records = Prediction.query.filter_by(user_id=user_id) \
                .order_by(Prediction.created_at.asc()).all()

    if not records:
        return jsonify({"analytics": None})

    pass_count = sum(1 for r in records if r.prediction == "PASS")
    fail_count = len(records) - pass_count

    trend = [
        {
            "date":       r.created_at.strftime("%d %b"),
            "confidence": r.confidence,
            "result":     r.prediction,
        }
        for r in records
    ]

    subject_data = [
        {
            "subject": "Attendance",
            "value":   round(sum(r.attendance  for r in records) / len(records), 1),
        },
        {
            "subject": "Test 1",
            "value":   round(sum(r.test1       for r in records) / len(records), 1),
        },
        {
            "subject": "Test 2",
            "value":   round(sum(r.test2       for r in records) / len(records), 1),
        },
        {
            "subject": "Assignment",
            "value":   round(sum(r.assignment  for r in records) / len(records), 1),
        },
        {
            "subject": "Study hrs",
            "value":   round(sum(r.study_hours for r in records) / len(records), 1),
        },
    ]

    return jsonify({
        "analytics": {
            "pass_count":   pass_count,
            "fail_count":   fail_count,
            "total":        len(records),
            "trend":        trend,
            "subject_data": subject_data,
        }
    })