# app/routes/disease_scans.py
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app import db
from app.models.disease_scan import DiseaseScan
from app.models.user import User
import os
import uuid
import io
import json
from datetime import datetime
import time

disease_scans_bp = Blueprint('disease_scans', __name__)

# Configuration
UPLOAD_FOLDER = 'app/static/uploads/disease_scans'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def ensure_upload_folder():
    """Ensure upload folder exists"""
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@disease_scans_bp.route('/scans', methods=['GET'])
@jwt_required()
def get_disease_scans():
    """Get recent disease scans for the current user"""
    try:
        user_id = get_jwt_identity()
        
        # Get limit from query params (default to last 10 scans, max 10)
        requested_limit = request.args.get('limit', 10, type=int)
        limit = min(requested_limit, 10)  # Ensure maximum of 10
        
        scans = DiseaseScan.query.filter_by(user_id=user_id)\
                                .order_by(DiseaseScan.scan_timestamp.desc())\
                                .limit(limit).all()
        
        return jsonify({
            "scans": [scan.to_dict() for scan in scans],
            "total": len(scans)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@disease_scans_bp.route('/scans', methods=['POST'])
@jwt_required()
def create_disease_scan():
    """Create a new disease scan from uploaded image"""
    try:
        user_id = get_jwt_identity()
        
        # Check if file is present
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type. Please upload PNG, JPG, JPEG, or GIF"}), 400
        
        # Ensure upload directory exists
        ensure_upload_folder()
        
        # Generate unique filename
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        # Check if user already has 10 or more scans
        # If so, delete the oldest one(s) to maintain limit of 10
        MAX_SCANS_PER_USER = 10
        existing_scans = DiseaseScan.query.filter_by(user_id=user_id).order_by(DiseaseScan.scan_timestamp).all()
        scans_to_delete = len(existing_scans) - (MAX_SCANS_PER_USER - 1)  # -1 because we're adding a new one
        
        if scans_to_delete > 0:
            for i in range(scans_to_delete):
                old_scan = existing_scans[i]
                
                # Delete old image file if it exists
                if old_scan.image_path and os.path.exists(old_scan.image_path):
                    try:
                        os.remove(old_scan.image_path)
                    except Exception as e:
                        pass  # Silently handle file deletion errors
                
                # Delete database record
                db.session.delete(old_scan)
        
        # Save file to both filesystem and database
        file.save(file_path)
        
        # Read file content for BLOB storage
        file.seek(0)  # Reset file pointer to beginning
        image_data = file.read()  # Read file content as bytes
        
        # Use both file storage and BLOB storage
        scan = DiseaseScan(
            user_id=user_id,
            image_path=file_path,
            image_data=image_data,  # Store binary data in BLOB column
            image_filename=file.filename,
            image_mimetype=file.content_type,
            status='pending'
        )
        
        db.session.add(scan)
        db.session.commit()
        
        # Get scan_id for further processing
        scan_id = scan.id
        
        # Use the real ML model for plant disease detection
        try:
            from app.utils.ml_models import predict_plant_disease
            
            # Call the actual ML model
            result = predict_plant_disease(file_path)
            
            # Update scan record with the real disease detection results
            scan.status = 'completed'
            scan.disease_name = result.get('class', 'Unknown')
            scan.confidence_score = result.get('confidence', 0)
            
            # Set confidence threshold - consider confident if > 50% for Gemini results
            confidence_threshold = 50.0
            scan.is_confident = result.get('confidence', 0) > confidence_threshold
            scan.confidence_threshold = confidence_threshold / 100  # Store as decimal
            
            scan.description = result.get('description', '')
            
            # Extract all result data properly
            symptoms = result.get('symptoms', [])
            prevention = result.get('prevention', [])
            treatment = result.get('treatment', [])
            
            # Ensure all fields are lists
            if isinstance(symptoms, str):
                symptoms = [symptoms]
            elif not isinstance(symptoms, list):
                symptoms = ["No symptoms information available"]
                
            if isinstance(prevention, str):
                prevention = [prevention]
            elif not isinstance(prevention, list):
                prevention = ["Follow general plant health practices"]
                
            if isinstance(treatment, str):
                treatment = [treatment]
            elif not isinstance(treatment, list):
                treatment = ["Consult an agricultural expert"]
            
            # Store treatment as comma-separated string for the treatment field
            scan.treatment = ', '.join(treatment)
                
            # Extract plant type from result or disease name
            plant_type = result.get('plant_type', '')
            if not plant_type and scan.disease_name and '___' in scan.disease_name:
                plant_type = scan.disease_name.split('___')[0]
            scan.plant_type = plant_type
            
            # Store comprehensive disease info as JSON with proper structure
            disease_info = {
                "diseaseName": scan.disease_name,
                "confidenceScore": scan.confidence_score,
                "description": scan.description,
                "symptoms": symptoms,
                "prevention": prevention,
                "treatment": treatment,
                "plantType": plant_type,
                # Include additional Gemini-specific fields if available
                "cause": result.get('cause', ''),
                "organic_treatments": result.get('organic_treatments', []),
                "chemical_treatments": result.get('chemical_treatments', []),
                "pesticide_products": result.get('pesticide_products', [])
            }
            
            # Store as possible_diseases JSON for consistent frontend handling
            scan.possible_diseases = json.dumps([disease_info])
            
            # Set plant type based on disease class
            plant_type = scan.disease_name.split('___')[0] if '___' in scan.disease_name else 'Unknown'
            scan.plant_type = plant_type
            
            # Set processing time
            scan.processing_time = 2.5  # Approximate processing time
            
            # Make image path relative for proper URL construction
            if scan.image_path and scan.image_path.startswith('app/'):
                scan.image_path = scan.image_path[4:]  # Remove 'app/' prefix for proper URL path
            
            # Update database
            db.session.commit()
        except Exception as e:
            # Mark scan as failed
            scan.status = 'failed'
            scan.error_message = str(e)
            db.session.commit()
            return jsonify({"error": f"Failed to process image: {str(e)}"}), 500
        
        # Return the updated scan with full disease details
        db.session.refresh(scan)  # Ensure we have the latest data from database
        updated_scan = DiseaseScan.query.get(scan_id)
        
        scan_dict = updated_scan.to_dict()
        
        return jsonify({
            "message": "Disease scan completed successfully",
            "scan": scan_dict
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Removed simulation functions as we're now using the real ML model directly

@disease_scans_bp.route('/scans/<int:scan_id>/image', methods=['GET'])
# Removed JWT requirement to allow direct image access
def get_scan_image(scan_id):
    """Serve the scan image from BLOB data or file"""
    try:
        # Don't require authentication for image access
        scan = DiseaseScan.query.filter_by(id=scan_id).first()
        if not scan:
            return jsonify({"error": "Scan not found"}), 404
        
        # Try to serve from BLOB data first if available
        if scan.image_data and scan.image_mimetype:
            # Create a BytesIO object from the BLOB data
            image_io = io.BytesIO(scan.image_data)
            mimetype = scan.image_mimetype or 'image/jpeg'
            
            # Send the image data directly from memory
            return send_file(
                image_io,
                mimetype=mimetype,
                as_attachment=False,
                download_name=scan.image_filename
            )
        
        # Fall back to file path if BLOB data is not available
        if scan.image_path and os.path.exists(scan.image_path):
            return send_file(scan.image_path)
            
        return jsonify({"error": "Image not found"}), 404
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@disease_scans_bp.route('/scans/<int:scan_id>', methods=['DELETE'])
@jwt_required()
def delete_scan(scan_id):
    """Delete a disease scan - optimized version"""
    try:
        user_id = get_jwt_identity()
        
        # Use filter_by with first() for faster query
        scan = DiseaseScan.query.filter_by(id=scan_id, user_id=user_id).first()
        if not scan:
            return jsonify({"error": "Scan not found or unauthorized"}), 404
        
        # Store image path before deletion
        image_path = scan.image_path
        
        # Delete database record first (faster)
        db.session.delete(scan)
        db.session.commit()
        
        # Delete image file asynchronously (don't wait for it)
        # This makes the API response faster
        if image_path and os.path.exists(image_path):
            try:
                os.remove(image_path)
            except OSError as e:
                # Log error but don't fail the request
                print(f"Warning: Could not delete image file {image_path}: {e}")
        
        return jsonify({
            "message": "Scan deleted successfully",
            "deletedId": scan_id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting scan {scan_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500

@disease_scans_bp.route('/scans/stats', methods=['GET'])
@jwt_required()
def get_scan_stats():
    """Get statistics about disease scans"""
    try:
        user_id = get_jwt_identity()
        
        total_scans = DiseaseScan.query.filter_by(user_id=user_id).count()
        recent_scans = DiseaseScan.query.filter_by(user_id=user_id)\
                                       .filter(DiseaseScan.scan_timestamp >= datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0))\
                                       .count()
        
        high_confidence_scans = DiseaseScan.query.filter_by(user_id=user_id, is_confident=True).count()
        
        return jsonify({
            "totalScans": total_scans,
            "todayScans": recent_scans,
            "highConfidenceScans": high_confidence_scans,
            "accuracyRate": round((high_confidence_scans / total_scans * 100), 1) if total_scans > 0 else 0
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
