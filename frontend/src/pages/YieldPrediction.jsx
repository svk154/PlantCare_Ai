import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Button, TextField, MenuItem, Alert, 
  Grid, Paper, CircularProgress, Chip, Collapse, IconButton
} from '@mui/material';
import { TrendingUp, ArrowRight, CheckCircle, BarChart3, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
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

export default function YieldPrediction() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    Crop: '',
    Season: '',
    State: '',
    Annual_Rainfall: '',
    Fertilizer: '',
    Pesticide: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [showStep1Guide, setShowStep1Guide] = useState(false);
  const [showStep2Guide, setShowStep2Guide] = useState(false);
  const [options, setOptions] = useState({
    crops: [],
    seasons: [],
    states: []
  });

  // Load dropdown options on component mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const response = await fetch('/api/crop-predictions/crop-options');
        if (response.ok) {
          const data = await response.json();
          setOptions(data);
        }
      } catch (err) {
        console.error('Error loading options:', err);
      }
    };
    
    loadOptions();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep1 = () => {
    const requiredFields = ['Crop', 'Season', 'State'];
    const emptyFields = requiredFields.filter(field => !formData[field]);
    
    if (emptyFields.length > 0) {
      setError('Please select crop, season, and state');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const requiredFields = ['Annual_Rainfall', 'Fertilizer', 'Pesticide'];
    const emptyFields = requiredFields.filter(field => !formData[field]);
    
    if (emptyFields.length > 0) {
      setError('Please fill in all input parameters');
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
      const response = await fetch('/api/crop-predictions/predict-yield', {
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
        throw new Error(data.error || 'Failed to predict yield');
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
      Crop: '',
      Season: '',
      State: '',
      Annual_Rainfall: '',
      Fertilizer: '',
      Pesticide: ''
    });
    setResult(null);
    setError('');
    setCurrentStep(1);
  };

  return (
    <Layout isLoggedIn={true}>
      <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 3 }}>
        {/* Header */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <BarChart3 size={32} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Crop Yield Prediction
            </Typography>
          </Box>
          <Typography variant="body1">
            Predict expected crop yield based on your farming conditions and inputs
          </Typography>
        </Paper>

        {/* Farmer's Guide Note - Collapsible */}
        <Card sx={{ mb: 3, border: '1px solid #fff3e0' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#f57c00' }}>
                <HelpCircle size={20} />
                How Yield Prediction Helps Your Farm Business
              </Typography>
              <IconButton 
                onClick={() => setShowGuide(!showGuide)} 
                size="small"
                sx={{ color: '#f57c00' }}
              >
                {showGuide ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </IconButton>
            </Box>
            <Collapse in={showGuide}>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>💰 Business Benefits:</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      • Plan your harvest timing and labor needs<br/>
                      • Estimate income from your crops<br/>
                      • Negotiate better prices with buyers<br/>
                      • Plan storage and transportation<br/>
                      • Make informed farming decisions
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>📊 What You'll Get:</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Expected yield in tons per hectare<br/>
                      • Comparison with regional averages<br/>
                      • Historical data for planning<br/>
                      • Insights for next season improvements
                    </Typography>
                  </Grid>
                </Grid>
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <strong>⚠️ Remember:</strong> Predictions are estimates based on historical data. Actual yields may vary due to weather, pests, diseases, and farming practices.
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
                    label={step === 1 ? 'Crop Details' : step === 2 ? 'Farm Inputs' : 'Results'}
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

        {/* Step 1: Crop Selection */}
        {currentStep === 1 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp size={20} />
                Crop and Location Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select the crop you want to grow and your farming location
              </Typography>

              {/* Collapsible crop selection guide */}
              <Box sx={{ mb: 2 }}>
                <Button 
                  variant="text" 
                  startIcon={showStep1Guide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  onClick={() => setShowStep1Guide(!showStep1Guide)}
                  sx={{ color: '#f57c00', p: 0, textTransform: 'none' }}
                  size="small"
                >
                  🌾 Choose Your Crop & Season Guide (Click to learn)
                </Button>
                <Collapse in={showStep1Guide}>
                  <Alert severity="info" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      • <strong>Crop Selection</strong>: Pick the crop you plan to grow this season<br/>
                      • <strong>Season</strong>: Kharif (monsoon), Rabi (winter), or year-round crops<br/>
                      • <strong>Location</strong>: Your state affects climate and soil conditions<br/>
                      <em>These factors significantly impact your expected yield.</em>
                    </Typography>
                  </Alert>
                </Collapse>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Select Crop"
                    select
                    fullWidth
                    value={formData.Crop}
                    onChange={(e) => handleInputChange('Crop', e.target.value)}
                  >
                    {options.crops.map((crop) => (
                      <MenuItem key={crop} value={crop}>
                        {crop}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Select Season"
                    select
                    fullWidth
                    value={formData.Season}
                    onChange={(e) => handleInputChange('Season', e.target.value)}
                  >
                    {options.seasons.map((season) => (
                      <MenuItem key={season} value={season}>
                        {season}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Select State"
                    select
                    fullWidth
                    value={formData.State}
                    onChange={(e) => handleInputChange('State', e.target.value)}
                  >
                    {options.states.map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button 
                  variant="contained" 
                  onClick={nextStep}
                  endIcon={<ArrowRight size={16} />}
                  disabled={!formData.Crop || !formData.Season || !formData.State}
                >
                  Next: Farm Inputs
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Farm Inputs */}
        {currentStep === 2 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChart3 size={20} />
                Farming Inputs & Conditions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter your planned farming inputs and expected rainfall
              </Typography>

              {/* Collapsible farming inputs guide */}
              <Box sx={{ mb: 2 }}>
                <Button 
                  variant="text" 
                  startIcon={showStep2Guide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  onClick={() => setShowStep2Guide(!showStep2Guide)}
                  sx={{ color: '#2e7d32', p: 0, textTransform: 'none' }}
                  size="small"
                >
                  💡 Input Planning Tips (Click to learn)
                </Button>
                <Collapse in={showStep2Guide}>
                  <Alert severity="success" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      • <strong>Rainfall</strong>: Check weather forecasts or historical data for your area<br/>
                      • <strong>Fertilizer</strong>: Amount you plan to use (kg per hectare)<br/>
                      • <strong>Pesticide</strong>: Budget for pest control (kg per hectare)<br/>
                      <em>Proper input planning leads to better yields and profits!</em>
                    </Typography>
                  </Alert>
                </Collapse>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Annual Rainfall (mm)"
                    type="number"
                    fullWidth
                    value={formData.Annual_Rainfall}
                    onChange={(e) => handleInputChange('Annual_Rainfall', e.target.value)}
                    helperText="Expected or average annual rainfall in your area"
                    inputProps={{ min: 0, step: 10 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Fertilizer Usage (kg)"
                    type="number"
                    fullWidth
                    value={formData.Fertilizer}
                    onChange={(e) => handleInputChange('Fertilizer', e.target.value)}
                    helperText="Total fertilizer to be used"
                    inputProps={{ min: 0, step: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Pesticide Usage (kg)"
                    type="number"
                    fullWidth
                    value={formData.Pesticide}
                    onChange={(e) => handleInputChange('Pesticide', e.target.value)}
                    helperText="Total pesticide to be used"
                    inputProps={{ min: 0, step: 0.1 }}
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
                  disabled={loading || !formData.Annual_Rainfall || !formData.Fertilizer || !formData.Pesticide}
                >
                  {loading ? 'Predicting...' : 'Predict Yield'}
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
                Yield Prediction Results
              </Typography>

              <Box sx={{ textAlign: 'center', p: 3 }}>
                {/* Crop Image */}
                {formData.Crop && cropImages[formData.Crop.toLowerCase()] && (
                  <Box sx={{ 
                    mb: 3, 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center' 
                  }}>
                    <img 
                      src={cropImages[formData.Crop.toLowerCase()]} 
                      alt={formData.Crop}
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
                
                <Typography variant="h2" component="h2" sx={{ mb: 1, color: 'primary.main', fontWeight: 'bold' }}>
                  {result.predicted_yield ? result.predicted_yield.toFixed(2) : '0'}
                </Typography>
                
                <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                  {result.unit || 'tons/hectare'}
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Based on your farming conditions, you can expect approximately <strong>{result.predicted_yield?.toFixed(2)} tons per hectare</strong> of {formData.Crop.toLowerCase()} yield.
                </Typography>

                {/* Input Summary */}
                <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Your Farming Plan:
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="caption" color="text.secondary">Crop</Typography>
                      <Typography variant="body2" fontWeight="bold">{formData.Crop}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="caption" color="text.secondary">Season</Typography>
                      <Typography variant="body2" fontWeight="bold">{formData.Season}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="caption" color="text.secondary">State</Typography>
                      <Typography variant="body2" fontWeight="bold">{formData.State}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="caption" color="text.secondary">Rainfall</Typography>
                      <Typography variant="body2" fontWeight="bold">{formData.Annual_Rainfall}mm</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="caption" color="text.secondary">Fertilizer</Typography>
                      <Typography variant="body2" fontWeight="bold">{formData.Fertilizer}kg</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="caption" color="text.secondary">Pesticide</Typography>
                      <Typography variant="body2" fontWeight="bold">{formData.Pesticide}kg</Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Additional Information */}
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Note:</strong> This prediction is based on historical data and machine learning models. 
                    Actual yield may vary depending on weather conditions, soil quality, and farming practices.
                  </Typography>
                </Alert>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button 
                  variant="outlined" 
                  onClick={resetForm}
                >
                  New Prediction
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => window.location.href = '/crop-recommendation'}
                >
                  Find Best Crop
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Crop Yield Prediction History */}
        <Box sx={{ mt: 4 }}>
          <CropPredictionHistory type="yield" refreshKey={historyRefreshKey} />
        </Box>
      </Box>
    </Layout>
  );
}