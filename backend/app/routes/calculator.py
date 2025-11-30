# app/routes/calculator.py
from flask import Blueprint, request, jsonify, current_app
from app.models.user import User
from app.models.calculator_history import CalculatorHistory
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db

calculator_bp = Blueprint('calculator', __name__, url_prefix='/calculator')

@calculator_bp.route('/save', methods=['POST'])
@jwt_required()
def save_calculation():
    """Save a calculator result to the user's history"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Extract required data
    calculation_type = data.get('calculationType')
    inputs = data.get('inputs')
    results = data.get('results')
    
    if not calculation_type or not inputs or not results:
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        # Create new history entry
        new_calculation = CalculatorHistory(
            user_id=user_id,
            calculation_type=calculation_type,
            inputs=inputs,
            results=results
        )
        
        db.session.add(new_calculation)
        db.session.commit()
        
        return jsonify({
            "message": "Calculation saved successfully",
            "id": new_calculation.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error saving calculation: {str(e)}")
        return jsonify({"error": "Failed to save calculation"}), 500

@calculator_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """Get user's calculation history"""
    user_id = get_jwt_identity()
    
    try:
        history = CalculatorHistory.query.filter_by(user_id=user_id).order_by(
            CalculatorHistory.created_at.desc()
        ).all()
        
        return jsonify({
            "history": [item.to_dict() for item in history]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error retrieving calculation history: {str(e)}")
        return jsonify({"error": "Failed to retrieve calculation history"}), 500

@calculator_bp.route('/history/<int:calculation_id>', methods=['GET'])
@jwt_required()
def get_calculation(calculation_id):
    """Get a specific calculation by ID"""
    user_id = get_jwt_identity()
    
    try:
        calculation = CalculatorHistory.query.filter_by(
            id=calculation_id, 
            user_id=user_id
        ).first()
        
        if not calculation:
            return jsonify({"error": "Calculation not found"}), 404
        
        return jsonify(calculation.to_dict()), 200
        
    except Exception as e:
        current_app.logger.error(f"Error retrieving calculation: {str(e)}")
        return jsonify({"error": "Failed to retrieve calculation"}), 500

@calculator_bp.route('/history/<int:calculation_id>', methods=['DELETE'])
@jwt_required()
def delete_calculation(calculation_id):
    """Delete a specific calculation by ID"""
    user_id = get_jwt_identity()
    
    try:
        calculation = CalculatorHistory.query.filter_by(
            id=calculation_id, 
            user_id=user_id
        ).first()
        
        if not calculation:
            return jsonify({"error": "Calculation not found"}), 404
        
        db.session.delete(calculation)
        db.session.commit()
        
        return jsonify({"message": "Calculation deleted successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting calculation: {str(e)}")
        return jsonify({"error": "Failed to delete calculation"}), 500
