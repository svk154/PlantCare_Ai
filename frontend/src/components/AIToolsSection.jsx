// Option 2: Create a dedicated AI Tools section
// Add this after the Quick Actions section in Dashboard.jsx

{/* AI-Powered Tools Section */}
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.1 }}
>
  <Card 
    elevation={2} 
    sx={{ 
      borderRadius: 4, 
      mb: { xs: 3, sm: 4 },
      background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Sprout size={32} style={{ marginRight: '12px' }} />
        <Typography 
          variant="h5" 
          fontWeight="bold" 
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          🤖 AI-Powered Farming Tools
        </Typography>
      </Box>
      
      <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
        Leverage artificial intelligence to make smarter farming decisions
      </Typography>
      
      <Box 
        sx={{
          display: 'grid',
          gridTemplateColumns: { 
            xs: '1fr',
            sm: '1fr 1fr'
          },
          gap: { xs: 2, sm: 3 }
        }}
      >
        {/* Crop Recommendation */}
        <Box 
          onClick={() => navigate('/crop-recommendation')}
          sx={{
            p: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            cursor: 'pointer',
            transition: 'all 0.2s',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white', mr: 2 }}>
              <Sprout size={24} />
            </Avatar>
            <Typography fontWeight="bold" variant="h6">
              Crop Recommendation
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Get AI-powered crop suggestions based on your soil conditions and environment
          </Typography>
        </Box>

        {/* Yield Prediction */}
        <Box 
          onClick={() => navigate('/yield-prediction')}
          sx={{
            p: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            cursor: 'pointer',
            transition: 'all 0.2s',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white', mr: 2 }}>
              <BarChart3 size={24} />
            </Avatar>
            <Typography fontWeight="bold" variant="h6">
              Yield Prediction
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Predict your expected crop yield based on farming conditions and inputs
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
</motion.div>