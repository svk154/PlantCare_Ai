# app/routes/farm_notes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from datetime import datetime
from app.models.farm import Farm
from app.models.farm_note import FarmNote
from app.routes.farms import farms_bp  # Import the farms blueprint

# Farm Notes API endpoints
@farms_bp.route('/<int:farm_id>/notes', methods=['GET'])
@jwt_required()
def get_farm_notes_handler(farm_id):
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
def add_farm_note_handler(farm_id):
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
def update_farm_note_handler(farm_id, note_id):
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
def delete_farm_note_handler(farm_id, note_id):
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
