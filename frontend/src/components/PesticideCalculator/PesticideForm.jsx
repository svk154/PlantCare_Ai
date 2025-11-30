import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  TextField, 
  MenuItem, 
  Button, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio,
  CircularProgress,
  Alert
  // Typography - Removed unused import
} from '@mui/material';

// Data for dropdown selections
const CROPS = [
  { value: 'rice', label: 'Rice', icon: '🌾' },
  { value: 'wheat', label: 'Wheat', icon: '🌾' },
  { value: 'maize', label: 'Maize (Corn)', icon: '🌽' },
  { value: 'tomato', label: 'Tomatoes', icon: '🍅' },
  { value: 'potato', label: 'Potatoes', icon: '🥔' },
  { value: 'cotton', label: 'Cotton', icon: '🧵' },
  { value: 'soybean', label: 'Soybean', icon: '🌱' },
  { value: 'coffee', label: 'Coffee', icon: '☕' },
  { value: 'apple', label: 'Apple', icon: '🍎' },
  { value: 'grapes', label: 'Grapes', icon: '🍇' },
  { value: 'citrus', label: 'Citrus', icon: '🍊' },
  { value: 'vegetables', label: 'Mixed Vegetables', icon: '🥬' }
];

const PESTS = [
  { value: 'aphids', label: 'Aphids', recommendedPesticide: 'Imidacloprid' },
  { value: 'caterpillars', label: 'Caterpillars', recommendedPesticide: 'Bacillus thuringiensis (Bt)' },
  { value: 'whiteflies', label: 'Whiteflies', recommendedPesticide: 'Pyrethroids' },
  { value: 'mites', label: 'Spider Mites', recommendedPesticide: 'Abamectin' },
  { value: 'thrips', label: 'Thrips', recommendedPesticide: 'Spinosad' },
  { value: 'fruitflies', label: 'Fruit Flies', recommendedPesticide: 'Malathion' },
  { value: 'beetles', label: 'Beetles', recommendedPesticide: 'Carbaryl' },
  { value: 'leafhoppers', label: 'Leafhoppers', recommendedPesticide: 'Neonicotinoid' },
  { value: 'stinkbugs', label: 'Stink Bugs', recommendedPesticide: 'Bifenthrin' },
  { value: 'borers', label: 'Borers', recommendedPesticide: 'Chlorpyrifos' }
];

const APPLICATION_METHODS = [
  { value: 'foliar', label: 'Foliar Spray', adjustmentFactor: 1.0 },
  { value: 'soil', label: 'Soil Application', adjustmentFactor: 0.9 },
  { value: 'granular', label: 'Granular Broadcast', adjustmentFactor: 1.2 },
  { value: 'drip', label: 'Drip Irrigation', adjustmentFactor: 0.8 }
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', factor: 0.8, description: 'Few pests visible, minor damage' },
  { value: 'medium', label: 'Medium', factor: 1.0, description: 'Moderate pest presence, visible damage' },
  { value: 'high', label: 'High', factor: 1.2, description: 'Severe infestation, significant crop damage' }
];

// Formulations
const FORMULATION_TYPES = [
  { value: 'liquid', label: 'Liquid (L/ha)', unit: 'L' },
  { value: 'granular', label: 'Granular (kg/ha)', unit: 'kg' }
];

// Default GPA (gallons per acre) by application method
const DEFAULT_GPA = {
  foliar: 20,
  soil: 15,
  granular: 0, // No water for granular
  drip: 10
};

// Application rates by crop and pest (L/ha or kg/ha)
const PESTICIDE_RATES = {
  rice: {
    aphids: 0.75, caterpillars: 1.0, whiteflies: 0.5, mites: 0.8, 
    thrips: 0.6, fruitflies: 0.9, beetles: 1.2, leafhoppers: 0.7, 
    stinkbugs: 0.8, borers: 1.5
  },
  wheat: {
    aphids: 0.6, caterpillars: 0.9, whiteflies: 0.5, mites: 0.7,
    thrips: 0.5, fruitflies: 0.0, beetles: 1.0, leafhoppers: 0.6,
    stinkbugs: 0.7, borers: 1.2
  },
  maize: {
    aphids: 0.8, caterpillars: 1.2, whiteflies: 0.6, mites: 0.7,
    thrips: 0.7, fruitflies: 0.0, beetles: 1.3, leafhoppers: 0.8,
    stinkbugs: 0.9, borers: 1.8
  },
  tomato: {
    aphids: 0.7, caterpillars: 1.5, whiteflies: 0.8, mites: 1.0,
    thrips: 0.9, fruitflies: 1.2, beetles: 1.1, leafhoppers: 0.8,
    stinkbugs: 1.0, borers: 1.3
  },
  potato: {
    aphids: 0.6, caterpillars: 1.3, whiteflies: 0.7, mites: 1.1,
    thrips: 0.8, fruitflies: 0.0, beetles: 1.5, leafhoppers: 0.7,
    stinkbugs: 0.9, borers: 1.2
  },
  cotton: {
    aphids: 0.9, caterpillars: 1.6, whiteflies: 1.0, mites: 1.2,
    thrips: 0.9, fruitflies: 0.0, beetles: 1.3, leafhoppers: 0.8,
    stinkbugs: 1.1, borers: 1.5
  },
  soybean: {
    aphids: 0.7, caterpillars: 1.1, whiteflies: 0.6, mites: 0.9,
    thrips: 0.7, fruitflies: 0.0, beetles: 1.2, leafhoppers: 0.7,
    stinkbugs: 1.0, borers: 1.3
  },
  coffee: {
    aphids: 0.8, caterpillars: 1.3, whiteflies: 0.8, mites: 1.0,
    thrips: 0.9, fruitflies: 1.1, beetles: 1.1, leafhoppers: 0.8,
    stinkbugs: 0.9, borers: 1.6
  },
  apple: {
    aphids: 0.8, caterpillars: 1.4, whiteflies: 0.7, mites: 1.2,
    thrips: 0.8, fruitflies: 1.3, beetles: 1.1, leafhoppers: 0.8,
    stinkbugs: 0.9, borers: 1.4
  },
  grapes: {
    aphids: 0.7, caterpillars: 1.3, whiteflies: 0.8, mites: 1.1,
    thrips: 0.9, fruitflies: 1.2, beetles: 1.0, leafhoppers: 0.8,
    stinkbugs: 0.8, borers: 1.3
  },
  citrus: {
    aphids: 0.8, caterpillars: 1.5, whiteflies: 0.9, mites: 1.3,
    thrips: 0.9, fruitflies: 1.4, beetles: 1.2, leafhoppers: 0.9,
    stinkbugs: 1.0, borers: 1.5
  },
  vegetables: {
    aphids: 0.7, caterpillars: 1.4, whiteflies: 0.8, mites: 1.0,
    thrips: 0.8, fruitflies: 1.1, beetles: 1.2, leafhoppers: 0.8,
    stinkbugs: 1.0, borers: 1.3
  }
};

// Default application rates if specific crop-pest combination not found
const DEFAULT_RATES = {
  liquid: 0.8,  // L/ha
  granular: 1.2 // kg/ha
};

const PesticideForm = ({ onCalculationResult }) => {
  const [formData, setFormData] = useState({
    crop: '',
    pest: '',
    plotSize: '',
    area_unit: 'hectare',
    severity: 'medium',
    application_method: 'foliar',
    formulation_type: 'liquid',
    gallons_per_acre: '',
    tank_capacity: '100'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (formData.application_method === 'granular') {
      setFormData(prev => ({
        ...prev,
        formulation_type: 'granular'
      }));
    }
    
    // Set default GPA based on application method
    if (formData.gallons_per_acre === '' && DEFAULT_GPA[formData.application_method]) {
      setFormData(prev => ({
        ...prev,
        gallons_per_acre: DEFAULT_GPA[formData.application_method].toString()
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.application_method]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const validateForm = () => {
    // Required fields validation
    if (!formData.crop || !formData.pest || !formData.plotSize) {
      setError('Please fill in all required fields.');
      return false;
    }
    
    // Area must be a positive number
    const areaNum = Number(formData.plotSize);
    if (isNaN(areaNum) || areaNum <= 0) {
      setError('Plot size must be a positive number.');
      return false;
    }
    
    if (formData.application_method !== 'granular' && formData.gallons_per_acre) {
      if (isNaN(formData.gallons_per_acre) || parseFloat(formData.gallons_per_acre) <= 0) {
        setError('Spray volume must be a positive number.');
        return false;
      }
    }
    
    if (formData.tank_capacity) {
      if (isNaN(formData.tank_capacity) || parseFloat(formData.tank_capacity) <= 0) {
        setError('Tank capacity must be a positive number.');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Convert plot size to hectares if needed
      let plotSizeHa = parseFloat(formData.plotSize);
      if (formData.area_unit === 'acre') {
        plotSizeHa = plotSizeHa * 0.404686; // Convert acres to hectares
      }
      
      // Get base rate for the crop-pest combination
      let baseRate;
      if (PESTICIDE_RATES[formData.crop] && 
          PESTICIDE_RATES[formData.crop][formData.pest] !== undefined) {
        baseRate = PESTICIDE_RATES[formData.crop][formData.pest];
      } else {
        // Use default rate if specific combination not found
        baseRate = formData.formulation_type === 'liquid' ? 
          DEFAULT_RATES.liquid : DEFAULT_RATES.granular;
      }
      
      // Get adjustment factors
      const severityFactor = SEVERITY_LEVELS.find(s => s.value === formData.severity)?.factor || 1.0;
      const methodFactor = APPLICATION_METHODS.find(m => m.value === formData.application_method)?.adjustmentFactor || 1.0;
      
      // Calculate adjusted rate
      const adjustedRate = baseRate * severityFactor * methodFactor;
      
      // Calculate total pesticide needed
      const totalPesticide = adjustedRate * plotSizeHa;
      
      // Calculate spray volume and tanks needed
      let sprayVolume = 0;
      let tanksNeeded = 0;
      let pesticidePerTank = 0;
      
      if (formData.application_method !== 'granular') {
        // Convert to acres for GPA calculation
        const plotSizeAcres = formData.area_unit === 'acre' ? 
          parseFloat(formData.plotSize) : plotSizeHa * 2.47105;
        
        // Get gallons per acre (GPA)
        const gpa = parseFloat(formData.gallons_per_acre) || 
          DEFAULT_GPA[formData.application_method] || 20;
        
        // Calculate total spray volume
        sprayVolume = plotSizeAcres * gpa;
        
        // Calculate tanks needed
        const tankCapacity = parseFloat(formData.tank_capacity) || 100;
        tanksNeeded = Math.ceil(sprayVolume / tankCapacity);
        
        // Calculate pesticide per tank
        pesticidePerTank = totalPesticide / tanksNeeded;
      }
      
      // Get recommended pesticide
      const recommendedPesticide = PESTS.find(p => p.value === formData.pest)?.recommendedPesticide || '';
      
      // Formulation unit
      const unit = FORMULATION_TYPES.find(f => f.value === formData.formulation_type)?.unit || 'L';
      
      // Generate schedule recommendations
      const scheduleRecs = formData.severity === 'high' ?
        "Apply half immediately and the remaining half after 5-7 days. Monitor regularly for pest resurgence." :
        "Apply at first signs of infestation. If needed, reapply after 10-14 days.";
      
      // Create environmental note
      const environmentalNote = "Be mindful of weather conditions when applying pesticides. Apply during calm weather to prevent drift. Avoid application before rain to prevent runoff into water bodies. Consider the impact on beneficial insects and follow local environmental guidelines.";

      // Create general advice
      const generalAdvice = "For most effective results, ensure thorough coverage of the plant surfaces. Apply pesticides early in the morning or late afternoon to avoid peak sun hours. Follow recommended water volume to ensure proper dilution and coverage.";
  
      // Create result object
      const result = {
        baseRate,
        adjustedRate,
        totalPesticide,
        sprayVolume,
        tanksNeeded,
        pesticidePerTank,
        recommendedPesticide,
        unit,
        scheduleRecs,
        formulationType: formData.formulation_type,
        applicationMethod: APPLICATION_METHODS.find(m => m.value === formData.application_method)?.label || '',
        areaUnit: formData.area_unit,
        plotSize: parseFloat(formData.plotSize),
        plotSizeHa,
        crop: CROPS.find(c => c.value === formData.crop)?.label || '',
        pest: PESTS.find(p => p.value === formData.pest)?.label || '',
        severity: SEVERITY_LEVELS.find(s => s.value === formData.severity)?.label || '',
        environmental_note: environmentalNote,
        general_advice: generalAdvice
      };
      
      // Simulate API request with a timeout
      setTimeout(() => {
        setLoading(false);
        onCalculationResult({ 
          result,
          saved_result: {
            input_data: formData
          }
        });
      }, 1000);
      
    } catch (err) {
      
      setError(err.message || 'An unexpected error occurred');
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
            {CROPS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box display="flex" alignItems="center" gap={1}>
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            select
            required
            fullWidth
            name="pest"
            label="Pest Type"
            value={formData.pest}
            onChange={handleChange}
            helperText="Select the pest you want to control"
          >
            {PESTS.map((option) => (
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
            name="plotSize"
            label="Plot Size"
            type="number"
            value={formData.plotSize}
            onChange={handleChange}
            helperText="Size of your plot"
            InputProps={{ inputProps: { step: "0.01", min: "0.01" } }}
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
            required
            fullWidth
            name="severity"
            label="Infestation Severity"
            value={formData.severity}
            onChange={handleChange}
            helperText="Current level of pest infestation"
          >
            {SEVERITY_LEVELS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label} - {option.description}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            name="application_method"
            label="Application Method"
            value={formData.application_method}
            onChange={handleChange}
            helperText="How you plan to apply the pesticide"
          >
            {APPLICATION_METHODS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            name="formulation_type"
            label="Formulation Type"
            value={formData.formulation_type}
            onChange={handleChange}
            disabled={formData.application_method === 'granular'}
            helperText="Form of pesticide to be applied"
          >
            {FORMULATION_TYPES.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        {formData.application_method !== 'granular' && (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="gallons_per_acre"
                label="Spray Volume (gallons per acre)"
                type="number"
                value={formData.gallons_per_acre}
                onChange={handleChange}
                helperText={`Default: ${DEFAULT_GPA[formData.application_method] || 20} GPA`}
                InputProps={{ inputProps: { min: 0, step: 1 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="tank_capacity"
                label="Tank Capacity (gallons)"
                type="number"
                value={formData.tank_capacity}
                onChange={handleChange}
                helperText="Your sprayer tank capacity"
                InputProps={{ inputProps: { min: 1, step: 1 } }}
              />
            </Grid>
          </>
        )}
        
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Calculate Pesticide Needs'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PesticideForm;
