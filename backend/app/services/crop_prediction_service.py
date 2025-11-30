import os
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class CropRecommendationService:
    """Service for crop recommendation based on soil and environmental conditions."""
    
    def __init__(self):
        self.model = None
        self.label_encoder = None
        self.crop_images = {
            "rice": "rice.jpg",
            "maize": "maize.jpg",
            "chickpea": "chickpea.jpg",
            "kidneybeans": "kidneybeans.jpg",
            "pigeonpeas": "pigeonpeas.jpg",
            "mothbeans": "mothbeans.jpg",
            "mungbean": "mungbean.jpg",
            "blackgram": "blackgram.jpg",
            "lentil": "lentil.jpg",
            "pomegranate": "pomegranate.jpg",
            "banana": "banana.jpg",
            "mango": "mango.jpg",
            "grapes": "grapes.jpg",
            "watermelon": "watermelon.jpg",
            "muskmelon": "muskmelon.jpg",
            "apple": "apple.jpg",
            "orange": "orange.jpg",
            "papaya": "papaya.jpg",
            "coconut": "coconut.jpg",
            "cotton": "cotton.jpg",
            "jute": "jute.jpg",
            "coffee": "coffee.jpg"
        }
        self._load_models()
    
    def _load_models(self):
        """Load the trained model and label encoder."""
        try:
            model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'models')
            model_path = os.path.join(model_dir, 'best_model.pkl')
            encoder_path = os.path.join(model_dir, 'label_encoder.pkl')
            
            if os.path.exists(model_path) and os.path.exists(encoder_path):
                self.model = joblib.load(model_path)
                self.label_encoder = joblib.load(encoder_path)
                logger.info("Crop recommendation models loaded successfully")
            else:
                logger.error(f"Model files not found at {model_path} or {encoder_path}")
                
        except Exception as e:
            logger.error(f"Error loading crop recommendation models: {e}")
    
    def predict_crop(self, soil_data: Dict[str, float]) -> Dict[str, Any]:
        """
        Predict the best crop based on soil and environmental conditions.
        
        Args:
            soil_data: Dictionary containing N, P, K, temperature, humidity, ph, rainfall
            
        Returns:
            Dictionary containing predicted crop, confidence, and image info
        """
        if not self.model or not self.label_encoder:
            return {"error": "Models not loaded properly"}
        
        try:
            # Validate input data
            required_fields = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
            for field in required_fields:
                if field not in soil_data:
                    return {"error": f"Missing required field: {field}"}
            
            # Prepare input data as DataFrame
            input_data = pd.DataFrame([[
                soil_data["N"],
                soil_data["P"], 
                soil_data["K"],
                soil_data["temperature"],
                soil_data["humidity"],
                soil_data["ph"],
                soil_data["rainfall"]
            ]], columns=required_fields)
            
            # Make prediction
            prediction = self.model.predict(input_data)[0]
            prediction_proba = self.model.predict_proba(input_data)[0]
            
            # Decode crop name
            predicted_crop = self.label_encoder.inverse_transform([prediction])[0]
            confidence = float(max(prediction_proba))
            
            # Get crop image
            crop_image = self.crop_images.get(predicted_crop.lower(), None)
            
            return {
                "predicted_crop": predicted_crop,
                "confidence": confidence,
                "image": crop_image,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Error predicting crop: {e}")
            return {"error": str(e)}


class CropYieldService:
    """Service for crop yield prediction."""
    
    def __init__(self):
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load the trained yield prediction model."""
        try:
            model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'models')
            model_path = os.path.join(model_dir, 'best_crop_yield_model.pkl')
            
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
                logger.info("Crop yield model loaded successfully")
            else:
                logger.error(f"Yield model file not found at {model_path}")
                
        except Exception as e:
            logger.error(f"Error loading crop yield model: {e}")
    
    def predict_yield(self, crop_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict crop yield based on crop and environmental conditions.
        
        Args:
            crop_data: Dictionary containing crop, season, state, rainfall, fertilizer, pesticide
            
        Returns:
            Dictionary containing predicted yield and related info
        """
        if not self.model:
            return {"error": "Yield model not loaded properly"}
        
        try:
            # Validate input data
            required_fields = ["Crop", "Season", "State", "Annual_Rainfall", "Fertilizer", "Pesticide"]
            for field in required_fields:
                if field not in crop_data:
                    return {"error": f"Missing required field: {field}"}
            
            # Prepare input data as DataFrame
            input_data = pd.DataFrame([crop_data])
            
            # Make prediction
            predicted_yield = self.model.predict(input_data)[0]
            
            return {
                "predicted_yield": float(predicted_yield),
                "unit": "tons/hectare",
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Error predicting yield: {e}")
            return {"error": str(e)}


# Singleton instances
crop_recommendation_service = CropRecommendationService()
crop_yield_service = CropYieldService()