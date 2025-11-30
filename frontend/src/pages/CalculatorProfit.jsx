import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, TextField, MenuItem, Alert, Chip, Grid, Paper, Stepper, Step, StepLabel } from '@mui/material';
import { BarChart3, TrendingUp, ArrowRight, ArrowLeft, DollarSign, Calculator, Sprout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PastCalculations from '../components/PastCalculations';

// Simplified crop data for farmers
const cropData = {
  wheat: { 
    name: 'Wheat', 
    icon: '🌾', 
    price: 2200, 
    unit: 'quintal', 
    yield: 20, 
    season: 'Rabi',
    color: '#fbbf24'
  },
  rice: { 
    name: 'Rice', 
    icon: '🌾', 
    price: 2100, 
    unit: 'quintal', 
    yield: 25, 
    season: 'Kharif',
    color: '#10b981'
  },
  corn: { 
    name: 'Corn/Maize', 
    icon: '🌽', 
    price: 1800, 
    unit: 'quintal', 
    yield: 18, 
    season: 'Kharif',
    color: '#f59e0b'
  },
  tomato: { 
    name: 'Tomato', 
    icon: '🍅', 
    price: 1000, 
    unit: 'quintal', 
    yield: 120, 
    season: 'Both',
    color: '#ef4444'
  },
  potato: { 
    name: 'Potato', 
    icon: '🥔', 
    price: 900, 
    unit: 'quintal', 
    yield: 90, 
    season: 'Both',
    color: '#a855f7'
  },
  onion: { 
    name: 'Onion', 
    icon: '🧅', 
    price: 1200, 
    unit: 'quintal', 
    yield: 80, 
    season: 'Both',
    color: '#8b5cf6'
  }
};

const steps = ['Select Crop', 'Farm Area', 'Costs & Prices', 'Results'];

export default function CalculatorProfit() {
  const navigate = useNavigate();
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  
  // Step management for mobile-first wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    crop: '',
    area: '',
    unit: 'acre',
    marketPrice: '',
    inputCost: '',
    useCustomYield: false,
    customYield: '',
    customCropName: '',
    customCropUnit: 'quintal',
    isCustomCrop: false
  });
  
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const calculateProfit = async () => {
    const area = parseFloat(formData.area);
    const marketPrice = parseFloat(formData.marketPrice);
    const inputCost = parseFloat(formData.inputCost) || 0;
    
    // Calculate area in acres (if hectare, convert)
    const areaInAcres = formData.unit === 'hectare' ? area * 2.47 : area;
    
    // Get crop info and yield
    let cropInfo, yieldPerAcre, yieldUnit;
    
    if (formData.isCustomCrop) {
      cropInfo = {
        name: formData.customCropName,
        unit: formData.customCropUnit
      };
      yieldPerAcre = parseFloat(formData.customYield);
      yieldUnit = formData.customCropUnit;
    } else {
      cropInfo = cropData[formData.crop];
      yieldPerAcre = formData.useCustomYield && formData.customYield 
        ? parseFloat(formData.customYield) 
        : cropInfo.yield;
      yieldUnit = cropInfo.unit;
    }
    
    const totalYield = Math.round(yieldPerAcre * areaInAcres);
    
    // Calculate revenue
    const totalRevenue = totalYield * marketPrice;
    
    // Calculate profit
    const totalProfit = totalRevenue - inputCost;
    const profitPerAcre = Math.round(totalProfit / areaInAcres);
    const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);
    
    // Break-even price
    const breakEvenPrice = Math.round(inputCost / totalYield);
    
    const resultData = {
      crop: cropInfo.name,
      area: formData.area,
      unit: formData.unit,
      totalYield,
      yieldUnit: yieldUnit,
      marketPrice,
      inputCost,
      totalRevenue,
      totalProfit,
      profitPerAcre,
      profitMargin,
      breakEvenPrice,
      isProfit: totalProfit > 0
    };

    setResult(resultData);
    setCurrentStep(4);
    setError('');

    // Save to backend API
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const apiData = {
          calculator_type: 'profit',
          input_data: {
            area: area,
            unit: formData.unit,
            crop: formData.isCustomCrop ? 'custom' : formData.crop,
            crop_name: cropInfo.name,
            input_cost: inputCost,
            market_price: marketPrice,
            is_custom_crop: formData.isCustomCrop,
            custom_crop_unit: formData.isCustomCrop ? formData.customCropUnit : null,
            use_custom_yield: formData.useCustomYield || formData.isCustomCrop,
            custom_yield: formData.isCustomCrop ? formData.customYield : formData.customYield
          },
          result_data: {
            yield: totalYield,
            revenue: totalRevenue,
            profit: totalProfit,
            profit_margin: profitMargin,
            break_even_price: breakEvenPrice
          }
        };
        
        const response = await fetch(`${API_BASE_URL}/calculator-results/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(apiData)
        });
        
        if (response.ok) {
          setHistoryRefreshKey(prev => prev + 1);
        }
      }
    } catch (err) {
      // Silent fail for API save
    }

    // Save to localStorage backup
    try {
      const savedCalculations = JSON.parse(localStorage.getItem('profitCalculations') || '[]');
      savedCalculations.push({
        calculator_type: 'profit',
        input_data: {
          area: area,
          unit: formData.unit,
          crop: formData.isCustomCrop ? 'custom' : formData.crop,
          crop_name: cropInfo.name,
          input_cost: inputCost,
          market_price: marketPrice,
          is_custom_crop: formData.isCustomCrop,
          custom_crop_unit: formData.isCustomCrop ? formData.customCropUnit : null,
          use_custom_yield: formData.useCustomYield || formData.isCustomCrop,
          custom_yield: formData.isCustomCrop ? formData.customYield : formData.customYield
        },
        result_data: {
          yield: totalYield,
          revenue: totalRevenue,
          profit: totalProfit,
          profit_margin: profitMargin,
          break_even_price: breakEvenPrice
        },
        timestamp: new Date().toISOString()
      });
      const recentCalculations = savedCalculations.slice(Math.max(savedCalculations.length - 10, 0));
      localStorage.setItem('profitCalculations', JSON.stringify(recentCalculations));
      setHistoryRefreshKey(prev => prev + 1);
    } catch (err) {
      // Silent fail for history storage
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      crop: '',
      area: '',
      unit: 'acre',
      marketPrice: '',
      inputCost: '',
      useCustomYield: false,
      customYield: '',
      customCropName: '',
      customCropUnit: 'quintal',
      isCustomCrop: false
    });
    setResult(null);
    setError('');
  };

  // Step 1: Crop Selection
  const renderCropSelection = () => (
    <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <CardContent sx={{ p: 4 }}>
        <Box textAlign="center" mb={4}>
          <Sprout size={48} color="#16a34a" />
          <Typography variant="h5" fontWeight="bold" mt={2} mb={1}>
            Choose Your Crop
          </Typography>
          <Typography color="text.secondary">
            Select the crop you want to analyze for profit
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {Object.entries(cropData).map(([key, crop]) => (
            <Grid item xs={6} sm={4} key={key}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: formData.crop === key ? '3px solid #16a34a' : '2px solid #e5e7eb',
                  '&:hover': { borderColor: '#16a34a' },
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
                onClick={() => setFormData({...formData, crop: key, isCustomCrop: false})}
              >
                <Typography variant="h3" mb={1}>{crop.icon}</Typography>
                <Typography fontWeight="bold" fontSize="1.1rem" mb={1}>
                  {crop.name}
                </Typography>
                <Chip 
                  label={crop.season} 
                  size="small" 
                  sx={{ bgcolor: crop.color, color: 'white', fontSize: '0.75rem' }}
                />
                <Typography variant="body2" color="text.secondary" mt={1}>
                  ~{crop.yield} {crop.unit}/acre
                </Typography>
              </Card>
            </Grid>
          ))}
          
          {/* Other/Custom Crop Option */}
          <Grid item xs={6} sm={4}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: formData.isCustomCrop ? '3px solid #16a34a' : '2px solid #e5e7eb',
                '&:hover': { borderColor: '#16a34a' },
                borderRadius: 2,
                p: 2,
                textAlign: 'center',
                transition: 'all 0.2s'
              }}
              onClick={() => setFormData({...formData, crop: 'other', isCustomCrop: true})}
            >
              <Typography variant="h3" mb={1}>🌱</Typography>
              <Typography fontWeight="bold" fontSize="1.1rem" mb={1}>
                Other Crop
              </Typography>
              <Chip 
                label="Custom" 
                size="small" 
                sx={{ bgcolor: '#6b7280', color: 'white', fontSize: '0.75rem' }}
              />
              <Typography variant="body2" color="text.secondary" mt={1}>
                Enter your own crop
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Custom Crop Input Fields */}
        {formData.isCustomCrop && (
          <Box mt={3}>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography fontWeight="bold">
                📝 Enter Your Crop Details
              </Typography>
              <Typography variant="body2">
                Please provide information about your specific crop
              </Typography>
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Crop Name"
                  placeholder="e.g., Sugarcane, Cotton, etc."
                  value={formData.customCropName}
                  onChange={(e) => setFormData({...formData, customCropName: e.target.value})}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Unit of Measurement"
                  value={formData.customCropUnit}
                  onChange={(e) => setFormData({...formData, customCropUnit: e.target.value})}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  <MenuItem value="quintal">Quintal</MenuItem>
                  <MenuItem value="kg">Kilogram</MenuItem>
                  <MenuItem value="ton">Ton</MenuItem>
                  <MenuItem value="bags">Bags</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        )}

        {(formData.crop && !formData.isCustomCrop) && (
          <Alert severity="success" sx={{ mt: 3, borderRadius: 2 }}>
            <Typography fontWeight="bold">
              ✅ {cropData[formData.crop].name} selected
            </Typography>
            <Typography variant="body2">
              Expected yield: {cropData[formData.crop].yield} {cropData[formData.crop].unit} per acre
            </Typography>
          </Alert>
        )}

        {formData.isCustomCrop && formData.customCropName && (
          <Alert severity="success" sx={{ mt: 3, borderRadius: 2 }}>
            <Typography fontWeight="bold">
              ✅ {formData.customCropName} selected
            </Typography>
            <Typography variant="body2">
              Custom crop - you'll need to enter expected yield details
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  // Step 2: Area Input
  const renderAreaInput = () => (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Box textAlign="center" mb={4}>
          <Calculator size={48} color="#059669" />
          <Typography variant="h5" fontWeight="bold" mt={2} mb={1}>
            Farm Area Details
          </Typography>
          <Typography color="text.secondary">
            Enter your farm area for {cropData[formData.crop]?.name}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Farm Area"
              value={formData.area}
              onChange={(e) => setFormData({...formData, area: e.target.value})}
              type="number"
              inputProps={{ min: 0, step: 0.1 }}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  fontSize: '1.2rem'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              label="Unit"
              value={formData.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              <MenuItem value="acre">Acre</MenuItem>
              <MenuItem value="hectare">Hectare</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {formData.area && (
          <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
            <Typography fontWeight="bold">
              📏 Area: {formData.area} {formData.unit}
            </Typography>
            <Typography variant="body2">
              {formData.unit === 'hectare' && (
                <>Equivalent to {(parseFloat(formData.area) * 2.47).toFixed(1)} acres</>
              )}
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  // Step 3: Costs and Prices
  const renderCostsInput = () => (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Box textAlign="center" mb={4}>
          <DollarSign size={48} color="#dc2626" />
          <Typography variant="h5" fontWeight="bold" mt={2} mb={1}>
            Costs & Market Price
          </Typography>
          <Typography color="text.secondary">
            Enter your investment costs and selling price
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Total Input Cost (₹)"
              value={formData.inputCost}
              onChange={(e) => setFormData({...formData, inputCost: e.target.value})}
              type="number"
              inputProps={{ min: 0 }}
              helperText="Seeds, fertilizers, pesticides, labor, etc."
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  fontSize: '1.2rem'
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={`Market Price per ${
                formData.isCustomCrop 
                  ? formData.customCropUnit 
                  : cropData[formData.crop]?.unit || 'unit'
              } (₹)`}
              placeholder={`Enter selling price per ${
                formData.isCustomCrop 
                  ? formData.customCropUnit 
                  : cropData[formData.crop]?.unit || 'unit'
              }`}
              value={formData.marketPrice}
              onChange={(e) => setFormData({...formData, marketPrice: e.target.value})}
              type="number"
              inputProps={{ min: 0 }}
              helperText={`Enter current market rate per ${
                formData.isCustomCrop 
                  ? formData.customCropUnit 
                  : cropData[formData.crop]?.unit || 'unit'
              }`}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  fontSize: '1.2rem'
                }
              }}
            />
          </Grid>
          
          {/* Custom Yield Input for Custom Crops */}
          {formData.isCustomCrop && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={`Expected Yield per Acre (${formData.customCropUnit})`}
                placeholder="Enter expected production per acre"
                value={formData.customYield}
                onChange={(e) => setFormData({...formData, customYield: e.target.value})}
                type="number"
                inputProps={{ min: 0 }}
                helperText={`How much ${formData.customCropName || 'crop'} do you expect to harvest per acre?`}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    fontSize: '1.2rem'
                  }
                }}
              />
            </Grid>
          )}
        </Grid>

        {formData.inputCost && formData.marketPrice && (
          <Alert severity="success" sx={{ mt: 3, borderRadius: 2 }}>
            <Typography fontWeight="bold">
              💰 Ready to Calculate
            </Typography>
            <Typography variant="body2">
              Investment: ₹{parseFloat(formData.inputCost).toLocaleString()} | 
              Price: ₹{parseFloat(formData.marketPrice).toLocaleString()}/{
                formData.isCustomCrop 
                  ? formData.customCropUnit 
                  : cropData[formData.crop]?.unit
              }
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  // Step 4: Results Display
  const renderResults = () => (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Box textAlign="center" mb={4}>
          <TrendingUp size={48} color={result?.isProfit ? "#16a34a" : "#dc2626"} />
          <Typography variant="h5" fontWeight="bold" mt={2} mb={1}>
            Profit Analysis Results
          </Typography>
          <Typography color="text.secondary">
            Your complete farming profit breakdown
          </Typography>
        </Box>

        {result && (
          <Grid container spacing={3}>
            {/* Profit Summary */}
            <Grid item xs={12}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  bgcolor: result.isProfit ? '#f0fdf4' : '#fef2f2',
                  border: `2px solid ${result.isProfit ? '#16a34a' : '#dc2626'}`,
                  borderRadius: 3
                }}
              >
                <Typography variant="h4" fontWeight="bold" color={result.isProfit ? '#16a34a' : '#dc2626'} mb={1}>
                  {result.isProfit ? '🎉' : '⚠️'} ₹{Math.abs(result.totalProfit).toLocaleString()}
                </Typography>
                <Typography variant="h6" color={result.isProfit ? '#16a34a' : '#dc2626'}>
                  {result.isProfit ? 'Expected Profit' : 'Expected Loss'}
                </Typography>
                <Typography color="text.secondary">
                  Profit Margin: {result.profitMargin}%
                </Typography>
              </Paper>
            </Grid>

            {/* Detailed Breakdown */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 2, bgcolor: '#f8fafc' }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>📊 Production Details</Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Crop:</Typography>
                  <Typography fontWeight="bold">{result.crop}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Area:</Typography>
                  <Typography fontWeight="bold">{result.area} {result.unit}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Expected Yield:</Typography>
                  <Typography fontWeight="bold">{result.totalYield} {result.yieldUnit}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Market Price:</Typography>
                  <Typography fontWeight="bold">₹{result.marketPrice}/{result.yieldUnit}</Typography>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 2, bgcolor: '#f8fafc' }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>💰 Financial Analysis</Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Total Revenue:</Typography>
                  <Typography fontWeight="bold" color="#16a34a">₹{result.totalRevenue.toLocaleString()}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Total Investment:</Typography>
                  <Typography fontWeight="bold" color="#dc2626">₹{result.inputCost.toLocaleString()}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Profit per Acre:</Typography>
                  <Typography fontWeight="bold">₹{result.profitPerAcre.toLocaleString()}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Break-even Price:</Typography>
                  <Typography fontWeight="bold">₹{result.breakEvenPrice}/{result.yieldUnit}</Typography>
                </Box>
              </Card>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                <Button
                  variant="outlined"
                  onClick={resetForm}
                  sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                >
                  Calculate Again
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/calculator-fertilizer')}
                  sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                >
                  Plan Fertilizers
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );

  // Validation for next step
  const canProceed = () => {
    switch (currentStep) {
      case 1: 
        if (formData.isCustomCrop) {
          return formData.crop && formData.customCropName && formData.customCropUnit;
        }
        return formData.crop;
      case 2: return formData.area && parseFloat(formData.area) > 0;
      case 3: 
        const hasBasicFields = formData.inputCost && formData.marketPrice && parseFloat(formData.marketPrice) > 0;
        if (formData.isCustomCrop) {
          return hasBasicFields && formData.customYield && parseFloat(formData.customYield) > 0;
        }
        return hasBasicFields;
      default: return false;
    }
  };

  return (
    <Layout isLoggedIn={true}>
      <Box sx={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%)', minHeight: '100vh' }}>
        <Box maxWidth={{ xs: "100%", md: 900 }} mx="auto" p={{ xs: 2, sm: 3 }}>
          <Box textAlign="center" my={{ xs: 3, sm: 5 }}>
            <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={1}>
              <BarChart3 size={42} color="#16a34a" />
              <Typography variant="h4" fontWeight="bold" color="#171717">
                Profit Estimation Calculator
              </Typography>
            </Box>
            <Typography color="text.secondary">
              Calculate your farming profits with step-by-step guidance
            </Typography>
          </Box>

          {/* Storage Limitation Notice */}
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2">
              📝 <strong>Note:</strong> Only your last 10 calculations are stored. Older calculations are automatically removed.
            </Typography>
          </Alert>

          {/* Mobile-First Stepper */}
          <Box mb={4}>
            <Stepper 
              activeStep={currentStep - 1} 
              alternativeLabel 
              sx={{ 
                '& .MuiStepLabel-label': { fontSize: { xs: '0.8rem', sm: '1rem' } }
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Step Content */}
          <Box mb={4}>
            {currentStep === 1 && renderCropSelection()}
            {currentStep === 2 && renderAreaInput()}
            {currentStep === 3 && renderCostsInput()}
            {currentStep === 4 && renderResults()}
          </Box>

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={currentStep === 1}
                startIcon={<ArrowLeft size={20} />}
                sx={{ px: 3 }}
              >
                Back
              </Button>
              
              <Button
                variant="contained"
                onClick={currentStep === 3 ? calculateProfit : handleNext}
                disabled={!canProceed()}
                endIcon={<ArrowRight size={20} />}
                sx={{ px: 4 }}
              >
                {currentStep === 3 ? 'Calculate' : 'Next'}
              </Button>
            </Box>
          )}

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Past Calculations */}
          <PastCalculations calculatorType="profit" refreshKey={historyRefreshKey} />
        </Box>
      </Box>
    </Layout>
  );
}