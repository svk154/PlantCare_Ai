import React from 'react';
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
import { CheckCircle } from 'lucide-react';

const FertilizerResults = ({ result, onNewCalculation, saved }) => {
  if (!result) return null;
  
  const { nutrients, recommendations, general_advice, environmental_note } = result.result;
  const inputData = result.saved_result?.input_data;
  
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
          Fertilizer Recommendation Results
        </Typography>
        <Typography variant="body1">
          For {inputData?.crop?.charAt(0).toUpperCase() + inputData?.crop?.slice(1) || 'your crop'} at{' '}
          {inputData?.growth_stage?.charAt(0).toUpperCase() + inputData?.growth_stage?.slice(1) || 'current'} stage
          {inputData?.soil_type && ` on ${inputData.soil_type} soil`}
          {inputData?.is_custom && inputData?.custom_crop_type && ` (${inputData.custom_crop_type} type)`}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Plot size: {inputData?.area} {inputData?.unit || 'hectare'}{inputData?.area > 1 ? 's' : ''}
        </Typography>
      </Box>
      
      {/* Nutrient Requirements */}
      <Typography variant="h6" gutterBottom>
        Nutrient Requirements
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} md={4}>
          <Card sx={{ bgcolor: '#e8f5e9', height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ mt: 1, color: '#2e7d32', fontWeight: 'bold' }}>
                {nutrients.N} kg
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Nitrogen (N)
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Promotes leaf growth and greening
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} md={4}>
          <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ mt: 1, color: '#1565c0', fontWeight: 'bold' }}>
                {nutrients.P} kg
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Phosphorus (P)
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Supports root development and flowering
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} md={4}>
          <Card sx={{ bgcolor: '#fff3e0', height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ mt: 1, color: '#e65100', fontWeight: 'bold' }}>
                {nutrients.K} kg
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Potassium (K)
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Enhances disease resistance and fruit quality
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Fertilizer Recommendations */}
      <Typography variant="h6" gutterBottom>
        Recommended Fertilizers
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {recommendations.map((rec, index) => (
          <Grid item xs={6} sm={6} md={4} key={index}>
            <Card elevation={4} sx={{ 
              height: '100%',
              border: `2px solid ${
                rec.nutrient === 'N' ? '#4caf50' : 
                rec.nutrient === 'P' ? '#2196f3' : 
                '#ff9800'
              }`,
              bgcolor: rec.nutrient === 'N' ? '#e8f5e9' : 
                      rec.nutrient === 'P' ? '#e3f2fd' : 
                      '#fff3e0'
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h3" mb={1}>
                  {rec.nutrient === 'N' ? '💛' : rec.nutrient === 'P' ? '💙' : '💚'}
                </Typography>
                <Typography variant="h5" fontWeight="bold" 
                  color={rec.nutrient === 'N' ? '#2e7d32' : rec.nutrient === 'P' ? '#1565c0' : '#e65100'} 
                  mb={1}>
                  {rec.name}
                </Typography>
                <Typography variant="h3" fontWeight="bold" 
                  color={rec.nutrient === 'N' ? '#1b5e20' : rec.nutrient === 'P' ? '#0d47a1' : '#bf360c'}>
                  {rec.amount} kg
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {rec.application}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Application Advice */}
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ mb: 4 }}>
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
      
      <Button
        variant="outlined"
        color="primary"
        fullWidth
        size="large"
        onClick={onNewCalculation}
        sx={{ mt: 2 }}
      >
        New Calculation
      </Button>
    </Box>
  );
};

export default FertilizerResults;
