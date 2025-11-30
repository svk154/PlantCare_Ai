import os
import numpy as np
from PIL import Image
import sys
import base64
import requests
import json
from dotenv import load_dotenv
import tensorflow as tf
from tensorflow.keras.models import load_model

# Load environment variables - force reload from .env file
load_dotenv(override=True)

# Get API key from environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY environment variable not set")
else:
    pass  # API key is set

# Import Gemini client if available
try:
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    from gemini_client import predict_plant_disease_with_gemini as gemini_predict
    GEMINI_CLIENT_AVAILABLE = True
except ImportError as e:
    GEMINI_CLIENT_AVAILABLE = False
    
# Using the most advanced Gemini 2.5 Pro model for superior plant disease detection accuracy
GEMINI_VISION_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent"

# Legacy model path (try to use a simplified model if available)
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'static', 'models', 'plant_disease_model_simple.h5')

# This will store our model once loaded (kept for backward compatibility)
model = None

# Define disease classes
DISEASE_CLASSES = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
    "Blueberry___healthy", "Cherry_(including_sour)___Powdery_mildew", "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight", "Corn_(maize)___healthy",
    "Grape___Black_rot", "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy", "Orange___Haunglongbing_(Citrus_greening)", "Peach___Bacterial_spot",
    "Peach___healthy", "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy",
    "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
    "Raspberry___healthy", "Soybean___healthy", "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch", "Strawberry___healthy", "Tomato___Bacterial_spot",
    "Tomato___Early_blight", "Tomato___Late_blight", "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot", "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot", "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]

def encode_image_to_base64(image_path):
    """
    Encode an image file to a base64 string
    """
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def init_model():
    """Initialize the model (attempt to load local model)"""
    global model
    
    try:
        # Load model directly
        model = load_model(MODEL_PATH)
        return True
    except Exception as e:
        return False

# Don't initialize the model during module import - lazy load it when needed
model_initialized = False

def ensure_model_initialized():
    """Lazy initialization of the model only when needed"""
    global model_initialized, model
    if not model_initialized:
        try:
            model_initialized = init_model()
        except Exception as e:
            model_initialized = False

def preprocess_image(image_path):
    """Preprocess image for model input - converts to grayscale for local model"""
    try:
        # Load and resize image in grayscale mode (1 channel)
        img = Image.open(image_path).convert("L").resize((224, 224))
        # Convert to numpy array and normalize
        arr = np.array(img) / 255.0
        # Add channel dimension
        arr = np.expand_dims(arr, axis=-1)
        # Add batch dimension
        arr = np.expand_dims(arr, axis=0)
        return arr
    except Exception as e:
        # Return a blank grayscale image as fallback
        return np.zeros((1, 224, 224, 1))

def get_disease_info(disease_name):
    """Get information about plant diseases"""
    disease_info = {
        "Apple___Apple_scab": {
            "symptoms": ["Dark olive-green spots on leaves", "Velvety texture on spots", "Deformed fruits with dark, scabby lesions"],
            "treatment": ["Remove and destroy infected leaves", "Apply fungicide sprays", "Improve air circulation around trees"],
            "prevention": ["Select resistant varieties", "Proper pruning", "Apply preventative fungicide"]
        },
        "Apple___Black_rot": {
            "symptoms": ["Purple spots on leaves", "Rotting fruit with concentric rings", "Cankers on branches"],
            "treatment": ["Remove infected fruit and branches", "Apply fungicides", "Prune out cankers"],
            "prevention": ["Maintain tree health", "Remove nearby wild apple trees", "Clean up fallen debris"]
        },
        "Apple___Cedar_apple_rust": {
            "symptoms": ["Bright orange-yellow spots on leaves", "Small yellow spots with red borders", "Deformed fruit"],
            "treatment": ["Remove and destroy infected leaves", "Apply fungicide", "Remove nearby cedar trees"],
            "prevention": ["Plant resistant varieties", "Avoid planting near cedar trees", "Preventative fungicide sprays"]
        },
        "Apple___healthy": {
            "symptoms": [],
            "treatment": ["No treatment needed - plant is healthy"],
            "prevention": ["Regular monitoring", "Balanced fertilization", "Proper watering"]
        },
        # Default response for any disease not in our database
        "default": {
            "symptoms": ["Visible damage on plant", "Abnormal growth or coloration", "Decreased plant vigor"],
            "treatment": ["Remove severely infected parts", "Consider appropriate fungicides or pesticides", "Improve growing conditions"],
            "prevention": ["Regular monitoring", "Maintain plant health", "Practice crop rotation"]
        }
    }
    
    # Return info for the disease, or default if not found
    return disease_info.get(disease_name, disease_info["default"])

def predict_with_gemini_api(image_path):
    """Use Gemini API to predict plant disease from image"""
    try:
        # Check if API key is available
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY not set")
        
        # Try to use the new Gemini client if available
        if GEMINI_CLIENT_AVAILABLE:
            return gemini_predict(image_path)
        
        # Fall back to legacy implementation if client not available
        
        # Encode image to base64
        base64_image = encode_image_to_base64(image_path)
        
        # Enhanced prompt for Gemini 2.5 Pro model with web search grounding
        prompt = """
        You are an expert agricultural pathologist with web search access for enhanced plant disease identification.
        
        CRITICAL IDENTIFICATION PROTOCOL WITH WEB SEARCH:
        1. WEB-ENABLED PLANT TYPE IDENTIFICATION:
           - Search: "plant identification leaf morphology [describe leaf features]"
           - Search: "[suspected plant type] leaf characteristics botanical identification"
           - Search: "difference between citrus tomato apple grape leaves identification"
           - Cross-reference with botanical databases and identification guides
           - CONFIRM plant species using web resources before proceeding
        
        2. WEB-ENHANCED DISEASE SYMPTOM ANALYSIS:
           - Search: "[confirmed plant type] diseases symptoms [describe symptoms]"
           - Search: "plant pathology [plant type] leaf spots discoloration identification"
           - Search: "[plant type] disease database symptoms photos"
           - Verify symptoms against agricultural extension databases
           
        3. WEB-VERIFIED DISEASE MATCHING:
           Available disease classes (MUST match web-confirmed plant type):
           {}
        
        WEB SEARCH REQUIREMENTS:
        - MANDATORY: Use web search to verify plant identification
        - Search botanical databases, extension services, plant pathology resources
        - Cross-reference symptoms with multiple reliable sources
        - Include web findings in your analysis confidence

        ACCURACY REQUIREMENTS:
        - Use web search to prevent plant type misidentification
        - If web confirms citrus: ONLY select Orange___ diseases
        - If web confirms tomato: ONLY select Tomato___ diseases
        - If web confirms apple: ONLY select Apple___ diseases
        - Web-verify disease symptoms before final classification
        - Confidence must incorporate web search validation results
        
        RESPONSE FORMAT (JSON only):
        {{
            "class": "EXACT disease name from the list with correct formatting",
            "confidence": number between 0-100,
            "plant_type": "Specific plant type identified",
            "description": "Detailed description of the disease and its pathology",
            "symptoms": ["Specific symptoms visible in THIS image", "Additional symptoms observed"],
            "treatment": ["Evidence-based treatment recommendation", "Alternative treatments if applicable"],
            "prevention": ["Specific prevention strategy", "Additional preventive measures"]
        }}
        
        Return ONLY valid JSON. Do not include ANY other explanatory text.
        """.format(", ".join(DISEASE_CLASSES))
        
        # Prepare the request payload
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": base64_image
                            }
                        }
                    ]
                }
            ],
            "generation_config": {
                "temperature": 0.0,  # Zero temperature for maximum determinism
                "top_p": 0.95,       # Slightly increased for the more capable model
                "top_k": 40,         # Increased for the more capable model
                "max_output_tokens": 1500,
                "response_mime_type": "application/json"
            }
        }
        
        # Make API request
        response = requests.post(
            f"{GEMINI_VISION_API_URL}?key={GEMINI_API_KEY}",
            json=payload
        )
        
        # Check for errors
        response.raise_for_status()
        
        # Extract the JSON from response
        result = response.json()
        
        if "candidates" in result and len(result["candidates"]) > 0:
            response_text = result["candidates"][0]["content"]["parts"][0]["text"]
            
            # Parse JSON string from response
            try:
                disease_info = json.loads(response_text)
                return disease_info
            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract the JSON part
                import re
                json_match = re.search(r'({.*})', response_text, re.DOTALL)
                if json_match:
                    try:
                        disease_info = json.loads(json_match.group(1))
                        return disease_info
                    except json.JSONDecodeError:
                        pass
                
                print(f"Failed to parse JSON response: {response_text}")
                return {
                    "class": "PREDICTION ERROR",
                    "confidence": 0.0,
                    "symptoms": [],
                    "treatment": ["Could not process the image"],
                    "prevention": []
                }
        else:
            print("No candidates in response")
            return {
                "class": "API ERROR",
                "confidence": 0.0,
                "symptoms": [],
                "treatment": ["API did not return a valid response"],
                "prevention": []
            }
            
    except Exception as e:
        print(f"Error using Gemini API: {str(e)}")
        return {
            "class": "API ERROR",
            "confidence": 0.0,
            "symptoms": [],
            "treatment": [f"Error: {str(e)}"],
            "prevention": []
        }

def predict_with_local_model(image_path):
    """Predict plant disease using the local TensorFlow model"""
    global model
    
    # Ensure model is initialized using our lazy loading function
    ensure_model_initialized()
    
    # Check if model is loaded
    if model is None:
        # Model couldn't be loaded even after initialization attempt
        return None
    
    try:
        # Preprocess the image
        arr = preprocess_image(image_path)
        
        # Make prediction
        y = model.predict(arr)
        
        # Get the predicted class index and confidence
        idx = np.argmax(y[0])
        confidence = float(np.max(y[0]) * 100)  # Convert to percentage
        
        # Get the class name
        class_name = DISEASE_CLASSES[idx] if idx < len(DISEASE_CLASSES) else "Unknown"
        
        # Get disease information from our local database
        # This is where we add the symptoms, treatment, and prevention information
        # that isn't directly predicted by the model but is based on the predicted class
        disease_info = get_disease_info(class_name)
        
        return {
            "class": class_name,
            "confidence": confidence,
            "symptoms": disease_info.get("symptoms", []),
            "treatment": disease_info.get("treatment", []),
            "prevention": disease_info.get("prevention", [])
        }
    except Exception as e:
        print(f"Local prediction error: {str(e)}")
        return None

def predict_plant_disease(image_path):
    """Main prediction function - tries local model first, falls back to Gemini API if needed"""
    # Confidence thresholds
    LOCAL_CONFIDENCE_THRESHOLD = 15.0  # Slightly higher threshold for local model
    
    # Lazily try to initialize the model (only if not already done)
    ensure_model_initialized()
    
    # First try with local model if available after initialization attempt
    if model is not None:
        try:
            local_result = predict_with_local_model(image_path)
            if local_result and local_result["class"] != "PREDICTION ERROR":
                confidence = local_result['confidence']
                
                # If confidence is high enough, return the local result
                if confidence >= LOCAL_CONFIDENCE_THRESHOLD:
                    return local_result
        except Exception as e:
            pass  # Silently fall back to Gemini API
    
    # If local model fails, isn't available, or has low confidence, use Gemini API
    gemini_result = predict_with_gemini_api(image_path)
    
    return gemini_result
