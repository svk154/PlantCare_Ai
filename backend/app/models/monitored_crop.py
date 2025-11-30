# app/models/monitored_crop.py
from app import db
from datetime import datetime, date

class MonitoredCrop(db.Model):
    __tablename__ = 'monitored_crops'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # e.g., "Wheat (HD-3086)"
    farm_name = db.Column(db.String(90), nullable=False)  # Reference to farm name
    farm_id = db.Column(db.Integer, db.ForeignKey('farms.id'), nullable=True)  # Optional FK to farms table
    planting_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.Enum('Healthy', 'Needs Attention', 'Harvested', name='crop_status'), 
                      default='Healthy', nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Additional fields for better tracking
    variety = db.Column(db.String(100))  # Crop variety
    expected_harvest_date = db.Column(db.Date)
    health_score = db.Column(db.Float, default=100.0)  # Health percentage
    notes = db.Column(db.Text)  # Additional notes
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "farmName": self.farm_name,
            "farmId": self.farm_id,
            "plantingDate": self.planting_date.isoformat() if self.planting_date else None,
            "status": self.status,
            "variety": self.variety,
            "expectedHarvestDate": self.expected_harvest_date.isoformat() if self.expected_harvest_date else None,
            "healthScore": self.health_score,
            "notes": self.notes,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None
        }
    
    def days_since_planting(self):
        """Calculate days since planting"""
        if self.planting_date:
            return (date.today() - self.planting_date).days
        return 0
    
    def days_to_harvest(self):
        """Calculate days until expected harvest"""
        if self.expected_harvest_date:
            return (self.expected_harvest_date - date.today()).days
        return None
