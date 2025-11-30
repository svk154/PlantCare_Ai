# app/routes/disease_detection.py
import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app import db
from app.models.disease import DiseaseDetection, DiseaseInfo
from app.utils.ml_models import predict_plant_disease
from app.utils.language import with_language, translate_response

disease_bp = Blueprint('disease_detection', __name__)

@disease_bp.route('/detect', methods=['POST'])
# Temporarily commenting out JWT requirement for testing
# @jwt_required()
@with_language
def detect_disease():
    # Temporarily setting a default user for testing
    user_id = 1 # get_jwt_identity()
    
    file = request.files.get('image')
    if not file or not file.filename:
        return jsonify({"error": "No image provided"}), 400

    filename = secure_filename(file.filename)
    save_dir = os.path.join(current_app.root_path, 'static', 'uploads')
    os.makedirs(save_dir, exist_ok=True)
    path = os.path.join(save_dir, filename)
    file.save(path)

    # Get prediction result (back to original format)
    result = predict_plant_disease(path)
    
    # Extract data from the standard format
    disease_class = result.get('class', 'Unknown')
    confidence = result.get('confidence', 0.0)
    symptoms = result.get('symptoms', [])
    treatment = result.get('treatment', [])
    prevention = result.get('prevention', [])
    
    # Determine confidence level for frontend compatibility
    is_confident = confidence >= 70.0
    
    disease_info = DiseaseInfo.query.filter_by(name=disease_class).first()

    description = getattr(disease_info, 'description', '') if disease_info else ''
    # If DB has no description, attempt to use description from model/Gemini result
    if not description:
        description = result.get('description') or ''
    cause = result.get('cause') or ''

    detection = DiseaseDetection(
        user_id=user_id,
        image_path=f'static/uploads/{filename}',
        predicted_disease=disease_class,
        scientific_name=getattr(disease_info, 'scientific_name', ''),
        confidence_score=confidence,
        severity=getattr(disease_info, 'severity_levels', ['unknown'])[0] if disease_info else 'unknown',
        details={
            'description': description,
            'cause': cause,
            'symptoms': symptoms,
            'treatment': treatment,
            'prevention': prevention,
            'isConfident': is_confident,
            'source': 'api_detection'
        }
    )
    
    # Only commit to database if we have a valid user_id
    if user_id:
        try:
            db.session.add(detection)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            # Just log the error but continue to return the prediction
            print(f"Database error: {e}")
    
    # Return the prediction regardless of database success
    # Unified + backward-compatible payload so any frontend variant can consume it
    # Normalize confidence_score to 0-1 for legacy code that multiplies by 100
    legacy_conf_score = confidence / 100.0 if confidence > 1 else confidence

    detection_dict = detection.to_dict()
    if detection_dict.get('details'):
        if 'description' not in detection_dict['details']:
            detection_dict['details']['description'] = description
        if cause and 'cause' not in detection_dict['details']:
            detection_dict['details']['cause'] = cause

    payload = {
        "result": {
            "disease": disease_class,
            "predicted_disease": disease_class,  # convenience alias
            "confidence": confidence,
            "confidence_score": legacy_conf_score,
            "isConfident": is_confident,
            "scientific_name": getattr(disease_info, 'scientific_name', ''),
            "severity": getattr(disease_info, 'severity_levels', ['unknown'])[0] if disease_info else 'unknown',
            "description": description,
            "cause": cause,
            "symptoms": symptoms,
            "treatment": treatment,
            "prevention": prevention,
            "source": "api_detection"
        },
        # Legacy flat keys
        "predicted_disease": disease_class,
        "confidence_score": legacy_conf_score,
        "confidence": confidence,
        "scientific_name": getattr(disease_info, 'scientific_name', ''),
        "severity": getattr(disease_info, 'severity_levels', ['unknown'])[0] if disease_info else 'unknown',
        "details": {
            "description": description,
            "cause": cause,
            "symptoms": symptoms,
            "treatment": treatment,
            "prevention": prevention,
            "isConfident": is_confident,
            "source": "api_detection"
        },
        "detection": detection_dict
    }
    # Pass through structured treatment lists if present for richer frontend usage
    if result.get('organic_treatments') or result.get('chemical_treatments'):
        payload['result']['organic_treatments'] = result.get('organic_treatments', [])
        payload['result']['chemical_treatments'] = result.get('chemical_treatments', [])
        payload['details']['organic_treatments'] = result.get('organic_treatments', [])
        payload['details']['chemical_treatments'] = result.get('chemical_treatments', [])
    
    # Translate the response based on language preference
    translated_payload = translate_response(payload)
    return jsonify(translated_payload)

@disease_bp.route('/history', methods=['GET'])
@jwt_required()
def detection_history():
    user_id = get_jwt_identity()
    detections = DiseaseDetection.query.filter_by(user_id=user_id).order_by(
        DiseaseDetection.created_at.desc()).all()
    return jsonify({
        "history": [detection.to_dict() for detection in detections]
    })
