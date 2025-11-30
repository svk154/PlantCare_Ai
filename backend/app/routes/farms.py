# app/routes/farms.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.farm import Farm
from app.models.user import User
from app.models.farm_note import FarmNote
from datetime import datetime

farms_bp = Blueprint('farms', __name__)

@farms_bp.route('', methods=['GET'])
@jwt_required()
def get_farms_no_slash():
    """Get all farms for the current user (no trailing slash) with optimized eager loading"""
    return get_farms()

@farms_bp.route('/', methods=['GET'])
@jwt_required()
def get_farms():
    """Get all farms for the current user with optimized eager loading"""
    try:
        from sqlalchemy.orm import joinedload
        user_id = get_jwt_identity()
        
        # Optimized query with eager loading to prevent N+1 queries
        farms = Farm.query.options(
            joinedload(Farm.crops),
            joinedload(Farm.notes)
        ).filter_by(user_id=user_id).order_by(Farm.created_at.desc()).all()
        
        return jsonify({
            "farms": [farm.to_dict() for farm in farms]
        }), 200
        
    except Exception as e:
        print(f"Error in get_farms: {str(e)}")
        return jsonify({"error": str(e)}), 500

@farms_bp.route('', methods=['POST'])
@jwt_required()
def add_farm_no_slash():
    """Add a new farm (no trailing slash)"""
    return add_farm()

@farms_bp.route('/', methods=['POST'])
@jwt_required()
def add_farm():
    """Add a new farm"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({"error": "Farm name is required"}), 400
        if not data.get('location'):
            return jsonify({"error": "Location is required"}), 400
        if not data.get('mainCrop'):
            return jsonify({"error": "Main crop is required"}), 400
        if not data.get('sizeAcres'):
            return jsonify({"error": "Size in acres is required"}), 400
        
        try:
            size_acres = float(data.get('sizeAcres'))
            if size_acres <= 0:
                return jsonify({"error": "Size must be greater than 0"}), 400
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid size format"}), 400
        
        # Create new farm
        farm = Farm(
            name=data['name'],
            location=data['location'],
            main_crop=data['mainCrop'],
            size_acres=size_acres,
            user_id=user_id
        )
        
        db.session.add(farm)
        db.session.commit()
        
        return jsonify({
            "message": "Farm added successfully",
            "farm": farm.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@farms_bp.route('/<int:farm_id>', methods=['PUT'])
@jwt_required()
def update_farm_no_slash(farm_id):
    """Update a farm (no trailing slash)"""
    return update_farm(farm_id)

@farms_bp.route('/<int:farm_id>', methods=['PUT'])
@jwt_required()
def update_farm(farm_id):
    """Update a farm"""
    try:
        user_id = get_jwt_identity()
        farm = Farm.query.filter_by(id=farm_id, user_id=user_id).first()
        
        if not farm:
            return jsonify({"error": "Farm not found"}), 404
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({"error": "Farm name is required"}), 400
        if not data.get('location'):
            return jsonify({"error": "Location is required"}), 400
        if not data.get('mainCrop'):
            return jsonify({"error": "Main crop is required"}), 400
        if not data.get('sizeAcres'):
            return jsonify({"error": "Size in acres is required"}), 400
        
        try:
            size_acres = float(data.get('sizeAcres'))
            if size_acres <= 0:
                return jsonify({"error": "Size must be greater than 0"}), 400
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid size format"}), 400
        
        # Update farm
        farm.name = data['name']
        farm.location = data['location']
        farm.main_crop = data['mainCrop']
        farm.size_acres = size_acres
        
        db.session.commit()
        
        return jsonify({
            "message": "Farm updated successfully",
            "farm": farm.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@farms_bp.route('/<int:farm_id>', methods=['DELETE'])
@jwt_required()
def delete_farm(farm_id):
    """Delete a farm"""
    try:
        user_id = get_jwt_identity()
        farm = Farm.query.filter_by(id=farm_id, user_id=user_id).first()
        
        if not farm:
            return jsonify({"error": "Farm not found"}), 404
        
        # Delete related records to avoid foreign key constraint issues
        # 1. Delete monitored crops that reference this farm
        from app.models.monitored_crop import MonitoredCrop
        monitored_crops = MonitoredCrop.query.filter_by(farm_id=farm_id).all()
        for crop in monitored_crops:
            db.session.delete(crop)
        
        # 2. Delete any crops from the embedded Crop model in farm.py
        if hasattr(farm, 'crops'):
            for crop in farm.crops:
                db.session.delete(crop)
        
        # 3. Farm notes will be deleted automatically due to cascade='all, delete-orphan'
        
        # Delete the farm
        db.session.delete(farm)
        db.session.commit()
        
        return jsonify({"message": "Farm deleted successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting farm {farm_id}: {str(e)}")  # Add logging
        return jsonify({"error": f"Failed to delete farm: {str(e)}"}), 500

@farms_bp.route('/<int:farm_id>/set-active', methods=['PUT'])
@jwt_required()
def set_active_farm_no_slash(farm_id):
    """Set a farm as active (no trailing slash)"""
    return set_active_farm(farm_id)

@farms_bp.route('/<int:farm_id>/set-active', methods=['PUT'])
@jwt_required()
def set_active_farm(farm_id):
    """Set a farm as active (only one farm can be active at a time)"""
    try:
        user_id = get_jwt_identity()
        
        # First, deactivate all farms for this user
        Farm.query.filter_by(user_id=user_id).update({'is_active': False})
        
        # Find and activate the specified farm
        farm = Farm.query.filter_by(id=farm_id, user_id=user_id).first()
        
        if not farm:
            return jsonify({"error": "Farm not found"}), 404
        
        farm.is_active = True
        db.session.commit()
        
        return jsonify({
            "message": "Farm set as active successfully",
            "farm": farm.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@farms_bp.route('/active', methods=['GET'])
@jwt_required()
def get_active_farm_no_slash():
    """Get the currently active farm (no trailing slash)"""
    return get_active_farm()

@farms_bp.route('/active', methods=['GET'])
@jwt_required()
def get_active_farm():
    """Get the currently active farm"""
    try:
        user_id = get_jwt_identity()
        farm = Farm.query.filter_by(user_id=user_id, is_active=True).first()
        
        if not farm:
            return jsonify({"message": "No active farm found"}), 404
        
        return jsonify({
            "farm": farm.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@farms_bp.route('/<int:farm_id>/notes', methods=['GET'])
@jwt_required()
def get_farm_notes_no_slash(farm_id):
    """Get all notes for a specific farm (no trailing slash)"""
    return get_farm_notes(farm_id)

@farms_bp.route('/<int:farm_id>/notes', methods=['GET'])
@jwt_required()
def get_farm_notes(farm_id):
    """Get all notes for a specific farm"""
    try:
        user_id = get_jwt_identity()
        farm = Farm.query.filter_by(id=farm_id, user_id=user_id).first()
        
        if not farm:
            return jsonify({"error": "Farm not found"}), 404
        
        notes = FarmNote.query.filter_by(farm_id=farm_id).order_by(FarmNote.created_at.desc()).all()
        
        return jsonify({
            "notes": [note.to_dict() for note in notes]
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@farms_bp.route('/<int:farm_id>/notes', methods=['POST'])
@jwt_required()
def add_farm_note(farm_id):
    """Add a new note to a farm"""
    try:
        user_id = get_jwt_identity()
        farm = Farm.query.filter_by(id=farm_id, user_id=user_id).first()
        
        if not farm:
            return jsonify({"error": "Farm not found"}), 404
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('content'):
            return jsonify({"error": "Note content is required"}), 400
        
        # Create new note
        note = FarmNote(
            content=data.get('content'),
            farm_id=farm_id,
            user_id=user_id
        )
        
        db.session.add(note)
        db.session.commit()
        
        return jsonify({
            "message": "Note added successfully",
            "note": note.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@farms_bp.route('/<int:farm_id>/notes/<int:note_id>', methods=['PUT'])
@jwt_required()
def update_farm_note(farm_id, note_id):
    """Update a farm note"""
    try:
        user_id = get_jwt_identity()
        note = FarmNote.query.filter_by(id=note_id, farm_id=farm_id, user_id=user_id).first()
        
        if not note:
            return jsonify({"error": "Note not found"}), 404
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('content'):
            return jsonify({"error": "Note content is required"}), 400
        
        # Update note
        note.content = data.get('content')
        note.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            "message": "Note updated successfully",
            "note": note.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@farms_bp.route('/<int:farm_id>/notes/<int:note_id>', methods=['DELETE'])
@jwt_required()
def delete_farm_note(farm_id, note_id):
    """Delete a farm note"""
    try:
        user_id = get_jwt_identity()
        note = FarmNote.query.filter_by(id=note_id, farm_id=farm_id, user_id=user_id).first()
        
        if not note:
            return jsonify({"error": "Note not found"}), 404
        
        db.session.delete(note)
        db.session.commit()
        
        return jsonify({
            "message": "Note deleted successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
