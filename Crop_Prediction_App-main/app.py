import streamlit as st
import joblib
import numpy as np
import pandas as pd
from PIL import Image

# ---------------------------
# Load trained model + encoder
# ---------------------------
model = joblib.load("best_model.pkl")   # trained RandomForest/XGBoost model
label_encoder = joblib.load("label_encoder.pkl")  # LabelEncoder used during training

# ---------------------------
# Crop images (add your own paths inside "images/" folder)
# ---------------------------
crop_images = {
    "rice": "images/rice.jpg",
    "maize": "images/maize.jpg",
    "chickpea": "images/chickpea.jpg",
    "kidneybeans": "images/kidneybeans.jpg",
    "pigeonpeas": "images/pigeonpeas.jpg",
    "mothbeans": "images/mothbeans.jpg",
    "mungbean": "images/mungbean.jpg",
    "blackgram": "images/blackgram.jpg",
    "lentil": "images/lentil.jpg",
    "pomegranate": "images/pomegranate.jpg",
    "banana": "images/banana.jpg",
    "mango": "images/mango.jpg",
    "grapes": "images/grapes.jpg",
    "watermelon": "images/watermelon.jpg",
    "muskmelon": "images/muskmelon.jpg",
    "apple": "images/apple.jpg",
    "orange": "images/orange.jpg",
    "papaya": "images/papaya.jpg",
    "coconut": "images/coconut.jpg",
    "cotton": "images/cotton.jpg",
    "jute": "images/jute.jpg",
    "coffee": "images/coffee.jpg"
}

# ---------------------------
# Streamlit UI
# ---------------------------
st.set_page_config(page_title="Crop Recommendation App", page_icon="🌾", layout="centered")

# App title
st.title("🌱 Crop Prediction App")
st.markdown("Enter soil and weather parameters to get the recommended crop.")

# Add farming banner
st.image("images/farming_banner.jpg", use_container_width=True)

# ---------------------------
# Input fields
# ---------------------------
col1, col2 = st.columns(2)

with col1:
    N = st.number_input("Nitrogen (N)", min_value=0, max_value=200, value=50)
    P = st.number_input("Phosphorous (P)", min_value=0, max_value=200, value=50)
    K = st.number_input("Potassium (K)", min_value=0, max_value=200, value=50)
    ph = st.number_input("pH value", min_value=0.0, max_value=14.0, value=6.5)

with col2:
    temperature = st.number_input("Temperature (°C)", min_value=0.0, max_value=50.0, value=25.0)
    humidity = st.number_input("Humidity (%)", min_value=0.0, max_value=100.0, value=60.0)
    rainfall = st.number_input("Rainfall (mm)", min_value=0.0, max_value=300.0, value=100.0)

# ---------------------------
# Predict button
# ---------------------------
if st.button("🌾 Predict Crop"):
    # Prepare input as DataFrame with correct feature names
    input_data = pd.DataFrame([[N, P, K, temperature, humidity, ph, rainfall]],
                              columns=["N", "P", "K", "temperature", "humidity", "ph", "rainfall"])
    
    # Predict numeric label
    prediction = model.predict(input_data)[0]
    
    # Decode to crop name
    predicted_crop = label_encoder.inverse_transform([prediction])[0]
    
    # Show result
    st.success(f"✅ Recommended Crop: **{predicted_crop.capitalize()}**")

    # Show crop image if available
    if predicted_crop.lower() in crop_images:
        img_path = crop_images[predicted_crop.lower()]
        try:
            img = Image.open(img_path)
            st.image(img, caption=predicted_crop.capitalize(), use_container_width=False, width=300)
        except:
            st.warning("⚠️ Image not found for this crop.")
