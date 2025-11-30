# app/models/calculator_result.py
from app import db
from datetime import datetime

class CalculatorResult(db.Model):
    __tablename__ = 'calculator_results'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    calculator_type = db.Column(db.String(32), nullable=False)  # 'fertilizer', 'pesticide', 'profit'
    input_data = db.Column(db.JSON, nullable=False)  # Store input parameters
    result_data = db.Column(db.JSON, nullable=False)  # Store calculation results
    notes = db.Column(db.String(256))  # Optional notes about the calculation
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "calculator_type": self.calculator_type,
            "input_data": self.input_data,
            "result_data": self.result_data,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
