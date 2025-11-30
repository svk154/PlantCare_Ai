import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, TextField, MenuItem, Alert, Chip, Grid, Paper } from '@mui/material';
import { Calculator, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PastCalculations from '../components/PastCalculations';

// Simplified crop data for farmers
const cropData = {
  wheat: { name: 'Wheat', icon: '🌾', npk: [120, 60, 40], stage_multiplier: { planting: 0.3, growing: 0.5, flowering: 0.2 } },
  rice: { name: 'Rice', icon: '🌾', npk: [100, 50, 50], stage_multiplier: { planting: 0.4, growing: 0.4, flowering: 0.2 } },
  corn: { name: 'Corn/Maize', icon: '🌽', npk: [140, 70, 60], stage_multiplier: { planting: 0.3, growing: 0.5, flowering: 0.2 } },
  tomato: { name: 'Tomato', icon: '🍅', npk: [150, 80, 100], stage_multiplier: { planting: 0.2, growing: 0.5, flowering: 0.3 } },
  potato: { name: 'Potato', icon: '🥔', npk: [100, 50, 80], stage_multiplier: { planting: 0.3, growing: 0.5, flowering: 0.2 } },
  cotton: { name: 'Cotton', icon: '🌱', npk: [120, 60, 80], stage_multiplier: { planting: 0.2, growing: 0.5, flowering: 0.3 } },
  sugarcane: { name: 'Sugarcane', icon: '🌿', npk: [200, 100, 120], stage_multiplier: { planting: 0.3, growing: 0.5, flowering: 0.2 } },
  soybean: { name: 'Soybean', icon: '🫘', npk: [80, 60, 70], stage_multiplier: { planting: 0.3, growing: 0.5, flowering: 0.2 } },
  chickpea: { name: 'Chickpea', icon: '🟤', npk: [60, 40, 50], stage_multiplier: { planting: 0.3, growing: 0.5, flowering: 0.2 } },
  onion: { name: 'Onion', icon: '🧅', npk: [120, 80, 100], stage_multiplier: { planting: 0.3, growing: 0.5, flowering: 0.2 } },
  garlic: { name: 'Garlic', icon: '🧄', npk: [100, 70, 80], stage_multiplier: { planting: 0.3, growing: 0.5, flowering: 0.2 } },
  banana: { name: 'Banana', icon: '🍌', npk: [180, 120, 150], stage_multiplier: { planting: 0.2, growing: 0.5, flowering: 0.3 } },
  mango: { name: 'Mango', icon: '🥭', npk: [150, 100, 120], stage_multiplier: { planting: 0.2, growing: 0.5, flowering: 0.3 } },
  coconut: { name: 'Coconut', icon: '🥥', npk: [130, 80, 140], stage_multiplier: { planting: 0.2, growing: 0.5, flowering: 0.3 } },
  chili: { name: 'Chili Pepper', icon: '🌶', npk: [130, 90, 110], stage_multiplier: { planting: 0.2, growing: 0.5, flowering: 0.3 } },
  cabbage: { name: 'Cabbage', icon: '🥬', npk: [120, 80, 90], stage_multiplier: { planting: 0.3, growing: 0.5, flowering: 0.2 } },
  cauliflower: { name: 'Cauliflower', icon: '🥦', npk: [140, 100, 110], stage_multiplier: { planting: 0.3, growing: 0.5, flowering: 0.2 } },
  okra: { name: 'Okra (Bhindi)', icon: '🫛', npk: [110, 70, 90], stage_multiplier: { planting: 0.2, growing: 0.5, flowering: 0.3 } },
  other: { name: 'Other Crop', icon: '🌿', npk: [100, 60, 80], stage_multiplier: { planting: 0.3, growing: 0.5, flowering: 0.2 } }
};

const growthStages = {
  planting: { name: 'Planting/Early', icon: '🌱', desc: 'Seeds planted, early growth' },
  growing: { name: 'Growing/Vegetative', icon: '🌿', desc: 'Plants growing, leaves developing' },
  flowering: { name: 'Flowering/Fruiting', icon: '🌸', desc: 'Flowers or fruits forming' }
};

export default function CalculatorFertilizer() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    crop: '',
    customCropName: '',
    area: '',
    stage: '',
    unit: 'acre'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleNext = () => {
    if (currentStep === 1 && !formData.crop) {
      setError('Please select your crop first');
      return;
    }
    if (currentStep === 1 && formData.crop === 'other' && !formData.customCropName.trim()) {
      setError('Please enter your crop name');
      return;
    }
    if (currentStep === 2 && (!formData.area || formData.area <= 0)) {
      setError('Please enter a valid area');
      return;
    }
    if (currentStep === 3 && !formData.stage) {
      setError('Please select growth stage');
      return;
    }
    setError('');
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const calculateFertilizer = async () => {
    const crop = cropData[formData.crop];
    const stage = growthStages[formData.stage];
    const area = parseFloat(formData.area);
    
    // Get crop name (use custom name if "other" is selected)
    const cropName = formData.crop === 'other' ? formData.customCropName : crop.name;
    
    // Calculate base requirements (kg per acre)
    const multiplier = formData.unit === 'hectare' ? 2.47 : 1;
    const adjustedArea = area * multiplier;
    
    const stageMultiplier = crop.stage_multiplier[formData.stage];
    
    const nitrogen = Math.round(crop.npk[0] * stageMultiplier * adjustedArea);
    const phosphorus = Math.round(crop.npk[1] * stageMultiplier * adjustedArea);
    const potassium = Math.round(crop.npk[2] * stageMultiplier * adjustedArea);
    
    // Convert to common fertilizer types
    const urea = Math.round(nitrogen / 0.46); // Urea is 46% N
    const dap = Math.round(phosphorus / 0.46); // DAP is 46% P2O5
    const mop = Math.round(potassium / 0.60); // MOP is 60% K2O
    
    const resultData = {
      crop: cropName,
      stage: stage.name,
      area: formData.area,
      unit: formData.unit,
      nutrients: { nitrogen, phosphorus, potassium },
      fertilizers: { urea, dap, mop },
      totalCost: Math.round((urea * 25 + dap * 35 + mop * 30)) // Estimated cost in ₹
    };

    setResult(resultData);
    setCurrentStep(4);

    // Save to backend API
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Normalize to backend vocabulary
        const cropForApi = formData.crop === 'corn' ? 'maize' : formData.crop;
        const growthStageForApi = formData.stage === 'growing' ? 'vegetative' : formData.stage;
        const apiData = {
          crop: cropForApi,
          area: area,
          area_unit: formData.unit,
          growth_stage: growthStageForApi
        };
        
        // Add custom crop name if it's an "other" crop
        if (formData.crop === 'other') {
          apiData.custom_crop_name = formData.customCropName;
        }
        
        const response = await fetch(`${API_BASE_URL}/calculator-results/fertilizer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(apiData)
        });
        
        if (response.ok) {
          // bump key to refresh history list
          setHistoryRefreshKey(prev => prev + 1);
        } else {
          // non-blocking: still allow local backup and UI
        }
      }
    } catch (err) {
      // Silent fail for API save
      
    }

    // Save to localStorage backup
    try {
      const savedCalculations = JSON.parse(localStorage.getItem('fertilizerCalculations') || '[]');
      savedCalculations.push({
        calculator_type: 'fertilizer',
        input_data: {
          crop: formData.crop,
          crop_name: crop.name,
          area: area,
          unit: formData.unit,
          growth_stage: formData.stage,
          stage_name: stage.name,
          soil_type: null,
          nutrient_focus: null
        },
        result_data: {
          N: nitrogen,
          P: phosphorus,
          K: potassium,
          fertilizers: [
            { name: 'Urea', amount: urea, application: `Apply ${urea} kg of Urea` },
            { name: 'DAP', amount: dap, application: `Apply ${dap} kg of DAP` },
            { name: 'MOP', amount: mop, application: `Apply ${mop} kg of MOP` }
          ],
          advice: 'Apply fertilizers in the early morning or evening for best results.',
          estimated_cost: resultData.totalCost
        },
        timestamp: new Date().toISOString()
      });
      const recentCalculations = savedCalculations.slice(Math.max(savedCalculations.length - 10, 0));
      localStorage.setItem('fertilizerCalculations', JSON.stringify(recentCalculations));
      // Ensure UI reflects local backup immediately
      setHistoryRefreshKey(prev => prev + 1);
    } catch (err) {
      // Silent fail for history storage
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({ crop: '', area: '', stage: '', unit: 'acre' });
    setResult(null);
    setError('');
  };

  return (
    <Layout isLoggedIn={true}>
      <Box sx={{ 
        background: 'linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%)', 
        minHeight: '100vh',
        pb: 4
      }}>
        <Box maxWidth={currentStep === 4 ? "lg" : "md"} mx="auto" px={2} py={4}>
          
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
              <Calculator size={48} color="#16a34a" />
              <Typography variant="h4" fontWeight="bold" color="#171717" mb={0}>
                Fertilizer Calculator
              </Typography>
            </Box>
            <Typography color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, mt: 1.5 }}>
              Simple, step-by-step fertilizer planning
            </Typography>
          </Box>

          {/* Storage Limitation Notice */}
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2">
              📝 <strong>Note:</strong> Only your last 10 calculations are stored. Older calculations are automatically removed.
            </Typography>
          </Alert>

          {/* Progress Indicator */}
          <Box display="flex" justifyContent="center" mb={4}>
            {[1, 2, 3, 4].map((step) => (
              <Box key={step} display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: currentStep >= step ? '#16a34a' : '#e5e7eb',
                    color: currentStep >= step ? 'white' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}
                >
                  {step === 4 && result ? <CheckCircle size={20} /> : step}
                </Box>
                {step < 4 && (
                  <Box
                    sx={{
                      width: 40,
                      height: 2,
                      bgcolor: currentStep > step ? '#16a34a' : '#e5e7eb',
                      mx: 1
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>

          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
              
              {/* Step 1: Crop Selection */}
              {currentStep === 1 && (
                <Box>
                  <Typography variant="h6" mb={3} textAlign="center">
                    🌱 What crop are you growing?
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(cropData).map(([key, crop]) => (
                      <Grid item xs={6} sm={4} key={key}>
                        <Paper
                          elevation={formData.crop === key ? 4 : 1}
                          onClick={() => setFormData({...formData, crop: key, customCropName: ''})}
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            cursor: 'pointer',
                            border: formData.crop === key ? '2px solid #16a34a' : '2px solid transparent',
                            bgcolor: formData.crop === key ? '#f0fdf4' : 'white',
                            minHeight: 80,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            '&:hover': { elevation: 3 }
                          }}
                        >
                          <Typography fontSize="2rem" mb={1}>{crop.icon}</Typography>
                          <Typography variant="body2" fontWeight="bold">{crop.name}</Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Custom Crop Name Input */}
                  {formData.crop === 'other' && (
                    <Box mt={3}>
                      <TextField
                        fullWidth
                        label="Enter your crop name"
                        placeholder="e.g., Mustard, Groundnut, Tea, Coffee..."
                        value={formData.customCropName}
                        onChange={(e) => setFormData({...formData, customCropName: e.target.value})}
                        sx={{
                          '& .MuiInputBase-input': {
                            fontSize: '1.1rem',
                            padding: '16px'
                          }
                        }}
                        helperText="Please specify the crop you are growing"
                      />
                    </Box>
                  )}
                </Box>
              )}

              {/* Step 2: Area Input */}
              {currentStep === 2 && (
                <Box>
                  <Typography variant="h6" mb={3} textAlign="center">
                    📏 How much area do you want to treat?
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Typography fontSize="2rem">{cropData[formData.crop]?.icon}</Typography>
                    <Chip label={formData.crop === 'other' ? formData.customCropName : cropData[formData.crop]?.name} color="primary" />
                  </Box>
                  
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={8}>
                      <TextField
                        fullWidth
                        label="Area"
                        type="number"
                        value={formData.area}
                        onChange={(e) => setFormData({...formData, area: e.target.value})}
                        inputProps={{ min: 0, step: 0.1 }}
                        sx={{
                          '& .MuiInputBase-input': {
                            fontSize: '1.2rem',
                            padding: '16px'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        select
                        fullWidth
                        value={formData.unit}
                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        sx={{
                          '& .MuiInputBase-input': {
                            fontSize: '1.1rem',
                            padding: '16px'
                          }
                        }}
                      >
                        <MenuItem value="acre">Acre</MenuItem>
                        <MenuItem value="hectare">Hectare</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                  
                  {/* Quick presets */}
                  <Typography variant="body2" color="text.secondary" mt={2} mb={1}>
                    Quick options:
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {['0.5', '1', '2', '5'].map((preset) => (
                      <Chip
                        key={preset}
                        label={`${preset} ${formData.unit}`}
                        onClick={() => setFormData({...formData, area: preset})}
                        variant={formData.area === preset ? 'filled' : 'outlined'}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Step 3: Growth Stage */}
              {currentStep === 3 && (
                <Box>
                  <Typography variant="h6" mb={3} textAlign="center">
                    🌱 What stage is your crop in?
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Typography fontSize="1.5rem">{cropData[formData.crop]?.icon}</Typography>
                    <Chip label={`${formData.crop === 'other' ? formData.customCropName : cropData[formData.crop]?.name} - ${formData.area} ${formData.unit}`} color="primary" />
                  </Box>
                  
                  <Grid container spacing={2}>
                    {Object.entries(growthStages).map(([key, stage]) => (
                      <Grid item xs={12} key={key}>
                        <Paper
                          elevation={formData.stage === key ? 4 : 1}
                          onClick={() => setFormData({...formData, stage: key})}
                          sx={{
                            p: 3,
                            cursor: 'pointer',
                            border: formData.stage === key ? '2px solid #16a34a' : '2px solid transparent',
                            bgcolor: formData.stage === key ? '#f0fdf4' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            '&:hover': { elevation: 3 }
                          }}
                        >
                          <Typography fontSize="2rem">{stage.icon}</Typography>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">{stage.name}</Typography>
                            <Typography color="text.secondary" fontSize="0.9rem">{stage.desc}</Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Step 4: Results */}
              {currentStep === 4 && result && (
                <Box>
                  {/* Header with Success Animation */}
                  <Box textAlign="center" mb={4}>
                    <Typography variant="h2" sx={{ fontSize: '3rem' }}>🎯</Typography>
                    <Typography variant="h4" fontWeight="bold" color="#16a34a" mt={1} mb={1}>
                      Your Fertilizer Plan is Ready!
                    </Typography>
                    <Typography color="text.secondary" variant="h6">
                      For {result.crop} • {result.stage} • {result.area} {result.unit}
                    </Typography>
                  </Box>

                  {/* Nutrient Requirements Overview */}
                  <Card elevation={3} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{ 
                      background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)', 
                      color: 'white', 
                      p: 3 
                    }}>
                      <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: 'white' }}>
                        🧪 Required Nutrients (NPK)
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={4}>
                          <Box textAlign="center">
                            <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>{result.nutrients.nitrogen}</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>kg Nitrogen (N)</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box textAlign="center">
                            <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>{result.nutrients.phosphorus}</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>kg Phosphorus (P)</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box textAlign="center">
                            <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>{result.nutrients.potassium}</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>kg Potassium (K)</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Card>

                  {/* Fertilizer Shopping List */}
                  <Typography variant="h5" fontWeight="bold" mb={3} color="#1f2937">
                    🛒 Your Shopping List
                  </Typography>
                  
                  <Grid container spacing={3} mb={4} sx={{ 
                    '& .MuiGrid-item': { 
                      display: 'flex',
                      '& .MuiCard-root': {
                        width: '100%'
                      }
                    }
                  }}>
                    {/* Urea Card */}
                    <Grid item xs={6}>
                      <Card elevation={4} sx={{ 
                        borderRadius: 3, 
                        border: '2px solid #fbbf24',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-4px)' },
                        width: '100%'
                      }}>
                        <Box sx={{ bgcolor: '#fffbeb', p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                          <Typography variant="h3" mb={1} sx={{ fontSize: { xs: '1.5rem', sm: '3rem' } }}>💛</Typography>
                          <Typography variant="h5" fontWeight="bold" color="#d97706" mb={1} sx={{ fontSize: { xs: '1rem', sm: '1.5rem' } }}>
                            Urea
                          </Typography>
                          <Typography variant="h3" fontWeight="bold" color="#92400e" sx={{ fontSize: { xs: '1.5rem', sm: '3rem' } }}>
                            {result.fertilizers.urea} kg
                          </Typography>
                          <Typography variant="body2" color="#78716c" mt={1} sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                            Nitrogen Source (46% N)
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="#d97706" mt={2} sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                            ~₹{Math.round(result.fertilizers.urea * 25)} cost
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>

                    {/* DAP Card */}
                    <Grid item xs={6}>
                      <Card elevation={4} sx={{ 
                        borderRadius: 3, 
                        border: '2px solid #3b82f6',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-4px)' },
                        width: '100%'
                      }}>
                        <Box sx={{ bgcolor: '#eff6ff', p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                          <Typography variant="h3" mb={1} sx={{ fontSize: { xs: '1.5rem', sm: '3rem' } }}>💙</Typography>
                          <Typography variant="h5" fontWeight="bold" color="#2563eb" mb={1} sx={{ fontSize: { xs: '1rem', sm: '1.5rem' } }}>
                            DAP
                          </Typography>
                          <Typography variant="h3" fontWeight="bold" color="#1d4ed8" sx={{ fontSize: { xs: '1.5rem', sm: '3rem' } }}>
                            {result.fertilizers.dap} kg
                          </Typography>
                          <Typography variant="body2" color="#78716c" mt={1} sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                            Phosphorus Source (46% P₂O₅)
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="#2563eb" mt={2} sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                            ~₹{Math.round(result.fertilizers.dap * 35)} cost
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>

                    {/* MOP Card */}
                    <Grid item xs={6}>
                      <Card elevation={4} sx={{ 
                        borderRadius: 3, 
                        border: '2px solid #10b981',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-4px)' },
                        width: '100%'
                      }}>
                        <Box sx={{ bgcolor: '#ecfdf5', p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                          <Typography variant="h3" mb={1} sx={{ fontSize: { xs: '1.5rem', sm: '3rem' } }}>💚</Typography>
                          <Typography variant="h5" fontWeight="bold" color="#059669" mb={1} sx={{ fontSize: { xs: '1rem', sm: '1.5rem' } }}>
                            MOP
                          </Typography>
                          <Typography variant="h3" fontWeight="bold" color="#047857" sx={{ fontSize: { xs: '1.5rem', sm: '3rem' } }}>
                            {result.fertilizers.mop} kg
                          </Typography>
                          <Typography variant="body2" color="#78716c" mt={1} sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                            Potassium Source (60% K₂O)
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="#059669" mt={2} sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                            ~₹{Math.round(result.fertilizers.mop * 30)} cost
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>

                    {/* Cost Summary Card */}
                    <Grid item xs={6}>
                      <Card elevation={4} sx={{ 
                        borderRadius: 3, 
                        border: '2px solid #16a34a',
                        bgcolor: '#f0fdf4',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-4px)' },
                        width: '100%'
                      }}>
                        <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                          <Typography variant="h3" mb={1} sx={{ fontSize: { xs: '1.5rem', sm: '3rem' } }}>💰</Typography>
                          <Typography variant="h5" fontWeight="bold" color="#16a34a" mb={1} sx={{ fontSize: { xs: '1rem', sm: '1.5rem' } }}>
                            Total Cost
                          </Typography>
                          <Typography variant="h3" fontWeight="bold" color="#047857" sx={{ fontSize: { xs: '1.5rem', sm: '3rem' } }}>
                            ₹{result.totalCost.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="#15803d" mt={1} sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                            Total fertilizer cost
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="#16a34a" mt={2} sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                            Market rates included
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Application Tips */}
                  <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} sm={6}>
                      <Card elevation={3} sx={{ borderRadius: 3, bgcolor: '#fef3c7' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" fontWeight="bold" color="#d97706" mb={2}>
                            ⏰ Application Tips
                          </Typography>
                          <Typography variant="body2" color="#92400e" mb={1}>
                            • Apply in early morning or evening
                          </Typography>
                          <Typography variant="body2" color="#92400e" mb={1}>
                            • Avoid application before heavy rain
                          </Typography>
                          <Typography variant="body2" color="#92400e">
                            • Water the field after application
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Action Buttons */}
                  <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
                    <Button
                      variant="contained"
                      onClick={resetForm}
                      sx={{ 
                        flex: 1, 
                        py: 2,
                        bgcolor: '#16a34a',
                        '&:hover': { bgcolor: '#15803d' },
                        borderRadius: 2,
                        fontSize: '1.1rem'
                      }}
                    >
                      🔄 Calculate Again
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/calculator-profit')}
                      sx={{ 
                        flex: 1, 
                        py: 2,
                        borderColor: '#16a34a',
                        color: '#16a34a',
                        '&:hover': { borderColor: '#15803d', bgcolor: '#f0fdf4' },
                        borderRadius: 2,
                        fontSize: '1.1rem'
                      }}
                    >
                      📊 Calculate Profit
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => navigate('/dashboard')}
                      sx={{ 
                        flex: 1, 
                        py: 2,
                        color: '#6b7280',
                        borderRadius: 2,
                        fontSize: '1.1rem'
                      }}
                    >
                      🏠 Dashboard
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Error Display */}
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Navigation Buttons */}
              {currentStep < 4 && (
                <Box display="flex" justifyContent="space-between" mt={4}>
                  <Button
                    variant="outlined"
                    onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/dashboard')}
                    sx={{ px: 4 }}
                  >
                    {currentStep === 1 ? 'Dashboard' : 'Back'}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={currentStep === 3 ? calculateFertilizer : handleNext}
                    endIcon={<ArrowRight size={20} />}
                    sx={{ px: 4 }}
                  >
                    {currentStep === 3 ? 'Calculate' : 'Next'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
        
        {/* Past Calculations */}
        <Box sx={{ maxWidth: "md", mx: "auto", px: 2, mt: 4 }}>
          <PastCalculations calculatorType="fertilizer" refreshKey={historyRefreshKey} />
        </Box>
      </Box>
    </Layout>
  );
}
