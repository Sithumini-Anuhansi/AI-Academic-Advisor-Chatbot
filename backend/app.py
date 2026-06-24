from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
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


@app.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    data    = request.get_json()
    message = data.get("message", "").strip()

    if not message:
        return jsonify({"error": "Message is required"}), 400

    user_id = int(get_jwt_identity())
    latest = (
        Prediction.query.filter_by(user_id=user_id)
        .order_by(Prediction.created_at.desc())
        .first()
    )
    prediction = latest.prediction if latest else data.get("prediction")

    try:
        result = generate_advice(message, prediction)
        return jsonify(result)
    except GeminiQuotaError:
        return jsonify({
            "error": "The AI is currently busy. Please try again in a minute.",
            "retry_after": 60,
        }), 429
    except Exception:
        app.logger.exception("Chat error")
        return jsonify({"error": "An internal server error occurred."}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)