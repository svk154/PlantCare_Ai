from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from app import db
from app.models.crop_predictions import CropRecommendation, CropYieldPrediction
from app.services.crop_prediction_service import crop_recommendation_service, crop_yield_service
import logging

logger = logging.getLogger(__name__)

crop_prediction_bp = Blueprint('crop_prediction', __name__)

@crop_prediction_bp.route('/recommend-crop', methods=['POST'])
def recommend_crop():
    """
    Recommend crop based on soil and environmental conditions.
    
    Expected JSON payload:
    {
        "N": 90,
        "P": 42, 
        "K": 43,
        "temperature": 20.87,
        "humidity": 82.0,
        "ph": 6.5,
        "rainfall": 202.9
    }
    """
    try:
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Optional JWT verification - allow anonymous usage
        user_id = None
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
        except:
            pass  # Anonymous user
        
        # Validate required fields
        required_fields = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Make prediction
        prediction_result = crop_recommendation_service.predict_crop(data)
        
        if "error" in prediction_result:
            return jsonify(prediction_result), 400
        
        # Save to database
        try:
            crop_recommendation = CropRecommendation(
                user_id=user_id,
                nitrogen=data["N"],
                phosphorus=data["P"],
                potassium=data["K"],
                temperature=data["temperature"],
                humidity=data["humidity"],
                ph=data["ph"],
                rainfall=data["rainfall"],
                predicted_crop=prediction_result["predicted_crop"],
                confidence=prediction_result.get("confidence")
            )
            db.session.add(crop_recommendation)
            db.session.commit()
            
            prediction_result["id"] = crop_recommendation.id
            
        except Exception as e:
            logger.error(f"Error saving crop recommendation: {e}")
            db.session.rollback()
            # Continue without saving to DB
        
        return jsonify(prediction_result), 200
        
    except Exception as e:
        logger.error(f"Error in crop recommendation: {e}")
        return jsonify({"error": "Internal server error"}), 500


@crop_prediction_bp.route('/predict-yield', methods=['POST'])
def predict_yield():
    """
    Predict crop yield based on crop and environmental conditions.
    
    Expected JSON payload:
    {
        "Crop": "Rice",
        "Season": "Kharif",
        "State": "Punjab", 
        "Annual_Rainfall": 1000.0,
        "Fertilizer": 100.0,
        "Pesticide": 50.0
    }
    """
    try:
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Optional JWT verification - allow anonymous usage
        user_id = None
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
        except:
            pass  # Anonymous user
        
        # Validate required fields
        required_fields = ["Crop", "Season", "State", "Annual_Rainfall", "Fertilizer", "Pesticide"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Make prediction
        prediction_result = crop_yield_service.predict_yield(data)
        
        if "error" in prediction_result:
            return jsonify(prediction_result), 400
        
        # Save to database
        try:
            yield_prediction = CropYieldPrediction(
                user_id=user_id,
                crop=data["Crop"],
                season=data["Season"],
                state=data["State"],
                annual_rainfall=data["Annual_Rainfall"],
                fertilizer=data["Fertilizer"],
                pesticide=data["Pesticide"],
                predicted_yield=prediction_result["predicted_yield"],
                unit=prediction_result.get("unit", "tons/hectare")
            )
            db.session.add(yield_prediction)
            db.session.commit()
            
            prediction_result["id"] = yield_prediction.id
            
        except Exception as e:
            logger.error(f"Error saving yield prediction: {e}")
            db.session.rollback()
            # Continue without saving to DB
        
        return jsonify(prediction_result), 200
        
    except Exception as e:
        logger.error(f"Error in yield prediction: {e}")
        return jsonify({"error": "Internal server error"}), 500


@crop_prediction_bp.route('/recommendation-history', methods=['GET'])
@jwt_required()
def get_recommendation_history():
    """Get crop recommendation history for the authenticated user."""
    try:
        user_id = get_jwt_identity()
        
        # Get user's recommendation history
        recommendations = CropRecommendation.query.filter_by(user_id=user_id)\
                                                 .order_by(CropRecommendation.created_at.desc())\
                                                 .limit(50).all()
        
        return jsonify({
            "recommendations": [rec.to_dict() for rec in recommendations],
            "total": len(recommendations)
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching recommendation history: {e}")
        return jsonify({"error": "Internal server error"}), 500


@crop_prediction_bp.route('/yield-history', methods=['GET'])
@jwt_required()
def get_yield_history():
    """Get crop yield prediction history for the authenticated user."""
    try:
        user_id = get_jwt_identity()
        
        # Get user's yield prediction history
        predictions = CropYieldPrediction.query.filter_by(user_id=user_id)\
                                              .order_by(CropYieldPrediction.created_at.desc())\
                                              .limit(50).all()
        
        return jsonify({
            "predictions": [pred.to_dict() for pred in predictions],
            "total": len(predictions)
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching yield history: {e}")
        return jsonify({"error": "Internal server error"}), 500


@crop_prediction_bp.route('/recommendation-history/<int:recommendation_id>', methods=['DELETE'])
@jwt_required()
def delete_recommendation(recommendation_id):
    """Delete a specific crop recommendation from history."""
    try:
        user_id = get_jwt_identity()
        logger.info(f"User {user_id} attempting to delete recommendation {recommendation_id}")
        
        # Find the recommendation belonging to the current user
        recommendation = CropRecommendation.query.filter_by(
            id=recommendation_id, 
            user_id=user_id
        ).first()
        
        if not recommendation:
            logger.warning(f"Recommendation {recommendation_id} not found or unauthorized for user {user_id}")
            return jsonify({"error": "Recommendation not found or unauthorized"}), 404
        
        # Delete the recommendation
        db.session.delete(recommendation)
        db.session.commit()
        
        logger.info(f"Successfully deleted recommendation {recommendation_id} for user {user_id}")
        return jsonify({"message": "Recommendation deleted successfully"}), 200
        
    except Exception as e:
        logger.error(f"Error deleting recommendation {recommendation_id}: {e}")
        db.session.rollback()
        return jsonify({"error": "Internal server error"}), 500


@crop_prediction_bp.route('/yield-history/<int:prediction_id>', methods=['DELETE'])
@jwt_required()
def delete_yield_prediction(prediction_id):
    """Delete a specific yield prediction from history."""
    try:
        user_id = get_jwt_identity()
        logger.info(f"User {user_id} attempting to delete yield prediction {prediction_id}")
        
        # Find the prediction belonging to the current user
        prediction = CropYieldPrediction.query.filter_by(
            id=prediction_id, 
            user_id=user_id
        ).first()
        
        if not prediction:
            logger.warning(f"Yield prediction {prediction_id} not found or unauthorized for user {user_id}")
            return jsonify({"error": "Prediction not found or unauthorized"}), 404
        
        # Delete the prediction
        db.session.delete(prediction)
        db.session.commit()
        
        logger.info(f"Successfully deleted yield prediction {prediction_id} for user {user_id}")
        return jsonify({"message": "Prediction deleted successfully"}), 200
        
    except Exception as e:
        logger.error(f"Error deleting prediction {prediction_id}: {e}")
        db.session.rollback()
        return jsonify({"error": "Internal server error"}), 500


@crop_prediction_bp.route('/crop-options', methods=['GET'])
def get_crop_options():
    """Get available crop options for the yield prediction form."""
    crop_options = ["Rice", "Wheat", "Maize", "Pulses", "Sugarcane", "Cotton", "Oilseeds"]
    season_options = ["Kharif", "Rabi", "Whole Year", "Summer", "Winter"]
    state_options = [
        "Andhra Pradesh", "Bihar", "Gujarat", "Karnataka", "Maharashtra",
        "Punjab", "Tamil Nadu", "Uttar Pradesh", "West Bengal", "Others"
    ]
    
    return jsonify({
        "crops": crop_options,
        "seasons": season_options,
        "states": state_options
    }), 200