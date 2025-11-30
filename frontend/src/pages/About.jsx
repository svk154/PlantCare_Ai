import { Button, Card, CardContent, Typography, Box, Container, Grid } from '@mui/material';
import { Target, Users, Lightbulb, Award, Globe, Check, Camera, BarChart3, CloudRain, Calculator, Sprout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { backgroundStyles } from '../assets/styles';

// Animation variants for consistent animations
const animationVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.8 } }
  },
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  },
  staggerContainer: {
    animate: { transition: { staggerChildren: 0.2 } }
  },
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }
};

const values = [
  {
    icon: <Target size={28} color="#16a34a" />,
    title: "Precision Agriculture",
    description: "Leveraging AI and data science to provide accurate, actionable insights for modern farming.",
    color: "#f0fdf4"
  },
  {
    icon: <Users size={28} color="#2563eb" />,
    title: "Community First",
    description: "Building a supportive network where farmers can share knowledge and learn from each other.",
    color: "#eff6ff"
  },
  {
    icon: <Lightbulb size={28} color="#7c3aed" />,
    title: "Innovation",
    description: "Continuously evolving our technology to address the changing needs of agriculture.",
    color: "#f5f3ff"
  },
  {
    icon: <Globe size={28} color="#059669" />,
    title: "Sustainability",
    description: "Promoting sustainable farming practices that benefit both farmers and the environment.",
    color: "#ecfdf5"
  }
];

const stats = [
  { number: "98%", label: "Disease Detection Accuracy", color: "#16a34a" },
  { number: "10,000+", label: "Farmers Using Our Platform", color: "#0284c7" },
  { number: "50,000+", label: "Plants Analyzed Monthly", color: "#7c3aed" },
  { number: "120+", label: "Plant Species Recognized", color: "#ea580c" }
];

const features = [
  { title: "Disease Detection", description: "Upload plant images for AI-powered disease identification with treatment recommendations", icon: <Camera color="#16a34a" size={28} /> },
  { title: "Crop Recommendation", description: "Get AI-powered crop recommendations based on soil NPK values, weather conditions, and environmental factors", icon: <Sprout color="#4CAF50" size={28} /> },
  { title: "Yield Prediction", description: "Predict crop yields based on farming inputs, environmental conditions, and historical data for better harvest planning", icon: <BarChart3 color="#FF9800" size={28} /> },
  { title: "Dashboard Analytics", description: "Visual farm statistics and personalized farming insights", icon: <BarChart3 color="#7c3aed" size={28} /> },
  { title: "Weather Integration", description: "Access real-time weather data and farming recommendations", icon: <CloudRain color="#06b6d4" size={28} /> },
  { title: "Agricultural Calculators", description: "Calculate fertilizer, pesticide requirements and estimate field profitability.", icon: <Calculator color="#2563eb" size={28} /> }
];

export default function About() {
  const navigate = useNavigate();

  return (
    <Layout>
      {/* Hero Section with Background Image */}
      <Box 
        sx={{ 
          position: 'relative', 
          color: 'white',
          py: { xs: 8, sm: 10, md: 14 },
          overflow: 'hidden'
        }}
      >
        {/* Background with image and overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1586771107445-d3ca888129ce?auto=format&fit=crop&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
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
            background: 'linear-gradient(rgba(46, 125, 50, 0.85), rgba(27, 94, 32, 0.9))',
            zIndex: -1
          }}
        />
        
        {/* Decorative leaf elements */}
        <Box
          component={motion.div}
          initial={{ rotate: -20, x: -100, opacity: 0 }}
          animate={{ rotate: 0, x: 0, opacity: 0.1 }}
          transition={{ duration: 1, type: 'spring' }}
          sx={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: '180px',
            height: '180px',
            background: 'url("https://www.svgrepo.com/show/95124/leaf.svg") no-repeat',
            backgroundSize: 'contain',
            zIndex: -1,
            opacity: 0.15,
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
            opacity: 0.15,
            transform: 'scaleX(-1)',
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                fontWeight: 800,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '4rem' },
                mb: 2,
                textAlign: 'center'
              }}
            >
              Our Mission at PlantCare AI
            </Typography>
            
            <Typography 
              variant="h5" 
              sx={{ 
                maxWidth: '800px', 
                mb: 4,
                opacity: 0.9,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem', lg: '1.5rem' },
                fontWeight: 400,
                textAlign: 'center',
                mx: 'auto'
              }}
            >
              Revolutionizing agriculture through AI-powered insights, empowering farmers to grow sustainably and maximize crop yields
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => navigate('/signup')}
                  sx={{ 
                    px: { xs: 3, sm: 4 }, 
                    py: { xs: 1.25, sm: 1.5 },
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    fontWeight: 600,
                    borderRadius: 3,
                    backgroundColor: 'white',
                    color: '#2e7d32',
                    boxShadow: '0px 8px 24px rgba(255, 255, 255, 0.2)',
                    "&:hover": { 
                      backgroundColor: '#f0fdf4',
                      boxShadow: '0px 8px 30px rgba(255, 255, 255, 0.3)'
                    } 
                  }}
                >
                  Join Our Community
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Container>
      </Box>
      
      {/* Our Vision Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={12}>
            <Box
              component={motion.div}
              variants={animationVariants.slideUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: 1.5 }}>
                OUR VISION
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 3, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem', lg: '2.5rem' } }}>
                Transforming Agriculture Through Technology
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}>
                At PlantCare AI, we envision a world where farmers of all scales have access to advanced agricultural 
                technology that optimizes crop yield, minimizes resource usage, and promotes sustainable farming practices. 
                Our AI-powered platform bridges the gap between traditional farming knowledge and cutting-edge technology, 
                making precision agriculture accessible to everyone.
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  "Early disease detection to prevent crop losses",
                  "Data-driven decisions for optimal resource allocation",
                  "Community knowledge sharing for collective growth",
                  "Sustainable farming practices for environmental stewardship"
                ].map((point, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box 
                      sx={{ 
                        backgroundColor: 'success.light', 
                        borderRadius: '50%', 
                        width: 36, 
                        height: 36,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Check color="#16a34a" size={20} />
                    </Box>
                    <Typography variant="body1">{point}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
      
      {/* Stats Section */}
      <Box 
        sx={{ 
          py: { xs: 6, md: 8 }, 
          background: backgroundStyles.primaryGradient,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(#16a34a 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            opacity: 0.07,
            zIndex: 0
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={{ xs: 2, sm: 2 }} sx={{ flexWrap: { xs: 'wrap', sm: 'wrap' } }}>
            {stats.map((stat, index) => (
              <Grid item xs={6} sm={6} md={3} key={index} sx={{ minWidth: { xs: 'auto', sm: 'auto' } }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Box 
                    sx={{ 
                      textAlign: 'center',
                      p: { xs: 1.5, sm: 2, md: 3 },
                      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
                    }}
                  >
                    <Typography 
                      variant="h2" 
                      component="p" 
                      sx={{ 
                        fontWeight: 800, 
                        mb: 1,
                        color: stat.color,
                        fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem', lg: '2.5rem' }
                      }}
                    >
                      {stat.number}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 500,
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.85rem', lg: '1rem' }
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* Core Values Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            component="h2" 
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Our Core Values
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary', 
              maxWidth: '700px', 
              mx: 'auto', 
              fontSize: '1.1rem' 
            }}
          >
            These principles guide everything we do at PlantCare AI
          </Typography>
        </Box>
        
        <Grid 
          container 
          spacing={3} 
          component={motion.div}
          variants={animationVariants.staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {values.map((value, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <motion.div variants={animationVariants.staggerItem}>
                <Card 
                  elevation={2}
                  sx={{ 
                    backgroundColor: value.color, 
                    height: '100%',
                    borderRadius: 4,
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ mb: 2 }}>
                      {value.icon}
                    </Box>
                    <Typography variant="h5" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                      {value.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      {value.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
      
      {/* Key Features Section */}
      <Box 
        sx={{ 
          bgcolor: '#e6faf0',  // Lighter green background to match the image
          py: { xs: 8, md: 10 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(#16a34a 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            opacity: 0.04,
            zIndex: 0
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="overline" 
              sx={{ 
                color: 'primary.dark', 
                fontWeight: 600, 
                letterSpacing: 1.5,
                fontSize: '1rem',
                mb: 1,
                display: 'block'
              }}
            >
              WHAT WE OFFER
            </Typography>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                fontWeight: 800, 
                mb: 3,
                fontSize: { xs: '2rem', sm: '2.25rem', md: '2.5rem', lg: '3rem' }
              }}
            >
              Key Features
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'text.secondary', 
                maxWidth: '700px', 
                mx: 'auto',
                fontWeight: 400,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
              }}
            >
              Advanced tools to transform your farming experience
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 4, maxWidth: '1000px', mx: 'auto' }}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card 
                  elevation={0}
                  sx={{ 
                    borderRadius: 6,
                    background: '#ffffff',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    overflow: 'hidden',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.03)'
                  }}
                >
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: { xs: 3, sm: 4 },
                      minWidth: { xs: '100%', sm: '130px' }
                    }}
                  >
                    <Box
                      sx={{ 
                        width: { xs: 56, sm: 64 }, 
                        height: { xs: 56, sm: 64 },
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: index === 0 ? 'rgba(22, 163, 74, 0.1)' :
                                         index === 1 ? 'rgba(124, 58, 237, 0.1)' :
                                         index === 2 ? 'rgba(6, 182, 212, 0.1)' :
                                         'rgba(37, 99, 235, 0.1)'
                      }}
                    >
                      {feature.icon}
                    </Box>
                  </Box>
                  <CardContent sx={{ p: { xs: 3, sm: 4 }, flex: 1 }}>
                    <Typography variant="h5" component="h3" sx={{ 
                      mb: 1.5, 
                      fontWeight: 600, 
                      color: index === 0 ? '#2e7d32' : 
                             index === 1 ? '#7c3aed' : 
                             index === 2 ? '#06b6d4' : 
                             '#2563eb',
                      fontSize: { xs: '1.25rem', sm: '1.5rem' }
                    }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: 'text.secondary', 
                      lineHeight: 1.7,
                      fontSize: { xs: '0.95rem', sm: '1rem' }
                    }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        </Container>
      </Box>
      
      {/* Technology Section with Award */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        {/* Cutting-Edge AI Technology Section */}
        <Box sx={{ mb: 8 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 3, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem', lg: '2.5rem' } }}>
              Cutting-Edge AI Technology
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}>
              Our advanced AI models identify plant diseases from thousands of images with exceptional accuracy. 
              Our platform integrates weather data, agricultural calculators, and community insights to provide 
              a comprehensive farming solution that's accessible to everyone.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/signup')}
                startIcon={<Camera />}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1
                }}
              >
                Try Disease Detection
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={() => navigate('/signup')}
                startIcon={<BarChart3 />}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1
                }}
              >
                Sign Up for Dashboard
              </Button>
            </Box>
          </motion.div>
        </Box>
        
        {/* Award-Winning Platform - Centered Section */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <Box sx={{ maxWidth: '600px', width: '100%' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card 
                elevation={3}
                sx={{ 
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Award size={80} color="#16a34a" />
                  <Typography variant="h4" color="#16a34a" fontWeight={700} mt={2} mb={1}>
                    Award-Winning Platform
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Recognized for innovation in agricultural technology and commitment to sustainability.
                  </Typography>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 3,
                      mt: 3
                    }}
                  >
                    <Box textAlign="center">
                      <Typography variant="h5" fontWeight={700} color="#16a34a">
                        2025
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        AgTech Innovator
                      </Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="h5" fontWeight={700} color="#16a34a">
                        2024
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Best AI Solution
                      </Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="h5" fontWeight={700} color="#16a34a">
                        2023
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Farming Innovation
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Box>
        </Box>
      </Container>
      
      {/* Call to Action */}
      <Box 
        sx={{ 
          py: { xs: 8, md: 12 },
          background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          mt: 8
        }}
      >
        {/* Background pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            opacity: 0.3,
            zIndex: 0
          }}
        />
        
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: 3,
                fontSize: { xs: '2rem', sm: '2.25rem', md: '2.5rem', lg: '3rem' } 
              }}
            >
              Ready to Revolutionize Your Farming?
            </Typography>
            <Typography 
              variant="h6" 
              component="p"
              sx={{ 
                fontWeight: 400, 
                mb: 5,
                opacity: 0.9,
                maxWidth: '700px',
                mx: 'auto',
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
              }}
            >
              Join thousands of farmers already using PlantCare AI to increase yields, 
              reduce costs, and farm more sustainably.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => navigate('/signup')}
                  sx={{ 
                    px: { xs: 3, sm: 4 }, 
                    py: { xs: 1.25, sm: 1.5 },
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    fontWeight: 600,
                    borderRadius: 3,
                    backgroundColor: 'white',
                    color: '#16a34a',
                    boxShadow: '0px 8px 24px rgba(255, 255, 255, 0.2)',
                    "&:hover": { 
                      backgroundColor: 'white',
                      boxShadow: '0px 8px 30px rgba(255, 255, 255, 0.3)'
                    } 
                  }}
                >
                  Get Started Free
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => navigate('/signup')}
                  sx={{ 
                    px: { xs: 3, sm: 4 }, 
                    py: { xs: 1.25, sm: 1.5 },
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    fontWeight: 600,
                    borderRadius: 3,
                    borderColor: 'white',
                    color: 'white',
                    "&:hover": { 
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    } 
                  }}
                >
                  Sign Up for Disease Detection
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </Layout>
  );
}
