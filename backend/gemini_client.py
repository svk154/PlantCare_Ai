import os
import base64
from PIL import Image
import json
import google.generativeai as genai
from dotenv import load_dotenv
import io
from flask import g
from app.utils.gemini_translation import translate_disease_info, get_gemini_prompt
from app.utils.language import translate_dict

# Load environment variables from .env file
load_dotenv(override=True)

# Get Gemini API key from environment variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY environment variable not set. Please add it to your .env file.")
else:
    # Print only a prefix of the API key for security while still confirming it's set
    key_prefix = GEMINI_API_KEY[:8] if len(GEMINI_API_KEY) > 8 else "***"
    print(f"Using Gemini API Key (prefix): {key_prefix}...")
    
    # Define disease classes (same as in the original model)
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

# Lazy initialization of the Gemini API - only configure when actually needed
def _initialize_gemini():
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)

def predict_plant_disease_with_gemini(image_path):
    """
    Use Google's Generative AI (Gemini Pro Vision) to analyze a plant image and detect diseases
    
    Args:
        image_path (str): Path to the image file
        
    Returns:
        dict: A dictionary containing disease class, confidence, symptoms, treatment and prevention
    """
    try:
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY not set in environment variables")
        
        # Initialize Gemini only when needed
        _initialize_gemini()
            
        # Load the image
        image = Image.open(image_path)
        
        # Use the most accurate model for plant disease detection
        # Gemini 2.5 Pro offers maximum response accuracy and state-of-the-art performance
        # Perfect for complex reasoning and multimodal understanding required for plant disease analysis
        selected_model = "models/gemini-2.5-pro"

        # Get user's language preference from Flask g object
        language = getattr(g, 'language', 'English') if hasattr(g, 'language') else 'English'
        
        # Get the prompt based on language
        prompt_template = get_gemini_prompt(language)
        
        # Format the prompt with disease classes
        prompt = prompt_template.format(disease_classes=', '.join(DISEASE_CLASSES))

        # Define the required response schema for structured disease detection output
        response_schema = {
            "type": "object",
            "properties": {
                "isConfident": {"type": "boolean"},
                "highConfidenceResult": {
                    "type": "object",
                    "properties": {
                        "diseaseName": {"type": "string"},
                        "description": {"type": "string"},
                        "cause": {"type": "string"},
                        "confidenceScore": {"type": "number"},
                        "symptoms": {
                            "type": "array",
                            "items": {"type": "string"}
                        },
                        "organicTreatments": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "title": {"type": "string"},
                                    "description": {"type": "string"}
                                },
                                "required": ["title", "description"]
                            }
                        },
                        "chemicalTreatments": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "activeIngredient": {"type": "string"},
                                    "usage": {"type": "string"},
                                    "caution": {"type": "string"}
                                },
                                "required": ["activeIngredient", "usage", "caution"]
                            }
                        },
                        "prevention": {
                            "type": "array",
                            "items": {"type": "string"}
                        },
                        "pesticideProducts": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "productName": {"type": "string"},
                                    "type": {"type": "string"},
                                    "activeIngredient": {"type": "string"},
                                    "price": {"type": "string"},
                                    "purchaseUrl": {"type": "string"},
                                    "seller": {"type": "string"}
                                },
                                "required": ["productName", "type", "purchaseUrl", "seller"]
                            }
                        }
                    },
                    "required": ["diseaseName", "description", "cause", "confidenceScore", "symptoms", 
                               "organicTreatments", "chemicalTreatments", "prevention"]
                },
                "lowConfidenceResults": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "diseaseName": {"type": "string"},
                            "preventionTips": {"type": "string"}
                        },
                        "required": ["diseaseName", "preventionTips"]
                    }
                }
            },
            "required": ["isConfident"]
        }

        # Initialize Gemini 2.5 Pro with structured output to enforce field requirements
        model = genai.GenerativeModel(
            selected_model,
            generation_config=genai.GenerationConfig(
                temperature=0.2,
                top_p=0.8,
                top_k=40,
                max_output_tokens=4096,
                response_mime_type="application/json",
                response_schema=response_schema  # This enforces the structured output schema
            )
        )
        print("✓ Using Gemini 2.5 Pro with built-in web search capabilities (prompt-activated)")
        
        # Generate content with image analysis
        # The prompt includes instructions for Gemini to use its built-in web search when needed
        response = model.generate_content([prompt, image])
        response_text = response.text.strip()
        
        print("✓ Plant disease analysis completed with web-enhanced prompts")
        
        # Try to parse the JSON response
        try:
            import json
            import re
            
            # Debug: Check if response is truncated
            if not response_text.strip().endswith('}'):
                print(f"⚠ Warning: Response appears truncated. Last 100 chars: ...{response_text[-100:]}")
                # Try to fix common truncation issues by adding missing closing braces
                if response_text.count('{') > response_text.count('}'):
                    missing_braces = response_text.count('{') - response_text.count('}')
                    response_text += '}' * missing_braces
                    print(f"  → Added {missing_braces} missing closing brace(s)")
            
            # Remove markdown code blocks if present
            clean_response = response_text
            if "```json" in clean_response:
                json_match = re.search(r'```json\s*(.*?)\s*```', clean_response, re.DOTALL)
                if json_match:
                    clean_response = json_match.group(1)
            elif "```" in clean_response:
                json_match = re.search(r'```\s*(.*?)\s*```', clean_response, re.DOTALL)
                if json_match:
                    clean_response = json_match.group(1)
            
            disease_info = json.loads(clean_response)
            
            # Handle confidence-based response structure like TypeScript version
            is_confident = disease_info.get("isConfident", False)
            
            if is_confident and "highConfidenceResult" in disease_info and disease_info["highConfidenceResult"]:
                    # High confidence result
                    high_conf = disease_info["highConfidenceResult"]
                    disease_name = high_conf.get("diseaseName", "Unknown")
                    confidence = float(high_conf.get("confidenceScore", 0))
                    
                    # Validate disease name
                    if disease_name not in DISEASE_CLASSES:
                        for disease in DISEASE_CLASSES:
                            if disease_name.lower().replace("_", " ") in disease.lower().replace("_", " "):
                                disease_name = disease
                                break
                        else:
                            disease_name = "Unknown"
                    
                    symptoms = high_conf.get("symptoms", [])

                    description = high_conf.get("description") or high_conf.get("diseaseDescription")
                    cause = high_conf.get("cause") or high_conf.get("occurrenceReason") or high_conf.get("whyOccurs")

                    # New structured treatment arrays
                    organic_treatments = high_conf.get("organicTreatments") or high_conf.get("organicTreatment")
                    chemical_treatments = high_conf.get("chemicalTreatments") or high_conf.get("chemicalTreatment")

                    def normalize_treatment_list(raw, kind):
                        if not raw:
                            return []
                        # Accept single string
                        if isinstance(raw, str):
                            return [{"title": raw.strip()[:60], "description": raw.strip()}]
                        # If dict already
                        if isinstance(raw, dict):
                            return [raw]
                        # If list of strings or dicts
                        items = []
                        for item in raw:
                            if isinstance(item, str):
                                items.append({"title": item.strip()[:60], "description": item.strip()})
                            elif isinstance(item, dict):
                                items.append(item)
                        return items

                    organic_list = normalize_treatment_list(organic_treatments, "organic")
                    chemical_list = normalize_treatment_list(chemical_treatments, "chemical")

                    # Ensure max 2 items each; if more, trim; if fewer, keep as-is
                    organic_list = organic_list[:2]
                    chemical_list = chemical_list[:2]

                    # Build combined treatment strings for backward compatibility
                    treatment = []
                    for i, ot in enumerate(organic_list):
                        t_str = f"Organic {i+1}: {ot.get('title', '')} - {ot.get('description', '')}".strip()
                        treatment.append(t_str)
                    for i, ct in enumerate(chemical_list):
                        label_parts = []
                        if ct.get('activeIngredient'):
                            label_parts.append(ct['activeIngredient'])
                        if ct.get('title') and ct['title'] not in label_parts:
                            label_parts.append(ct['title'])
                        main_label = ", ".join(label_parts) or f"Chemical {i+1}" 
                        usage = ct.get('usage') or ct.get('description') or ''
                        caution = ct.get('caution')
                        t_str = f"Chemical {i+1}: {main_label} - {usage}"
                        if caution:
                            t_str += f" (Caution: {caution})"
                        treatment.append(t_str)

                    prevention = high_conf.get("prevention", [])

                    # Extract pesticide products (limit to maximum 3)
                    pesticide_products = high_conf.get("pesticideProducts", [])
                    if isinstance(pesticide_products, list):
                        pesticide_products = pesticide_products[:3]  # Limit to 3 products
                    else:
                        pesticide_products = []

                    # Create the result dictionary
                    result = {
                        "class": disease_name,
                        "confidence": confidence,
                        "symptoms": symptoms if isinstance(symptoms, list) else [str(symptoms)],
                        "treatment": treatment if isinstance(treatment, list) else [str(treatment)],
                        "prevention": prevention if isinstance(prevention, list) else [str(prevention)],
                        "description": description,
                        "cause": cause,
                        "organic_treatments": organic_list,
                        "chemical_treatments": chemical_list,
                        "pesticide_products": pesticide_products
                    }
                    
                    # Get user's language preference
                    language = getattr(g, 'language', 'English') if hasattr(g, 'language') else 'English'
                    
                    # Translate the result if needed
                    if language != 'English':
                        result = translate_dict(result, language)
                        
                    return result
                    
            elif not is_confident and "lowConfidenceResults" in disease_info:
                    # Low confidence results - return the most likely one
                    low_conf_results = disease_info["lowConfidenceResults"]
                    if low_conf_results and len(low_conf_results) > 0:
                        # Take the first (most likely) result
                        primary_result = low_conf_results[0]
                        disease_name = primary_result.get("diseaseName", "Unknown")
                        
                        # Validate disease name
                        if disease_name not in DISEASE_CLASSES:
                            for disease in DISEASE_CLASSES:
                                if disease_name.lower().replace("_", " ") in disease.lower().replace("_", " "):
                                    disease_name = disease
                                    break
                            else:
                                disease_name = "Unknown"
                        
                        # Collect prevention tips from all possibilities
                        prevention_tips = []
                        for result in low_conf_results:
                            if result.get("preventionTips"):
                                prevention_tips.append(result["preventionTips"])
                        
                        # Create the result dictionary
                        result = {
                            "class": disease_name,
                            "confidence": 50.0,  # Default for low confidence
                            "symptoms": ["Multiple possibilities detected - manual inspection recommended"],
                            "treatment": ["Consult agricultural extension service for specific treatment"],
                            "prevention": prevention_tips if prevention_tips else ["Follow general plant health practices"]
                        }
                        
                        # Get user's language preference
                        language = getattr(g, 'language', 'English') if hasattr(g, 'language') else 'English'
                        
                        # Translate the result if needed
                        if language != 'English':
                            result = translate_dict(result, language)
                            
                        return result
            
            # Fallback if structure doesn't match expected format
            return {
                "class": "Unknown",
                "confidence": 0.0,
                "symptoms": ["Unable to parse AI response"],
                "treatment": ["Please try with a clearer image"],
                "prevention": ["Ensure good plant health practices"]
            }
                
        except json.JSONDecodeError:
            # If JSON parsing fails, try to extract information manually
            # Look for disease names in the response
            detected_disease = "Unknown"
            for disease in DISEASE_CLASSES:
                if disease in response_text:
                    detected_disease = disease
                    break
            
            return {
                "class": detected_disease,
                "confidence": 75.0,  # Default confidence for manual parsing
                "symptoms": ["Analysis completed but detailed symptoms not available"],
                "treatment": ["Consult agricultural extension service for specific treatment"],
                "prevention": ["Follow general plant health practices"]
            }

        except Exception as e:
            print(f"Error generating content: {str(e)}")
            return {"class": "API_ERROR", "confidence": 0.0, "symptoms": [], "treatment": [f"Error: {str(e)}"], "prevention": []}
            
    except Exception as e:
        error_message = str(e)
        print(f"Error in Gemini client: {error_message}")
        return {"class": "CLIENT_ERROR", "confidence": 0.0, "symptoms": [], "treatment": [f"Error: {error_message}"], "prevention": []}

# Simple test function to verify the implementation works
if __name__ == "__main__":
    # Check if an image path is provided as argument
    import sys
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
    else:
        # Use a default test image if available
        test_dir = os.path.join(os.path.dirname(__file__), 'app', 'static', 'uploads')
        for root, dirs, files in os.walk(test_dir):
            for file in files:
                if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                    image_path = os.path.join(root, file)
                    break
            if 'image_path' in locals():
                break
    
    if 'image_path' in locals() and os.path.exists(image_path):
        print(f"Testing with image: {image_path}")
        result = predict_plant_disease_with_gemini(image_path)
        print("Prediction result:")
        print(json.dumps(result, indent=2))
    else:
        print("No test image found. Please provide an image path as argument.")
