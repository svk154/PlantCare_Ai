# app/models/disease.py
from app import db
from datetime import datetime

class DiseaseDetection(db.Model):
    __tablename__ = 'disease_detections'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    plant_type = db.Column(db.String(50))
    image_path = db.Column(db.String(200))
    predicted_disease = db.Column(db.String(100))
    scientific_name = db.Column(db.String(100))
    confidence_score = db.Column(db.Float)
    severity = db.Column(db.String(20))
    detected_at = db.Column(db.DateTime, default=datetime.utcnow)
    details = db.Column(db.JSON)  # symptoms, treatment, prevention, etc.

    def to_dict(self):
        return {
            "id": self.id,
            "plant_type": self.plant_type,
            "image_path": self.image_path,
            "predicted_disease": self.predicted_disease,
            "scientific_name": self.scientific_name,
            "confidence_score": self.confidence_score,
            "severity": self.severity,
            "detected_at": self.detected_at.isoformat() if self.detected_at else None,
            "details": self.details
        }

class DiseaseInfo(db.Model):
    __tablename__ = 'disease_info'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True)
    scientific_name = db.Column(db.String(100))
    description = db.Column(db.Text)
    symptoms = db.Column(db.JSON)
    treatment = db.Column(db.JSON)
    prevention = db.Column(db.JSON)
    affected_plants = db.Column(db.JSON)
    severity_levels = db.Column(db.JSON)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "scientific_name": self.scientific_name,
            "description": self.description,
            "symptoms": self.symptoms,
            "treatment": self.treatment,
            "prevention": self.prevention,
            "affected_plants": self.affected_plants,
            "severity_levels": self.severity_levels
        }
