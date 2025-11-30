import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, Typography, Box, Chip, IconButton, Grid, Alert, 
  Collapse, Avatar, Paper, Divider, CircularProgress 
} from '@mui/material';
import { 
  Clock, ChevronDown, ChevronUp, Sprout, BarChart3, 
  Thermometer, Droplets, Beaker, CloudRain, Trash2 
} from 'lucide-react';

const CropPredictionHistory = ({ type, refreshKey }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = type === 'recommendation' 
          ? '/api/crop-predictions/recommendation-history'
          : '/api/crop-predictions/yield-history';
          
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          headers: getAuthHeaders(),
          cache: 'no-store'
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Please login to view your prediction history');
            return;
          }
          throw new Error('Failed to fetch prediction history');
        }
        
        const data = await response.json();
        const historyData = type === 'recommendation' ? data.recommendations : data.predictions;
        setHistory(historyData || []);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [API_BASE_URL, type, refreshKey]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleExpanded = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const handleDelete = async (id) => {
    const confirmMessage = `Are you sure you want to delete this ${type === 'recommendation' ? 'crop recommendation' : 'yield prediction'}? This action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeletingId(id);
    try {
      const endpoint = type === 'recommendation' 
        ? `/api/crop-predictions/recommendation-history/${id}`
        : `/api/crop-predictions/yield-history/${id}`;
        
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to delete predictions');
        }
        if (response.status === 404) {
          throw new Error('Prediction not found or unauthorized');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete prediction');
      }

      // Remove the deleted item from state
      setHistory(prevHistory => prevHistory.filter(item => item.id !== id));
      
      // Close expanded card if it was the deleted one
      if (expandedCard === id) {
        setExpandedCard(null);
      }
      
      // Show success feedback (you could replace this with a toast notification)
      console.log(`${type === 'recommendation' ? 'Recommendation' : 'Prediction'} deleted successfully`);
      
    } catch (err) {
      console.error('Error deleting prediction:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {type === 'recommendation' ? 'Recommendation History' : 'Yield Prediction History'}
          </Typography>
          <Typography color="text.secondary">Loading history...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {type === 'recommendation' ? 'Recommendation History' : 'Yield Prediction History'}
          </Typography>
          <Alert severity="warning">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Clock size={20} />
          {type === 'recommendation' ? 'Crop Recommendation History' : 'Yield Prediction History'}
        </Typography>
        
        {history.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
            <Typography color="text.secondary">
              No {type === 'recommendation' ? 'recommendations' : 'predictions'} yet. 
              {type === 'recommendation' ? ' Get your first crop recommendation above!' : ' Make your first yield prediction above!'}
            </Typography>
          </Paper>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {history.length} {type === 'recommendation' ? 'recommendation' : 'prediction'}{history.length !== 1 ? 's' : ''} found
              {history.length > 3 && (
                <Typography component="span" variant="caption" sx={{ ml: 1, fontStyle: 'italic' }}>
                  (scroll to see more)
                </Typography>
              )}
            </Typography>
            
            {/* Scrollable container for history items */}
            <Box 
              sx={{ 
                position: 'relative',
                maxHeight: '400px', 
                overflowY: 'auto',
                overflowX: 'hidden',
                pr: 1, // Add padding for scrollbar space
                // Custom scrollbar styling
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.4)',
                  },
                },
                // Fade effect at bottom when scrollable
                '&::after': history.length > 3 ? {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '20px',
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 100%)',
                  pointerEvents: 'none',
                  zIndex: 1,
                } : {},
              }}
            >
              <Grid container spacing={2}>
                {history.map((item) => (
                <Grid item xs={12} key={item.id}>
                  <Paper elevation={1} sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: type === 'recommendation' ? '#4CAF50' : '#FF9800', width: 40, height: 40 }}>
                          {type === 'recommendation' ? <Sprout size={20} /> : <BarChart3 size={20} />}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {type === 'recommendation' ? item.predicted_crop?.charAt(0).toUpperCase() + item.predicted_crop?.slice(1) : `${item.predicted_yield?.toFixed(2)} ${item.unit || 'tons/hectare'}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(item.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type === 'recommendation' && item.confidence && (
                          <Chip 
                            label={`${(item.confidence * 100).toFixed(1)}%`} 
                            size="small" 
                            color="success"
                          />
                        )}
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          sx={{ 
                            color: 'error.main',
                            '&:hover': { bgcolor: 'error.light', color: 'white' },
                            '&:disabled': { color: 'text.disabled' }
                          }}
                          title="Delete prediction"
                        >
                          {deletingId === item.id ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </IconButton>
                        <IconButton size="small" onClick={() => toggleExpanded(item.id)}>
                          {expandedCard === item.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </IconButton>
                      </Box>
                    </Box>

                    <Collapse in={expandedCard === item.id}>
                      <Divider sx={{ mb: 2 }} />
                      
                      {type === 'recommendation' ? (
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Sprout size={16} color="#4CAF50" />
                              <Typography variant="caption" display="block" color="text.secondary">Nitrogen</Typography>
                              <Typography variant="body2" fontWeight="bold">{item.nitrogen}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Beaker size={16} color="#2196F3" />
                              <Typography variant="caption" display="block" color="text.secondary">Phosphorous</Typography>
                              <Typography variant="body2" fontWeight="bold">{item.phosphorus}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Beaker size={16} color="#FF9800" />
                              <Typography variant="caption" display="block" color="text.secondary">Potassium</Typography>
                              <Typography variant="body2" fontWeight="bold">{item.potassium}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Thermometer size={16} color="#F44336" />
                              <Typography variant="caption" display="block" color="text.secondary">Temperature</Typography>
                              <Typography variant="body2" fontWeight="bold">{item.temperature}°C</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Droplets size={16} color="#00BCD4" />
                              <Typography variant="caption" display="block" color="text.secondary">Humidity</Typography>
                              <Typography variant="body2" fontWeight="bold">{item.humidity}%</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Beaker size={16} color="#9C27B0" />
                              <Typography variant="caption" display="block" color="text.secondary">pH</Typography>
                              <Typography variant="body2" fontWeight="bold">{item.ph}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <CloudRain size={16} color="#607D8B" />
                              <Typography variant="caption" display="block" color="text.secondary">Rainfall</Typography>
                              <Typography variant="body2" fontWeight="bold">{item.rainfall}mm</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      ) : (
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Sprout size={16} color="#4CAF50" />
                              <Typography variant="caption" display="block" color="text.secondary">Crop</Typography>
                              <Typography variant="body2" fontWeight="bold">{item.crop}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Typography variant="caption" display="block" color="text.secondary">Season</Typography>
                              <Typography variant="body2" fontWeight="bold">{item.season}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Typography variant="caption" display="block" color="text.secondary">State</Typography>
                              <Typography variant="body2" fontWeight="bold">{item.state}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <CloudRain size={16} color="#607D8B" />
                              <Typography variant="caption" display="block" color="text.secondary">Rainfall</Typography>
                              <Typography variant="body2" fontWeight="bold">{item.annual_rainfall}mm</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Typography variant="caption" display="block" color="text.secondary">Fertilizer</Typography>
                              <Typography variant="body2" fontWeight="bold">{item.fertilizer}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Typography variant="caption" display="block" color="text.secondary">Pesticide</Typography>
                              <Typography variant="body2" fontWeight="bold">{item.pesticide}</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      )}
                    </Collapse>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CropPredictionHistory;