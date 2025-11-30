def validate_email(email):
    import re
    return bool(re.match(r"[^@]+@[^@]+\.[^@]+", email or ""))

def validate_password(password):
    """
    Validate password strength with the following rules:
    - At least 12 characters long
    - Contains at least one uppercase letter
    - Contains at least one lowercase letter
    - Contains at least one digit
    - Contains at least one special character
    """
    import re
    
    if not password or len(password) < 12:
        return False
        
    # Check for at least one uppercase letter
    if not re.search(r'[A-Z]', password):
        return False
        
    # Check for at least one lowercase letter
    if not re.search(r'[a-z]', password):
        return False
        
    # Check for at least one digit
    if not re.search(r'\d', password):
        return False
        
    # Check for at least one special character
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False
        
    return True

def validate_registration(data):
    errors = {}
    if not validate_email(data.get("email")):
        errors["email"] = "Invalid email"
    if not validate_password(data.get("password")):
        errors["password"] = "Password too short"
    if not data.get("name"):
        errors["name"] = "Name required"
    return not errors, errors

def validate_login(data):
    errors = {}
    if not validate_email(data.get("email")):
        errors["email"] = "Invalid email"
    if not validate_password(data.get("password")):
        errors["password"] = "Password too short"
    return not errors, errors

def validate_farm(data):
    errors = {}
    if not data.get("name"): errors["name"] = "Farm name required"
    if not data.get("size") or float(data.get("size",0)) <= 0: errors["size"] = "Invalid size"
    return not errors, errors

def validate_crop(data):
    errors = {}
    if not data.get("name"): errors["name"] = "Crop name required"
    return not errors, errors

def validate_transaction(data):
    errors = {}
    if not data.get("amount") or float(data.get("amount",0)) <= 0: errors["amount"] = "Invalid amount"
    if not data.get("category"): errors["category"] = "Category required"
    return not errors, errors

def validate_forum_post(data):
    errors = {}
    if not data.get("title"): errors["title"] = "Title required"
    if not data.get("content"): errors["content"] = "Content required"
    return not errors, errors

def validate_forum_reply(data):
    errors = {}
    if not data.get("content"): errors["content"] = "Content required"
    return not errors, errors
