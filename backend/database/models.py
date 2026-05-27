from database.db import db
from datetime import datetime

class User(db.Model):
    __tablename__ = "users"

    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(100), nullable=False)
    email      = db.Column(db.String(150), unique=True, nullable=False)
    password   = db.Column(db.String(255), nullable=False)
    role       = db.Column(db.String(20), default="student")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    predictions = db.relationship("Prediction", backref="user", lazy=True)

    def to_dict(self):
        return {
            "id":    self.id,
            "name":  self.name,
            "email": self.email,
            "role":  self.role,
        }


class Prediction(db.Model):
    __tablename__ = "predictions"

    id          = db.Column(db.Integer, primary_key=True)
    user_id     = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    attendance  = db.Column(db.Float, nullable=False)
    test1       = db.Column(db.Float, nullable=False)
    test2       = db.Column(db.Float, nullable=False)
    assignment  = db.Column(db.Float, nullable=False)
    study_hours = db.Column(db.Float, nullable=False)
    prediction  = db.Column(db.String(10), nullable=False)
    confidence  = db.Column(db.Float, nullable=False)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id":          self.id,
            "attendance":  self.attendance,
            "test1":       self.test1,
            "test2":       self.test2,
            "assignment":  self.assignment,
            "study_hours": self.study_hours,
            "prediction":  self.prediction,
            "confidence":  self.confidence,
            "created_at":  self.created_at.isoformat(),
        }