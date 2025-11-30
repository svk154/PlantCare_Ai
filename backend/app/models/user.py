# app/models/user.py
from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(64), nullable=False)
    phone = db.Column(db.String(20))
    date_joined = db.Column(db.DateTime, default=datetime.utcnow)
    role = db.Column(db.String(20), default="user")

    farms = db.relationship('Farm', backref='user', lazy='dynamic')
    disease_detections = db.relationship('DiseaseDetection', backref='user', lazy='dynamic')
    forum_posts = db.relationship('ForumPost', backref='user', lazy='dynamic')
    forum_replies = db.relationship('ForumReply', backref='user', lazy='dynamic')
    transactions = db.relationship('FarmLedger', backref='user', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "phone": self.phone,
            "role": self.role,
            "date_joined": self.date_joined.isoformat() if self.date_joined else None
        }
