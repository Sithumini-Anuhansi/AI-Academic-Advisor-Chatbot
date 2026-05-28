from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from datetime import timedelta
import os

load_dotenv()

from database.db import db
from database.models import User, Prediction
from routes.auth import auth_bp
from routes.predictions import predictions_bp
from chatbot.chatbot import generate_advice

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
def chat():
    data       = request.get_json()
    message    = data.get("message", "").strip()
    prediction = data.get("prediction", None)

    if not message:
        return jsonify({"error": "Message is required"}), 400

    advice = generate_advice(message, prediction)
    return jsonify({"message": advice})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True)