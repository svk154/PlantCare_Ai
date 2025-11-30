import React, { useState } from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';
import FertilizerForm from './FertilizerForm';
import FertilizerResults from './FertilizerResults';
import PastCalculations from '../PastCalculations';

const FertilizerCalculator = () => {
  const [calculationResult, setCalculationResult] = useState(null);
  const [calculationSaved, setCalculationSaved] = useState(false);
  
  const handleCalculationResult = (result) => {
    setCalculationResult(result);
    setCalculationSaved(true);
  };
  
  const handleNewCalculation = () => {
    setCalculationResult(null);
    setCalculationSaved(false);
  };
  
  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          Fertilizer Calculator
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" paragraph>
          Get fertilizer recommendations based on your crop needs and field details
        </Typography>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        {!calculationResult ? (
          <FertilizerForm onCalculationResult={handleCalculationResult} />
        ) : (
          <FertilizerResults 
            result={calculationResult} 
            onNewCalculation={handleNewCalculation}
            saved={calculationSaved}
          />
        )}
      </Paper>
      
      <PastCalculations calculatorType="fertilizer" />
    </Container>
  );
};

export default FertilizerCalculator;
