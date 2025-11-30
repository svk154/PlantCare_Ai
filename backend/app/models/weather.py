# app/models/weather.py
from app import db
from datetime import datetime

class WeatherData(db.Model):
    __tablename__ = 'weather_data'
    id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(128))
    temperature = db.Column(db.Float)
    humidity = db.Column(db.Float)
    weather_condition = db.Column(db.String(64))
    wind_speed = db.Column(db.Float)
    rainfall = db.Column(db.Float)
    forecast_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "location": self.location,
            "temperature": self.temperature,
            "humidity": self.humidity,
            "weather_condition": self.weather_condition,
            "wind_speed": self.wind_speed,
            "rainfall": self.rainfall,
            "forecast_date": self.forecast_date.isoformat() if self.forecast_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
