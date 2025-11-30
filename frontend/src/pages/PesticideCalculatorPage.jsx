import React from 'react';
import { Box, Typography } from '@mui/material';
import { Droplets } from 'lucide-react';

import PesticideCalculator from '../components/PesticideCalculator/PesticideCalculator';
import Layout from '../components/Layout';
import { isAuthenticated } from '../utils/auth';

const PesticideCalculatorPage = () => {

  // Check if user is logged in

  // Check if user is logged in
  const userIsLoggedIn = isAuthenticated();

  return (
    <Layout isLoggedIn={userIsLoggedIn}>
      <Box minHeight="100vh" sx={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%)', pt: 2 }}>

      <Box maxWidth={{ xs: "100%", md: 900 }} mx="auto" p={3}>
        <Box textAlign="center" my={2}>
          <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={1}>
            <Droplets size={42} color="#16a34a" />
            <Typography variant="h4" fontWeight="bold" color="#171717">
              Pesticide Calculator
            </Typography>
          </Box>
          <Typography color="text.secondary">
            Calculate precise pesticide application rates for your crops based on scientific recommendations.
            This tool helps you determine the right amount of pesticides needed for effective pest control.
          </Typography>
        </Box>
        
        {/* Using the modular PesticideCalculator component */}
        <PesticideCalculator />
      </Box>
    </Box>
    </Layout>
  );
};

export default PesticideCalculatorPage;
