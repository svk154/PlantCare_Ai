from functools import wraps
from flask import request, g

# Dictionary of translations for Hindi
hindi_translations = {
    # Common messages and errors
    "Success": "सफल",
    "Error": "त्रुटि",
    "Not found": "नहीं मिला",
    "Unauthorized": "अनधिकृत",
    "Bad request": "खराब अनुरोध",
    "Internal server error": "आंतरिक सर्वर त्रुटि",
    
    # Authentication messages
    "Login successful": "लॉगइन सफल",
    "Invalid credentials": "अमान्य प्रमाण पत्र",
    "Password changed successfully": "पासवर्ड सफलतापूर्वक बदल दिया गया",
    "User registered successfully": "उपयोगकर्ता सफलतापूर्वक पंजीकृत",
    "Email already exists": "ईमेल पहले से मौजूद है",
    "Logout successful": "लॉगआउट सफल",
    
    # Disease detection
    "Disease detected": "रोग का पता चला",
    "No disease detected": "कोई रोग नहीं मिला",
    "Image uploaded successfully": "छवि सफलतापूर्वक अपलोड की गई",
    "Invalid image format": "अमान्य छवि प्रारूप",
    
    # Farm management
    "Farm added successfully": "खेत सफलतापूर्वक जोड़ा गया",
    "Farm updated successfully": "खेत सफलतापूर्वक अपडेट किया गया",
    "Farm deleted successfully": "खेत सफलतापूर्वक हटा दिया गया",
    "Crop added successfully": "फसल सफलतापूर्वक जोड़ी गई",
    "Crop updated successfully": "फसल सफलतापूर्वक अपडेट की गई",
    "Crop deleted successfully": "फसल सफलतापूर्वक हटा दी गई",
    
    # Transactions
    "Transaction added successfully": "लेनदेन सफलतापूर्वक जोड़ा गया",
    "Transaction updated successfully": "लेनदेन सफलतापूर्वक अपडेट किया गया",
    "Transaction deleted successfully": "लेनदेन सफलतापूर्वक हटा दिया गया",
    
    # Calculators
    "Calculation saved successfully": "गणना सफलतापूर्वक सहेजी गई",
    "Invalid calculation parameters": "अमान्य गणना पैरामीटर",
    
    # Forum
    "Post created successfully": "पोस्ट सफलतापूर्वक बनाई गई",
    "Reply added successfully": "जवाब सफलतापूर्वक जोड़ा गया",
    "Post updated successfully": "पोस्ट सफलतापूर्वक अपडेट की गई",
    "Post deleted successfully": "पोस्ट सफलतापूर्वक हटा दी गई",
    
    # Weather
    "Weather data retrieved successfully": "मौसम डेटा सफलतापूर्वक प्राप्त किया गया",
    "Weather API error": "मौसम API त्रुटि",
    
    # User account
    "Profile updated successfully": "प्रोफ़ाइल सफलतापूर्वक अपडेट की गई",
    "Account deleted successfully": "खाता सफलतापूर्वक हटा दिया गया",
    
    # Fertilizer recommendations
    "Fertilizer recommendations": "उर्वरक सिफारिशें",
    "Based on your crop and soil type": "आपकी फसल और मिट्टी के प्रकार के आधार पर",
    "Apply nitrogen": "नाइट्रोजन लागू करें",
    "Apply phosphorus": "फास्फोरस लागू करें",
    "Apply potassium": "पोटेशियम लागू करें",
}

def translate_text(text, language='English'):
    """
    Translate text to the specified language
    """
    if language != 'Hindi':
        return text
    
    # Check if direct translation exists
    if text in hindi_translations:
        return hindi_translations[text]
    
    # Return original text if no translation found
    return text

def translate_dict(data, language='English'):
    """
    Recursively translate values in a dictionary or list
    """
    if language == 'English':
        return data
    
    if isinstance(data, dict):
        translated_dict = {}
        for key, value in data.items():
            if isinstance(value, (dict, list)):
                translated_dict[key] = translate_dict(value, language)
            elif isinstance(value, str):
                translated_dict[key] = translate_text(value, language)
            else:
                translated_dict[key] = value
        return translated_dict
    
    elif isinstance(data, list):
        translated_list = []
        for item in data:
            if isinstance(item, (dict, list)):
                translated_list.append(translate_dict(item, language))
            elif isinstance(item, str):
                translated_list.append(translate_text(item, language))
            else:
                translated_list.append(item)
        return translated_list
    
    return data

def with_language(f):
    """
    Decorator to set language preference from request
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get language from headers or default to English
        language = request.headers.get('X-Language', 'English')
        
        # Store language in Flask g object for access in the view function
        g.language = language
        
        # Call the original function
        return f(*args, **kwargs)
    
    return decorated_function

def translate_response(response_data):
    """
    Translate response data based on language in Flask g object
    """
    language = getattr(g, 'language', 'English')
    if language == 'English':
        return response_data
    
    return translate_dict(response_data, language)