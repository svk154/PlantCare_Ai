# app/routes/calculators.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.helpers import calculate_npk_requirements, calculate_pesticide_requirements, calculate_profit_estimation

calc_bp = Blueprint('calculators', __name__)

@calc_bp.route('/fertilizer', methods=['POST'])
@jwt_required()
def fertilizer():
    data = request.json or {}
    crop = data.get('crop')
    area = float(data.get('area', 0))
    unit = data.get('unit', 'hectare')
    if not crop or area <= 0:
        return jsonify({"error": "Invalid input"}), 400
    result = calculate_npk_requirements(crop, area, unit)
    return jsonify(result)

@calc_bp.route('/pesticide', methods=['POST'])
@jwt_required()
def pesticide():
    data = request.json or {}
    pesticide = data.get('pesticide')
    area = float(data.get('area', 0))
    unit = data.get('unit', 'hectare')
    if not pesticide or area <= 0:
        return jsonify({"error": "Invalid input"}), 400
    result = calculate_pesticide_requirements(pesticide, area, unit)
    return jsonify(result)

@calc_bp.route('/profit', methods=['POST'])
@jwt_required()
def profit():
    data = request.json or {}
    crop = data.get('crop')
    area = float(data.get('area', 0))
    unit = data.get('unit', 'acre')
    market_price = float(data.get('market_price', 0))
    input_cost = float(data.get('input_cost', 0))
    if not crop or area <= 0:
        return jsonify({"error": "Invalid input"}), 400
    result = calculate_profit_estimation(crop, area, unit, market_price, input_cost)
    return jsonify(result)

@calc_bp.route('/crop-data', methods=['GET'])
def crop_data():
    # Return list of crops, fertilizers, pesticides configurations
    return jsonify({
        "fertilizer_crops": ["Wheat", "Rice", "Corn", "Tomato", "Potato"],
        "pesticides": ["Neem Oil", "Carbendazim", "Chlorpyrifos", "Copper Oxychloride", "Mancozeb"],
        "units": ["hectare", "acre"]
    })
