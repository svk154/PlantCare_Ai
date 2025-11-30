import { useState } from 'react';
import { Button, Box, Typography, TextField, Card, CardContent, InputAdornment, IconButton } from '@mui/material';

import { Leaf, Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 12) {
      newErrors.password = 'Password must be at least 12 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, digit, and special character';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');
    setSignupSuccess(false);
    if (validateForm()) {
      try {
        // Import API config for dynamic base URL
        const { getApiBaseUrl } = await import('../utils/apiConfig');
        const apiBaseUrl = getApiBaseUrl();
        
        const res = await fetch(`${apiBaseUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: formData.fullName,
            email: formData.email,
            password: formData.password
          })
        });
        const data = await res.json();
        if (res.ok) {
          setSignupSuccess(true);
          setTimeout(() => navigate('/login'), 1500);
        } else {
          setSignupError(data.error || 'Registration failed.');
        }
      } catch (err) {
        setSignupError('Network error. Please try again.');
      }
    }
  };

  return (
    <Box 
      minHeight="100vh" 
      sx={{ 
        background: 'linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%)',
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        overflowX: 'hidden'
      }}
    >
      {/* Navigation Header */}
      <Box sx={{ bgcolor: "#fff", borderBottom: '1px solid #bbf7d0', position: 'sticky', top: 0, zIndex: 50 }}>
        <Box maxWidth="lg" mx="auto" px={2} height={64} display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1} onClick={() => navigate('/')} sx={{ cursor: "pointer" }}>
            <Leaf size={32} color="#16a34a" />
            <Typography fontWeight="bold" variant="h5" color="#166534">PlantCare AI</Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/login')}
              sx={{ borderColor: "#bbf7d0", color: "#15803d", minHeight: 44, px: 2, "&:hover": { background: "#f0fdf4" } }}
            >
              Login
            </Button>
            <Button 
              onClick={() => navigate('/about')}
              sx={{ background: "#16a34a", color: "white", minHeight: 44, px: 2, "&:hover": { background: "#15803d" } }}
            >
              About
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Signup Form */}
      <Box py={{ xs: 6, md: 8 }} px={{ xs: 2, sm: 3 }} maxWidth="sm" mx="auto">
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" fontWeight="bold" color="#171717" gutterBottom fontSize={{ xs: '1.75rem', sm: '2rem', md: '2.25rem' }}>
            Join{" "}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(90deg, #16a34a, #059669)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}
            >PlantCare AI
            </Box>
          </Typography>
          <Typography color="text.secondary" fontSize={{ xs: '0.95rem', sm: '1rem' }}>
            Create your account to start optimizing your farming operations
          </Typography>
        </Box>

        <Card elevation={4} sx={{ bgcolor: "#fff", borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {signupError && (
              <Box mb={2}><Typography color="error">{signupError}</Typography></Box>
            )}
            {signupSuccess && (
              <Box mb={2}><Typography color="success.main">Registration successful! Redirecting to login...</Typography></Box>
            )}
            <form onSubmit={handleSubmit}>
              <Box mb={3}>
                <TextField
                  fullWidth
                  name="fullName"
                  label="Full Name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <User size={20} color="#6b7280" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#16a34a',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#16a34a',
                    },
                  }}
                />
              </Box>

              <Box mb={3}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={20} color="#6b7280" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#16a34a',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#16a34a',
                    },
                  }}
                />
              </Box>

              <Box mb={3}>
                <TextField
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={20} color="#6b7280" />
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#16a34a',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#16a34a',
                    },
                  }}
                />
              </Box>

              <Box mb={4}>
                <TextField
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={20} color="#6b7280" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#16a34a',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#16a34a',
                    },
                  }}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                size="large"
                sx={{
                  background: "#16a34a",
                  color: "white",
                  py: { xs: 1.5, sm: 1.75 },
                  px: { xs: 3, sm: 4 },
                  minHeight: 48,
                  fontSize: { xs: '1rem', sm: '1.0625rem' },
                  fontWeight: 600,
                  borderRadius: 2,
                  "&:hover": { background: "#15803d" },
                  mb: 3
                }}
              >
                Create Account
              </Button>

              <Box textAlign="center">
                <Typography color="text.secondary">
                  Already have an account?{' '}
                  <Button
                    variant="text"
                    onClick={() => navigate('/login')}
                    sx={{ color: '#16a34a', fontWeight: 600, textTransform: 'none', minHeight: 44 }}
                  >
                    Sign In
                  </Button>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
