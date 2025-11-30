# app/routes/monitored_crops.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.monitored_crop import MonitoredCrop
from app.models.farm import Farm
from app.models.user import User
from datetime import datetime, date

monitored_crops_bp = Blueprint('monitored_crops', __name__)

@monitored_crops_bp.route('/crops', methods=['GET'])
@jwt_required()
def get_monitored_crops():
    """Get all monitored crops for the current user"""
    try:
        user_id = get_jwt_identity()
        crops = MonitoredCrop.query.filter_by(user_id=user_id).order_by(MonitoredCrop.created_at.desc()).all()
        
        return jsonify({
            "crops": [crop.to_dict() for crop in crops]
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@monitored_crops_bp.route('/crops', methods=['POST'])
@jwt_required()
def add_monitored_crop():
    """Add a new monitored crop"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({"error": "Crop name is required"}), 400
        if not data.get('farmName'):
            return jsonify({"error": "Farm name is required"}), 400
        if not data.get('plantingDate'):
            return jsonify({"error": "Planting date is required"}), 400
        
        # Parse planting date
        try:
            planting_date = datetime.strptime(data.get('plantingDate'), '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"error": "Invalid planting date format. Use YYYY-MM-DD"}), 400
        
        # Check if farm exists and belongs to user
        farm = Farm.query.filter_by(name=data.get('farmName'), user_id=user_id).first()
        farm_id = farm.id if farm else None
        
        # Parse expected harvest date if provided
        expected_harvest_date = None
        if data.get('expectedHarvestDate'):
            try:
                expected_harvest_date = datetime.strptime(data.get('expectedHarvestDate'), '%Y-%m-%d').date()
            except ValueError:
                return jsonify({"error": "Invalid expected harvest date format. Use YYYY-MM-DD"}), 400
        
        # Create new monitored crop
        new_crop = MonitoredCrop(
            name=data.get('name'),
            farm_name=data.get('farmName'),
            farm_id=farm_id,
            planting_date=planting_date,
            status=data.get('status', 'Healthy'),
            user_id=user_id,
            variety=data.get('variety'),
            expected_harvest_date=expected_harvest_date,
            health_score=100.0,  # Default health score since frontend no longer sends this
            notes=data.get('notes')
        )
        
        db.session.add(new_crop)
        db.session.commit()
        
        return jsonify({
            "message": "Monitored crop added successfully",
            "crop": new_crop.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@monitored_crops_bp.route('/crops/<int:crop_id>', methods=['PUT'])
@jwt_required()
def update_monitored_crop(crop_id):
    """Update a monitored crop"""
    try:
        user_id = get_jwt_identity()
        crop = MonitoredCrop.query.filter_by(id=crop_id, user_id=user_id).first()
        
        if not crop:
            return jsonify({"error": "Monitored crop not found"}), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if 'name' in data:
            crop.name = data['name']
        if 'farmName' in data:
            crop.farm_name = data['farmName']
            # Update farm_id if farm exists
            farm = Farm.query.filter_by(name=data['farmName'], user_id=user_id).first()
            crop.farm_id = farm.id if farm else None
        if 'plantingDate' in data:
            try:
                crop.planting_date = datetime.strptime(data['plantingDate'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({"error": "Invalid planting date format. Use YYYY-MM-DD"}), 400
        if 'status' in data:
            crop.status = data['status']
        if 'variety' in data:
            crop.variety = data['variety']
        if 'expectedHarvestDate' in data:
            if data['expectedHarvestDate']:
                try:
                    crop.expected_harvest_date = datetime.strptime(data['expectedHarvestDate'], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({"error": "Invalid expected harvest date format. Use YYYY-MM-DD"}), 400
            else:
                crop.expected_harvest_date = None
        # Remove health score update since frontend no longer sends this
        if 'notes' in data:
            crop.notes = data['notes']
        
        crop.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            "message": "Monitored crop updated successfully",
            "crop": crop.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@monitored_crops_bp.route('/crops/<int:crop_id>', methods=['DELETE'])
@jwt_required()
def delete_monitored_crop(crop_id):
    """Delete a monitored crop"""
    try:
        user_id = get_jwt_identity()
        crop = MonitoredCrop.query.filter_by(id=crop_id, user_id=user_id).first()
        
        if not crop:
            return jsonify({"error": "Monitored crop not found"}), 404
        
        db.session.delete(crop)
        db.session.commit()
        
        return jsonify({"message": "Monitored crop deleted successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@monitored_crops_bp.route('/crops/stats', methods=['GET'])
@jwt_required()
def get_crop_stats():
    """Get statistics about monitored crops"""
    try:
        user_id = get_jwt_identity()
        crops = MonitoredCrop.query.filter_by(user_id=user_id).all()
        
        total_crops = len(crops)
        status_counts = {}
        farm_counts = {}
        
        for crop in crops:
            # Count by status
            status = crop.status
            status_counts[status] = status_counts.get(status, 0) + 1
            
            # Count by farm
            farm = crop.farm_name
            farm_counts[farm] = farm_counts.get(farm, 0) + 1
        
        return jsonify({
            "totalCrops": total_crops,
            "statusBreakdown": status_counts,
            "farmBreakdown": farm_counts
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
