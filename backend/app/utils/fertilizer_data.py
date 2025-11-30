"""Provides crop nutrient requirement data and fertilizer calculation utilities."""

# Base nutrient requirements (kg/hectare) for common crops
# Format: [N, P, K] in kg/hectare
CROP_NUTRIENTS = {
    "rice": {"N": 120, "P": 60, "K": 80},
    "wheat": {"N": 100, "P": 50, "K": 60},
    "maize": {"N": 140, "P": 70, "K": 60},
    "tomato": {"N": 150, "P": 100, "K": 150},
    "potato": {"N": 120, "P": 100, "K": 150},
    "cotton": {"N": 100, "P": 50, "K": 50},
    "soybean": {"N": 80, "P": 60, "K": 40},
    "coffee": {"N": 200, "P": 100, "K": 200},
    "sugarcane": {"N": 150, "P": 60, "K": 80},
    
    # Default values for custom/other crops based on plant type
    "other_vegetable": {"N": 130, "P": 80, "K": 120},
    "other_grain": {"N": 110, "P": 55, "K": 65},
    "other_fruit": {"N": 140, "P": 90, "K": 140},
    "other_general": {"N": 120, "P": 70, "K": 100},
}

# Growth stage adjustment factors
GROWTH_STAGES = {
    "planting": 0.4,      # Early stage needs less
    "vegetative": 0.7,    # Growing stage needs moderate amounts
    "flowering": 1.0,     # Flowering/fruiting needs full amount
    "harvesting": 0.2,    # Pre-harvest needs minimal
}

# Soil type adjustment factors
SOIL_ADJUSTMENTS = {
    "sandy": {"N": 1.2, "P": 1.1, "K": 1.0},    # Sandy soils leach nutrients faster
    "loamy": {"N": 1.0, "P": 1.0, "K": 1.0},    # Loamy is baseline
    "clay": {"N": 0.9, "P": 1.1, "K": 1.0},     # Clay holds nutrients better but may bind P
}

# Common fertilizers with nutrient content percentages
FERTILIZERS = {
    "urea": {"N": 46, "P": 0, "K": 0},
    "DAP": {"N": 18, "P": 46, "K": 0},
    "MOP": {"N": 0, "P": 0, "K": 60},
    "NPK_15_15_15": {"N": 15, "P": 15, "K": 15},
}

# Unit conversion factors
AREA_CONVERSIONS = {
    "hectare_to_acre": 2.47105,
    "acre_to_hectare": 0.404686,
}

def calculate_fertilizer(crop, area, area_unit, growth_stage, soil_type=None, nutrient_focus=None, custom_crop_name=None, custom_crop_type=None):
    """
    Calculate fertilizer requirements based on crop, area, growth stage and soil type.
    
    Args:
        crop (str): Type of crop
        area (float): Size of the plot
        area_unit (str): Unit of measurement ('hectare' or 'acre')
        growth_stage (str): Current growth stage of the crop
        soil_type (str, optional): Type of soil
        nutrient_focus (str, optional): Nutrient to emphasize ('N', 'P', or 'K')
        custom_crop_name (str, optional): Custom name for 'other' crop type
        custom_crop_type (str, optional): Category for custom crop ('vegetable', 'grain', 'fruit', 'general')
    
    Returns:
        dict: Dictionary containing nutrient requirements and fertilizer recommendations
    """
    # Handle custom crop type
    if crop == "other":
        if not custom_crop_type or custom_crop_type not in ["vegetable", "grain", "fruit", "general"]:
            custom_crop_type = "general"
        
        # Use the appropriate default values
        crop = f"other_{custom_crop_type}"
    
    # Validate inputs
    if crop not in CROP_NUTRIENTS:
        return {"error": "Unsupported crop type"}
    if growth_stage not in GROWTH_STAGES:
        return {"error": "Invalid growth stage"}
    if soil_type and soil_type not in SOIL_ADJUSTMENTS:
        return {"error": "Invalid soil type"}
    
    # Convert area to hectares if needed
    area_in_hectares = area
    if area_unit == "acre":
        area_in_hectares = area * AREA_CONVERSIONS["acre_to_hectare"]
    
    # Get base nutrient requirements
    base_nutrients = CROP_NUTRIENTS[crop]
    
    # Calculate adjusted nutrient requirements
    adjusted_nutrients = {}
    for nutrient in ["N", "P", "K"]:
        # Start with base value
        value = base_nutrients[nutrient]
        
        # Adjust for growth stage
        value *= GROWTH_STAGES[growth_stage]
        
        # Adjust for soil type if provided
        if soil_type:
            value *= SOIL_ADJUSTMENTS[soil_type][nutrient]
        
        # Adjust for nutrient focus if provided (10% increase)
        if nutrient_focus == nutrient:
            value *= 1.1
        
        # Scale for area
        value *= area_in_hectares
        
        # Round to 1 decimal place
        adjusted_nutrients[nutrient] = round(value, 1)
    
    # Calculate fertilizer recommendations
    fertilizer_recommendations = []
    
    # Urea for Nitrogen
    if adjusted_nutrients["N"] > 0:
        urea_amount = round(adjusted_nutrients["N"] * 100 / FERTILIZERS["urea"]["N"], 1)
        fertilizer_recommendations.append({
            "name": "Urea",
            "amount": urea_amount,
            "nutrient": "N",
            "application": "Apply 50% at planting and 50% during vegetative growth"
        })
    
    # DAP for Phosphorus
    if adjusted_nutrients["P"] > 0:
        dap_amount = round(adjusted_nutrients["P"] * 100 / FERTILIZERS["DAP"]["P"], 1)
        fertilizer_recommendations.append({
            "name": "DAP (Diammonium Phosphate)",
            "amount": dap_amount,
            "nutrient": "P",
            "application": "Apply 100% at planting or early growth stage"
        })
    
    # MOP for Potassium
    if adjusted_nutrients["K"] > 0:
        mop_amount = round(adjusted_nutrients["K"] * 100 / FERTILIZERS["MOP"]["K"], 1)
        fertilizer_recommendations.append({
            "name": "MOP (Muriate of Potash)",
            "amount": mop_amount,
            "nutrient": "K",
            "application": "Apply 50% at planting and 50% before flowering"
        })
    
    # Add general application advice
    general_advice = "Apply fertilizers in the early morning or evening. Avoid application before heavy rain."
    environmental_note = "Note: Over-application of fertilizers can harm the environment. Always follow local regulations."
    
    return {
        "nutrients": adjusted_nutrients,
        "recommendations": fertilizer_recommendations,
        "general_advice": general_advice,
        "environmental_note": environmental_note
    }
