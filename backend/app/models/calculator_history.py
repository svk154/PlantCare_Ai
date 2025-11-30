# app/models/calculator_history.py
from app import db
from datetime import datetime

class CalculatorHistory(db.Model):
    """Model for storing calculator history"""
    __tablename__ = 'calculator_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    calculation_type = db.Column(db.String(50), nullable=False)  # e.g., 'pesticide', 'fertilizer', etc.
    inputs = db.Column(db.JSON, nullable=False)
    results = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert the model instance to a dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'calculation_type': self.calculation_type,
            'inputs': self.inputs,
            'results': self.results,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
