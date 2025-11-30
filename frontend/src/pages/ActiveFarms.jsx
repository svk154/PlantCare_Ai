import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Grid, 
  IconButton, 
  Avatar,
  Container,
  Alert,
  Snackbar,
  Chip,
  Stack
} from '@mui/material';
import { 
  Sprout, 
  Plus, 
  Trash2, 
  CheckCircle, 
  MapPin,
  Wheat,
  FileText,
  Edit,
  TreePine,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import FarmNotes from '../components/FarmNotes';
import FarmNotesGuide from '../components/FarmNotesGuide';
import { useNavigate } from 'react-router-dom';

// Add Farm Form Component
const AddFarmForm = ({ onAddFarm, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    mainCrop: '',
    sizeAcres: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Farm name is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.mainCrop.trim()) {
      newErrors.mainCrop = 'Main crop is required';
    }
    if (!formData.sizeAcres || isNaN(formData.sizeAcres) || parseFloat(formData.sizeAcres) <= 0) {
      newErrors.sizeAcres = 'Valid size in acres is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onAddFarm({
        ...formData,
        sizeAcres: parseFloat(formData.sizeAcres)
      });
      
      // Reset form
      setFormData({
        name: '',
        location: '',
        mainCrop: '',
        sizeAcres: ''
      });
    }
  };

  return (
    <Card 
      elevation={3} 
      sx={{ 
        borderRadius: 3,
        bgcolor: 'white',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          background: 'linear-gradient(90deg, #16a34a, #059669)',
          zIndex: 1,
        }
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <Avatar 
            sx={{ 
              bgcolor: '#16a34a20', 
              color: '#16a34a',
              width: 40,
              height: 40,
              mr: 2
            }}
          >
            <Plus size={20} />
          </Avatar>
          <Typography variant="h5" fontWeight="bold" color="#171717">
            Add New Farm
          </Typography>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3} alignItems="flex-start">
            {/* Form Fields Row */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Farm Name"
                placeholder="e.g., Green Valley Farm"
                value={formData.name}
                onChange={handleInputChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                      '& fieldset': {
                        borderColor: '#16a34a',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                      '& fieldset': {
                        borderColor: '#16a34a',
                        borderWidth: 2,
                      },
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#16a34a',
                    fontWeight: 600,
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Location"
                placeholder="e.g., Punjab, India"
                value={formData.location}
                onChange={handleInputChange('location')}
                error={!!errors.location}
                helperText={errors.location}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                      '& fieldset': {
                        borderColor: '#16a34a',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                      '& fieldset': {
                        borderColor: '#16a34a',
                        borderWidth: 2,
                      },
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#16a34a',
                    fontWeight: 600,
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Main Crop"
                placeholder="e.g., Wheat"
                value={formData.mainCrop}
                onChange={handleInputChange('mainCrop')}
                error={!!errors.mainCrop}
                helperText={errors.mainCrop}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                      '& fieldset': {
                        borderColor: '#16a34a',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                      '& fieldset': {
                        borderColor: '#16a34a',
                        borderWidth: 2,
                      },
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#16a34a',
                    fontWeight: 600,
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Size (Acres)"
                type="number"
                placeholder="e.g., 50"
                value={formData.sizeAcres}
                onChange={handleInputChange('sizeAcres')}
                error={!!errors.sizeAcres}
                helperText={errors.sizeAcres}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                      '& fieldset': {
                        borderColor: '#16a34a',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                      '& fieldset': {
                        borderColor: '#16a34a',
                        borderWidth: 2,
                      },
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#16a34a',
                    fontWeight: 600,
                  },
                }}
              />
            </Grid>
            
            {/* Submit Button */}
            <Grid item xs={12} md={2}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={<Plus size={18} />}
                fullWidth
                sx={{
                  bgcolor: '#16a34a',
                  color: 'white',
                  fontWeight: 600,
                  py: 2,
                  px: 3,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '16px',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                  transition: 'all 0.2s ease',
                  height: '56px', // Match TextField height
                  '&:hover': {
                    bgcolor: '#15803d',
                    boxShadow: '0 6px 20px rgba(22, 163, 74, 0.35)',
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0px)',
                  },
                  '&:disabled': {
                    bgcolor: '#9ca3af',
                    transform: 'none',
                    boxShadow: 'none',
                  },
                }}
              >
                {loading ? 'Adding...' : 'Add Farm'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

// Edit Farm Form Component
const EditFarmForm = ({ farm, onEditFarm, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: farm?.name || '',
    location: farm?.location || '',
    mainCrop: farm?.mainCrop || '',
    sizeAcres: farm?.sizeAcres || ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Farm name is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.mainCrop.trim()) {
      newErrors.mainCrop = 'Main crop is required';
    }
    if (!formData.sizeAcres || isNaN(formData.sizeAcres) || parseFloat(formData.sizeAcres) <= 0) {
      newErrors.sizeAcres = 'Valid size in acres is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onEditFarm(farm.id, {
        ...formData,
        sizeAcres: parseFloat(formData.sizeAcres)
      });
    }
  };

  return (
    <Card 
      elevation={3} 
      sx={{ 
        borderRadius: 3,
        bgcolor: 'white',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          background: 'linear-gradient(90deg, #f59e0b, #d97706)',
          zIndex: 1,
        }
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <Avatar 
            sx={{ 
              bgcolor: '#f59e0b20', 
              color: '#f59e0b',
              width: 40,
              height: 40,
              mr: 2
            }}
          >
            <Edit size={20} />
          </Avatar>
          <Typography variant="h5" fontWeight="bold" color="#171717">
            Edit Farm
          </Typography>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3} alignItems="flex-start">
            {/* Form Fields Row */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Farm Name"
                placeholder="e.g., Green Valley Farm"
                value={formData.name}
                onChange={handleInputChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                      '& fieldset': {
                        borderColor: '#f59e0b',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                      '& fieldset': {
                        borderColor: '#f59e0b',
                        borderWidth: 2,
                      },
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#f59e0b',
                    fontWeight: 600,
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Location"
                placeholder="e.g., Punjab, India"
                value={formData.location}
                onChange={handleInputChange('location')}
                error={!!errors.location}
                helperText={errors.location}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                      '& fieldset': {
                        borderColor: '#f59e0b',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                      '& fieldset': {
                        borderColor: '#f59e0b',
                        borderWidth: 2,
                      },
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#f59e0b',
                    fontWeight: 600,
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Main Crop"
                placeholder="e.g., Wheat"
                value={formData.mainCrop}
                onChange={handleInputChange('mainCrop')}
                error={!!errors.mainCrop}
                helperText={errors.mainCrop}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                      '& fieldset': {
                        borderColor: '#f59e0b',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                      '& fieldset': {
                        borderColor: '#f59e0b',
                        borderWidth: 2,
                      },
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#f59e0b',
                    fontWeight: 600,
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Size (Acres)"
                type="number"
                placeholder="e.g., 50"
                value={formData.sizeAcres}
                onChange={handleInputChange('sizeAcres')}
                error={!!errors.sizeAcres}
                helperText={errors.sizeAcres}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                      '& fieldset': {
                        borderColor: '#f59e0b',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                      '& fieldset': {
                        borderColor: '#f59e0b',
                        borderWidth: 2,
                      },
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#f59e0b',
                    fontWeight: 600,
                  },
                }}
              />
            </Grid>
            
            {/* Action Buttons */}
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', gap: 1, height: '56px' }}>
                <Button
                  type="button"
                  onClick={onCancel}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '14px',
                    px: 2,
                    borderColor: '#d1d5db',
                    color: '#374151',
                    transition: 'all 0.2s ease',
                    flex: 1,
                    '&:hover': {
                      borderColor: '#9ca3af',
                      backgroundColor: 'rgba(156, 163, 175, 0.08)',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0px)',
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    bgcolor: '#f59e0b',
                    color: 'white',
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
                    transition: 'all 0.2s ease',
                    flex: 1,
                    '&:hover': {
                      bgcolor: '#d97706',
                      boxShadow: '0 6px 20px rgba(245, 158, 11, 0.35)',
                      transform: 'translateY(-2px)',
                    },
                    '&:active': {
                      transform: 'translateY(0px)',
                    },
                    '&:disabled': {
                      bgcolor: '#9ca3af',
                      transform: 'none',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {loading ? 'Updating...' : 'Update'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

// Farm Card Component
const FarmCard = ({ farm, isActive, onSetActive, onDelete, onViewNotes, onEdit, loading }) => {
  const [farmNotes, setFarmNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);

  // Fetch farm notes when component mounts
  useEffect(() => {
    const fetchFarmNotes = async () => {
      try {
        setNotesLoading(true);
        const { createApiRequest } = await import('../utils/apiConfig');
        const response = await createApiRequest(`farms/${farm.id}/notes`);
        
        if (response.ok) {
          const data = await response.json();
          setFarmNotes(data.notes || []);
        }
      } catch (error) {
        
      } finally {
        setNotesLoading(false);
      }
    };

    if (farm?.id) {
      fetchFarmNotes();
    }
  }, [farm?.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        elevation={2}
        sx={{ 
          borderRadius: 3,
          bgcolor: 'white',
          position: 'relative',
          overflow: 'hidden',
          border: isActive ? '2px solid #16a34a' : '1px solid #e5e7eb',
          transition: 'all 0.3s ease',
          height: '480px', // Fixed height instead of minHeight
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            transform: 'translateY(-4px)',
            elevation: 3,
            boxShadow: isActive 
              ? '0 12px 35px rgba(22, 163, 74, 0.2)' 
              : '0 12px 35px rgba(0, 0, 0, 0.15)',
          },
          ...(isActive && {
            boxShadow: '0 8px 25px rgba(22, 163, 74, 0.15)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: 'linear-gradient(90deg, #16a34a, #059669)',
              zIndex: 1,
            }
          })
        }}
      >
        <CardContent sx={{ 
          p: 4, 
          flex: '1 1 auto', 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
            <Typography variant="h6" fontWeight="bold" color="#171717" sx={{ fontSize: '18px' }}>
              {farm.name}
            </Typography>
            <Box display="flex" alignItems="center">
              <IconButton 
                onClick={() => onEdit(farm)}
                disabled={loading}
                title="Edit Farm"
                aria-label="Edit farm"
                sx={{ 
                  color: '#f59e0b',
                  bgcolor: 'rgba(245, 158, 11, 0.08)',
                  mr: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    color: '#d97706',
                    bgcolor: 'rgba(245, 158, 11, 0.15)',
                    transform: 'scale(1.1)',
                  },
                  '&:disabled': {
                    color: '#9ca3af',
                    bgcolor: 'rgba(156, 163, 175, 0.08)',
                  }
                }}
                size="small"
              >
                <Edit size={16} />
              </IconButton>
              <IconButton 
                onClick={() => onDelete(farm.id)}
                disabled={loading}
                title="Delete Farm"
                aria-label="Delete farm"
                sx={{ 
                  color: '#ef4444',
                  bgcolor: 'rgba(239, 68, 68, 0.08)',
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    color: '#dc2626',
                    bgcolor: 'rgba(239, 68, 68, 0.15)',
                    transform: 'scale(1.1)',
                  },
                  '&:disabled': {
                    color: '#9ca3af',
                    bgcolor: 'rgba(156, 163, 175, 0.08)',
                  }
                }}
                size="small"
              >
                <Trash2 size={16} />
              </IconButton>
            </Box>
          </Box>
          
          {/* Farm Notes Section */}
          <Box mb={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
              <Typography variant="subtitle2" fontWeight="600" color="#374151" sx={{ fontSize: '14px' }}>
                <FileText size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Farm Notes
              </Typography>
              {farmNotes.length > 0 && (
                <Button
                  size="small"
                  variant="text"
                  onClick={() => onViewNotes(farm.id, farm.name)}
                  sx={{ 
                    fontSize: '11px', 
                    textTransform: 'none',
                    color: '#3b82f6',
                    minWidth: 'auto',
                    p: 0.5
                  }}
                >
                  View All ({farmNotes.length})
                </Button>
              )}
            </Box>
            <Box 
              sx={{ 
                bgcolor: '#f8fafc',
                borderRadius: 2,
                p: 2,
                border: '1px solid #e2e8f0',
                height: '120px', // Fixed height instead of min/max
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {notesLoading ? (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                  flexDirection: 'column',
                  gap: 1
                }}>
                  <Typography variant="body2" color="#9ca3af" sx={{ fontSize: '12px', textAlign: 'center' }}>
                    Loading notes...
                  </Typography>
                </Box>
              ) : farmNotes.length > 0 ? (
                <Stack spacing={1} sx={{ height: '100%' }}>
                  {farmNotes.slice(0, 3).map((note, index) => (
                    <Box key={index} sx={{ 
                      bgcolor: 'white', 
                      p: 1.5, 
                      borderRadius: 1.5,
                      border: '1px solid #e2e8f0',
                      flex: '0 0 auto'
                    }}>
                      <Typography variant="body2" color="#4b5563" sx={{ fontSize: '13px', lineHeight: 1.4 }}>
                        {note.content || note.text || note}
                      </Typography>
                      {note.createdAt && (
                        <Typography variant="caption" color="#9ca3af" sx={{ fontSize: '11px' }}>
                          {new Date(note.createdAt).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  ))}
                  {farmNotes.length > 3 && (
                    <Typography variant="caption" color="#6b7280" sx={{ textAlign: 'center', fontStyle: 'italic', mt: 'auto' }}>
                      +{farmNotes.length - 3} more notes
                    </Typography>
                  )}
                </Stack>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                  flexDirection: 'column',
                  gap: 1
                }}>
                  <FileText size={20} color="#9ca3af" />
                  <Typography variant="body2" color="#9ca3af" sx={{ fontSize: '12px', textAlign: 'center' }}>
                    No notes yet. Click below to add farm observations.
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => onViewNotes(farm.id, farm.name)}
                    sx={{ 
                      fontSize: '11px', 
                      textTransform: 'none',
                      color: '#3b82f6',
                      minWidth: 'auto',
                      p: 0.5
                    }}
                  >
                    Add Note
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
          
          <Box 
            display="flex" 
            alignItems="center" 
            mb={3} 
            sx={{ 
              color: '#6b7280',
              bgcolor: '#f8fafc',
              px: 2,
              py: 1.5,
              borderRadius: 2,
              border: '1px solid #f1f5f9'
            }}
          >
            <MapPin size={16} />
            <Typography ml={1} fontSize={14} fontWeight="500">
              {farm.location}
            </Typography>
          </Box>
          
          <Stack spacing={2}>
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center"
              sx={{
                bgcolor: '#f0fdf4',
                px: 3,
                py: 2,
                borderRadius: 2,
                border: '1px solid #bbf7d0'
              }}
            >
              <Box display="flex" alignItems="center">
                <Wheat size={18} color="#16a34a" />
                <Typography ml={1} fontSize={14} fontWeight="medium" color="#6b7280">
                  Main Crop
                </Typography>
              </Box>
              <Typography fontSize={15} fontWeight="700" color="#16a34a">
                {farm.mainCrop}
              </Typography>
            </Box>
            
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center"
              sx={{
                bgcolor: '#fef3c7',
                px: 3,
                py: 2,
                borderRadius: 2,
                border: '1px solid #fde68a'
              }}
            >
              <Box display="flex" alignItems="center">
                <TreePine size={18} color="#f59e0b" />
                <Typography ml={1} fontSize={14} fontWeight="medium" color="#6b7280">
                  Farm Size
                </Typography>
              </Box>
              <Typography fontSize={15} fontWeight="700" color="#f59e0b">
                {farm.sizeAcres} acres
              </Typography>
            </Box>
          </Stack>
          
          {/* Spacer to push button to bottom */}
          <Box sx={{ flexGrow: 1 }} />
          
          <Box mt={3}>
            {isActive ? (
              <Button
                onClick={() => onSetActive(farm.id)}
                disabled={loading}
                variant="contained"
                fullWidth
                startIcon={<CheckCircle size={16} />}
                sx={{
                  py: 2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '15px',
                  bgcolor: '#16a34a',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#dc2626',
                    boxShadow: '0 6px 20px rgba(220, 38, 38, 0.35)',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    bgcolor: '#9ca3af',
                    transform: 'none',
                  }
                }}
              >
                Deactivate Farm
              </Button>
            ) : (
              <Button
                onClick={() => onSetActive(farm.id)}
                disabled={loading}
                variant="outlined"
                fullWidth
                startIcon={<Activity size={16} />}
                sx={{
                  py: 2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '15px',
                  borderColor: '#d1d5db',
                  color: '#374151',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#16a34a',
                    backgroundColor: 'rgba(22, 163, 74, 0.08)',
                    color: '#16a34a',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)',
                  },
                  '&:disabled': {
                    borderColor: '#d1d5db',
                    color: '#9ca3af',
                    transform: 'none',
                  }
                }}
              >
                Activate Farm
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main ActiveFarms Component
export default function ActiveFarms() {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [notesDialog, setNotesDialog] = useState({ open: false, farmId: null, farmName: '' });
  const [showNotesGuide, setShowNotesGuide] = useState(
    localStorage.getItem('farmNotesGuideShown') !== 'true'
  );
  const [editingFarm, setEditingFarm] = useState(null);

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchFarms = async () => {
      try {
        setLoading(true);
        const { createApiRequest } = await import('../utils/apiConfig');

        const response = await createApiRequest('farms/', {
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setFarms(data.farms || []);
        } else {
          throw new Error('Failed to fetch farms');
        }
      } catch (error) {
        
        showSnackbar('Failed to load farms', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFarms();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddFarm = async (farmData) => {
    try {
      setLoading(true);
      // Token is handled by createApiRequest
      
      // Import API config for dynamic base URL
      const { createApiRequest } = await import('../utils/apiConfig');
      
      const response = await createApiRequest('farms/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(farmData)
      });

      if (response.ok) {
        const data = await response.json();
        setFarms(prev => [data.farm, ...prev]);
        showSnackbar('Farm added successfully!', 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add farm');
      }
    } catch (error) {
      
      showSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFarm = async (farmId) => {
    if (!window.confirm('Are you sure you want to delete this farm?')) {
      return;
    }

    try {
      setLoading(true);
      // Token handling is done by createApiRequest
      // Use createApiRequest to handle API base URL dynamically
      const { createApiRequest } = await import('../utils/apiConfig');
      const response = await createApiRequest(`farms/${farmId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setFarms(prev => prev.filter(farm => farm.id !== farmId));
        showSnackbar('Farm deleted successfully!', 'success');
      } else {
        throw new Error('Failed to delete farm');
      }
    } catch (error) {
      
      showSnackbar('Failed to delete farm', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditFarm = async (farmId, farmData) => {
    try {
      setLoading(true);
      const { createApiRequest } = await import('../utils/apiConfig');
      
      const response = await createApiRequest(`farms/${farmId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(farmData)
      });

      if (response.ok) {
        const data = await response.json();
        setFarms(prev => prev.map(farm => 
          farm.id === farmId ? data.farm : farm
        ));
        setEditingFarm(null);
        showSnackbar('Farm updated successfully!', 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update farm');
      }
    } catch (error) {
      
      showSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSetActiveFarm = async (farmId) => {
    try {
      setLoading(true);
      // Use createApiRequest to handle API base URL and token dynamically
      const { createApiRequest } = await import('../utils/apiConfig');
      const response = await createApiRequest(`farms/${farmId}/set-active`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update farms list to toggle active status for the selected farm
        // Allow multiple farms to be active simultaneously
        setFarms(prev => prev.map(farm => 
          farm.id === farmId 
            ? { ...farm, isActive: !farm.isActive }
            : farm
        ));
        const targetFarm = farms.find(farm => farm.id === farmId);
        const newStatus = !targetFarm?.isActive;
        showSnackbar(
          newStatus ? 'Farm activated successfully!' : 'Farm deactivated successfully!', 
          'success'
        );
      } else {
        throw new Error('Failed to update farm status');
      }
    } catch (error) {
      
      showSnackbar('Failed to set active farm', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  const handleOpenNotes = (farmId, farmName) => {
    setNotesDialog({
      open: true,
      farmId,
      farmName
    });
  };
  
  const handleCloseNotes = () => {
    setNotesDialog({
      ...notesDialog,
      open: false
    });
  };

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
              bgcolor: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
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
                  <Sprout size={28} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={800} color="#171717" mb={0.5}>
                    My Active Farms
                  </Typography>
                  <Typography color="#6b7280" fontSize={16} fontWeight={500}>
                    Manage your farm profiles and set your active farm for crop tracking
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={3} mt={3}>
                <Chip 
                  icon={<Activity size={16} />}
                  label={`${farms.length} Total Farms`}
                  variant="filled"
                  sx={{ 
                    bgcolor: '#dbeafe', 
                    color: '#1e40af',
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: '#1e40af' }
                  }}
                />
                <Chip 
                  icon={<CheckCircle size={16} />}
                  label={`${farms.filter(f => f.isActive).length} Active`}
                  variant="filled"
                  sx={{ 
                    bgcolor: '#dcfce7', 
                    color: '#15803d',
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: '#15803d' }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Form Section */}
        <Box mb={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {editingFarm ? (
              <EditFarmForm 
                farm={editingFarm} 
                onEditFarm={handleEditFarm} 
                onCancel={() => setEditingFarm(null)}
                loading={loading} 
              />
            ) : (
              <AddFarmForm onAddFarm={handleAddFarm} loading={loading} />
            )}
          </motion.div>
        </Box>

        {/* Farms Grid Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
              {farms.length > 0 ? (
                <>
                  {showNotesGuide && farms.length > 0 && (
                    <FarmNotesGuide onClose={() => setShowNotesGuide(false)} />
                  )}
                  <Box sx={{ 
                    maxHeight: '70vh', 
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': { 
                      width: '8px' 
                    },
                    '&::-webkit-scrollbar-track': { 
                      background: '#f1f1f1',
                      borderRadius: '4px' 
                    },
                    '&::-webkit-scrollbar-thumb': { 
                      background: '#16a34a',
                      borderRadius: '4px' 
                    },
                    '&::-webkit-scrollbar-thumb:hover': { 
                      background: '#15803d' 
                    }
                  }}>
                    <Grid container spacing={4}>
                      {farms.map((farm) => (
                        <Grid item xs={12} lg={6} xl={4} key={farm.id}>
                          <FarmCard
                            farm={farm}
                            isActive={farm.isActive}
                            onSetActive={handleSetActiveFarm}
                            onDelete={handleDeleteFarm}
                            onViewNotes={handleOpenNotes}
                            onEdit={(farm) => setEditingFarm(farm)}
                            loading={loading}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </>
              ) : (
                <Card 
                  elevation={2}
                  sx={{ 
                    borderRadius: 3,
                    border: '2px dashed #d1d5db',
                    bgcolor: 'linear-gradient(135deg, #fafbff 0%, #f1f5f9 100%)',
                    background: 'linear-gradient(135deg, #fafbff 0%, #f1f5f9 100%)',
                    minHeight: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '200px',
                      height: '200px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(22,163,74,0.05) 0%, transparent 70%)',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 0,
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 8, position: 'relative', zIndex: 1 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: '#16a34a10',
                        color: '#16a34a',
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 3,
                        border: '3px solid #dcfce7'
                      }}
                    >
                      <Sprout size={36} />
                    </Avatar>
                    <Typography variant="h5" fontWeight={700} color="#374151" mb={2}>
                      Start Your Farm Journey
                    </Typography>
                    <Typography color="#6b7280" fontSize={16} mb={3} maxWidth="400px" mx="auto">
                      Create your first farm profile to begin tracking crops, monitoring health, and managing your agricultural operations.
                    </Typography>
                    <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
                      <Chip 
                        icon={<Plus size={16} />}
                        label="Add Farm"
                        variant="filled"
                        sx={{ 
                          bgcolor: '#16a34a', 
                          color: 'white',
                          fontWeight: 600,
                          px: 2,
                          '& .MuiChip-icon': { color: 'white' }
                        }}
                      />
                      <Chip 
                        icon={<Activity size={16} />}
                        label="Track Progress"
                        variant="outlined"
                        sx={{ 
                          borderColor: '#16a34a', 
                          color: '#16a34a',
                          fontWeight: 600,
                          '& .MuiChip-icon': { color: '#16a34a' }
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%', borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        
        {/* Farm Notes Dialog */}
        <FarmNotes 
          farmId={notesDialog.farmId}
          farmName={notesDialog.farmName}
          open={notesDialog.open}
          onClose={handleCloseNotes}
        />
      </Container>
    </Layout>
  );
}
