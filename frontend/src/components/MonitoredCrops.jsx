import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Grid,
  InputAdornment,
  Avatar,
  Checkbox,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Add, 
  Delete, 
  Agriculture, 
  Edit, 
  Search,
  CheckCircle,
  Warning,
  CalendarToday,
  LocalFlorist,
  Sort,
  ViewCompact,
  ViewModule,
  DeleteSweep
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';

// Styled components matching dashboard theme with consistent design system
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '10px 20px',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-1px)',
  },
}));

const AddCropModal = ({ open, onClose, onAddCrop, farms }) => {
  const [formData, setFormData] = useState({
    name: '',
    farmName: farms.length > 0 ? farms[0]?.name || '' : '',
    plantingDate: new Date().toISOString().split('T')[0],
    status: 'Healthy',
    variety: '',
    expectedHarvestDate: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Crop name is required';
    if (!formData.farmName) newErrors.farmName = 'Farm selection is required';
    if (!formData.plantingDate) newErrors.plantingDate = 'Planting date is required';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onAddCrop(formData);
      onClose();
      // Reset form
      setFormData({
        name: '',
        farmName: farms.length > 0 ? farms[0]?.name || '' : '',
        plantingDate: new Date().toISOString().split('T')[0],
        status: 'Healthy',
        variety: '',
        expectedHarvestDate: '',
        notes: ''
      });
      setErrors({});
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Agriculture color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Add New Monitored Crop
          </Typography>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Crop Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Wheat (HD-3086)"
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
              required
            />
            
            <FormControl fullWidth required error={!!errors.farmName}>
              <InputLabel>Farm</InputLabel>
              <Select
                value={formData.farmName}
                onChange={(e) => handleChange('farmName', e.target.value)}
                label="Farm"
              >
                {farms.length > 0 ? (
                  farms.map(farm => (
                    <MenuItem key={farm.id} value={farm.name}>
                      {farm.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Please add a farm first</MenuItem>
                )}
              </Select>
              {errors.farmName && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.farmName}
                </Typography>
              )}
            </FormControl>
            
            <TextField
              label="Variety"
              value={formData.variety}
              onChange={(e) => handleChange('variety', e.target.value)}
              placeholder="e.g. HD-3086"
              fullWidth
            />
            
            <TextField
              label="Planting Date"
              type="date"
              value={formData.plantingDate}
              onChange={(e) => handleChange('plantingDate', e.target.value)}
              error={!!errors.plantingDate}
              helperText={errors.plantingDate}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            
            <TextField
              label="Expected Harvest Date"
              type="date"
              value={formData.expectedHarvestDate}
              onChange={(e) => handleChange('expectedHarvestDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            
            <FormControl fullWidth>
              <InputLabel>Initial Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                label="Initial Status"
              >
                <MenuItem value="Healthy">Healthy</MenuItem>
                <MenuItem value="Needs Attention">Needs Attention</MenuItem>
                <MenuItem value="Harvested">Harvested</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes about this crop..."
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <StyledButton type="submit" variant="contained" color="primary">
            Add Crop
          </StyledButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const EditCropModal = ({ open, onClose, onEditCrop, crop, farms }) => {
  const [formData, setFormData] = useState({
    name: '',
    farmName: '',
    plantingDate: '',
    status: 'Healthy',
    variety: '',
    expectedHarvestDate: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  // Update form data when crop changes
  useEffect(() => {
    if (crop) {
      setFormData({
        name: crop.name || '',
        farmName: crop.farmName || '',
        plantingDate: crop.plantingDate ? crop.plantingDate.split('T')[0] : '',
        status: crop.status || 'Healthy',
        variety: crop.variety || '',
        expectedHarvestDate: crop.expectedHarvestDate ? crop.expectedHarvestDate.split('T')[0] : '',
        notes: crop.notes || ''
      });
      setErrors({});
    }
  }, [crop]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Crop name is required';
    if (!formData.farmName) newErrors.farmName = 'Farm selection is required';
    if (!formData.plantingDate) newErrors.plantingDate = 'Planting date is required';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onEditCrop(crop.id, formData);
      onClose();
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Edit color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Edit Monitored Crop
          </Typography>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Crop Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Wheat (HD-3086)"
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
              required
            />
            
            <FormControl fullWidth required error={!!errors.farmName}>
              <InputLabel>Farm</InputLabel>
              <Select
                value={formData.farmName}
                onChange={(e) => handleChange('farmName', e.target.value)}
                label="Farm"
              >
                {farms.length > 0 ? (
                  farms.map(farm => (
                    <MenuItem key={farm.id} value={farm.name}>
                      {farm.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Please add a farm first</MenuItem>
                )}
              </Select>
              {errors.farmName && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.farmName}
                </Typography>
              )}
            </FormControl>
            
            <TextField
              label="Variety"
              value={formData.variety}
              onChange={(e) => handleChange('variety', e.target.value)}
              placeholder="e.g. HD-3086"
              fullWidth
            />
            
            <TextField
              label="Planting Date"
              type="date"
              value={formData.plantingDate}
              onChange={(e) => handleChange('plantingDate', e.target.value)}
              error={!!errors.plantingDate}
              helperText={errors.plantingDate}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            
            <TextField
              label="Expected Harvest Date"
              type="date"
              value={formData.expectedHarvestDate}
              onChange={(e) => handleChange('expectedHarvestDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="Healthy">Healthy</MenuItem>
                <MenuItem value="Needs Attention">Needs Attention</MenuItem>
                <MenuItem value="Harvested">Harvested</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes about this crop..."
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <StyledButton type="submit" variant="contained" color="primary">
            Update Crop
          </StyledButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Healthy':
      return { color: 'success', bg: '#dcfce7', textColor: '#15803d' };
    case 'Needs Attention':
      return { color: 'warning', bg: '#fef3c7', textColor: '#d97706' };
    case 'Harvested':
      return { color: 'info', bg: '#dbeafe', textColor: '#1e40af' };
    default:
      return { color: 'default', bg: '#f3f4f6', textColor: '#6b7280' };
  }
};

// Enhanced Crop Card Component
const CropCard = ({ crop, onEdit, onDelete, isSelected, onToggleSelect, compactMode }) => {
  const statusStyle = getStatusColor(crop.status);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <StyledCard sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        border: isSelected ? '2px solid #16a34a' : '1px solid #e5e7eb',
        bgcolor: isSelected ? 'rgba(22, 163, 74, 0.02)' : 'white',
      }}>
        <CardContent sx={{ flexGrow: 1, p: compactMode ? 2 : 3 }}>
          {/* Header with Checkbox */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={compactMode ? 1 : 2}>
            <Box display="flex" alignItems="flex-start" gap={1} flex={1}>
              <Checkbox
                checked={isSelected}
                onChange={() => onToggleSelect(crop.id)}
                size="small"
                sx={{
                  color: '#d1d5db',
                  p: 0,
                  mt: 0.25,
                  '&.Mui-checked': {
                    color: '#16a34a',
                  },
                }}
              />
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                color="#171717" 
                sx={{ fontSize: compactMode ? '16px' : '18px' }}
              >
                {crop.name}
              </Typography>
            </Box>
            <Chip
              label={crop.status}
              size="small"
              sx={{
                bgcolor: statusStyle.bg,
                color: statusStyle.textColor,
                fontWeight: 600,
                fontSize: compactMode ? '10px' : '12px'
              }}
            />
          </Box>

          {/* Farm Info */}
          <Box display="flex" alignItems="center" mb={compactMode ? 1 : 2}>
            <Agriculture size={compactMode ? 14 : 16} color="#6b7280" />
            <Typography ml={1} color="#6b7280" fontSize={compactMode ? 12 : 14} fontWeight={500}>
              {crop.farmName}
            </Typography>
          </Box>

          {/* Details Grid */}
          {!compactMode ? (
            <>
              <Grid container spacing={2} mb={2}>
                <Grid item xs={6}>
                  <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" color="#6b7280" fontWeight={600}>
                      Variety
                    </Typography>
                    <Typography variant="body2" fontWeight={500} color="#374151">
                      {crop.variety || 'Not specified'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ bgcolor: '#f0fdf4', p: 1.5, borderRadius: 2, border: '1px solid #bbf7d0' }}>
                    <Typography variant="caption" color="#16a34a" fontWeight={600}>
                      <CalendarToday sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                      Planted
                    </Typography>
                    <Typography variant="body2" fontWeight={500} color="#15803d">
                      {new Date(crop.plantingDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Expected Harvest */}
              {crop.expectedHarvestDate && (
                <Box sx={{ bgcolor: '#fef3c7', p: 2, borderRadius: 2, border: '1px solid #fde68a', mb: 2 }}>
                  <Typography variant="caption" color="#d97706" fontWeight={600}>
                    Expected Harvest
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="#92400e">
                    {new Date(crop.expectedHarvestDate).toLocaleDateString()}
                  </Typography>
                </Box>
              )}

              {/* Notes */}
              {crop.notes && (
                <Box>
                  <Typography variant="caption" color="#6b7280" fontWeight={600} mb={1} display="block">
                    Notes
                  </Typography>
                  <Typography variant="body2" color="#374151" sx={{ 
                    bgcolor: '#f8fafc', 
                    p: 1.5, 
                    borderRadius: 1.5,
                    border: '1px solid #e2e8f0',
                    fontSize: '13px',
                    lineHeight: 1.4
                  }}>
                    {crop.notes}
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            /* Compact Mode - Show key info only */
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="caption" color="#6b7280" fontWeight={600}>
                  Planted: {new Date(crop.plantingDate).toLocaleDateString()}
                </Typography>
                {crop.variety && (
                  <Typography variant="caption" color="#374151" fontWeight={500}>
                    {crop.variety}
                  </Typography>
                )}
              </Box>
              {crop.expectedHarvestDate && (
                <Typography variant="caption" color="#d97706" fontWeight={600}>
                  Harvest: {new Date(crop.expectedHarvestDate).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>

        {/* Actions */}
        <CardActions sx={{ p: compactMode ? 2 : 3, pt: 0, gap: 1 }}>
          {compactMode ? (
            /* Compact Actions */
            <Box display="flex" gap={1} width="100%">
              <IconButton
                onClick={() => onEdit(crop)}
                size="small"
                sx={{
                  color: '#f59e0b',
                  bgcolor: 'rgba(245, 158, 11, 0.08)',
                  flex: 1,
                  '&:hover': {
                    bgcolor: 'rgba(245, 158, 11, 0.15)',
                  },
                }}
              >
                <Edit size={16} />
              </IconButton>
              <IconButton
                onClick={() => onDelete(crop.id)}
                size="small"
                sx={{
                  color: '#ef4444',
                  bgcolor: 'rgba(239, 68, 68, 0.08)',
                  flex: 1,
                  '&:hover': {
                    bgcolor: 'rgba(239, 68, 68, 0.15)',
                  },
                }}
              >
                <Delete size={16} />
              </IconButton>
            </Box>
          ) : (
            /* Full Actions */
            <>
              <Button
                size="small"
                startIcon={<Edit size={16} />}
                onClick={() => onEdit(crop)}
                sx={{
                  color: '#f59e0b',
                  bgcolor: 'rgba(245, 158, 11, 0.08)',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  flex: 1,
                  '&:hover': {
                    bgcolor: 'rgba(245, 158, 11, 0.15)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Edit
              </Button>
              <Button
                size="small"
                startIcon={<Delete size={16} />}
                onClick={() => onDelete(crop.id)}
                sx={{
                  color: '#ef4444',
                  bgcolor: 'rgba(239, 68, 68, 0.08)',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  flex: 1,
                  '&:hover': {
                    bgcolor: 'rgba(239, 68, 68, 0.15)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Delete
              </Button>
            </>
          )}
        </CardActions>
      </StyledCard>
    </motion.div>
  );
};

const MonitoredCrops = () => {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCrops, setSelectedCrops] = useState([]);
  const [compactMode, setCompactMode] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [sortAnchorEl, setSortAnchorEl] = useState(null);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Filter crops based on search and status
  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (crop.variety && crop.variety.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || crop.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort filtered crops
  const sortedAndFilteredCrops = [...filteredCrops].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.plantingDate) - new Date(a.plantingDate);
      case 'oldest':
        return new Date(a.plantingDate) - new Date(b.plantingDate);
      case 'status':
        const statusOrder = { 'Needs Attention': 0, 'Healthy': 1, 'Harvested': 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      case 'farm':
        return a.farmName.localeCompare(b.farmName);
      default:
        return 0;
    }
  });

  // Calculate statistics
  const totalCrops = crops.length;
  const healthyCrops = crops.filter(crop => crop.status === 'Healthy').length;
  const needsAttention = crops.filter(crop => crop.status === 'Needs Attention').length;
  const harvestedCrops = crops.filter(crop => crop.status === 'Harvested').length;

  const fetchCrops = async () => {
    try {
      const { createApiRequest } = await import('../utils/apiConfig');
      const response = await createApiRequest('crops/crops');

      if (response.ok) {
        const data = await response.json();
        setCrops(data.crops || []);
      } else {
        
        showSnackbar('Failed to load crops', 'error');
      }
    } catch (error) {
      
      showSnackbar('Error loading crops', 'error');
    }
  };

  const handleAddCrop = async (cropData) => {
    try {
      const { createApiRequest } = await import('../utils/apiConfig');
      const response = await createApiRequest('crops/crops', {
        method: 'POST',
        body: JSON.stringify(cropData)
      });

      if (response.ok) {
        await fetchCrops(); // Refresh the list
        showSnackbar('Crop added successfully');
      } else {
        const errorData = await response.json();
        showSnackbar(errorData.error || 'Failed to add crop', 'error');
      }
    } catch (error) {
      
      showSnackbar('Error adding crop', 'error');
    }
  };

  const handleDeleteCrop = async (cropId) => {
    if (window.confirm('Are you sure you want to delete this crop?')) {
      try {
        const { createApiRequest } = await import('../utils/apiConfig');
        const response = await createApiRequest(`crops/crops/${cropId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await fetchCrops(); // Refresh the list
          showSnackbar('Crop deleted successfully');
        } else {
          const errorData = await response.json();
          showSnackbar(errorData.error || 'Failed to delete crop', 'error');
        }
      } catch (error) {
        
        showSnackbar('Error deleting crop', 'error');
      }
    }
  };

  const handleEditCrop = (crop) => {
    setEditingCrop(crop);
    setIsEditModalOpen(true);
  };

  const handleEditCropSubmit = async (cropId, cropData) => {
    try {
      const { createApiRequest } = await import('../utils/apiConfig');
      const response = await createApiRequest(`crops/crops/${cropId}`, {
        method: 'PUT',
        body: JSON.stringify(cropData)
      });

      if (response.ok) {
        await fetchCrops(); // Refresh the list
        showSnackbar('Crop updated successfully');
      } else {
        const errorData = await response.json();
        showSnackbar(errorData.error || 'Failed to update crop', 'error');
      }
    } catch (error) {
      
      showSnackbar('Error updating crop', 'error');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        // Fetch crops
        const { createApiRequest } = await import('../utils/apiConfig');
        const cropsResponse = await createApiRequest('crops/crops');

        if (cropsResponse.ok) {
          const cropsData = await cropsResponse.json();
          setCrops(cropsData.crops || []);
        } else {
          
          showSnackbar('Failed to load crops', 'error');
        }

        // Fetch farms
        const farmsResponse = await createApiRequest('farms/');

        if (farmsResponse.ok) {
          const farmsData = await farmsResponse.json();
          setFarms(farmsData.farms || []);
          
        } else {
          
          showSnackbar('Failed to load farms', 'error');
        }
      } catch (error) {
        
        showSnackbar('Error loading data', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <Box>
      {/* Summary Cards - Horizontal Layout */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 3, 
        mb: 4, 
        width: '100%', 
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <Box sx={{ width: { xs: '100%', md: '250px' } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <StyledCard 
              elevation={3}
              sx={{ 
                borderRadius: 3,
                bgcolor: '#f8fafc',
                position: 'relative',
                overflow: 'hidden',
                height: '116px',
                width: '100%',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  background: '#16a34a',
                  zIndex: 1,
                }
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                {/* Top row: Icon and Number */}
                <Box display="flex" justifyContent="space-between" alignItems="center" gap={1.5} mb={1}>
                  <Avatar sx={{ bgcolor: '#16a34a', width: 40, height: 40 }}>
                    <Agriculture />
                  </Avatar>
                  <Typography variant="h3" fontWeight={800} color="#16a34a">
                    {totalCrops}
                  </Typography>
                </Box>
                {/* Bottom row: Centered Name */}
                <Box textAlign="center">
                  <Typography variant="body1" color="#6b7280" fontWeight={600}>
                    Total Crops
                  </Typography>
                </Box>
              </CardContent>
            </StyledCard>
          </motion.div>
        </Box>
        
        <Box sx={{ width: { xs: '100%', md: '250px' } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <StyledCard 
              elevation={3}
              sx={{ 
                borderRadius: 3,
                bgcolor: '#f0fdf4',
                position: 'relative',
                overflow: 'hidden',
                height: '116px',
                maxWidth: '600px',
                mx: 'auto',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  background: '#15803d',
                  zIndex: 1,
                }
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                {/* Top row: Icon and Number */}
                <Box display="flex" justifyContent="space-between" alignItems="center" gap={1.5} mb={1}>
                  <Avatar sx={{ bgcolor: '#15803d', width: 40, height: 40 }}>
                    <CheckCircle />
                  </Avatar>
                  <Typography variant="h3" fontWeight={800} color="#15803d">
                    {healthyCrops}
                  </Typography>
                </Box>
                {/* Bottom row: Centered Name */}
                <Box textAlign="center">
                  <Typography variant="body1" color="#6b7280" fontWeight={600}>
                    Healthy Crops
                  </Typography>
                </Box>
              </CardContent>
            </StyledCard>
          </motion.div>
        </Box>
        
        <Box sx={{ width: { xs: '100%', md: '250px' } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <StyledCard 
              elevation={3}
              sx={{ 
                borderRadius: 3,
                bgcolor: '#fef3c7',
                position: 'relative',
                overflow: 'hidden',
                height: '116px',
                maxWidth: '600px',
                mx: 'auto',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  background: '#d97706',
                  zIndex: 1,
                }
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                {/* Top row: Icon and Number */}
                <Box display="flex" justifyContent="space-between" alignItems="center" gap={1.5} mb={1}>
                  <Avatar sx={{ bgcolor: '#d97706', width: 40, height: 40 }}>
                    <Warning />
                  </Avatar>
                  <Typography variant="h3" fontWeight={800} color="#d97706">
                    {needsAttention}
                  </Typography>
                </Box>
                {/* Bottom row: Centered Name */}
                <Box textAlign="center">
                  <Typography variant="body1" color="#6b7280" fontWeight={600}>
                    Need Attention
                  </Typography>
                </Box>
              </CardContent>
            </StyledCard>
          </motion.div>
        </Box>
        
        <Box sx={{ width: { xs: '100%', md: '250px' } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <StyledCard 
              elevation={3}
              sx={{ 
                borderRadius: 3,
                bgcolor: '#f3e8ff',
                position: 'relative',
                overflow: 'hidden',
                height: '116px',
                maxWidth: '600px',
                mx: 'auto',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  background: '#9333ea',
                  zIndex: 1,
                }
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                {/* Top row: Icon and Number */}
                <Box display="flex" justifyContent="space-between" alignItems="center" gap={1.5} mb={1}>
                  <Avatar sx={{ bgcolor: '#9333ea', width: 40, height: 40 }}>
                    <LocalFlorist />
                  </Avatar>
                  <Typography variant="h3" fontWeight={800} color="#9333ea">
                    {harvestedCrops}
                  </Typography>
                </Box>
                {/* Bottom row: Centered Name */}
                <Box textAlign="center">
                  <Typography variant="body1" color="#6b7280" fontWeight={600}>
                    Harvested
                  </Typography>
                </Box>
              </CardContent>
            </StyledCard>
          </motion.div>
        </Box>
      </Box>

      {/* Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', md: 'row' }}
          justifyContent="space-between" 
          alignItems={{ xs: 'stretch', md: 'center' }}
          gap={2}
          mb={4}
          p={3}
          sx={{
            bgcolor: 'white',
            borderRadius: 3,
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Enhanced Search and Filters */}
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} flex={1} mb={2}>
            <TextField
              placeholder="Search crops, farms, or varieties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ 
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f8fafc',
                  border: '2px solid transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    borderColor: '#16a34a',
                    boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.1)',
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} color="#6b7280" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm('')}
                      sx={{ p: 0.5 }}
                    >
                      <Typography sx={{ fontSize: 16, color: '#6b7280' }}>×</Typography>
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status Filter"
                sx={{
                  borderRadius: 2,
                  backgroundColor: '#f8fafc',
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#16a34a',
                  }
                }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Healthy">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#16a34a' }} />
                    Healthy
                  </Box>
                </MenuItem>
                <MenuItem value="Needs Attention">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                    Needs Attention
                  </Box>
                </MenuItem>
                <MenuItem value="Harvested">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#8b5cf6' }} />
                    Harvested
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Active Filters Display */}
          {(searchTerm || statusFilter !== 'all') && (
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              <Typography variant="body2" color="#6b7280" sx={{ alignSelf: 'center', mr: 1 }}>
                Active filters:
              </Typography>
              {searchTerm && (
                <Chip
                  label={`Search: "${searchTerm}"`}
                  size="small"
                  onDelete={() => setSearchTerm('')}
                  sx={{
                    bgcolor: 'rgba(22, 163, 74, 0.1)',
                    color: '#16a34a',
                    '& .MuiChip-deleteIcon': {
                      color: '#16a34a',
                    },
                  }}
                />
              )}
              {statusFilter !== 'all' && (
                <Chip
                  label={`Status: ${statusFilter}`}
                  size="small"
                  onDelete={() => setStatusFilter('all')}
                  sx={{
                    bgcolor: 'rgba(22, 163, 74, 0.1)',
                    color: '#16a34a',
                    '& .MuiChip-deleteIcon': {
                      color: '#16a34a',
                    },
                  }}
                />
              )}
              <Button
                size="small"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                sx={{
                  fontSize: 12,
                  textTransform: 'none',
                  color: '#6b7280',
                  minWidth: 'auto',
                  p: 0.5,
                }}
              >
                Clear all
              </Button>
            </Box>
          )}

          {/* Enhanced Controls */}
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            {/* Sort Menu */}
            <Tooltip title="Sort crops">
              <Button
                variant="outlined"
                size="small"
                startIcon={<Sort />}
                onClick={(e) => setSortAnchorEl(e.currentTarget)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#d1d5db',
                  color: '#374151',
                  '&:hover': {
                    borderColor: '#16a34a',
                    backgroundColor: 'rgba(22, 163, 74, 0.08)',
                  },
                }}
              >
                Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : sortBy === 'status' ? 'Status' : 'Farm'}
              </Button>
            </Tooltip>

            {/* Compact Mode Toggle */}
            <Tooltip title={compactMode ? "Switch to detailed view" : "Switch to compact view"}>
              <IconButton
                onClick={() => setCompactMode(!compactMode)}
                sx={{
                  color: compactMode ? '#16a34a' : '#6b7280',
                  bgcolor: compactMode ? 'rgba(22, 163, 74, 0.08)' : 'transparent',
                  border: '1px solid #d1d5db',
                  '&:hover': {
                    bgcolor: 'rgba(22, 163, 74, 0.15)',
                    borderColor: '#16a34a',
                  },
                }}
              >
                {compactMode ? <ViewModule /> : <ViewCompact />}
              </IconButton>
            </Tooltip>

            {/* Bulk Actions */}
            {selectedCrops.length > 0 && (
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  label={`${selectedCrops.length} selected`}
                  size="small"
                  color="primary"
                  onDelete={() => setSelectedCrops([])}
                />
                <Tooltip title="Delete selected crops">
                  <IconButton
                    onClick={() => {
                      // Handle bulk delete
                      selectedCrops.forEach(cropId => handleDeleteCrop(cropId));
                      setSelectedCrops([]);
                    }}
                    sx={{
                      color: '#ef4444',
                      '&:hover': {
                        bgcolor: 'rgba(239, 68, 68, 0.08)',
                      },
                    }}
                  >
                    <DeleteSweep />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            
            <StyledButton
              variant="contained"
              startIcon={<Add />}
              onClick={() => setIsModalOpen(true)}
              sx={{
                bgcolor: '#16a34a',
                color: 'white',
                '&:hover': {
                  bgcolor: '#15803d',
                },
              }}
            >
              Add Crop
            </StyledButton>
          </Box>
        </Box>
      </motion.div>

      {/* Modals */}
      <AddCropModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddCrop={handleAddCrop} 
        farms={farms} 
      />
      
      <EditCropModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCrop(null);
        }}
        onEditCrop={handleEditCropSubmit}
        crop={editingCrop}
        farms={farms}
      />

      {/* Sort Menu */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={() => setSortAnchorEl(null)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            mt: 1,
          }
        }}
      >
        {[
          { value: 'newest', label: 'Newest First', icon: <CalendarToday /> },
          { value: 'oldest', label: 'Oldest First', icon: <CalendarToday /> },
          { value: 'status', label: 'By Status', icon: <Warning /> },
          { value: 'farm', label: 'By Farm', icon: <Agriculture /> },
        ].map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => {
              setSortBy(option.value);
              setSortAnchorEl(null);
            }}
            selected={sortBy === option.value}
            sx={{
              py: 1.5,
              px: 2,
              minWidth: 160,
              '&.Mui-selected': {
                bgcolor: 'rgba(22, 163, 74, 0.08)',
                color: '#16a34a',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
              {option.icon}
            </ListItemIcon>
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Menu>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {loading ? (
          <StyledCard sx={{ p: 4, textAlign: 'center' }}>
            <Typography>Loading crops...</Typography>
          </StyledCard>
        ) : filteredCrops.length > 0 ? (
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
            {/* Enhanced Card View */}
            <Grid container spacing={compactMode ? 2 : 3}>
              {sortedAndFilteredCrops.map((crop) => (
                <Grid item xs={12} sm={6} md={compactMode ? 3 : 4} lg={compactMode ? 3 : 3} key={crop.id}>
                  <CropCard
                    crop={crop}
                    onEdit={handleEditCrop}
                    onDelete={handleDeleteCrop}
                    isSelected={selectedCrops.includes(crop.id)}
                    onToggleSelect={(cropId) => {
                      if (selectedCrops.includes(cropId)) {
                        setSelectedCrops(prev => prev.filter(id => id !== cropId));
                      } else {
                        setSelectedCrops(prev => [...prev, cropId]);
                      }
                    }}
                    compactMode={compactMode}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          /* Empty State */
          <StyledCard sx={{ textAlign: 'center', p: 8 }}>
            <Avatar sx={{ mx: 'auto', mb: 3, bgcolor: '#16a34a', width: 64, height: 64 }}>
              <Agriculture sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="h5" fontWeight="bold" color="#171717" mb={2}>
              {searchTerm || statusFilter !== 'all' ? 'No crops match your filters' : 'No crops are being monitored yet'}
            </Typography>
            <Typography variant="body1" color="#6b7280" mb={4}>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Add your first crop to start monitoring its health and progress'
              }
            </Typography>
            {(!searchTerm && statusFilter === 'all') && (
              <StyledButton
                variant="contained"
                startIcon={<Add />}
                onClick={() => setIsModalOpen(true)}
                sx={{
                  bgcolor: '#16a34a',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#15803d',
                  },
                }}
              >
                Add Your First Crop
              </StyledButton>
            )}
          </StyledCard>
        )}
      </motion.div>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MonitoredCrops;
