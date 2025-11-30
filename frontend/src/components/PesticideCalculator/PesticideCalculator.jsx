import React, { useState } from 'react';
import { Container, Paper } from '@mui/material';
import PesticideForm from './PesticideForm';
import PesticideResults from './PesticideResults';
import PastCalculations from '../PastCalculations';

const PesticideCalculator = () => {
  const [calculationResult, setCalculationResult] = useState(null);
  const [calculationSaved, setCalculationSaved] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  
  const handleCalculationResult = (result) => {
    setCalculationResult(result);
    setCalculationSaved(false);
  };
  
  const handleNewCalculation = () => {
    setCalculationResult(null);
    setCalculationSaved(false);
  };

  const handleSaveStatus = (status) => {
    setCalculationSaved(status);
    if (status) {
      setHistoryRefreshKey(prev => prev + 1);
    }
  };
  
  return (
    <Container maxWidth="lg">      
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        {!calculationResult ? (
          <PesticideForm onCalculationResult={handleCalculationResult} />
        ) : (
          <PesticideResults 
            result={calculationResult} 
            onNewCalculation={handleNewCalculation}
            saved={calculationSaved}
            onSaveStatus={handleSaveStatus}
          />
        )}
      </Paper>
      
  <PastCalculations calculatorType="pesticide" refreshKey={historyRefreshKey} />
    </Container>
  );
};

export default PesticideCalculator;
