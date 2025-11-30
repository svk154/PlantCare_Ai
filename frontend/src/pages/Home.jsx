import { Button, Box, Typography, Card, Avatar, Container, Grid } from '@mui/material';
import { Leaf, Calculator, Users, CloudRain, BarChart3, MapPin, Camera, Sprout, Award, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DiseaseResultCard from '../components/DiseaseResultCard';
import Layout from '../components/Layout';
import { backgroundStyles, animationVariants } from '../assets/styles';

const featureIcons = {
  "Disease Detection": <Camera color="#16a34a" size={28} />,
  "Crop Recommendation": <Sprout color="#4CAF50" size={28} />,
  "Farm Management": <Sprout color="#059669" size={28} />,
  "Cultivation Tips": <Leaf color="#ea580c" size={28} />,
  "Dashboard Analytics": <BarChart3 color="#7c3aed" size={28} />,
  "Community Forum": <Users color="#db2777" size={28} />,
  "My Crops Selection": <MapPin color="#7c3aed" size={28} />,
  "Weather Integration": <CloudRain color="#06b6d4" size={28} />,
  "Agricultural Calculators": <Calculator color="#2563eb" size={28} />,
  "Yield Prediction": <BarChart3 color="#FF9800" size={28} />
};

const features = [
  { title: "Disease Detection", description: "Upload plant images for AI-powered disease identification with treatment recommendations" },
  { title: "Crop Recommendation", description: "Get AI-powered crop recommendations based on soil NPK values, weather conditions, and environmental factors" },
  { title: "Farm Management", description: "Manage multiple farms, track crops, and monitor plant health records" },
  { title: "Weather Integration", description: "Access real-time weather data and farming recommendations" },
  { title: "Dashboard Analytics", description: "Visual farm statistics and personalized farming insights" },
  { title: "Agricultural Calculators", description: "Calculate fertilizer, pesticide requirements and estimate field profitability" },
  { title: "Yield Prediction", description: "Predict crop yields based on farming inputs, environmental conditions, and historical data for better harvest planning" },
  { title: "My Crops Selection", description: "Select up to 8 crops for personalized cultivation recommendations" },
  { title: "Cultivation Tips", description: "Get location-based farming advice and seasonal recommendations" },
  { title: "Community Forum", description: "Connect with farmers, share experiences, and get expert advice" }
];

const stats = [
  { value: '98%', label: 'Disease Detection Accuracy', color: '#16a34a' },
  { value: '10,000+', label: 'Farmers Using Our Platform', color: '#0284c7' },
  { value: '50,000+', label: 'Plants Analyzed Monthly', color: '#7c3aed' },
  { value: '120+', label: 'Plant Species Recognized', color: '#ea580c' }
];

const testimonials = [
  {
    quote: "PlantCare AI has transformed how I manage my farm. The disease detection saved my tomato crops from blight before it could spread.",
    name: "Michael Johnson",
    role: "Farm Owner, California",
    image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=128&q=80"
  },
  {
    quote: "The analytics dashboard gives me insights I never had before. I can make better decisions about irrigation and fertilizer application.",
    name: "Sarah Williams",
    role: "Agricultural Consultant",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80"
  },
  {
    quote: "I've reduced my pesticide usage by 40% thanks to the precise recommendations. Better for my crops and better for the environment.",
    name: "David Chen",
    role: "Organic Farmer, Oregon",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80"
  }
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <Layout>
      {/* Hero Section with Background Pattern */}
      <Box 
        sx={{
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: 6, sm: 8, md: 12 },
          pb: { xs: 8, sm: 10, md: 16 },
        }}
      >
        {/* Background gradient and pattern */}
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #ecfdf5 100%)',
            zIndex: -2,
          }}
        />
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(#16a34a 2px, transparent 2px)',
            backgroundSize: '30px 30px',
            opacity: 0.08,
            zIndex: -1,
          }}
        />

        {/* Leaf decorations */}
        <Box
          component={motion.div}
          initial={{ rotate: -20, x: -100, opacity: 0 }}
          animate={{ rotate: 0, x: 0, opacity: 0.1 }}
          transition={{ duration: 1, type: 'spring' }}
          sx={{
            position: 'absolute',
            top: '5%',
            left: '5%',
            width: '200px',
            height: '200px',
            background: 'url("https://www.svgrepo.com/show/95124/leaf.svg") no-repeat',
            backgroundSize: 'contain',
            zIndex: -1,
            opacity: 0.1,
          }}
        />
        
        <Box
          component={motion.div}
          initial={{ rotate: 20, x: 100, opacity: 0 }}
          animate={{ rotate: 0, x: 0, opacity: 0.1 }}
          transition={{ duration: 1, type: 'spring', delay: 0.3 }}
          sx={{
            position: 'absolute',
            bottom: '10%',
            right: '5%',
            width: '150px',
            height: '150px',
            background: 'url("https://www.svgrepo.com/show/95124/leaf.svg") no-repeat',
            backgroundSize: 'contain',
            zIndex: -1,
            opacity: 0.1,
            transform: 'scaleX(-1)',
          }}
        />

        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Typography 
                  variant="h1" 
                  fontWeight="900" 
                  fontSize={{ xs: '2rem', sm: '2.5rem', md: '3.5rem', lg: '4rem' }}
                  lineHeight={1.1}
                  mb={3}
                >
                  Smart Agriculture with{' '}
                  <Box
                    component="span"
                    sx={backgroundStyles.gradientText}
                  >
                    AI-Powered Insights
                  </Box>
                </Typography>
                
                <Typography 
                  variant="h5" 
                  color="text.secondary" 
                  lineHeight={1.5}
                  mb={5}
                  fontSize={{ xs: '1rem', sm: '1.1rem', md: '1.25rem', lg: '1.5rem' }}
                >
                  Revolutionize your farming with our comprehensive plant disease detection system, agricultural calculators, and community-driven knowledge sharing platform.
                </Typography>

                <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={{ xs: 2, sm: 2 }}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      size="large"
                      onClick={() => navigate('/signup')}
                      sx={{ 
                        background: "#16a34a",
                        color: "white", 
                        px: { xs: 3, sm: 4 }, 
                        py: { xs: 1.25, sm: 1.5 }, 
                        fontSize: { xs: "1rem", sm: "1.1rem" }, 
                        borderRadius: 3,
                        boxShadow: '0px 8px 24px rgba(22, 163, 74, 0.3)',
                        "&:hover": { 
                          background: "#15803d",
                          boxShadow: '0px 10px 30px rgba(22, 163, 74, 0.4)',
                        } 
                      }}
                    >
                      Get Started Free
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/about')}
                      sx={{ 
                        borderColor: "#bbf7d0", 
                        borderWidth: 2,
                        color: "#15803d", 
                        px: { xs: 3, sm: 4 }, 
                        py: { xs: 1.25, sm: 1.5 }, 
                        fontSize: { xs: "1rem", sm: "1.1rem" }, 
                        borderRadius: 3,
                        "&:hover": { 
                          background: "#f0fdf4", 
                          borderColor: "#15803d" 
                        } 
                      }}
                    >
                      Learn More
                    </Button>
                  </motion.div>
                </Box>

                <Box 
                  display="flex" 
                  flexWrap="wrap" 
                  mt={5} 
                  gap={1.5}
                  component={motion.div}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  {['AI-Powered', 'Easy to Use', 'Comprehensive', 'Community Driven'].map((tag) => (
                    <Box
                      key={tag}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: 'rgba(22, 163, 74, 0.08)',
                        color: '#166534',
                        px: 2,
                        py: 0.75,
                        borderRadius: 5,
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}
                    >
                      <Check size={16} />
                      {tag}
                    </Box>
                  ))}
                </Box>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6} sx={{ 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%'
                }}
              >
                <Box 
                  component="img"
                  loading="lazy"
                  decoding="async"
                  src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=600&q=70"
                  alt="Plant Analysis"
                  sx={{
                    maxWidth: { xs: '95%', sm: '85%', md: '100%' },
                    height: 'auto',
                    borderRadius: { xs: 2, sm: 4 },
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    border: { xs: '4px solid white', sm: '8px solid white' },
                    margin: '0 auto'
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box 
        sx={{ 
          py: 6, 
          bgcolor: 'white'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 2, sm: 3 }} justifyContent="center">
            {stats.map((stat, idx) => (
              <Grid item xs={6} sm={6} md={3} key={idx}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <Box 
                    textAlign="center" 
                    py={{ xs: 1.5, sm: 2 }}
                    px={{ xs: 1, sm: 1 }}
                    sx={{
                      borderRadius: 4,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease'
                      }
                    }}
                  >
                    <Typography 
                      variant="h3" 
                      fontWeight="bold" 
                      gutterBottom
                      sx={{ color: stat.color, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>{stat.label}</Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* AI-Powered Tools Section */}
      <Box 
        sx={{ 
          py: { xs: 6, md: 10 }, 
          position: 'relative',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Typography 
                variant="h2" 
                fontWeight="bold" 
                mb={2}
                sx={{ fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' } }}
              >
                🤖 AI-Powered Crop Intelligence
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }, maxWidth: '600px', mx: 'auto' }}
              >
                Advanced machine learning tools to optimize your farming decisions and maximize yields
              </Typography>
            </motion.div>
          </Box>

          <Grid container spacing={4}>
            {/* Crop Recommendation Tool */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <Card 
                  sx={{ 
                    p: 4, 
                    height: '100%', 
                    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                    color: 'white',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
                      <Sprout size={32} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight="bold" mb={1}>
                        Crop Recommendation
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        AI-powered crop selection
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" mb={3} sx={{ opacity: 0.95 }}>
                    Get intelligent crop recommendations based on your soil's NPK values, local climate conditions, and environmental factors. Our AI analyzes optimal growing conditions to suggest the best crops for maximum yield.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => {
                      const token = localStorage.getItem('access_token');
                      if (token) {
                        navigate('/crop-recommendation');
                      } else {
                        navigate('/signup');
                      }
                    }}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                      borderRadius: 2,
                      py: 1.5,
                      px: 3
                    }}
                    startIcon={<Sprout />}
                  >
                    Try Crop Recommendation
                  </Button>
                </Card>
              </motion.div>
            </Grid>

            {/* Yield Prediction Tool */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card 
                  sx={{ 
                    p: 4, 
                    height: '100%', 
                    background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                    color: 'white',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
                      <BarChart3 size={32} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight="bold" mb={1}>
                        Yield Prediction
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Smart harvest forecasting
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" mb={3} sx={{ opacity: 0.95 }}>
                    Predict your crop yields with precision using our advanced ML models. Input your farming details, environmental conditions, and get accurate harvest forecasts for better planning and profitability.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => {
                      const token = localStorage.getItem('access_token');
                      if (token) {
                        navigate('/yield-prediction');
                      } else {
                        navigate('/signup');
                      }
                    }}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                      borderRadius: 2,
                      py: 1.5,
                      px: 3
                    }}
                    startIcon={<BarChart3 />}
                  >
                    Try Yield Prediction
                  </Button>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Animated Disease Result Card Section */}
      <Box 
        sx={{
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, white 0%, #f0fdf4 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h2" fontWeight="bold" mb={2} fontSize={{ xs: '1.75rem', sm: '2rem', md: '2.25rem', lg: '2.5rem' }}>
                AI-Powered Disease Detection
              </Typography>
              <Typography variant="h6" color="text.secondary" mx="auto" maxWidth={700} fontSize={{ xs: '0.95rem', sm: '1rem', md: '1.1rem', lg: '1.25rem' }}>
                Our advanced machine learning algorithms can identify plant diseases with 98% accuracy.
                Get instant treatment recommendations tailored to your specific crops.
              </Typography>
            </motion.div>
          </Box>

          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <Box>
                  <Typography variant="h4" fontWeight={600} mb={3} color="primary.dark">
                    How It Works
                  </Typography>
                  
                  {[
                    { step: 1, title: "Upload Plant Image", description: "Take a photo of the affected part of your plant and upload it to our system" },
                    { step: 2, title: "AI Analysis", description: "Our ML model analyzes the image and identifies diseases with high accuracy" },
                    { step: 3, title: "Treatment Recommendations", description: "Get detailed treatment recommendations and prevention strategies" }
                  ].map((item) => (
                    <Box 
                      key={item.step} 
                      sx={{ 
                        display: 'flex', 
                        gap: 2, 
                        mb: 3,
                        p: 2,
                        borderRadius: 3,
                        bgcolor: 'rgba(255, 255, 255, 0.7)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                      }}
                    >
                      <Avatar
                        sx={{ 
                          bgcolor: '#16a34a', 
                          color: 'white',
                          width: 45,
                          height: 45,
                          fontWeight: 'bold'
                        }}
                      >
                        {item.step}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {item.title}
                        </Typography>
                        <Typography color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                  
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={async () => {
                        try {
                          // Import API config for dynamic base URL
                          const { getApiBaseUrl } = await import('../utils/apiConfig');
                          const apiBaseUrl = getApiBaseUrl();
                          
                          // Check auth status via API
                          const response = await fetch(`${apiBaseUrl}/auth/me`, {
                            method: 'GET',
                            headers: {
                              'Content-Type': 'application/json'
                            },
                            credentials: 'include' // Include cookies
                          });
                          
                          if (response.ok) {
                            navigate('/disease-detection');
                          } else {
                            navigate('/login', { state: { from: '/disease-detection', message: 'Please log in to access disease detection' } });
                          }
                        } catch (error) {
                          // If error occurs, redirect to login
                          
                          navigate('/login', { state: { from: '/disease-detection', message: 'Please log in to access disease detection' } });
                        }
                      }}
                      startIcon={<Camera />}
                      sx={{ 
                        mt: 2,
                        borderRadius: 3,
                        py: { xs: 1.25, sm: 1.5 },
                        px: { xs: 3, sm: 4 },
                        fontSize: { xs: '1rem', sm: '1.1rem' }
                      }}
                    >
                      Try Disease Detection
                    </Button>
                  </motion.div>
                </Box>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={6} textAlign="center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: 'spring' }}
              >
                <DiseaseResultCard />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Grid Section */}
      <Box 
        sx={{ 
          py: { xs: 6, md: 8 },
          background: 'linear-gradient(135deg, #f7fee7 0%, #ecfdf5 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative patterns */}
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(#16a34a 2px, transparent 2px)',
            backgroundSize: '30px 30px',
            opacity: 0.06,
            zIndex: 0,
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={animationVariants.staggerContainer}
          >
            <Box textAlign="center" mb={4}>
              <motion.div variants={animationVariants.slideUp}>
                <Typography variant="h3" fontWeight="bold" mb={2} fontSize={{ xs: '1.75rem', sm: '2.25rem', md: '2.5rem' }}>
                  Comprehensive Farm Management Solution
                </Typography>
                <Typography variant="body1" color="text.secondary" maxWidth={700} mx="auto" fontSize={{ xs: '0.95rem', md: '1rem' }}>
                  Everything you need to optimize your agricultural operations and maximize crop yield
                </Typography>
              </motion.div>
            </Box>

            <Box width="100%" mx="auto">
              <Grid container spacing={{ xs: 2, sm: 3 }} justifyContent="center">
                {features.map((feature, idx) => (
                <Grid item xs={12} sm={6} lg={4} key={feature.title} sx={{ maxWidth: { xs: '100%', sm: 400, lg: 350 } }}>
                  <motion.div 
                    variants={animationVariants.staggerItem}
                    whileHover={{ y: -3 }}
                    transition={{ type: "spring", stiffness: 250 }}
                  >
                    <Card
                      elevation={1}
                      sx={{
                        p: { xs: 2, sm: 2.5, md: 3 },
                        height: '100%',
                        minHeight: { xs: '160px', sm: '180px' },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        borderRadius: 3,
                        bgcolor: "#fff",
                        overflow: 'visible',
                        position: 'relative',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                        },
                        '&:before': {
                          content: '""',
                          position: 'absolute',
                          width: '100%',
                          height: '5px',
                          top: 0,
                          left: 0,
                          backgroundImage: `linear-gradient(90deg, ${idx % 4 === 0 ? '#16a34a' : idx % 4 === 1 ? '#0284c7' : idx % 4 === 2 ? '#7c3aed' : '#ea580c'}, ${idx % 4 === 0 ? '#059669' : idx % 4 === 1 ? '#0369a1' : idx % 4 === 2 ? '#6d28d9' : '#c2410c'})`,
                          borderTopLeftRadius: 12,
                          borderTopRightRadius: 12,
                        }
                      }}
                    >
                      <Avatar
                        sx={{ 
                          bgcolor: 'rgba(249, 250, 251, 0.8)',
                          width: 52,
                          height: 52,
                          mb: 1.5,
                          color: idx % 4 === 0 ? '#16a34a' : idx % 4 === 1 ? '#0284c7' : idx % 4 === 2 ? '#7c3aed' : '#ea580c',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                        }}
                      >
                        {featureIcons[feature.title]}
                      </Avatar>
                      
                      <Typography variant="h6" fontWeight={700} mb={0.5} fontSize={{ xs: '1rem', sm: '1.1rem' }}>
                        {feature.title}
                      </Typography>
                      
                      <Typography color="text.secondary" fontSize={{ xs: '0.8rem', sm: '0.85rem', md: '0.875rem' }} lineHeight={1.5}>
                        {feature.description}
                      </Typography>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
              </Grid>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box 
        sx={{ 
          py: { xs: 8, md: 12 },
          bgcolor: 'white',
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h2" fontWeight="bold" mb={2} fontSize={{ xs: '1.75rem', sm: '2rem', md: '2.25rem', lg: '2.5rem' }}>
                What Farmers Are Saying
              </Typography>
              <Typography variant="h6" color="text.secondary" mx="auto" maxWidth={700} fontSize={{ xs: '0.95rem', sm: '1rem', md: '1.1rem', lg: '1.25rem' }}>
                Join thousands of satisfied farmers who have transformed their agricultural practices with PlantCare AI
              </Typography>
            </motion.div>
          </Box>

          <Grid container spacing={{ xs: 3, sm: 4 }}>
            {testimonials.map((testimonial, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <Card
                    elevation={2}
                    sx={{
                      p: { xs: 3, sm: 4 },
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      ...backgroundStyles.cardHoverEffect
                    }}
                  >
                    <Box sx={{ fontSize: 40, color: '#16a34a', height: 30, mb: 2 }}>"</Box>
                    <Typography variant="body1" mb={3} flex={1}>
                      {testimonial.quote}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar imgProps={{ loading: 'lazy', decoding: 'async' }} src={testimonial.image} sx={{ width: 56, height: 56 }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box 
        sx={{ 
          py: { xs: 10, md: 16 },
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#f0fdf4',
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 50%, #ecfdf5 100%)',
            zIndex: -2,
          }}
        />

        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Box 
              sx={{
                textAlign: 'center',
                p: { xs: 4, md: 8 },
                borderRadius: 8,
                ...backgroundStyles.glassmorphism,
              }}
            >
              <Award size={64} color="#16a34a" style={{ marginBottom: 24 }} />
              
              <Typography variant="h3" fontWeight="bold" mb={3} fontSize={{ xs: '1.75rem', sm: '2rem', md: '2.25rem', lg: '2.5rem' }}>
                Ready to Transform Your Farming?
              </Typography>
              
              <Typography variant="h6" color="text.secondary" mb={5} maxWidth={600} mx="auto" fontSize={{ xs: '0.95rem', sm: '1rem', md: '1.1rem', lg: '1.25rem' }}>
                Join thousands of farmers who are increasing yields, reducing costs, and practicing sustainable agriculture with PlantCare AI.
              </Typography>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="large"
                  onClick={() => navigate('/signup')}
                  sx={{ 
                    background: "#16a34a",
                    color: "white", 
                    px: 6, 
                    py: 2, 
                    fontSize: "1.2rem", 
                    borderRadius: 3,
                    boxShadow: '0px 8px 24px rgba(22, 163, 74, 0.3)',
                    "&:hover": { 
                      background: "#15803d",
                      boxShadow: '0px 10px 30px rgba(22, 163, 74, 0.4)',
                    } 
                  }}
                >
                  Get Started Today
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </Layout>
  );
}
