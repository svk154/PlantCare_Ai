import React from 'react';
import { Container, Box, Typography, Card, CardContent, Avatar, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { Agriculture, Grass, CheckCircle, Warning } from '@mui/icons-material';
import Layout from '../components/Layout';
import MonitoredCrops from '../components/MonitoredCrops';

const CropsPage = () => {
  return (
    <Layout isLoggedIn={true}>
      <Container maxWidth="xl" sx={{ py: 4, pl: 6 }}>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            elevation={2}
            sx={{
              borderRadius: 3,
              bgcolor: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              mb: 4,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                background: 'linear-gradient(90deg, #16a34a, #059669, #0284c7)',
                zIndex: 1,
              }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar 
                  sx={{ 
                    bgcolor: '#16a34a', 
                    color: 'white',
                    width: 56,
                    height: 56,
                    mr: 3,
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                  }}
                >
                  <Agriculture sx={{ fontSize: 28 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={800} color="#171717" mb={0.5}>
                    Crop Monitoring
                  </Typography>
                  <Typography color="#6b7280" fontSize={16} fontWeight={500}>
                    Track health, progress, and harvest schedules across all farms
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={3} mt={3} flexWrap="wrap">
                <Chip 
                  icon={<Grass />}
                  label="Track Crop Health"
                  variant="filled"
                  sx={{ 
                    bgcolor: '#dbeafe', 
                    color: '#1e40af',
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: '#1e40af' }
                  }}
                />
                <Chip 
                  icon={<CheckCircle />}
                  label="Monitor Progress"
                  variant="filled"
                  sx={{ 
                    bgcolor: '#dcfce7', 
                    color: '#15803d',
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: '#15803d' }
                  }}
                />
                <Chip 
                  icon={<Warning />}
                  label="Health Alerts"
                  variant="filled"
                  sx={{ 
                    bgcolor: '#fef3c7', 
                    color: '#d97706',
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: '#d97706' }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <MonitoredCrops />
        </motion.div>
      </Container>
    </Layout>
  );
};

export default CropsPage;
