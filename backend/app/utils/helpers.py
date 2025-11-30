def calculate_npk_requirements(crop, area, unit):
    CROP_NPK = {
        "Wheat": {"N": 120, "P": 60, "K": 40},
        "Rice": {"N": 100, "P": 50, "K": 50},
        "Corn": {"N": 130, "P": 60, "K": 40},
        "Tomato": {"N": 120, "P": 50, "K": 80},
        "Potato": {"N": 150, "P": 70, "K": 100},
    }
    per_area = CROP_NPK.get(crop)
    multiplier = 1 if unit == "hectare" else 1/2.47105
    return {
        "N": round(per_area["N"] * area * multiplier, 1),
        "P": round(per_area["P"] * area * multiplier, 1),
        "K": round(per_area["K"] * area * multiplier, 1)
    } if per_area else {"error": "Invalid crop"}

def calculate_pesticide_requirements(pesticide, area, unit):
    PESTICIDE_DATA = {
        "Neem Oil": {"dose": 2, "unit": "liters", "dilution": "2ml/liter of water"},
        "Carbendazim": {"dose": 0.5, "unit": "kilograms", "dilution": "1g/liter of water"},
        "Chlorpyrifos": {"dose": 1, "unit": "liters", "dilution": "2ml/liter of water"},
        "Copper Oxychloride": {"dose": 1.5, "unit": "kilograms", "dilution": "1.5g/liter of water"},
        "Mancozeb": {"dose": 2, "unit": "kilograms", "dilution": "2g/liter of water"}
    }
    rec = PESTICIDE_DATA.get(pesticide)
    multiplier = 1 if unit == "hectare" else 1/2.47105
    return {
        "quantity": round(rec["dose"] * area * multiplier, 2),
        "unit": rec["unit"],
        "dilution": rec["dilution"]
    } if rec else {"error": "Invalid pesticide"}

def calculate_profit_estimation(crop, area, unit, market_price, input_cost):
    CROP_DATA = {
        "Wheat": {"defaultPrice": 2200, "unit": "quintal", "yieldPerAcre": 20},
        "Rice": {"defaultPrice": 2100, "unit": "quintal", "yieldPerAcre": 25},
        "Corn": {"defaultPrice": 1800, "unit": "quintal", "yieldPerAcre": 18},
        "Tomato": {"defaultPrice": 1000, "unit": "quintal", "yieldPerAcre": 120},
        "Potato": {"defaultPrice": 900, "unit": "quintal", "yieldPerAcre": 90}
    }
    d = CROP_DATA.get(crop)
    acres = area * 2.47105 if unit == "hectare" else area
    yield_total = d["yieldPerAcre"] * acres if d else 0
    gross = (market_price or d["defaultPrice"]) * yield_total if d else 0
    profit = gross - input_cost if d else 0
    return {
        "yield": yield_total, "gross": gross, "profit": profit
    } if d else {"error": "Invalid crop"}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.',1)[1].lower() in ("jpg","jpeg","png")

def preprocess_image(file):
    # Placeholder: actual preprocessing logic for ML input
    return file

def send_welcome_email(user):
    # Placeholder for flask-mail code
    return True
