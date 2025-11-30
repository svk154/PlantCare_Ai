# app/routes/weather.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.weather import WeatherData
from datetime import datetime, timedelta

weather_bp = Blueprint('weather', __name__)

@weather_bp.route('/current', methods=['GET'])
@jwt_required()
def current_weather():
    # For demo, returns sample data
    city = request.args.get('location', 'Delhi')
    return jsonify({
        "location": city,
        "temperature": 26.5,
        "humidity": 70,
        "weather_condition": "Partly Cloudy",
        "wind_speed": 15.2,
        "rainfall": 0,
        "forecast_date": datetime.utcnow().date().isoformat(),
        "advice": "Irrigate morning/evening"
    })

@weather_bp.route('/forecast', methods=['GET'])
@jwt_required()
def forecast():
    city = request.args.get('location', 'Delhi')
    days = int(request.args.get('days', 7))
    forecast = []
    today = datetime.utcnow().date()
    for i in range(days):
        forecast.append({
            "date": (today + timedelta(days=i)).isoformat(),
            "temp": 26 + i % 3,
            "weather": ["Cloudy", "Rainy", "Sunny"][i % 3]
        })
    return jsonify({"location": city, "forecast": forecast})

@weather_bp.route('/history', methods=['GET'])
@jwt_required()
def weather_history():
    city = request.args.get('location', 'Delhi')
    days = int(request.args.get('days', 30))
    qs = WeatherData.query.filter(WeatherData.location.ilike(f"%{city}%")).order_by(WeatherData.forecast_date.desc()).limit(days)
    return jsonify([w.to_dict() for w in qs])

@weather_bp.route('/alerts', methods=['GET'])
@jwt_required()
def alerts():
    city = request.args.get('location', 'Delhi')
    return jsonify({
        "alerts": [
            {
                "type": "heat_wave",
                "message": "High temperature expected. Water crops early.",
                "severity": "high"
            }
        ]
    })
