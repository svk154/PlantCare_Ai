/**
 * Contains reference data for crop nutrient requirements and fertilizer calculations
 */

// Base nutrient requirements (kg/hectare) for common crops
export const CROP_NUTRIENTS = {
  "rice": { "N": 120, "P": 60, "K": 80 },
  "wheat": { "N": 100, "P": 50, "K": 60 },
  "maize": { "N": 140, "P": 70, "K": 60 },
  "tomato": { "N": 150, "P": 100, "K": 150 },
  "potato": { "N": 120, "P": 100, "K": 150 },
  "cotton": { "N": 100, "P": 50, "K": 50 },
  "soybean": { "N": 80, "P": 60, "K": 40 },
  "coffee": { "N": 200, "P": 100, "K": 200 },
  "sugarcane": { "N": 150, "P": 60, "K": 80 },
};

// Growth stage adjustment factors
export const GROWTH_STAGES = {
  "planting": 0.4,    // Early stage needs less
  "vegetative": 0.7,  // Growing stage needs moderate amounts
  "flowering": 1.0,   // Flowering/fruiting needs full amount
  "harvesting": 0.2,  // Pre-harvest needs minimal
};

// Soil type adjustment factors
export const SOIL_ADJUSTMENTS = {
  "sandy": { "N": 1.2, "P": 1.1, "K": 1.0 },  // Sandy soils leach nutrients faster
  "loamy": { "N": 1.0, "P": 1.0, "K": 1.0 },  // Loamy is baseline
  "clay": { "N": 0.9, "P": 1.1, "K": 1.0 },   // Clay holds nutrients better but may bind P
};

// Common fertilizers with nutrient content percentages
export const FERTILIZERS = {
  "urea": { "N": 46, "P": 0, "K": 0 },
  "DAP": { "N": 18, "P": 46, "K": 0 },
  "MOP": { "N": 0, "P": 0, "K": 60 },
  "NPK_15_15_15": { "N": 15, "P": 15, "K": 15 },
};

// Unit conversion factors
export const AREA_CONVERSIONS = {
  "hectare_to_acre": 2.47105,
  "acre_to_hectare": 0.404686,
};
