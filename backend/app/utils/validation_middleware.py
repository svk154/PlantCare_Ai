# app/utils/validation_middleware.py

from functools import wraps
from flask import request, jsonify
from .validators import validate_email, validate_password

def validate_json(*required_fields):
    """
    A decorator to validate JSON payload in incoming requests.
    Checks for presence of required fields and returns 400 if missing.
    
    Args:
        *required_fields: List of field names that must be present in the request JSON
        
    Returns:
        Function: Decorated route function
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Check if request has JSON data
            if not request.is_json:
                return jsonify({"error": "Missing JSON in request"}), 400
            
            data = request.json or {}
            missing_fields = [field for field in required_fields if field not in data or not data[field]]
            
            if missing_fields:
                return jsonify({
                    "error": "Missing required fields",
                    "fields": missing_fields
                }), 400
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def validate_auth_input(f):
    """
    A decorator specifically for validating authentication inputs (email/password)
    
    Returns:
        Function: Decorated route function
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({"error": "Missing JSON in request"}), 400
            
        data = request.json or {}
        errors = {}
        
        # Check email
        if 'email' not in data or not data['email']:
            errors['email'] = "Email is required"
        elif not validate_email(data['email']):
            errors['email'] = "Invalid email format"
            
        # Check password
        if 'password' not in data or not data['password']:
            errors['password'] = "Password is required"
        elif not validate_password(data['password']):
            errors['password'] = ("Password must be at least 12 characters long and include "
                                 "uppercase, lowercase, digit and special characters")
        
        if errors:
            return jsonify({"error": "Validation failed", "details": errors}), 400
            
        return f(*args, **kwargs)
    return decorated_function

def sanitize_input(data):
    """
    Sanitize input data to prevent XSS and injection attacks
    
    Args:
        data (dict): Input data dictionary
        
    Returns:
        dict: Sanitized data
    """
    import bleach
    
    sanitized = {}
    
    if not isinstance(data, dict):
        return data
    
    for key, value in data.items():
        if isinstance(value, str):
            # Sanitize string values
            sanitized[key] = bleach.clean(value, strip=True) if key != 'password' else value
        elif isinstance(value, dict):
            # Recursively sanitize nested dictionaries
            sanitized[key] = sanitize_input(value)
        elif isinstance(value, list):
            # Sanitize lists
            sanitized[key] = [
                bleach.clean(item, strip=True) if isinstance(item, str) else item 
                for item in value
            ]
        else:
            # Keep other types as is
            sanitized[key] = value
    
    return sanitized
