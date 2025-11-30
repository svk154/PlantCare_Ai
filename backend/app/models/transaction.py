# app/models/transaction.py
from app import db
from datetime import datetime, date

class FarmLedger(db.Model):
    __tablename__ = 'farm_ledger'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(64), nullable=False)
    note = db.Column(db.String(128))
    transaction_type = db.Column(db.String(16), default='expense')  # 'expense' or 'income'
    transaction_date = db.Column(db.Date, default=date.today)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "amount": self.amount,
            "category": self.category,
            "note": self.note,
            "type": self.transaction_type,
            "date": self.transaction_date.isoformat() if self.transaction_date else None,
            "transaction_date": self.transaction_date.isoformat() if self.transaction_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
