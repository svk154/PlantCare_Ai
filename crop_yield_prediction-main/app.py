# app.py

import streamlit as st
import pandas as pd
import joblib

# Load saved model
model = joblib.load("best_crop_yield_model.pkl")

st.set_page_config(page_title="Crop Yield Predictor", page_icon="🌾", layout="centered")

st.title("🌾 Crop Yield Prediction App")
st.markdown("Enter crop and environmental details to predict the **expected yield (tons/hectare)**.")

# ---------------- Inputs ----------------
crop = st.selectbox("Select Crop", ["Rice", "Wheat", "Maize", "Pulses", "Sugarcane", "Cotton", "Oilseeds"])
season = st.selectbox("Select Season", ["Kharif", "Rabi", "Whole Year", "Summer", "Winter"])
state = st.selectbox("Select State", [
    "Andhra Pradesh", "Bihar", "Gujarat", "Karnataka", "Maharashtra",
    "Punjab", "Tamil Nadu", "Uttar Pradesh", "West Bengal", "Others"
])

rainfall = st.number_input("Annual Rainfall (mm)", min_value=0.0, step=10.0)
fertilizer = st.number_input("Fertilizer Used (kg)", min_value=0.0, step=1.0)
pesticide = st.number_input("Pesticide Used (kg)", min_value=0.0, step=1.0)

# ---------------- Prediction ----------------
if st.button("Predict Yield"):
    data = pd.DataFrame({
        "Crop": [crop],
        "Season": [season],
        "State": [state],
        "Annual_Rainfall": [rainfall],
        "Fertilizer": [fertilizer],
        "Pesticide": [pesticide]
    })

    prediction = model.predict(data)[0]
    st.success(f"🌱 Predicted Crop Yield: **{prediction:.2f} tons/hectare**")
