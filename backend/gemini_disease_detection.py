import os
import base64
import requests
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get Gemini API key from environment variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY environment variable not set. Please add it to your .env file.")
    # Do not use a placeholder value - let it fail explicitly if not configured
else:
    # Print only a prefix of the API key for security while still confirming it's set
    key_prefix = GEMINI_API_KEY[:8] if len(GEMINI_API_KEY) > 8 else "***"
    print(f"Using Gemini API Key (prefix): {key_prefix}...")

# Gemini API endpoint for image analysis
# Using the more advanced Gemini 1.5 Pro Vision model for better visual understanding
GEMINI_VISION_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-vision:generateContent"
# Legacy model reference in case we need to fall back
# GEMINI_VISION_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent"

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

def encode_image_to_base64(image_path):
    """
    Encode an image file to a base64 string
    """
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def predict_plant_disease_with_gemini(image_path):
    """
    Use Gemini API to predict plant disease from image
    """
    try:
        # Encode image to base64
        base64_image = encode_image_to_base64(image_path)
        
        # Advanced prompt for Gemini 1.5 Pro Vision model with buying links for Indian farmers
        prompt = """
        You are an expert agricultural pathologist specializing in computer vision-based disease identification in plants.
        
        ANALYZING PROCESS:
        1. IDENTIFY PLANT TYPE: Carefully examine the image to determine the exact plant species (e.g., tomato, apple, grape)
        2. VISUAL ASSESSMENT: Analyze visible symptoms with extreme precision:
           - Leaf characteristics: spots (size, color, pattern), discoloration, necrosis
           - Stem/fruit features: lesions, rot, unusual growths
           - Overall plant appearance: wilting, stunted growth, defoliation
        3. PATTERN RECOGNITION: Compare visible patterns against known disease signatures
        4. DISEASE IDENTIFICATION: Select the PRECISE disease from this specific list (format is [Plant]___[Disease]):
        {}
        
        CRITICAL ACCURACY REQUIREMENTS:
        - You MUST select a disease that EXACTLY matches one from the list above, using identical formatting
        - Use the PRECISE spelling and format shown (e.g., "Apple___Apple_scab")
        - For healthy plants, use "[Plant]___healthy" format (e.g., "Tomato___healthy")
        - If symptoms don't clearly match a listed disease, use "Unknown" with appropriate confidence
        - Your confidence score should reflect genuine certainty - be conservative when uncertain
        - Pay special attention to distinguishing between similar diseases like Early_blight vs Late_blight
        
        INDIAN MARKET PRODUCT RECOMMENDATIONS:
        - Provide 3 specific treatment products available in India for the identified disease
        - Include both chemical and organic/natural treatment options when possible
        - For each product, provide:
          * Product name (exact branded product available in India)
          * Type (chemical, organic, or biological)
          * Active ingredients
          * Dosage information 
          * Application method
          * Indian e-commerce links to purchase (from reputable Indian agricultural sites like BigHaat, AgriBegri, IndiaMART, or major retailers)
          * Approximate price range in Rupees (₹)
        
        RESPONSE FORMAT (JSON only):
        {{
            "class": "EXACT disease name from the list with correct formatting",
            "confidence": number between 0-100,
            "plant_type": "Specific plant type identified",
            "description": "Detailed description of the disease and its pathology",
            "symptoms": ["Specific symptoms visible in THIS image", "Additional symptoms observed"],
            "treatment": ["Evidence-based treatment recommendation", "Alternative treatments if applicable"],
            "prevention": ["Specific prevention strategy", "Additional preventive measures"],
            "india_specific_products": [
                {{
                    "name": "Product name available in India",
                    "type": "chemical/organic/biological",
                    "active_ingredients": "Main active compounds",
                    "dosage": "Recommended application rate",
                    "application_method": "How to apply the product",
                    "buy_link": "Direct link to Indian e-commerce site",
                    "price_range": "Price range in Rupees"
                }},
                {{
                    "name": "Second product option",
                    "type": "chemical/organic/biological", 
                    "active_ingredients": "Main active compounds",
                    "dosage": "Recommended application rate",
                    "application_method": "How to apply the product",
                    "buy_link": "Direct link to Indian e-commerce site",
                    "price_range": "Price range in Rupees"
                }},
                {{
                    "name": "Third product option (preferably organic if others are chemical)",
                    "type": "chemical/organic/biological",
                    "active_ingredients": "Main active compounds",
                    "dosage": "Recommended application rate",
                    "application_method": "How to apply the product",
                    "buy_link": "Direct link to Indian e-commerce site",
                    "price_range": "Price range in Rupees"
                }}
            ]
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
        if not GEMINI_API_KEY:
            raise ValueError("Gemini API key is not set in environment variables")
        
        # Print API endpoint for debugging
        print(f"Calling Gemini API at: {GEMINI_VISION_API_URL}")
        
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

# Test the function if this file is run directly
if __name__ == "__main__":
    # Path to a test image
    test_image_path = os.path.join("app", "static", "uploads", "images_1.jpeg")
    
    if os.path.exists(test_image_path):
        print(f"Testing with image: {test_image_path}")
        result = predict_plant_disease_with_gemini(test_image_path)
        print(json.dumps(result, indent=2))
    else:
        print(f"Test image not found at {test_image_path}")
        # Try to find any image in the uploads directory
        uploads_dir = os.path.join("app", "static", "uploads")
        if os.path.exists(uploads_dir):
            for filename in os.listdir(uploads_dir):
                if filename.lower().endswith((".jpg", ".jpeg", ".png")):
                    test_image_path = os.path.join(uploads_dir, filename)
                    print(f"Found alternative image: {test_image_path}")
                    result = predict_plant_disease_with_gemini(test_image_path)
                    print(json.dumps(result, indent=2))
                    break
            else:
                print(f"No suitable image found in {uploads_dir}")
        else:
            print(f"Uploads directory not found at {uploads_dir}")
