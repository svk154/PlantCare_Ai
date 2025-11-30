# app/routes/analytics.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.farm import Farm, Crop
from app.models.monitored_crop import MonitoredCrop
from app.models.disease import DiseaseDetection
from app.models.transaction import FarmLedger
from sqlalchemy import func
from datetime import datetime
from app import db, cache
from flask import request

# Simple in-memory cache for development (replace with Redis in production)
_cache = {}

analytics_bp = Blueprint('analytics', __name__)

def _user_cache_key():
    try:
        uid = get_jwt_identity()
    except Exception:
        uid = 'anon'
    qs = request.query_string.decode() if request.query_string else ''
    return f"{request.path}?uid={uid}&{qs}"

@analytics_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@cache.cached(timeout=180, key_prefix=_user_cache_key)
def dashboard():
    """Optimized dashboard stats with single aggregated query and simple caching"""
    user_id = get_jwt_identity()
    
    # Note: Additional in-function cache not needed when using Flask-Caching
    
    # Single optimized query for all basic stats using subqueries
    farm_count = db.session.query(func.count(Farm.id)).filter_by(user_id=user_id).scalar()
    crop_count = db.session.query(func.count(MonitoredCrop.id)).filter_by(user_id=user_id).scalar()
    scans = db.session.query(func.count(DiseaseDetection.id)).filter_by(user_id=user_id).scalar()
    total_expenses = db.session.query(func.coalesce(func.sum(FarmLedger.amount), 0)).filter_by(
        user_id=user_id, transaction_type="expense"
    ).scalar()
    
    result = {
        "farm_count": farm_count,
        "crop_count": crop_count,
        "disease_scans": scans,
        "total_expenses": float(total_expenses or 0)
    }
    
    return jsonify(result)

@analytics_bp.route('/crop-health', methods=['GET'])
@jwt_required()
@cache.cached(timeout=120, key_prefix=_user_cache_key)
def crop_health():
    """Optimized crop health query with better indexing"""
    user_id = get_jwt_identity()
    
    # Optimized query with explicit column selection
    crops = db.session.query(
        MonitoredCrop.name,
        MonitoredCrop.status,
        MonitoredCrop.health_score
    ).filter_by(user_id=user_id).all()
    
    data = [{
        "crop": crop.name,
        "status": crop.status,
        "health_score": crop.health_score
    } for crop in crops]
    return jsonify(data)

@analytics_bp.route('/financial', methods=['GET'])
@jwt_required()
@cache.cached(timeout=60, key_prefix=_user_cache_key)
def financial():
    user_id = get_jwt_identity()
    transactions = FarmLedger.query.filter_by(user_id=user_id).all()
    expenses = sum(t.amount for t in transactions if t.transaction_type == "expense")
    income = sum(t.amount for t in transactions if t.transaction_type == "income")
    return jsonify({"total_expenses": expenses, "total_income": income})

@analytics_bp.route('/disease-trends', methods=['GET'])
@jwt_required()
@cache.cached(timeout=300, key_prefix=_user_cache_key)
def disease_trends():
    user_id = get_jwt_identity()
    from sqlalchemy import extract
    one_year_ago = func.date(func.now(), '-1 year')
    trends = DiseaseDetection.query.filter(
        DiseaseDetection.user_id == user_id,
    ).with_entities(
        extract('month', DiseaseDetection.detected_at).label('month'),
        func.count(DiseaseDetection.id)
    ).group_by('month').all()
    return jsonify([{"month": int(month), "count": int(count)} for month, count in trends])

@analytics_bp.route('/disease-counts', methods=['GET'])
@jwt_required()
@cache.cached(timeout=180, key_prefix=_user_cache_key)
def disease_counts():
    """Enhanced grouping of disease detections by disease type with additional metrics"""
    user_id = get_jwt_identity()
    
    # Get disease counts with additional metrics
    results = db.session.query(
        DiseaseDetection.predicted_disease,
        func.count(DiseaseDetection.id).label('count'),
        func.avg(DiseaseDetection.confidence_score).label('avg_confidence'),
        func.max(DiseaseDetection.detected_at).label('last_detection')
    ).filter(
        DiseaseDetection.user_id == user_id,
        DiseaseDetection.predicted_disease.isnot(None)  # Exclude null disease names
    ).group_by(DiseaseDetection.predicted_disease).order_by(func.count(DiseaseDetection.id).desc()).all()
    
    return jsonify([
        {
            "disease": disease, 
            "count": int(count),
            "avg_confidence": round(float(avg_confidence or 0), 2),
            "last_detection": last_detection.isoformat() if last_detection else None
        } 
        for disease, count, avg_confidence, last_detection in results
    ])

@analytics_bp.route('/expense-categories', methods=['GET'])
@jwt_required()
@cache.cached(timeout=120, key_prefix=_user_cache_key)
def expense_categories():
    """Simple grouping of expenses by category"""
    user_id = get_jwt_identity()
    
    results = db.session.query(
        FarmLedger.category,
        func.sum(FarmLedger.amount)
    ).filter(
        FarmLedger.user_id == user_id,
        FarmLedger.transaction_type == 'expense'
    ).group_by(FarmLedger.category).all()
    
    return jsonify([
        {"category": category, "amount": float(amount)}
        for category, amount in results
    ])

@analytics_bp.route('/monthly-expenses', methods=['GET'])
@jwt_required()
@cache.cached(timeout=180, key_prefix=_user_cache_key)
def monthly_expenses():
    """Optimized monthly expenses query with better performance"""
    user_id = get_jwt_identity()
    current_year = datetime.now().year
    
    # Single optimized query with proper indexing
    results = db.session.query(
        func.extract('month', FarmLedger.transaction_date).label('month'),
        func.sum(FarmLedger.amount).label('amount')
    ).filter(
        FarmLedger.user_id == user_id,
        FarmLedger.transaction_type == 'expense',
        func.extract('year', FarmLedger.transaction_date) == current_year
    ).group_by('month').all()
    
    # Create optimized monthly data structure
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    monthly_data = {i+1: {"month": months[i], "amount": 0} for i in range(12)}
    
    # Fill in actual data where available
    for month_num, amount in results:
        if 1 <= int(month_num) <= 12:
            monthly_data[int(month_num)]["amount"] = float(amount or 0)
    
    return jsonify(list(monthly_data.values()))

@analytics_bp.route('/disease-severity', methods=['GET'])
@jwt_required()
@cache.cached(timeout=300, key_prefix=_user_cache_key)
def disease_severity():
    """Disease detections grouped by severity level"""
    user_id = get_jwt_identity()
    
    results = db.session.query(
        DiseaseDetection.severity,
        func.count(DiseaseDetection.id)
    ).filter(
        DiseaseDetection.user_id == user_id,
        DiseaseDetection.severity.isnot(None)
    ).group_by(DiseaseDetection.severity).all()
    
    return jsonify([
        {"severity": severity or "Unknown", "count": int(count)}
        for severity, count in results
    ])

@analytics_bp.route('/recent-diseases', methods=['GET'])
@jwt_required()
@cache.cached(timeout=120, key_prefix=_user_cache_key)
def recent_diseases():
    """Most recent disease detections (last 30 days)"""
    user_id = get_jwt_identity()
    from datetime import datetime, timedelta
    
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    results = db.session.query(
        DiseaseDetection.predicted_disease,
        func.count(DiseaseDetection.id),
        func.avg(DiseaseDetection.confidence_score)
    ).filter(
        DiseaseDetection.user_id == user_id,
        DiseaseDetection.detected_at >= thirty_days_ago,
        DiseaseDetection.predicted_disease.isnot(None)
    ).group_by(DiseaseDetection.predicted_disease).order_by(func.count(DiseaseDetection.id).desc()).all()
    
    return jsonify([
        {
            "disease": disease,
            "count": int(count),
            "avg_confidence": round(float(avg_confidence or 0), 2)
        }
        for disease, count, avg_confidence in results
    ])

@analytics_bp.route('/disease-confidence', methods=['GET'])
@jwt_required()
@cache.cached(timeout=300, key_prefix=_user_cache_key)
def disease_confidence():
    """Disease detection confidence distribution"""
    user_id = get_jwt_identity()
    
    # Group confidence scores into ranges
    confidence_ranges = [
        ("Low (0-50%)", 0, 0.5),
        ("Medium (50-75%)", 0.5, 0.75),
        ("High (75-90%)", 0.75, 0.9),
        ("Very High (90-100%)", 0.9, 1.0)
    ]
    
    result_data = []
    for range_name, min_conf, max_conf in confidence_ranges:
        count = db.session.query(func.count(DiseaseDetection.id)).filter(
            DiseaseDetection.user_id == user_id,
            DiseaseDetection.confidence_score >= min_conf,
            DiseaseDetection.confidence_score < max_conf if max_conf < 1.0 else DiseaseDetection.confidence_score <= max_conf
        ).scalar()
        
        if count > 0:
            result_data.append({"confidence_range": range_name, "count": int(count)})
    
    return jsonify(result_data)
