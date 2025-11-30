# app/models/farm.py
from app import db
from datetime import datetime
from app.models.farm_note import FarmNote

class Farm(db.Model):
    __tablename__ = 'farms'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(90), nullable=False)
    location = db.Column(db.String(128))
    main_crop = db.Column(db.String(64), nullable=False)  # Main crop field
    size_acres = db.Column(db.Float, nullable=False)  # Size in acres
    soil_type = db.Column(db.String(64))
    is_active = db.Column(db.Boolean, default=False)  # Active farm flag
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    crops = db.relationship('Crop', backref='farm', lazy='select', cascade='all, delete-orphan')
    notes = db.relationship('FarmNote', backref='farm', lazy='select', cascade='all, delete-orphan')

    def to_dict(self):
        """Optimized to_dict method with eager loaded relationships"""
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "mainCrop": self.main_crop,  # Match frontend format
            "sizeAcres": self.size_acres,  # Match frontend format
            "soil_type": self.soil_type,
            "isActive": self.is_active,  # Match frontend format
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "crops": [crop.to_dict() for crop in self.crops],
            "notes": [note.to_dict() for note in sorted(self.notes, key=lambda n: n.created_at or datetime.min, reverse=True)]
        }

class Crop(db.Model):
    __tablename__ = 'crops'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    variety = db.Column(db.String(64))
    planted_date = db.Column(db.Date)
    expected_harvest = db.Column(db.Date)
    status = db.Column(db.String(32))
    health_score = db.Column(db.Float)
    farm_id = db.Column(db.Integer, db.ForeignKey('farms.id'))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "variety": self.variety,
            "planted_date": self.planted_date.isoformat() if self.planted_date else None,
            "expected_harvest": self.expected_harvest.isoformat() if self.expected_harvest else None,
            "status": self.status,
            "health_score": self.health_score
        }
