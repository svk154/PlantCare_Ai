import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, Grid, Alert, Collapse } from '@mui/material';
import { Clock, Trash2, ChevronDown, ChevronUp, Calculator } from 'lucide-react';

// Mobile-first Past Calculations component for farmers
const PastCalculations = ({ calculatorType, refreshKey }) => {
  const [pastResults, setPastResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    const fetchPastResults = async () => {
      setLoading(true);
      try {
        const url = `${API_BASE_URL}/calculator-results/list?type=${calculatorType}` + (refreshKey ? `&_=${refreshKey}` : '');
        const response = await fetch(url, {
          headers: getAuthHeaders(),
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch past calculations');
        }
        
        const data = await response.json();
        setPastResults(data.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPastResults();
  }, [API_BASE_URL, calculatorType, refreshKey]);
  
  const handleDeleteResult = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/calculator-results/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        setPastResults(pastResults.filter(result => result.id !== id));
      }
    } catch (err) {
      
    }
  };
  
  // Format timestamp to readable date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get calculator type display info
  const getCalculatorInfo = (type) => {
    switch (type) {
      case 'fertilizer':
        return { icon: '🌱', name: 'Fertilizer', color: '#16a34a' };
      case 'pesticide':
        return { icon: '🧪', name: 'Pesticide', color: '#3b82f6' };
      case 'profit':
        return { icon: '💰', name: 'Profit', color: '#059669' };
      default:
        return { icon: '📊', name: 'Calculator', color: '#6b7280' };
    }
  };
  
  // Mobile-friendly result summary
  const renderMobileSummary = (result) => {
    const calcInfo = getCalculatorInfo(result.calculator_type);
    
    switch (result.calculator_type) {
      case 'fertilizer':
        const cropName = result.input_data?.crop_name || result.input_data?.crop || 'Crop';
        const area = result.input_data?.area || 'N/A';
        const unit = result.input_data?.unit || 'unit';
        
        return (
          <Box>
            <Typography variant="h6" fontWeight="bold" color={calcInfo.color} mb={1}>
              {calcInfo.icon} {cropName.charAt(0).toUpperCase() + cropName.slice(1)}
            </Typography>
            <Grid container spacing={1} mb={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Area</Typography>
                <Typography fontWeight="bold">{area} {unit}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Stage</Typography>
                <Typography fontWeight="bold">
                  {result.input_data?.stage_name || result.input_data?.growth_stage || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
            <Chip 
              label="Fertilizer Plan"
              color="success" 
              size="small" 
            />
          </Box>
        );

      case 'pesticide':
        // Handle both old complex format and new simple format
        const pesticideArea = result.input_data?.area || result.input_data?.plot_size || result.result_data?.area || 'N/A';
        const pesticideAreaUnit = result.input_data?.area_unit || result.result_data?.area_unit || '';
        const pesticideName = result.result_data?.pesticide || result.result_data?.recommended_pesticide || result.input_data?.pesticide_type || 'N/A';
        
        return (
          <Box>
            <Typography variant="h6" fontWeight="bold" color={calcInfo.color} mb={1}>
              {calcInfo.icon} Pesticide Application
            </Typography>
            <Grid container spacing={1} mb={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Area</Typography>
                <Typography fontWeight="bold">
                  {pesticideArea} {pesticideAreaUnit}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Pesticide</Typography>
                <Typography fontWeight="bold">
                  {pesticideName}
                </Typography>
              </Grid>
            </Grid>
            <Chip 
              label="Spray Plan"
              color="primary" 
              size="small" 
            />
          </Box>
        );

      case 'profit':
        return (
          <Box>
            <Typography variant="h6" fontWeight="bold" color={calcInfo.color} mb={1}>
              {calcInfo.icon} Profit Analysis
            </Typography>
            <Grid container spacing={1} mb={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Crop</Typography>
                <Typography fontWeight="bold">
                  {result.input_data?.crop_name || result.input_data?.crop || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Area</Typography>
                <Typography fontWeight="bold">
                  {result.input_data?.area || 'N/A'} {result.input_data?.unit || 'acre'}
                </Typography>
              </Grid>
            </Grid>
            <Chip 
              label="Profit Calculated"
              color="success"
              size="small" 
            />
          </Box>
        );

      default:
        return (
          <Box>
            <Typography variant="h6" fontWeight="bold" mb={1}>
              {calcInfo.icon} {calcInfo.name} Calculation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Calculation completed
            </Typography>
          </Box>
        );
    }
  };

  // Expanded details for mobile
  const renderExpandedDetails = (result) => {
    if (!result.result_data) return null;

    // Handle fertilizer calculations specifically
    if (result.calculator_type === 'fertilizer') {
      const data = result.result_data;
      
      return (
        <Box mt={2}>
          {/* NPK Requirements */}
          {data.nutrients && (
            <Box p={2} bgcolor="#f0fdf4" borderRadius={2} mb={2}>
              <Typography variant="subtitle2" fontWeight="bold" mb={1} color="#16a34a">
                🧪 Nutrient Requirements (NPK)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Nitrogen</Typography>
                  <Typography fontWeight="bold">{data.nutrients.nitrogen} kg</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Phosphorus</Typography>
                  <Typography fontWeight="bold">{data.nutrients.phosphorus} kg</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Potassium</Typography>
                  <Typography fontWeight="bold">{data.nutrients.potassium} kg</Typography>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Fertilizer Recommendations */}
          {(data.fertilizers || (Array.isArray(data.fertilizers) && data.fertilizers.length > 0)) && (
            <Box p={2} bgcolor="#fffbeb" borderRadius={2} mb={2}>
              <Typography variant="subtitle2" fontWeight="bold" mb={1} color="#d97706">
                🛒 Fertilizer Requirements
              </Typography>
              <Grid container spacing={2}>
                {/* Handle both object format and array format */}
                {Array.isArray(data.fertilizers) ? (
                  data.fertilizers.map((fertilizer, index) => (
                    <Grid item xs={4} key={index}>
                      <Typography variant="body2" color="text.secondary">{fertilizer.name}</Typography>
                      <Typography fontWeight="bold">{fertilizer.amount} kg</Typography>
                    </Grid>
                  ))
                ) : (
                  <>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Urea</Typography>
                      <Typography fontWeight="bold">{data.fertilizers.urea || 0} kg</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">DAP</Typography>
                      <Typography fontWeight="bold">{data.fertilizers.dap || 0} kg</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">MOP</Typography>
                      <Typography fontWeight="bold">{data.fertilizers.mop || 0} kg</Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          )}

          {/* Total Cost */}
          {(data.totalCost || data.estimated_cost) && (
            <Box p={2} bgcolor="#ecfdf5" borderRadius={2}>
              <Typography variant="subtitle2" fontWeight="bold" mb={1} color="#059669">
                💰 Total Cost
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="#16a34a">
                ₹{(data.totalCost || data.estimated_cost).toLocaleString()}
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    // Handle pesticide calculations specifically
    if (result.calculator_type === 'pesticide') {
      const data = result.result_data;
      const inputData = result.input_data;
      
      // Handle both old complex format and new simple format
      const pesticideName = data?.pesticide || data?.recommended_pesticide || inputData?.pesticide_type || 'N/A';
      const applicationArea = inputData?.area || inputData?.plot_size || data?.area || 'N/A';
      const areaUnit = inputData?.area_unit || data?.area_unit || '';
      const requiredQuantity = data?.quantity || data?.total_pesticide || 'N/A';
      const quantityUnit = data?.unit || 'ml';
      const dilutionInfo = data?.dilution || data?.adjusted_rate || 'N/A';
      const totalCost = data?.cost || data?.total_pesticide * 0.5 || 'N/A'; // Fallback cost calculation
      const safetyLevel = data?.safety || 'Moderate';
      
      return (
        <Box mt={2}>
          {/* Application Overview */}
          <Box p={2} bgcolor="#eff6ff" borderRadius={2} mb={2}>
            <Typography variant="subtitle2" fontWeight="bold" mb={1} color="#2563eb">
              🧪 Application Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Pesticide</Typography>
                <Typography fontWeight="bold">{pesticideName}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Application Area</Typography>
                <Typography fontWeight="bold">
                  {applicationArea} {areaUnit}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Dosage and Dilution */}
          <Box p={2} bgcolor="#fefce8" borderRadius={2} mb={2}>
            <Typography variant="subtitle2" fontWeight="bold" mb={1} color="#ca8a04">
              💧 Dosage & Dilution
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Required Quantity</Typography>
                <Typography fontWeight="bold">{requiredQuantity} {quantityUnit}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Dilution Info</Typography>
                <Typography fontWeight="bold">{dilutionInfo}</Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Cost Information */}
          {totalCost !== 'N/A' && (
            <Box p={2} bgcolor="#f0fdf4" borderRadius={2} mb={2}>
              <Typography variant="subtitle2" fontWeight="bold" mb={1} color="#16a34a">
                💰 Cost Information
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="#059669">
                ₹{typeof totalCost === 'number' ? totalCost.toLocaleString() : totalCost}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total application cost
              </Typography>
            </Box>
          )}

          {/* Safety Information */}
          <Box p={2} bgcolor="#fef2f2" borderRadius={2}>
            <Typography variant="subtitle2" fontWeight="bold" mb={1} color="#dc2626">
              ⚠️ Safety Level
            </Typography>
            <Typography fontWeight="bold" color="#b91c1c">
              {safetyLevel}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Always follow safety guidelines during application
            </Typography>
          </Box>
        </Box>
      );
    }

    // Handle profit calculations specifically
    if (result.calculator_type === 'profit') {
      const data = result.result_data;
      const inputData = result.input_data;
      
      return (
        <Box mt={2}>
          {/* Crop Information */}
          <Box p={2} bgcolor="#f0fdf4" borderRadius={2} mb={2}>
            <Typography variant="subtitle2" fontWeight="bold" mb={1} color="#16a34a">
              🌱 Crop Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Crop</Typography>
                <Typography fontWeight="bold">
                  {inputData?.crop_name || inputData?.crop || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Area</Typography>
                <Typography fontWeight="bold">
                  {inputData?.area || 'N/A'} {inputData?.unit || 'acre'}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Financial Summary */}
          <Box p={2} bgcolor="#fffbeb" borderRadius={2} mb={2}>
            <Typography variant="subtitle2" fontWeight="bold" mb={1} color="#d97706">
              💰 Financial Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                <Typography fontWeight="bold" color="#059669">
                  ₹{data?.revenue ? data.revenue.toLocaleString() : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Input Costs</Typography>
                <Typography fontWeight="bold" color="#dc2626">
                  ₹{inputData?.input_cost ? inputData.input_cost.toLocaleString() : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Profit/Loss Result */}
          {data?.profit !== undefined && (
            <Box p={2} bgcolor={data.profit >= 0 ? "#f0fdf4" : "#fef2f2"} borderRadius={2} mb={2}>
              <Typography variant="subtitle2" fontWeight="bold" mb={1} 
                color={data.profit >= 0 ? "#16a34a" : "#dc2626"}>
                {data.profit >= 0 ? "📈 Profit" : "📉 Loss"}
              </Typography>
              <Typography variant="h5" fontWeight="bold" 
                color={data.profit >= 0 ? "#059669" : "#b91c1c"}>
                ₹{Math.abs(data.profit).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {data.profit_margin ? `Profit Margin: ${data.profit_margin}%` : ''}
              </Typography>
            </Box>
          )}

          {/* Additional Information */}
          <Box p={2} bgcolor="#f3f4f6" borderRadius={2}>
            <Typography variant="subtitle2" fontWeight="bold" mb={1} color="#374151">
              📊 Additional Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Expected Yield</Typography>
                <Typography fontWeight="bold">
                  {data?.yield ? `${data.yield} quintals` : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Market Price</Typography>
                <Typography fontWeight="bold">
                  ₹{inputData?.market_price || 'N/A'} per quintal
                </Typography>
              </Grid>
              {data?.break_even_price && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Break-even Price</Typography>
                    <Typography fontWeight="bold" color="#f59e0b">
                      ₹{data.break_even_price} per quintal
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </Box>
      );
    }

    // Generic handling for other calculator types
    return (
      <Box mt={2} p={2} bgcolor="#f8fafc" borderRadius={2}>
        <Typography variant="subtitle2" fontWeight="bold" mb={1}>
          📊 Detailed Results:
        </Typography>
        <Box sx={{ fontSize: '0.9rem' }}>
          {Object.entries(result.result_data).map(([key, value], index) => {
            if (typeof value === 'object' || value === null || value === undefined) return null;
            
            const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const displayValue = typeof value === 'number' && key.includes('cost') 
              ? `₹${value}` 
              : String(value);

            return (
              <Box key={`${key}-${index}`} display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2" color="text.secondary">{displayKey}:</Typography>
                <Typography variant="body2" fontWeight="bold">{displayValue}</Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Card sx={{ mt: 3, borderRadius: 3 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Calculator size={48} color="#6b7280" />
          <Typography color="text.secondary" mt={2}>Loading past calculations...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="warning" sx={{ mt: 3, borderRadius: 2 }}>
        <Typography fontWeight="bold">Unable to load past calculations</Typography>
        <Typography variant="body2">{error}</Typography>
      </Alert>
    );
  }

  if (!pastResults.length) {
    return (
      <Card sx={{ mt: 3, borderRadius: 3, bgcolor: '#f8fafc' }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Calculator size={48} color="#6b7280" />
          <Typography variant="h6" color="text.secondary" mt={2}>
            No past calculations yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your calculation history will appear here
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box mt={3}>
      <Typography variant="h6" fontWeight="bold" mb={1} color="text.primary">
        📋 Past Calculations ({pastResults.length})
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Showing last {pastResults.length} of max 10 stored calculations
      </Typography>
      
      {/* Scrollable container for calculations */}
      <Box
        sx={{
          maxHeight: '400px',
          overflowY: 'auto',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          bgcolor: '#f8fafc',
          p: 1,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#4ade80',
            borderRadius: '4px',
            '&:hover': {
              background: '#22c55e',
            },
          },
        }}
      >
        <Grid container spacing={2}>
          {pastResults.slice(0, 10).map((result) => (
          <Grid item xs={12} key={result.id}>
            <Card 
              elevation={2} 
              sx={{ 
                borderRadius: 3,
                border: '1px solid #e5e7eb',
                '&:hover': { elevation: 4 }
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Header with date and delete */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Clock size={16} color="#6b7280" />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(result.created_at)}
                    </Typography>
                  </Box>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteResult(result.id)}
                    sx={{ color: '#ef4444' }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Box>

                {/* Main summary */}
                {renderMobileSummary(result)}

                {/* Expand/Collapse button */}
                <Box display="flex" justifyContent="center" mt={2}>
                  <IconButton
                    size="small"
                    onClick={() => setExpandedCard(expandedCard === result.id ? null : result.id)}
                    sx={{ 
                      bgcolor: '#f1f5f9',
                      '&:hover': { bgcolor: '#e2e8f0' }
                    }}
                  >
                    {expandedCard === result.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </IconButton>
                </Box>

                {/* Expanded details */}
                <Collapse in={expandedCard === result.id}>
                  {renderExpandedDetails(result)}
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        ))}
        </Grid>
      </Box>

      {pastResults.length > 10 && (
        <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
          Showing 10 most recent calculations
        </Typography>
      )}
    </Box>
  );
};

export default PastCalculations;