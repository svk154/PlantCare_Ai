import { useState, useEffect } from 'react';
import { Button, Box, Typography, Card, CardContent, Alert, InputAdornment, IconButton, Checkbox, FormControlLabel, Container, Grid, TextField } from '@mui/material';
import { Leaf, Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState('');
  
  // Check if user was redirected from another page
  useEffect(() => {
    if (location.state?.message) {
      setRedirectMessage(location.state.message);
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        // Import sanitization utility
        const { sanitizeFormData } = await import('../utils/sanitize');
        
        // Sanitize input before sending to server
        const sanitizedData = sanitizeFormData({ 
          email: formData.email, 
          password: formData.password 
        });
        
        // Import API config for base URL
        const { getApiBaseUrl } = await import('../utils/apiConfig');
        const apiBaseUrl = getApiBaseUrl();
        
        // Use configurable API base URL for login
        const response = await fetch(`${apiBaseUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(sanitizedData),
          credentials: 'include'
        });
        
        // Handle non-200 responses
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ 
            error: `Login failed with status ${response.status}` 
          }));
          setLoginError(errorData.error || 'Login failed. Please check your credentials.');
          return;
        }
        
        const data = await response.json();
        
        // If the request was successful but returned an error field
        if (data.error) {
          setLoginError(data.error || 'Login failed. Please check your credentials and try again.');
          return;
        }
        
        // Store access token in localStorage
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
        }
        
        if (onLoginSuccess) onLoginSuccess();
        
        // Redirect to the original page if user was redirected from somewhere
        if (location.state?.from) {
          navigate(location.state.from);
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        // Show more specific error message if available
        if (err && err.error) {
          setLoginError(err.error);
        } else {
          setLoginError('Network error. Please check your connection and try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Box 
      sx={{ 
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        overflowX: 'hidden'
      }}
    >
      {/* Header with back button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/')}
          sx={{ color: '#166534', minHeight: 44, px: 1.5 }}
        >
          Back to Home
        </Button>
        
        <Box 
          display="flex" 
          alignItems="center" 
          gap={1}
          onClick={() => {
            // On the login page, always redirect to the home page
            navigate('/');
          }}
          sx={{ 
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.85
            }
          }}
        >
          <Leaf size={28} color="#16a34a" />
          <Typography fontWeight="bold" color="#166534">
            PlantCare AI
          </Typography>
        </Box>
        
        <Box width={301} /> {/* Empty box to center the logo */}
      </Box>
      
      {/* Main content */}
      <Box 
        sx={{ 
          display: 'flex',
          flex: 1,
          position: 'relative',
          justifyContent: 'center',
          alignItems: 'center',
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
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
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
            opacity: 0.05,
            zIndex: -1,
          }}
        />
        
        {/* Split screen layout */}
        <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Grid container spacing={{ xs: 2, md: 0 }} justifyContent="center">
            {/* Left side - Login form */}
            <Grid item xs={12} md={6} sx={{ py: { xs: 4, md: 10 }, px: { xs: 3, md: 5 } }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Box maxWidth={500} mx="auto">
                  <Box textAlign="center" mb={5}>
                    <Typography variant="h3" fontWeight="bold" gutterBottom fontSize={{ xs: '1.75rem', sm: '2rem', md: '2.25rem' }}>
                      Welcome Back
                    </Typography>
                    <Typography color="text.secondary" fontSize={{ xs: '0.95rem', sm: '1rem' }}>
                      Login to access your farm dashboard and tools
                    </Typography>
                  </Box>
                  
                  {redirectMessage && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      {redirectMessage}
                    </Alert>
                  )}
                  
                  {loginError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {loginError}
                    </Alert>
                  )}
                  
                  <Card 
                    elevation={4} 
                    component="form" 
                    onSubmit={handleSubmit}
                    sx={{ 
                      borderRadius: 3,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      overflow: 'visible',
                      width: '100%'
                    }}
                  >
                    <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        error={!!errors.email}
                        helperText={errors.email || ''}
                        sx={{ mb: 3 }}
                        autoComplete="email"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Mail size={20} color="#666" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange}
                        error={!!errors.password}
                        helperText={errors.password || ''}
                        sx={{ mb: 2 }}
                        autoComplete="current-password"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock size={20} color="#666" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              name="rememberMe"
                              checked={formData.rememberMe}
                              onChange={handleInputChange}
                              color="primary"
                              size="small"
                            />
                          }
                          label="Remember me"
                        />
                        <Typography 
                          component={RouterLink} 
                          to="/forgot-password"
                          variant="body2"
                          color="primary"
                          sx={{ textDecoration: 'none' }}
                        >
                          Forgot password?
                        </Typography>
                      </Box>
                      
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isLoading}
                        sx={{ 
                          py: { xs: 1.5, sm: 1.75 },
                          px: { xs: 3, sm: 4 },
                          minHeight: 48,
                          fontSize: { xs: '1rem', sm: '1.0625rem' },
                          backgroundColor: "#16a34a",
                          "&:hover": { backgroundColor: "#15803d" },
                          borderRadius: 2,
                          boxShadow: '0px 8px 24px rgba(22, 163, 74, 0.25)',
                        }}
                      >
                        {isLoading ? 'Logging in...' : 'Login'}
                      </Button>
                      
                      <Box mt={3} textAlign="center">
                        <Typography variant="body2">
                          Don't have an account?{' '}
                          <Typography
                            component={RouterLink}
                            to="/signup"
                            color="primary"
                            sx={{ textDecoration: 'none', fontWeight: 600 }}
                          >
                            Sign up
                          </Typography>
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </motion.div>
            </Grid>
            
            {/* Right side - Image and info */}
            <Grid 
              item 
              md={6} 
              sx={{ 
                display: { xs: 'none', md: 'block' },
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  backgroundImage: 'url(https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&q=80)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderTopLeftRadius: 40,
                  borderBottomLeftRadius: 40,
                  boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    background: 'linear-gradient(rgba(21, 128, 61, 0.3), rgba(21, 128, 61, 0.7))',
                  }
                }}
              />
              
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '10%',
                  left: '10%',
                  right: '10%',
                  color: 'white',
                  zIndex: 1,
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Grow Better with AI
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                    Access all your farm data, disease detection tools, and agricultural calculators in one place.
                  </Typography>
                  
                  <Box display="flex" flexDirection="column" gap={1}>
                    {['AI-Powered Disease Detection', 'Farm Analytics Dashboard', 'Weather Forecasts'].map((feature, i) => (
                      <Box 
                        key={i} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1 
                        }}
                      >
                        <Box 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            borderRadius: '50%', 
                            bgcolor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center' 
                          }}
                        >
                          <Typography color="#166534" fontWeight="bold">✓</Typography>
                        </Box>
                        <Typography>{feature}</Typography>
                      </Box>
                    ))}
                  </Box>
                </motion.div>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
