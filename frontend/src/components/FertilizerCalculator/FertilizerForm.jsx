import React, { useState } from 'react';import React, { useState } from 'react';

import { import { 

  Box,   Box, 

  Grid,   Grid, 

  TextField,   TextField, 

  MenuItem,   MenuItem, 

  Button,   Button, 

  Alert,  Alert,

  Typography,  Typography,

  Paper,  Paper,

  Chip,  Chip,

  CircularProgress  CircularProgress

} from '@mui/material';} from '@mui/material';

import { ArrowRight, Sprout } from 'lucide-react';import { ArrowRight, Sprout } from 'lucide-react';



// Simplified crop data for farmers with visual elements// Simplified crop data for farmers with visual elements

const cropData = {const cropData = {

  rice: { name: 'Rice', icon: '🌾', color: '#10b981', season: 'Kharif' },  rice: { name: 'Rice', icon: '🌾', color: '#10b981', season: 'Kharif' },

  wheat: { name: 'Wheat', icon: '🌾', color: '#fbbf24', season: 'Rabi' },  wheat: { name: 'Wheat', icon: '🌾', color: '#fbbf24', season: 'Rabi' },

  maize: { name: 'Maize (Corn)', icon: '🌽', color: '#f59e0b', season: 'Kharif' },  maize: { name: 'Maize (Corn)', icon: '🌽', color: '#f59e0b', season: 'Kharif' },

  tomato: { name: 'Tomato', icon: '🍅', color: '#ef4444', season: 'Both' },  tomato: { name: 'Tomato', icon: '🍅', color: '#ef4444', season: 'Both' },

  potato: { name: 'Potato', icon: '🥔', color: '#a855f7', season: 'Rabi' },  potato: { name: 'Potato', icon: '🥔', color: '#a855f7', season: 'Rabi' },

  cotton: { name: 'Cotton', icon: '🌱', color: '#06b6d4', season: 'Kharif' },  cotton: { name: 'Cotton', icon: '🌱', color: '#06b6d4', season: 'Kharif' },

  soybean: { name: 'Soybean', icon: '🫘', color: '#84cc16', season: 'Kharif' },  soybean: { name: 'Soybean', icon: '🫘', color: '#84cc16', season: 'Kharif' },

  sugarcane: { name: 'Sugarcane', icon: '🎋', color: '#22c55e', season: 'Annual' }  sugarcane: { name: 'Sugarcane', icon: '🎋', color: '#22c55e', season: 'Annual' }

};};



const growthStages = {const growthStages = {

  planting: { name: 'Planting/Sowing', icon: '🌱', desc: 'Seed preparation & planting', color: '#16a34a' },  planting: { name: 'Planting/Sowing', icon: '🌱', desc: 'Seed preparation & planting', color: '#16a34a' },

  vegetative: { name: 'Growth Stage', icon: '🌿', desc: 'Leaf & stem development', color: '#059669' },  vegetative: { name: 'Growth Stage', icon: '🌿', desc: 'Leaf & stem development', color: '#059669' },

  flowering: { name: 'Flowering/Fruiting', icon: '🌸', desc: 'Flower & fruit formation', color: '#dc2626' },  flowering: { name: 'Flowering/Fruiting', icon: '🌸', desc: 'Flower & fruit formation', color: '#dc2626' },

  harvesting: { name: 'Pre-Harvest', icon: '🌾', desc: 'Final growth phase', color: '#ca8a04' }  harvesting: { name: 'Pre-Harvest', icon: '🌾', desc: 'Final growth phase', color: '#ca8a04' }

};};



const FertilizerForm = ({ onCalculationResult }) => {const FertilizerForm = ({ onCalculationResult }) => {

  const [currentStep, setCurrentStep] = useState(1);  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({  const [formData, setFormData] = useState({

    crop: '',    crop: '',

    area: '',    area: '',

    area_unit: 'acre',    area_unit: 'acre',

    growth_stage: '',    growth_stage: '',

    soil_type: 'loamy',    soil_type: 'loamy',

    custom_crop_name: ''    custom_crop_name: ''

  });  });

  const [loading, setLoading] = useState(false);  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);  const [error, setError] = useState(null);

    

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';



  const handleNext = () => {  const handleNext = () => {

    if (currentStep === 1 && !formData.crop) {    if (currentStep === 1 && !formData.crop) {

      setError('Please select a crop');      setError('Please select a crop');

      return;      return;

    }    }

    if (currentStep === 2 && (!formData.area || formData.area <= 0)) {    if (currentStep === 2 && (!formData.area || formData.area <= 0)) {

      setError('Please enter a valid area');      setError('Please enter a valid area');

      return;      return;

    }    }

    if (currentStep === 3 && !formData.growth_stage) {    if (currentStep === 3 && !formData.growth_stage) {

      setError('Please select growth stage');      setError('Please select growth stage');

      return;      return;

    }    }

    setError('');    setError('');

    if (currentStep < 4) {    if (currentStep < 4) {

      setCurrentStep(currentStep + 1);      setCurrentStep(currentStep + 1);

    }    }

  };  };



  const handleSubmit = async () => {  const handleSubmit = async () => {

    setLoading(true);    setLoading(true);

    setError(null);    setError(null);

        

    try {    try {

      const token = localStorage.getItem('access_token');      const token = localStorage.getItem('access_token');

      if (!token) {      if (!token) {

        throw new Error('Please log in to use the calculator');        throw new Error('Please log in to use the calculator');

      }      }



      const submitData = {      const submitData = {

        ...formData,        ...formData,

        nutrient_focus: 'balanced', // Default to balanced        nutrient_focus: 'balanced', // Default to balanced

        custom_crop_type: 'general'        custom_crop_type: 'general'

      };      };



      const response = await fetch(`${API_BASE_URL}/calculate-fertilizer`, {      const response = await fetch(`${API_BASE_URL}/calculate-fertilizer`, {

        method: 'POST',        method: 'POST',

        headers: {        headers: {

          'Content-Type': 'application/json',          'Content-Type': 'application/json',

          'Authorization': `Bearer ${token}`          'Authorization': `Bearer ${token}`

        },        },

        body: JSON.stringify(submitData)        body: JSON.stringify(submitData)

      });      });

            

      if (!response.ok) {      if (!response.ok) {

        const errorData = await response.json();        const errorData = await response.json();

        throw new Error(errorData.error || 'Calculation failed');        throw new Error(errorData.error || 'Calculation failed');

      }      }

            

      const result = await response.json();      const result = await response.json();

      onCalculationResult(result);      onCalculationResult(result);

            

    } catch (err) {    } catch (err) {

      setError(err.message);      setError(err.message);

    } finally {    } finally {

      setLoading(false);      setLoading(false);

    }    }

  };  };



  return (  return (

    <Box>    <Box>

      <Typography variant="h5" fontWeight="bold" textAlign="center" mb={2} color="#166534">      <Typography variant="h5" fontWeight="bold" textAlign="center" mb={2} color="#166534">

        <Sprout size={32} style={{ verticalAlign: 'middle', marginRight: 8 }} />        <Sprout size={32} style={{ verticalAlign: 'middle', marginRight: 8 }} />

        Fertilizer Calculator        Fertilizer Calculator

      </Typography>      </Typography>

            

      {/* Progress Indicator */}      {/* Progress Indicator */}

      <Box display="flex" justifyContent="center" mb={4}>      <Box display="flex" justifyContent="center" mb={4}>

        {[1, 2, 3, 4].map((step) => (        {[1, 2, 3, 4].map((step) => (

          <Box key={step} display="flex" alignItems="center">          <Box key={step} display="flex" alignItems="center">

            <Box            <Box

              sx={{              sx={{

                width: { xs: 28, sm: 32 },                width: { xs: 28, sm: 32 },

                height: { xs: 28, sm: 32 },                height: { xs: 28, sm: 32 },

                borderRadius: '50%',                borderRadius: '50%',

                bgcolor: currentStep >= step ? '#166534' : '#e5e7eb',                bgcolor: currentStep >= step ? '#166534' : '#e5e7eb',

                color: currentStep >= step ? 'white' : '#6b7280',                color: currentStep >= step ? 'white' : '#6b7280',

                display: 'flex',                display: 'flex',

                alignItems: 'center',                alignItems: 'center',

                justifyContent: 'center',                justifyContent: 'center',

                fontWeight: 'bold',                fontWeight: 'bold',

                fontSize: { xs: '0.8rem', sm: '0.9rem' }                fontSize: { xs: '0.8rem', sm: '0.9rem' }

              }}              }}

            >            >

              {step}              {step}

            </Box>            </Box>

            {step < 4 && (            {step < 4 && (

              <Box              <Box

                sx={{                sx={{

                  width: { xs: 30, sm: 40 },                  width: { xs: 30, sm: 40 },

                  height: 2,                  height: 2,

                  bgcolor: currentStep > step ? '#166534' : '#e5e7eb',                  bgcolor: currentStep > step ? '#166534' : '#e5e7eb',

                  mx: 1                  mx: 1

                }}                }}

              />              />

            )}            )}

          </Box>          </Box>

        ))}        ))}

      </Box>      </Box>



      {/* Step 1: Crop Selection */}      {/* Step 1: Crop Selection */}

      {currentStep === 1 && (      {currentStep === 1 && (

        <Box>        <Box>

          <Typography variant="h6" mb={3} textAlign="center">          <Typography variant="h6" mb={3} textAlign="center">

            🌱 Select your crop            🌱 Select your crop

          </Typography>          </Typography>

          <Grid container spacing={2}>          <Grid container spacing={2}>

            {Object.entries(cropData).map(([key, crop]) => (            {Object.entries(cropData).map(([key, crop]) => (

              <Grid item xs={12} sm={6} md={4} key={key}>              <Grid item xs={12} sm={6} md={4} key={key}>

                <Paper                <Paper

                  elevation={formData.crop === key ? 4 : 1}                  elevation={formData.crop === key ? 4 : 1}

                  onClick={() => setFormData({...formData, crop: key})}                  onClick={() => setFormData({...formData, crop: key})}

                  sx={{                  sx={{

                    p: 2,                    p: 2,

                    cursor: 'pointer',                    cursor: 'pointer',

                    border: formData.crop === key ? `2px solid ${crop.color}` : '2px solid transparent',                    border: formData.crop === key ? `2px solid ${crop.color}` : '2px solid transparent',

                    bgcolor: formData.crop === key ? `${crop.color}15` : 'white',                    bgcolor: formData.crop === key ? `${crop.color}15` : 'white',

                    minHeight: 80,                    minHeight: 80,

                    display: 'flex',                    display: 'flex',

                    alignItems: 'center',                    alignItems: 'center',

                    gap: 2,                    gap: 2,

                    '&:hover': { elevation: 3 }                    '&:hover': { elevation: 3 }

                  }}                  }}

                >                >

                  <Typography fontSize="2rem">{crop.icon}</Typography>                  <Typography fontSize="2rem">{crop.icon}</Typography>

                  <Box>                  <Box>

                    <Typography variant="subtitle1" fontWeight="bold">{crop.name}</Typography>                    <Typography variant="subtitle1" fontWeight="bold">{crop.name}</Typography>

                    <Chip                     <Chip 

                      label={crop.season}                       label={crop.season} 

                      size="small"                       size="small" 

                      sx={{ bgcolor: `${crop.color}25`, color: crop.color }}                      sx={{ bgcolor: `${crop.color}25`, color: crop.color }}

                    />                    />

                  </Box>                  </Box>

                </Paper>                </Paper>

              </Grid>              </Grid>

            ))}            ))}

          </Grid>          </Grid>

        </Box>        </Box>

      )}      )}



      {/* Step 2: Area Input */}      {/* Step 2: Area Input */}

      {currentStep === 2 && (      {currentStep === 2 && (

        <Box>        <Box>

          <Typography variant="h6" mb={3} textAlign="center">          <Typography variant="h6" mb={3} textAlign="center">

            📏 Farm area            📏 Farm area

          </Typography>          </Typography>

          <Box display="flex" alignItems="center" gap={2} mb={3}>          <Box display="flex" alignItems="center" gap={2} mb={3}>

            <Typography fontSize="2rem">{cropData[formData.crop]?.icon}</Typography>            <Typography fontSize="2rem">{cropData[formData.crop]?.icon}</Typography>

            <Chip label={cropData[formData.crop]?.name} sx={{ bgcolor: `${cropData[formData.crop]?.color}15` }} />            <Chip label={cropData[formData.crop]?.name} sx={{ bgcolor: `${cropData[formData.crop]?.color}15` }} />

          </Box>          </Box>

                    

          <Grid container spacing={2} alignItems="center">          <Grid container spacing={2} alignItems="center">

            <Grid item xs={8}>            <Grid item xs={8}>

              <TextField              <TextField

                fullWidth                fullWidth

                label="Area"                label="Area"

                type="number"                type="number"

                value={formData.area}                value={formData.area}

                onChange={(e) => setFormData({...formData, area: e.target.value})}                onChange={(e) => setFormData({...formData, area: e.target.value})}

                inputProps={{ min: 0, step: 0.1 }}                inputProps={{ min: 0, step: 0.1 }}

                sx={{                sx={{

                  '& .MuiInputBase-input': {                  '& .MuiInputBase-input': {

                    fontSize: { xs: '1.1rem', sm: '1.2rem' },                    fontSize: { xs: '1.1rem', sm: '1.2rem' },

                    padding: { xs: '14px', sm: '16px' }                    padding: { xs: '14px', sm: '16px' }

                  }                  }

                }}                }}

              />              />

            </Grid>            </Grid>

            <Grid item xs={4}>            <Grid item xs={4}>

              <TextField              <TextField

                select                select

                fullWidth                fullWidth

                value={formData.area_unit}                value={formData.area_unit}

                onChange={(e) => setFormData({...formData, area_unit: e.target.value})}                onChange={(e) => setFormData({...formData, area_unit: e.target.value})}

                sx={{                sx={{

                  '& .MuiInputBase-input': {                  '& .MuiInputBase-input': {

                    fontSize: { xs: '1rem', sm: '1.1rem' },                    fontSize: { xs: '1rem', sm: '1.1rem' },

                    padding: { xs: '14px', sm: '16px' }                    padding: { xs: '14px', sm: '16px' }

                  }                  }

                }}                }}

              >              >

                <MenuItem value="acre">Acre</MenuItem>                <MenuItem value="acre">Acre</MenuItem>

                <MenuItem value="hectare">Hectare</MenuItem>                <MenuItem value="hectare">Hectare</MenuItem>

              </TextField>              </TextField>

            </Grid>            </Grid>

          </Grid>          </Grid>

                    

          {/* Quick presets */}          {/* Quick presets */}

          <Typography variant="body2" color="text.secondary" mt={2} mb={1}>          <Typography variant="body2" color="text.secondary" mt={2} mb={1}>

            Quick options:            Quick options:

          </Typography>          </Typography>

          <Box display="flex" gap={1} flexWrap="wrap">          <Box display="flex" gap={1} flexWrap="wrap">

            {['0.5', '1', '2', '5', '10'].map((preset) => (            {['0.5', '1', '2', '5', '10'].map((preset) => (

              <Chip              <Chip

                key={preset}                key={preset}

                label={`${preset} ${formData.area_unit}`}                label={`${preset} ${formData.area_unit}`}

                onClick={() => setFormData({...formData, area: preset})}                onClick={() => setFormData({...formData, area: preset})}

                variant={formData.area === preset ? 'filled' : 'outlined'}                variant={formData.area === preset ? 'filled' : 'outlined'}

                size="small"                size="small"

                sx={{ mb: 1 }}                sx={{ mb: 1 }}

              />              />

            ))}            ))}

          </Box>          </Box>

        </Box>        </Box>

      )}      )}



      {/* Step 3: Growth Stage */}      {/* Step 3: Growth Stage */}

      {currentStep === 3 && (      {currentStep === 3 && (

        <Box>        <Box>

          <Typography variant="h6" mb={3} textAlign="center">          <Typography variant="h6" mb={3} textAlign="center">

            🌱 Growth stage            🌱 Growth stage

          </Typography>          </Typography>

          <Box display="flex" alignItems="center" gap={2} mb={3}>          <Box display="flex" alignItems="center" gap={2} mb={3}>

            <Typography fontSize="1.5rem">{cropData[formData.crop]?.icon}</Typography>            <Typography fontSize="1.5rem">{cropData[formData.crop]?.icon}</Typography>

            <Chip label={`${formData.area} ${formData.area_unit} ${cropData[formData.crop]?.name}`} color="primary" />            <Chip label={`${formData.area} ${formData.area_unit} ${cropData[formData.crop]?.name}`} color="primary" />

          </Box>          </Box>

                    

          <Grid container spacing={2}>          <Grid container spacing={2}>

            {Object.entries(growthStages).map(([key, stage]) => (            {Object.entries(growthStages).map(([key, stage]) => (

              <Grid item xs={12} sm={6} key={key}>              <Grid item xs={12} sm={6} key={key}>

                <Paper                <Paper

                  elevation={formData.growth_stage === key ? 4 : 1}                  elevation={formData.growth_stage === key ? 4 : 1}

                  onClick={() => setFormData({...formData, growth_stage: key})}                  onClick={() => setFormData({...formData, growth_stage: key})}

                  sx={{                  sx={{

                    p: 2,                    p: 2,

                    cursor: 'pointer',                    cursor: 'pointer',

                    border: formData.growth_stage === key ? `2px solid ${stage.color}` : '2px solid transparent',                    border: formData.growth_stage === key ? `2px solid ${stage.color}` : '2px solid transparent',

                    bgcolor: formData.growth_stage === key ? `${stage.color}15` : 'white',                    bgcolor: formData.growth_stage === key ? `${stage.color}15` : 'white',

                    minHeight: 80,                    minHeight: 80,

                    display: 'flex',                    display: 'flex',

                    alignItems: 'center',                    alignItems: 'center',

                    gap: 2,                    gap: 2,

                    '&:hover': { elevation: 3 }                    '&:hover': { elevation: 3 }

                  }}                  }}

                >                >

                  <Typography fontSize="2rem">{stage.icon}</Typography>                  <Typography fontSize="2rem">{stage.icon}</Typography>

                  <Box>                  <Box>

                    <Typography variant="subtitle1" fontWeight="bold">{stage.name}</Typography>                    <Typography variant="subtitle1" fontWeight="bold">{stage.name}</Typography>

                    <Typography variant="body2" color="text.secondary">{stage.desc}</Typography>                    <Typography variant="body2" color="text.secondary">{stage.desc}</Typography>

                  </Box>                  </Box>

                </Paper>                </Paper>

              </Grid>              </Grid>

            ))}            ))}

          </Grid>          </Grid>

        </Box>        </Box>

      )}      )}



      {/* Step 4: Additional Details */}      {/* Step 4: Additional Details */}

      {currentStep === 4 && (      {currentStep === 4 && (

        <Box>        <Box>

          <Typography variant="h6" mb={3} textAlign="center">          <Typography variant="h6" mb={3} textAlign="center">

            🌾 Final details            🌾 Final details

          </Typography>          </Typography>

          <Box display="flex" alignItems="center" gap={2} mb={3}>          <Box display="flex" alignItems="center" gap={2} mb={3}>

            <Typography fontSize="1.5rem">{cropData[formData.crop]?.icon}</Typography>            <Typography fontSize="1.5rem">{cropData[formData.crop]?.icon}</Typography>

            <Chip label={`${formData.area} ${formData.area_unit} ${cropData[formData.crop]?.name}`} color="primary" />            <Chip label={`${formData.area} ${formData.area_unit} ${cropData[formData.crop]?.name}`} color="primary" />

            <Chip label={growthStages[formData.growth_stage]?.name} color="secondary" />            <Chip label={growthStages[formData.growth_stage]?.name} color="secondary" />

          </Box>          </Box>

                    

          <Grid container spacing={2}>          <Grid container spacing={2}>

            <Grid item xs={12}>            <Grid item xs={12}>

              <TextField              <TextField

                select                select

                fullWidth                fullWidth

                label="Soil Type"                label="Soil Type"

                value={formData.soil_type}                value={formData.soil_type}

                onChange={(e) => setFormData({...formData, soil_type: e.target.value})}                onChange={(e) => setFormData({...formData, soil_type: e.target.value})}

                sx={{                sx={{

                  '& .MuiInputBase-input': {                  '& .MuiInputBase-input': {

                    fontSize: '1.1rem',                    fontSize: '1.1rem',

                    padding: '16px'                    padding: '16px'

                  }                  }

                }}                }}

              >              >

                <MenuItem value="sandy">🏖️ Sandy Soil</MenuItem>                <MenuItem value="sandy">🏖️ Sandy Soil</MenuItem>

                <MenuItem value="loamy">🌱 Loamy Soil (Best)</MenuItem>                <MenuItem value="loamy">🌱 Loamy Soil (Best)</MenuItem>

                <MenuItem value="clay">🧱 Clay Soil</MenuItem>                <MenuItem value="clay">🧱 Clay Soil</MenuItem>

              </TextField>              </TextField>

            </Grid>            </Grid>

          </Grid>          </Grid>



          <Alert severity="info" sx={{ mt: 2 }}>          <Alert severity="info" sx={{ mt: 2 }}>

            <Typography variant="body2">            <Typography variant="body2">

              We'll calculate optimal NPK fertilizer recommendations based on your crop needs and growth stage.              We'll calculate optimal NPK fertilizer recommendations based on your crop needs and growth stage.

            </Typography>            </Typography>

          </Alert>          </Alert>

        </Box>        </Box>

      )}      )}



      {/* Error Display */}      {/* Error Display */}

      {error && (      {error && (

        <Alert severity="error" sx={{ mt: 2 }}>        <Alert severity="error" sx={{ mt: 2 }}>

          {error}          {error}

        </Alert>        </Alert>

      )}      )}



      {/* Navigation Buttons */}      {/* Navigation Buttons */}

      <Box display="flex" justifyContent="space-between" mt={4}>      <Box display="flex" justifyContent="space-between" mt={4}>

        <Button        <Button

          variant="outlined"          variant="outlined"

          onClick={() => setCurrentStep(currentStep - 1)}          onClick={() => setCurrentStep(currentStep - 1)}

          disabled={currentStep === 1}          disabled={currentStep === 1}

          sx={{ px: 4 }}          sx={{ px: 4 }}

        >        >

          Back          Back

        </Button>        </Button>

        <Button        <Button

          variant="contained"          variant="contained"

          onClick={currentStep === 4 ? handleSubmit : handleNext}          onClick={currentStep === 4 ? handleSubmit : handleNext}

          endIcon={currentStep === 4 ? (loading ? <CircularProgress size={20} color="inherit" /> : null) : <ArrowRight size={20} />}          endIcon={currentStep === 4 ? (loading ? <CircularProgress size={20} color="inherit" /> : null) : <ArrowRight size={20} />}

          sx={{ px: 4 }}          sx={{ px: 4 }}

          disabled={loading}          disabled={loading}

        >        >

          {currentStep === 4 ? (loading ? 'Calculating...' : 'Calculate') : 'Next'}          {currentStep === 4 ? (loading ? 'Calculating...' : 'Calculate') : 'Next'}

        </Button>        </Button>

      </Box>      </Box>

    </Box>    </Box>

  );  );

};};

    setError(null);

export default FertilizerForm;    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('access_token');
      
      // Prepare request data
      const requestData = {
        ...formData,
        area: Number(formData.area)
      };
      
      // Remove custom crop fields if not needed
      if (formData.crop !== 'other') {
        delete requestData.custom_crop_name;
        delete requestData.custom_crop_type;
      }
      
      const response = await fetch(`${API_BASE_URL}/calculator-results/fertilizer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate fertilizer requirements');
      }
      
      onCalculationResult(data);
    } catch (err) {
      
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            select
            required
            fullWidth
            name="crop"
            label="Crop Type"
            value={formData.crop}
            onChange={handleChange}
            helperText="Select the crop you are growing"
          >
            {crops.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {formData.crop === 'other' && (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                name="custom_crop_name"
                label="Custom Crop Name"
                value={formData.custom_crop_name}
                onChange={handleChange}
                helperText="Enter the name of your crop"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                required
                fullWidth
                name="custom_crop_type"
                label="Custom Crop Category"
                value={formData.custom_crop_type}
                onChange={handleChange}
                helperText="Select the category that best matches your crop"
              >
                {cropTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </>
        )}
        
        <Grid item xs={12} md={6}>
          <TextField
            select
            required
            fullWidth
            name="growth_stage"
            label="Growth Stage"
            value={formData.growth_stage}
            onChange={handleChange}
            helperText="Current growth stage of your crop"
          >
            {growthStages.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid item xs={12} sm={8} md={6}>
          <TextField
            required
            fullWidth
            name="area"
            label="Plot Size"
            value={formData.area}
            onChange={handleChange}
            type="number"
            inputProps={{ step: "0.01", min: "0.01" }}
            helperText="Size of your plot"
          />
        </Grid>
        
        <Grid item xs={12} sm={4} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Unit</FormLabel>
            <RadioGroup
              row
              name="area_unit"
              value={formData.area_unit}
              onChange={handleChange}
            >
              <FormControlLabel 
                value="hectare" 
                control={<Radio />} 
                label="Hectares" 
              />
              <FormControlLabel 
                value="acre" 
                control={<Radio />} 
                label="Acres" 
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            name="soil_type"
            label="Soil Type (Optional)"
            value={formData.soil_type}
            onChange={handleChange}
            helperText="Select your soil type for more accurate recommendations"
          >
            {soilTypes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Nutrient Focus (Optional)</FormLabel>
            <Typography variant="caption" color="textSecondary" gutterBottom>
              Select if you want to emphasize a specific nutrient
            </Typography>
            <RadioGroup
              row
              name="nutrient_focus"
              value={formData.nutrient_focus}
              onChange={handleChange}
            >
              <FormControlLabel 
                value="N" 
                control={<Radio />} 
                label="Nitrogen (N)" 
              />
              <FormControlLabel 
                value="P" 
                control={<Radio />} 
                label="Phosphorus (P)" 
              />
              <FormControlLabel 
                value="K" 
                control={<Radio />} 
                label="Potassium (K)" 
              />
              <FormControlLabel 
                value="" 
                control={<Radio />} 
                label="Balanced" 
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Calculate Fertilizer Needs'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FertilizerForm;
