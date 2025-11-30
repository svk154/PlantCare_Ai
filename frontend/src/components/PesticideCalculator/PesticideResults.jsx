import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  Card,
  CardContent,
  Grid,
  Alert
} from '@mui/material';
import { CheckCircle, Download, Share2 } from 'lucide-react';

// Category data to map values to labels
const CROPS_MAP = {
  'rice': 'Rice',
  'wheat': 'Wheat',
  'maize': 'Maize (Corn)',
  'tomato': 'Tomatoes',
  'potato': 'Potatoes',
  'cotton': 'Cotton',
  'soybean': 'Soybean',
  'coffee': 'Coffee',
  'apple': 'Apple',
  'grapes': 'Grapes',
  'citrus': 'Citrus',
  'vegetables': 'Mixed Vegetables'
};

const PESTS_MAP = {
  'aphids': 'Aphids',
  'caterpillars': 'Caterpillars',
  'whiteflies': 'Whiteflies',
  'mites': 'Spider Mites',
  'thrips': 'Thrips',
  'fruitflies': 'Fruit Flies',
  'beetles': 'Beetles',
  'leafhoppers': 'Leafhoppers',
  'stinkbugs': 'Stink Bugs',
  'borers': 'Borers'
};

const SEVERITY_MAP = {
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High'
};

const APPLICATION_METHOD_MAP = {
  'foliar': 'Foliar Spray',
  'soil': 'Soil Application',
  'granular': 'Granular Broadcast',
  'drip': 'Drip Irrigation'
};

const FORMULATION_MAP = {
  'liquid': 'Liquid (L/ha)',
  'granular': 'Granular (kg/ha)'
};

const PesticideResults = ({ result, onNewCalculation, saved, onSaveStatus }) => {
  const [isSaving, setIsSaving] = useState(false);
  
  if (!result) return null;
  
  const { unit, recommendedPesticide, sprayVolume, tanksNeeded, pesticidePerTank, 
    totalPesticide, general_advice, environmental_note, scheduleRecs, crop, pest, severity,
    applicationMethod, formulationType, plotSize, plotSizeHa } = result.result;
  const inputData = result.saved_result?.input_data;
  
  // Save calculation to history
  const saveCalculation = async () => {
    if (saved) return;
    
    setIsSaving(true);
    
    try {
      const token = localStorage.getItem('access_token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/calculator-results/pesticide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          inputs: {
            crop: crop,
            pest: pest,
            plotSize: plotSize,
            area_unit: inputData?.area_unit || 'hectare',
            severity: severity,
            application_method: applicationMethod.toLowerCase(),
            formulation_type: formulationType,
            gallons_per_acre: inputData?.gallons_per_acre || '',
            tank_capacity: inputData?.tank_capacity || '100'
          },
          results: {
            recommendedPesticide: recommendedPesticide,
            totalPesticide: totalPesticide,
            sprayVolume: sprayVolume,
            tanksNeeded: tanksNeeded,
            pesticidePerTank: pesticidePerTank,
            unit: unit,
            applicationMethod: applicationMethod,
            crop: crop,
            pest: pest,
            severity: severity,
            plotSize: plotSize,
            plotSizeHa: plotSizeHa,
            scheduleRecs: scheduleRecs,
            environmental_note: environmental_note,
            general_advice: general_advice,
            baseRate: result.result?.baseRate || 0,
            adjustedRate: result.result?.adjustedRate || 0,
            calculation_categories: {
              crop_type: CROPS_MAP[crop] || crop,
              pest_type: PESTS_MAP[pest] || pest,
              severity_level: SEVERITY_MAP[severity] || severity,
              application_type: APPLICATION_METHOD_MAP[applicationMethod.toLowerCase()] || applicationMethod,
              formulation: FORMULATION_MAP[formulationType] || formulationType
            }
          },
          calculatedAt: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        onSaveStatus(true);
        setTimeout(() => setIsSaving(false), 500);
      } else {
        onSaveStatus(false);
        setIsSaving(false);
        alert('Failed to save calculation. Please try again.');
      }
    } catch (err) {
      
      setIsSaving(false);
      alert('Error saving calculation. Please check your network connection.');
    }
  };

  // Share calculation
  const shareCalculation = () => {
    // Create a summary for sharing
    const summary = `
PlantCare AI - Pesticide Calculator Results:
Crop: ${crop}
Pest: ${pest}
Plot Size: ${plotSize} ${inputData?.area_unit || 'hectare'} (${plotSizeHa.toFixed(2)} hectares)
Severity: ${severity}
Application Method: ${applicationMethod}
Formulation Type: ${formulationType}

Recommendation:
${recommendedPesticide} (${totalPesticide.toFixed(2)} ${unit})
${applicationMethod === 'Granular Broadcast' ? 
  `Apply ${totalPesticide.toFixed(2)} ${unit} of pesticide across your plot` : 
  `Mix ${pesticidePerTank.toFixed(2)} ${unit} per tank (${tanksNeeded} tanks needed)
Total Spray Volume: ${sprayVolume.toFixed(2)} gallons`}

Application Schedule:
${scheduleRecs}

Environmental Note:
${environmental_note}

General Advice:
${general_advice}

Always read and follow pesticide label instructions carefully.
    `.trim();
    
    // Use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'PlantCare AI Pesticide Recommendation',
        text: summary
      }).catch(err => {
        
        copyToClipboard(summary);
      });
    } else {
      copyToClipboard(summary);
    }
  };

  // Helper function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Copied to clipboard!');
      })
      .catch(() => {
        alert('Failed to copy to clipboard');
      });
  };

  // Download as text
  const downloadCalculation = () => {
    // Create a summary text
    const summary = `
PLANTCARE AI - PESTICIDE RECOMMENDATION
--------------------------------------
Date: ${new Date().toLocaleDateString()}

INPUT DETAILS:
Crop: ${crop}
Pest: ${pest}
Plot Size: ${plotSize} ${inputData?.area_unit || 'hectare'} (${plotSizeHa.toFixed(2)} hectares)
Severity Level: ${severity}
Application Method: ${applicationMethod}
Formulation Type: ${formulationType}

PESTICIDE RECOMMENDATION:
Recommended Pesticide: ${recommendedPesticide}
Total Pesticide Required: ${totalPesticide.toFixed(2)} ${unit}

${formulationType === 'granular' ? 
  'APPLICATION DETAILS (Granular):' :
  `APPLICATION DETAILS (Spray):
Spray Volume Required: ${sprayVolume.toFixed(2)} gallons
Tank Capacity: ${inputData?.tank_capacity || '100'} gallons
Tanks Required: ${tanksNeeded}
Pesticide Per Tank: ${pesticidePerTank.toFixed(2)} ${unit}/tank`}

SCHEDULE AND APPLICATION:
${scheduleRecs}

ENVIRONMENTAL CONSIDERATIONS:
${environmental_note}

GENERAL ADVICE:
${general_advice}

SAFETY NOTES:
- Always read and follow pesticide label instructions
- Wear appropriate personal protective equipment
- Store pesticides in original containers away from children and pets
- Follow local regulations for pesticide use and disposal

Generated by PlantCare AI
www.plantcareai.com
    `.trim();
    
    // Create a blob and download link
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pesticide_Calculation_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <Box>
      {saved && (
        <Alert 
          icon={<CheckCircle size={20} />}
          severity="success" 
          sx={{ mb: 3 }}
        >
          Calculation saved successfully! You can find it in your past calculations.
        </Alert>
      )}
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" color="primary" gutterBottom>
          Pesticide Recommendation Results
        </Typography>
        <Typography variant="body1">
          For {crop} affected by {pest} ({severity} infestation)
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Plot size: {plotSize} {inputData?.area_unit || 'hectare'}{inputData?.area_unit === 'hectare' && plotSize > 1 ? 's' : ''} ({plotSizeHa.toFixed(2)} hectares)
        </Typography>
      </Box>
      
      {/* Recommended Pesticide */}
      <Typography variant="h6" gutterBottom>
        Recommended Pesticide
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ mt: 1, color: '#2e7d32', fontWeight: 'bold' }}>
                {recommendedPesticide}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Total required: {totalPesticide.toFixed(2)} {unit}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Application Details */}
      {formulationType !== 'granular' && (
        <>
          <Typography variant="h6" gutterBottom>
            Application Details
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ color: '#1565c0', fontWeight: 'bold' }}>
                    {sprayVolume.toFixed(1)}
                  </Typography>
                  <Typography variant="body1">
                    gallons
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Spray Volume
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ color: '#1565c0', fontWeight: 'bold' }}>
                    {tanksNeeded}
                  </Typography>
                  <Typography variant="body1">
                    tanks
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tanks Required
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ color: '#1565c0', fontWeight: 'bold' }}>
                    {pesticidePerTank.toFixed(2)}
                  </Typography>
                  <Typography variant="body1">
                    {unit}/tank
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Pesticide Per Tank
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
      
      {/* Application Advice */}
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ mb: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body1" fontWeight="medium">
            Application Schedule
          </Typography>
          <Typography variant="body2">
            {scheduleRecs}
          </Typography>
        </Alert>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body1" fontWeight="medium">
            Application Advice
          </Typography>
          <Typography variant="body2">
            {general_advice}
          </Typography>
        </Alert>
        
        <Alert severity="warning">
          <Typography variant="body1" fontWeight="medium">
            Environmental Note
          </Typography>
          <Typography variant="body2">
            {environmental_note}
          </Typography>
        </Alert>
      </Box>
      
      {/* Action Buttons */}
      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item xs={12} md={4}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={onNewCalculation}
          >
            New Calculation
          </Button>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={saveCalculation}
            disabled={saved || isSaving}
          >
            {isSaving ? 'Saving...' : saved ? 'Saved' : 'Save Calculation'}
          </Button>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={shareCalculation}
              sx={{ flex: 1 }}
              startIcon={<Share2 size={18} />}
            >
              Share
            </Button>
            
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={downloadCalculation}
              sx={{ flex: 1 }}
              startIcon={<Download size={18} />}
            >
              Download
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PesticideResults;
