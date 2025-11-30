# app/routes/auth.py
from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User
from flask_jwt_extended import (create_access_token, create_refresh_token, jwt_required, get_jwt_identity)
from werkzeug.security import check_password_hash

auth_bp = Blueprint('auth', __name__)

from app.utils.validation_middleware import validate_json, validate_auth_input, sanitize_input

@auth_bp.route("/register", methods=['POST'])
@validate_json('email', 'name', 'password')
@validate_auth_input
def register():
    # Get sanitized data
    data = sanitize_input(request.json or {})
    email = data.get('email')
    name = data.get('name')
    password = data.get('password')

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered."}), 400

    user = User(email=email, name=name)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Registration successful!"}), 201

@auth_bp.route("/login", methods=['POST'])
@validate_json('email', 'password')
# Skip complex password validation for login attempts - we just need non-empty values
def login():
    # Log request information to help debug CORS and authentication issues
    print(f"Login attempt received - Origin: {request.headers.get('Origin')} - Remote: {request.remote_addr}")
    
    data = sanitize_input(request.json or {})
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    
    if not user:
        print(f"Login failed: User with email {email} not found")
        return jsonify({"error": "Invalid credentials"}), 401
    
    if not user.check_password(password):
        print(f"Login failed: Invalid password for user {email}")
        return jsonify({"error": "Invalid credentials"}), 401

    # Create tokens
    access = create_access_token(identity=str(user.id))
    refresh = create_refresh_token(identity=str(user.id))
    
    # Create response with token in JSON body
    response = jsonify({
        "success": True,
        "user_id": user.id,
        "name": user.name,
        "access_token": access,  # Include token in response body for localStorage
        "token_type": "Bearer"
    })
    
    # Set cookies as a backup authentication method
    response.set_cookie('access_token_cookie', access, 
                        httponly=True, 
                        secure=request.is_secure,
                        samesite='Lax',
                        max_age=24*60*60)  # 24 hours
    
    response.set_cookie('refresh_token_cookie', refresh, 
                        httponly=True, 
                        secure=request.is_secure,
                        samesite='Lax',
                        max_age=30*24*60*60)  # 30 days
    
    return response

@auth_bp.route("/me", methods=['GET'])
@jwt_required()
def me():
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict())

@auth_bp.route("/refresh", methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id_str = get_jwt_identity()
    access = create_access_token(identity=user_id_str)
    
    # Create response
    response = jsonify({"success": True})
    
    # Set cookie
    response.set_cookie('access_token_cookie', access,
                      httponly=True,
                      secure=request.is_secure,
                      samesite='Lax',
                      max_age=24*60*60)  # 24 hours
    
    return response

@auth_bp.route("/logout", methods=['POST'])
@jwt_required()
def logout():
    # Clear the JWT cookies
    response = jsonify({"message": "Logged out successfully"})
    response.delete_cookie('access_token_cookie')
    response.delete_cookie('refresh_token_cookie')
    return response

@auth_bp.route("/change-password", methods=['POST'])
@jwt_required()
@validate_json('current_password', 'new_password')
def change_password():
    """Change user password"""
    data = sanitize_input(request.json or {})
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    # Validate new password strength
    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters long"}), 400
    
    # Get current user
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Verify current password
    if not user.check_password(current_password):
        return jsonify({"error": "Current password is incorrect"}), 400
    
    # Set new password
    user.set_password(new_password)
    db.session.commit()
    
    return jsonify({"message": "Password changed successfully"}), 200
