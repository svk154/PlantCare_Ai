import React, { useState } from 'react';
import { 
  Box, Typography, Card, CardContent, Button, TextField, Alert, 
  Grid, Paper, CircularProgress, Chip, Collapse, IconButton
} from '@mui/material';
import { Sprout, ArrowRight, CheckCircle, TrendingUp, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import Layout from '../components/Layout';
import CropPredictionHistory from '../components/CropPredictionHistory';

// Crop images mapping
const cropImages = {
  "rice": "/crop-images/rice.jpg",
  "maize": "/crop-images/maize.jpg",
  "chickpea": "/crop-images/chickpea.jpg",
  "kidneybeans": "/crop-images/kidneybeans.jpg",
  "pigeonpeas": "/crop-images/pigeonpeas.jpg", // Note: may not have image
  "mothbeans": "/crop-images/mothbeans.jpg",
  "mungbean": "/crop-images/mungbean.jpg",
  "blackgram": "/crop-images/blackgram.jpg",
  "lentil": "/crop-images/lentil.jpg",
  "pomegranate": "/crop-images/pomegranate.jpg",
  "banana": "/crop-images/banana.jpg",
  "mango": "/crop-images/mango.jpg",
  "grapes": "/crop-images/grapes.jpg",
  "watermelon": "/crop-images/watermelon.jpg",
  "muskmelon": "/crop-images/muskmelon.jpg",
  "apple": "/crop-images/apple.jpg",
  "orange": "/crop-images/orange.jpg",
  "papaya": "/crop-images/papaya.jpg",
  "coconut": "/crop-images/coconut.jpg",
  "cotton": "/crop-images/cotton.jpg",
  "jute": "/crop-images/jute.jpg",
  "coffee": "/crop-images/coffee.jpg"
};

export default function CropRecommendation() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [showStep1Guide, setShowStep1Guide] = useState(false);
  const [showStep2Guide, setShowStep2Guide] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep1 = () => {
    const requiredFields = ['N', 'P', 'K', 'temperature'];
    const emptyFields = requiredFields.filter(field => !formData[field]);
    
    if (emptyFields.length > 0) {
      setError('Please fill in all soil and temperature information');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const requiredFields = ['humidity', 'ph', 'rainfall'];
    const emptyFields = requiredFields.filter(field => !formData[field]);
    
    if (emptyFields.length > 0) {
      setError('Please fill in all environmental conditions');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/crop-predictions/recommend-crop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get crop recommendation');
      }

      setResult(data);
      setCurrentStep(3); // Results step
      setHistoryRefreshKey(prev => prev + 1); // Refresh history
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      N: '',
      P: '',
      K: '',
      temperature: '',
      humidity: '',
      ph: '',
      rainfall: ''
    });
    setResult(null);
    setError('');
    setCurrentStep(1);
  };

  return (
    <Layout isLoggedIn={true}>
      <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 3 }}>
        {/* Header */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Sprout size={32} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Crop Recommendation
            </Typography>
          </Box>
          <Typography variant="body1">
            Get personalized crop recommendations based on your soil and environmental conditions
          </Typography>
        </Paper>

        {/* Farmer's Guide Note - Collapsible */}
        <Card sx={{ mb: 3, border: '1px solid #e8f5e8' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#2e7d32' }}>
                <HelpCircle size={20} />
                How This Helps Your Farming
              </Typography>
              <IconButton 
                onClick={() => setShowGuide(!showGuide)} 
                size="small"
                sx={{ color: '#2e7d32' }}
              >
                {showGuide ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </IconButton>
            </Box>
            <Collapse in={showGuide}>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>🌱 Why Use This Tool?</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      • Choose the right crop for your soil conditions<br/>
                      • Increase your chances of a successful harvest<br/>
                      • Optimize your farm's productivity and profits<br/>
                      • Reduce crop failure risks
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>📋 What You Need:</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Soil test results (NPK values)<br/>
                      • Current weather conditions<br/>
                      • Soil pH level (get from soil testing)<br/>
                      • Expected rainfall data
                    </Typography>
                  </Grid>
                </Grid>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <strong>💡 Tip:</strong> Get your soil tested at your local agriculture department or use a home soil testing kit for accurate NPK and pH values.
                </Alert>
              </Box>
            </Collapse>
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <Chip
                    label={step === 1 ? 'Soil Data' : step === 2 ? 'Environment' : 'Results'}
                    color={currentStep >= step ? 'primary' : 'default'}
                    variant={currentStep === step ? 'filled' : 'outlined'}
                    icon={currentStep > step ? <CheckCircle size={16} /> : undefined}
                  />
                  {step < 3 && <ArrowRight size={16} color="#666" />}
                </React.Fragment>
              ))}
            </Box>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Step 1: Soil Parameters */}
        {currentStep === 1 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Sprout size={20} />
                Soil Nutrient Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter the nutrient levels in your soil (NPK values) and current temperature
              </Typography>
              
              {/* Collapsible NPK guide */}
              <Box sx={{ mb: 2 }}>
                <Button 
                  variant="text" 
                  startIcon={showStep1Guide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  onClick={() => setShowStep1Guide(!showStep1Guide)}
                  sx={{ color: '#2e7d32', p: 0, textTransform: 'none' }}
                  size="small"
                >
                  📖 What is NPK? (Click to learn)
                </Button>
                <Collapse in={showStep1Guide}>
                  <Alert severity="info" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      • <strong>N (Nitrogen)</strong>: Helps plants grow green leaves and stems<br/>
                      • <strong>P (Phosphorus)</strong>: Helps with root development and flowering<br/>
                      • <strong>K (Potassium)</strong>: Improves plant disease resistance and fruit quality<br/>
                      <em>Get these values from a soil test at your local agriculture office.</em>
                    </Typography>
                  </Alert>
                </Collapse>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nitrogen (N)"
                    type="number"
                    fullWidth
                    value={formData.N}
                    onChange={(e) => handleInputChange('N', e.target.value)}
                    helperText="Nitrogen content (0-200)"
                    inputProps={{ min: 0, max: 200 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phosphorous (P)"
                    type="number"
                    fullWidth
                    value={formData.P}
                    onChange={(e) => handleInputChange('P', e.target.value)}
                    helperText="Phosphorous content (0-200)"
                    inputProps={{ min: 0, max: 200 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Potassium (K)"
                    type="number"
                    fullWidth
                    value={formData.K}
                    onChange={(e) => handleInputChange('K', e.target.value)}
                    helperText="Potassium content (0-200)"
                    inputProps={{ min: 0, max: 200 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Temperature (°C)"
                    type="number"
                    fullWidth
                    value={formData.temperature}
                    onChange={(e) => handleInputChange('temperature', e.target.value)}
                    helperText="Current temperature (0-50°C)"
                    inputProps={{ min: 0, max: 50 }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button 
                  variant="contained" 
                  onClick={nextStep}
                  endIcon={<ArrowRight size={16} />}
                  disabled={!formData.N || !formData.P || !formData.K || !formData.temperature}
                >
                  Next: Environmental Data
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Environmental Parameters */}
        {currentStep === 2 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp size={20} />
                Environmental Conditions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter the current environmental conditions in your area
              </Typography>

              {/* Collapsible environmental guide */}
              <Box sx={{ mb: 2 }}>
                <Button 
                  variant="text" 
                  startIcon={showStep2Guide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  onClick={() => setShowStep2Guide(!showStep2Guide)}
                  sx={{ color: '#2e7d32', p: 0, textTransform: 'none' }}
                  size="small"
                >
                  🌤️ Environmental Factors Guide (Click to learn)
                </Button>
                <Collapse in={showStep2Guide}>
                  <Alert severity="success" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      • <strong>Humidity</strong>: Check local weather apps or use a hygrometer<br/>
                      • <strong>pH Level</strong>: 6.0-7.0 is ideal for most crops (test your soil)<br/>
                      • <strong>Rainfall</strong>: Expected rainfall this season (check weather forecasts)<br/>
                      <em>These factors help determine which crops will thrive in your conditions.</em>
                    </Typography>
                  </Alert>
                </Collapse>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Humidity (%)"
                    type="number"
                    fullWidth
                    value={formData.humidity}
                    onChange={(e) => handleInputChange('humidity', e.target.value)}
                    helperText="Relative humidity (0-100%)"
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="pH Value"
                    type="number"
                    fullWidth
                    value={formData.ph}
                    onChange={(e) => handleInputChange('ph', e.target.value)}
                    helperText="Soil pH level (0-14)"
                    inputProps={{ min: 0, max: 14, step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Rainfall (mm)"
                    type="number"
                    fullWidth
                    value={formData.rainfall}
                    onChange={(e) => handleInputChange('rainfall', e.target.value)}
                    helperText="Expected or recent rainfall (0-500mm)"
                    inputProps={{ min: 0, max: 500 }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button 
                  variant="outlined" 
                  onClick={prevStep}
                >
                  Back
                </Button>
                <Button 
                  variant="contained" 
                  onClick={nextStep}
                  endIcon={loading ? <CircularProgress size={16} /> : <CheckCircle size={16} />}
                  disabled={loading || !formData.humidity || !formData.ph || !formData.rainfall}
                >
                  {loading ? 'Analyzing...' : 'Get Recommendation'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Results */}
        {currentStep === 3 && result && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle size={20} />
                Crop Recommendation
              </Typography>

              <Box sx={{ textAlign: 'center', p: 3 }}>
                {/* Crop Image */}
                {result.predicted_crop && cropImages[result.predicted_crop.toLowerCase()] && (
                  <Box sx={{ 
                    mb: 3, 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center' 
                  }}>
                    <img 
                      src={cropImages[result.predicted_crop.toLowerCase()]} 
                      alt={result.predicted_crop}
                      style={{
                        width: '200px',
                        height: '200px',
                        borderRadius: '12px',
                        objectFit: 'cover',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        display: 'block',
                        margin: '0 auto'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </Box>
                )}
                
                <Typography variant="h3" component="h2" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                  {result.predicted_crop ? result.predicted_crop.charAt(0).toUpperCase() + result.predicted_crop.slice(1) : 'Unknown'}
                </Typography>
                
                {result.confidence && (
                  <Chip 
                    label={`Confidence: ${(result.confidence * 100).toFixed(1)}%`}
                    color="success"
                    sx={{ mb: 3 }}
                  />
                )}

                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Based on your soil and environmental conditions, we recommend growing <strong>{result.predicted_crop}</strong>.
                </Typography>

                {/* Input Summary */}
                <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Your Conditions:
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="caption" color="text.secondary">Nitrogen</Typography>
                      <Typography variant="body2" fontWeight="bold">{formData.N}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="caption" color="text.secondary">Phosphorous</Typography>
                      <Typography variant="body2" fontWeight="bold">{formData.P}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="caption" color="text.secondary">Potassium</Typography>
                      <Typography variant="body2" fontWeight="bold">{formData.K}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="caption" color="text.secondary">Temperature</Typography>
                      <Typography variant="body2" fontWeight="bold">{formData.temperature}°C</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="caption" color="text.secondary">Humidity</Typography>
                      <Typography variant="body2" fontWeight="bold">{formData.humidity}%</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="caption" color="text.secondary">pH</Typography>
                      <Typography variant="body2" fontWeight="bold">{formData.ph}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="caption" color="text.secondary">Rainfall</Typography>
                      <Typography variant="body2" fontWeight="bold">{formData.rainfall}mm</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button 
                  variant="outlined" 
                  onClick={resetForm}
                >
                  New Analysis
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => window.location.href = '/yield-prediction'}
                >
                  Predict Yield
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Crop Recommendation History */}
        <Box sx={{ mt: 4 }}>
          <CropPredictionHistory type="recommendation" refreshKey={historyRefreshKey} />
        </Box>
      </Box>
    </Layout>
  );
}