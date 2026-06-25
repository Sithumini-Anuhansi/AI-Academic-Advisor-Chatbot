from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
from datetime import timedelta
import os

load_dotenv()

from database.db import db
from database.models import User, Prediction
from routes.auth import auth_bp
from routes.predictions import predictions_bp
from chatbot.chatbot import generate_advice, GeminiQuotaError

app = Flask(__name__)
CORS(app)

app.config["SECRET_KEY"]                     = os.environ.get("SECRET_KEY")
app.config["JWT_SECRET_KEY"]                 = os.environ.get("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"]       = timedelta(days=7)
app.config["SQLALCHEMY_DATABASE_URI"]        = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
JWTManager(app)

app.register_blueprint(auth_bp)
app.register_blueprint(predictions_bp)

with app.app_context():
    db.create_all()


def _rate_limit_key():
    try:
        return str(get_jwt_identity())
    except Exception:
        return get_remote_address()


limiter = Limiter(
    key_func=_rate_limit_key,
    app=app,
    default_limits=["30 per minute"],
    storage_uri="memory://",
)


@app.route("/chat", methods=["POST"])
@limiter.limit("10 per minute")
@jwt_required()
def chat():
    data    = request.get_json()
    message = data.get("message", "").strip()
    history = data.get("history", [])

    if not message:
        return jsonify({"error": "Message is required"}), 400

    user_id = int(get_jwt_identity())
    latest = (
        Prediction.query.filter_by(user_id=user_id)
        .order_by(Prediction.created_at.desc())
        .first()
    )

    student_context = None
    if latest:
        student_context = {
            "prediction":  latest.prediction,
            "confidence":  latest.confidence,
            "attendance":  latest.attendance,
            "test1":       latest.test1,
            "test2":       latest.test2,
            "assignment":  latest.assignment,
            "study_hours": latest.study_hours,
        }

    try:
        result = generate_advice(message, student_context, history)
        return jsonify(result)
    except GeminiQuotaError:
        return jsonify({
            "error": "The AI is currently busy. Please try again in a minute.",
            "retry_after": 60,
        }), 429
    except Exception:
        app.logger.exception("Chat error")
        return jsonify({"error": "An internal server error occurred."}), 500


@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({
        "error": "You're sending messages too quickly. Please wait a moment.",
        "retry_after": 60,
    }), 429


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)