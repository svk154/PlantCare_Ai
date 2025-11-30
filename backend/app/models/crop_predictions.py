from app import db
from datetime import datetime

class CropRecommendation(db.Model):
    """Model for storing crop recommendation predictions."""
    
    __tablename__ = 'crop_recommendations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Input parameters
    nitrogen = db.Column(db.Float, nullable=False)
    phosphorus = db.Column(db.Float, nullable=False)  
    potassium = db.Column(db.Float, nullable=False)
    temperature = db.Column(db.Float, nullable=False)
    humidity = db.Column(db.Float, nullable=False)
    ph = db.Column(db.Float, nullable=False)
    rainfall = db.Column(db.Float, nullable=False)
    
    # Prediction results
    predicted_crop = db.Column(db.String(100), nullable=False)
    confidence = db.Column(db.Float, nullable=True)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'nitrogen': self.nitrogen,
            'phosphorus': self.phosphorus,
            'potassium': self.potassium,
            'temperature': self.temperature,
            'humidity': self.humidity,
            'ph': self.ph,
            'rainfall': self.rainfall,
            'predicted_crop': self.predicted_crop,
            'confidence': self.confidence,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class CropYieldPrediction(db.Model):
    """Model for storing crop yield predictions."""
    
    __tablename__ = 'crop_yield_predictions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Input parameters
    crop = db.Column(db.String(100), nullable=False)
    season = db.Column(db.String(50), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    annual_rainfall = db.Column(db.Float, nullable=False)
    fertilizer = db.Column(db.Float, nullable=False)
    pesticide = db.Column(db.Float, nullable=False)
    
    # Prediction results
    predicted_yield = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), default='tons/hectare')
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'crop': self.crop,
            'season': self.season,
            'state': self.state,
            'annual_rainfall': self.annual_rainfall,
            'fertilizer': self.fertilizer,
            'pesticide': self.pesticide,
            'predicted_yield': self.predicted_yield,
            'unit': self.unit,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }