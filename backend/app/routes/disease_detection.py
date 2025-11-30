# app/routes/disease_detection.py
import os
import time
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app import db
from app.models.disease import DiseaseDetection, DiseaseInfo
from app.utils.ml_models import predict_plant_disease

disease_bp = Blueprint('disease_detection', __name__)

@disease_bp.route('/detect', methods=['POST'])
@jwt_required()
def detect_disease():
    user_id = get_jwt_identity()
    file = request.files.get('image')
    if not file or not file.filename:
        return jsonify({"error": "No image provided"}), 400
    
    # Validate file type
    allowed_extensions = {'jpg', 'jpeg', 'png', 'gif'}
    if not '.' in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify({"error": "File type not allowed. Only image files (jpg, jpeg, png, gif) are permitted."}), 400
    
    # Check file size (limit to 10MB)
    file_content = file.read()
    file.seek(0)  # Reset file pointer after reading
    file_size = len(file_content)
    if file_size > 10 * 1024 * 1024:  # 10MB
        return jsonify({"error": "File too large. Maximum size is 10MB."}), 400
    
    filename = secure_filename(file.filename)
    # Add timestamp to filename to prevent overwriting
    timestamp = int(time.time())
    filename = f"{timestamp}_{filename}"
    
    save_dir = os.path.join(current_app.root_path, 'static', 'uploads')
    os.makedirs(save_dir, exist_ok=True)
    path = os.path.join(save_dir, filename)
    file.save(path)

    result = predict_plant_disease(path)
    disease_info = DiseaseInfo.query.filter_by(name=result['class']).first()

    detection = DiseaseDetection(
        user_id=user_id,
        image_path=f'static/uploads/{filename}',
        predicted_disease=result['class'],
        scientific_name=getattr(disease_info, 'scientific_name', ''),
        confidence_score=result['confidence'],
        severity=getattr(disease_info, 'severity_levels', ['unknown'])[0] if disease_info else 'unknown',
        details={
            'symptoms': getattr(disease_info, 'symptoms', []),
            'treatment': getattr(disease_info, 'treatment', []),
            'prevention': getattr(disease_info, 'prevention', [])
        }
    )
    db.session.add(detection)
    db.session.commit()

    return jsonify({"result": detection.to_dict()})

@disease_bp.route('/history', methods=['GET'])
@jwt_required()
def detection_history():
    user_id = get_jwt_identity()
    records = DiseaseDetection.query.filter_by(user_id=user_id)\
        .order_by(DiseaseDetection.detected_at.desc()).limit(50).all()
    return jsonify([r.to_dict() for r in records])

@disease_bp.route('/info/<disease_name>', methods=['GET'])
def disease_info(disease_name):
    d = DiseaseInfo.query.filter_by(name=disease_name).first()
    if not d:
        return jsonify({"error": "Disease not found"}), 404
    return jsonify(d.to_dict())

@disease_bp.route('/stats', methods=['GET'])
@jwt_required()
def stats():
    user_id = get_jwt_identity()
    from sqlalchemy import func
    stats = db.session.query(
        DiseaseDetection.predicted_disease,
        func.count(DiseaseDetection.id)
    ).filter_by(user_id=user_id)\
     .group_by(DiseaseDetection.predicted_disease).all()
    return jsonify([{ 'disease': k, 'count': v } for k,v in stats])
