# app/routes/calculator_results.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.calculator_result import CalculatorResult
from app import db
from sqlalchemy import desc
from app.utils.fertilizer_data import calculate_fertilizer

calculator_results_bp = Blueprint('calculator_results', __name__)

@calculator_results_bp.route('/save', methods=['POST'])
@jwt_required()
def save_calculation():
    """Save a calculator result"""
    user_id = get_jwt_identity()
    data = request.json
    
    if not data or not data.get('calculator_type') or not data.get('input_data') or not data.get('result_data'):
        return jsonify({"error": "Missing required data"}), 400
    
    # Create new calculation result
    new_result = CalculatorResult(
        user_id=user_id,
        calculator_type=data['calculator_type'],
        input_data=data['input_data'],
        result_data=data['result_data'],
        notes=data.get('notes', '')
    )
    
    # Count existing calculator results for this user
    count = CalculatorResult.query.filter_by(user_id=user_id).count()
    
    # If more than 10 results exist, delete the oldest one
    if count >= 10:
        oldest_result = CalculatorResult.query.filter_by(user_id=user_id).order_by(
            CalculatorResult.created_at
        ).first()
        
        if oldest_result:
            db.session.delete(oldest_result)
    
    # Save the new result
    db.session.add(new_result)
    db.session.commit()
    
    return jsonify({"message": "Calculation saved successfully", "id": new_result.id})

@calculator_results_bp.route('/list', methods=['GET'])
@jwt_required()
def list_calculations():
    """Get calculator results for current user (limited to most recent 10)"""
    user_id = get_jwt_identity()
    
    # Get calculator type filter from query params if provided
    calculator_type = request.args.get('type')
    
    # Query with optional type filter
    query = CalculatorResult.query.filter_by(user_id=user_id)
    if calculator_type:
        query = query.filter_by(calculator_type=calculator_type)
    
    # Get most recent 10 results
    results = query.order_by(desc(CalculatorResult.created_at)).limit(10).all()
    
    return jsonify({
        "results": [result.to_dict() for result in results]
    })

@calculator_results_bp.route('/<int:result_id>', methods=['GET'])
@jwt_required()
def get_calculation(result_id):
    """Get a specific calculator result"""
    user_id = get_jwt_identity()
    
    result = CalculatorResult.query.filter_by(id=result_id, user_id=user_id).first()
    
    if not result:
        return jsonify({"error": "Calculator result not found"}), 404
        
    return jsonify(result.to_dict())

@calculator_results_bp.route('/<int:result_id>', methods=['DELETE'])
@jwt_required()
def delete_calculation(result_id):
    """Delete a calculator result"""
    user_id = get_jwt_identity()
    
    result = CalculatorResult.query.filter_by(id=result_id, user_id=user_id).first()
    
    if not result:
        return jsonify({"error": "Calculator result not found"}), 404
    
    db.session.delete(result)
    db.session.commit()
    
    return jsonify({"message": "Calculation deleted successfully"})

@calculator_results_bp.route('/fertilizer', methods=['POST'])
@jwt_required()
def calculate_fertilizer_recommendation():
    """Calculate fertilizer recommendation and save result"""
    current_user_id = get_jwt_identity()
    
    # Get data from request
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Extract required fields
    try:
        crop = data['crop']
        area = float(data['area'])
        area_unit = data['area_unit']
        growth_stage = data['growth_stage']
        
        # Optional fields
        soil_type = data.get('soil_type')
        nutrient_focus = data.get('nutrient_focus')
        
        # Custom crop fields
        custom_crop_name = None
        custom_crop_type = None
        if crop == "other":
            custom_crop_name = data.get('custom_crop_name', 'Custom Crop')
            custom_crop_type = data.get('custom_crop_type', 'general')
    except (KeyError, ValueError) as e:
        return jsonify({"error": f"Invalid input: {str(e)}"}), 400
    
    # Calculate fertilizer recommendation
    result = calculate_fertilizer(
        crop=crop,
        area=area,
        area_unit=area_unit,
        growth_stage=growth_stage,
        soil_type=soil_type,
        nutrient_focus=nutrient_focus,
        custom_crop_name=custom_crop_name,
        custom_crop_type=custom_crop_type
    )
    
    # Check if calculation had an error
    if "error" in result:
        return jsonify({"error": result["error"]}), 400
    
    # Create simplified result data for storage
    storage_result = {
        "N": result["nutrients"]["N"],
        "P": result["nutrients"]["P"],
        "K": result["nutrients"]["K"],
        "fertilizers": [
            {
                "name": rec["name"],
                "amount": rec["amount"],
                "application": rec["application"]
            }
            for rec in result["recommendations"]
        ],
        "advice": result["general_advice"]
    }
    
    # Prepare input data for saving
    input_data = {
        "crop": crop if crop != "other" else custom_crop_name,
        "area": area,
        "unit": area_unit,
        "growth_stage": growth_stage,
        "soil_type": soil_type,
        "nutrient_focus": nutrient_focus
    }
    
    # Add custom crop information if applicable
    if crop == "other":
        input_data["is_custom"] = True
        input_data["custom_crop_type"] = custom_crop_type
    
    # Save calculation result to database
    calculator_result = CalculatorResult(
        user_id=current_user_id,
        calculator_type="fertilizer",
        input_data=input_data,
        result_data=storage_result
    )
    
    db.session.add(calculator_result)
    db.session.commit()
    
    # Return the complete result along with the saved result ID
    return jsonify({
        "success": True,
        "result": result,
        "saved_result": calculator_result.to_dict()
    }), 200

@calculator_results_bp.route('/pesticide', methods=['POST'])
@jwt_required()
def save_pesticide_calculation():
    """Save a pesticide calculation result"""
    current_user_id = get_jwt_identity()
    
    # Get data from request
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    try:
        # Extract data
        inputs = data.get('inputs', {})
        results = data.get('results', {})
        
        # Get crop and pest categories
        crop_value = inputs.get('crop', '')
        pest_value = inputs.get('pest', '')
        
        # Find the category labels
        crop_label = ''
        pest_label = ''
        
        # Common crop and pest categories from the frontend
        crops = [
            { 'value': 'rice', 'label': 'Rice' },
            { 'value': 'wheat', 'label': 'Wheat' },
            { 'value': 'maize', 'label': 'Maize (Corn)' },
            { 'value': 'tomato', 'label': 'Tomatoes' },
            { 'value': 'potato', 'label': 'Potatoes' },
            { 'value': 'cotton', 'label': 'Cotton' },
            { 'value': 'soybean', 'label': 'Soybean' },
            { 'value': 'coffee', 'label': 'Coffee' },
            { 'value': 'apple', 'label': 'Apple' },
            { 'value': 'grapes', 'label': 'Grapes' },
            { 'value': 'citrus', 'label': 'Citrus' },
            { 'value': 'vegetables', 'label': 'Mixed Vegetables' }
        ]
        
        pests = [
            { 'value': 'aphids', 'label': 'Aphids' },
            { 'value': 'caterpillars', 'label': 'Caterpillars' },
            { 'value': 'whiteflies', 'label': 'Whiteflies' },
            { 'value': 'mites', 'label': 'Spider Mites' },
            { 'value': 'thrips', 'label': 'Thrips' },
            { 'value': 'fruitflies', 'label': 'Fruit Flies' },
            { 'value': 'beetles', 'label': 'Beetles' },
            { 'value': 'leafhoppers', 'label': 'Leafhoppers' },
            { 'value': 'stinkbugs', 'label': 'Stink Bugs' },
            { 'value': 'borers', 'label': 'Borers' }
        ]
        
        # Find the matching crop label
        for crop_item in crops:
            if crop_item['value'] == crop_value:
                crop_label = crop_item['label']
                break
        
        # Find the matching pest label
        for pest_item in pests:
            if pest_item['value'] == pest_value:
                pest_label = pest_item['label']
                break
        
        # Structure the input data properly for database storage
        structured_inputs = {
            "crop": inputs.get('crop', ''),
            "crop_label": crop_label,
            "pest": inputs.get('pest', ''),
            "pest_label": pest_label,
            "plot_size": float(inputs.get('plotSize', 0)),
            "area_unit": inputs.get('area_unit', 'hectare'),
            "severity": inputs.get('severity', 'medium'),
            "application_method": inputs.get('application_method', 'foliar'),
            "formulation_type": inputs.get('formulation_type', 'liquid'),
            "gallons_per_acre": inputs.get('gallons_per_acre', ''),
            "tank_capacity": inputs.get('tank_capacity', '100')
        }
        
        # Extract calculation categories if available
        calculation_categories = results.get('calculation_categories', {})
        
        # Structure the results for database storage
        structured_results = {
            "recommended_pesticide": results.get('recommendedPesticide', ''),
            "total_pesticide": results.get('totalPesticide', 0),
            "spray_volume": results.get('sprayVolume', 0),
            "tanks_needed": results.get('tanksNeeded', 0),
            "pesticide_per_tank": results.get('pesticidePerTank', 0),
            "unit": results.get('unit', ''),
            "application_method": results.get('applicationMethod', ''),
            "crop": results.get('crop', ''),
            "pest": results.get('pest', ''),
            "severity": results.get('severity', ''),
            "plot_size": results.get('plotSize', 0),
            "plot_size_ha": results.get('plotSizeHa', 0),
            "schedule_recommendations": results.get('scheduleRecs', []),
            "environmental_note": results.get('environmental_note', ''),
            "general_advice": results.get('general_advice', ''),
            "base_rate": results.get('baseRate', 0),
            "adjusted_rate": results.get('adjustedRate', 0),
            "categories": {
                "crop_type": calculation_categories.get('crop_type', ''),
                "pest_type": calculation_categories.get('pest_type', ''),
                "severity_level": calculation_categories.get('severity_level', ''),
                "application_type": calculation_categories.get('application_type', ''),
                "formulation": calculation_categories.get('formulation', '')
            }
        }
        
        # Save calculation result to database
        calculator_result = CalculatorResult(
            user_id=current_user_id,
            calculator_type="pesticide",
            input_data=structured_inputs,
            result_data=structured_results
        )
        
        # Count existing calculator results for this user of this type
        count = CalculatorResult.query.filter_by(
            user_id=current_user_id,
            calculator_type="pesticide"
        ).count()
        
        # If more than 10 results exist, delete the oldest one
        if count >= 10:
            oldest_result = CalculatorResult.query.filter_by(
                user_id=current_user_id,
                calculator_type="pesticide"
            ).order_by(CalculatorResult.created_at).first()
            
            if oldest_result:
                db.session.delete(oldest_result)
        
        db.session.add(calculator_result)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Pesticide calculation saved successfully",
            "saved_result": calculator_result.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Error saving pesticide calculation: {str(e)}"}), 400
