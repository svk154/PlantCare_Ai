import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import Layout from '../components/Layout';
import DiseaseScans from '../components/DiseaseScans';

const DiseaseScanPage = () => {
  return (
    <Layout isLoggedIn={true}>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" fontWeight="bold" color="primary.main" mb={3}>
            Disease Scan History
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            View your plant disease scan history and manage your scans. The system keeps your recent scans for quick access.
          </Typography>
          
          <DiseaseScans />
        </Box>
      </Container>
    </Layout>
  );
};

export default DiseaseScanPage;
