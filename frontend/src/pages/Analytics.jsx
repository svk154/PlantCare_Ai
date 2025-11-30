import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, Skeleton } from '@mui/material';
import { Download, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { saveAs } from 'file-saver';
import Layout from '../components/Layout';

// For export CSV
function convertToCSV(arr) {
  const rows = [
    Object.keys(arr[0]).join(','),
    ...arr.map(obj => Object.values(obj).join(','))
  ];
  return rows.join('\n');
}

// Loading skeleton component
const SkeletonCard = ({ height = 300 }) => (
  <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
    <CardContent>
      <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width="100%" height={height} />
    </CardContent>
  </Card>
);

export default function Analytics() {
  // Check if we have cached data to optimize initial loading
  const hasCachedData = () => {
    return localStorage.getItem('analytics_basicStats') && 
           localStorage.getItem('analytics_cropHealth') &&
           localStorage.getItem('analytics_diseaseCounts') &&
           localStorage.getItem('analytics_monthlyExpenses') &&
           localStorage.getItem('analytics_expenseCategories');
  };

  const [loading, setLoading] = useState(!hasCachedData());
  const [error, setError] = useState(null);
  
  // Initialize analytics data states with optimized defaults
  const [basicStats, setBasicStats] = useState(() => {
    const cached = localStorage.getItem('analytics_basicStats');
    return cached ? JSON.parse(cached) : {
      farm_count: 0,
      crop_count: 0,
      disease_scans: 0,
      total_expenses: 0
    };
  });
  
  const [cropHealth, setCropHealth] = useState(() => {
    const cached = localStorage.getItem('analytics_cropHealth');
    return cached ? JSON.parse(cached) : [];
  });
  
  const [diseaseCounts, setDiseaseCounts] = useState(() => {
    const cached = localStorage.getItem('analytics_diseaseCounts');
    return cached ? JSON.parse(cached) : [];
  });
  
  const [monthlyExpenses, setMonthlyExpenses] = useState(() => {
    const cached = localStorage.getItem('analytics_monthlyExpenses');
    return cached ? JSON.parse(cached) : [];
  });
  
  const [expenseCategories, setExpenseCategories] = useState(() => {
    const cached = localStorage.getItem('analytics_expenseCategories');
    return cached ? JSON.parse(cached) : [];
  });

  // Function to get auth headers

  // Function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch analytics data from the API
  useEffect(() => {
    const fetchData = async () => {
      // Only show loading if we don't have cached data
      if (!hasCachedData()) {
        setLoading(true);
      }
      setError(null);
      
      try {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const headers = getAuthHeaders();
        
        // Fetch all analytics data in parallel for optimal performance
        const [
          dashboardResponse,
          cropHealthResponse,
          diseaseCountsResponse,
          monthlyExpensesResponse,
          expenseCategoriesResponse
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/analytics/dashboard`, { headers }),
          fetch(`${API_BASE_URL}/analytics/crop-health`, { headers }),
          fetch(`${API_BASE_URL}/analytics/disease-counts`, { headers }),
          fetch(`${API_BASE_URL}/analytics/monthly-expenses`, { headers }),
          fetch(`${API_BASE_URL}/analytics/expense-categories`, { headers })
        ]);

        // Check if all responses are ok
        if (!dashboardResponse.ok) throw new Error("Failed to load dashboard stats");
        if (!cropHealthResponse.ok) throw new Error("Failed to load crop health data");
        if (!diseaseCountsResponse.ok) throw new Error("Failed to load disease counts");
        if (!monthlyExpensesResponse.ok) throw new Error("Failed to load monthly expenses");
        if (!expenseCategoriesResponse.ok) throw new Error("Failed to load expense categories");

        // Parse all responses in parallel
        const [
          dashboardData,
          cropHealthData,
          diseaseCountsData,
          monthlyExpensesData,
          expenseCategoriesData
        ] = await Promise.all([
          dashboardResponse.json(),
          cropHealthResponse.json(),
          diseaseCountsResponse.json(),
          monthlyExpensesResponse.json(),
          expenseCategoriesResponse.json()
        ]);

        // Update all states and cache in localStorage for instant future loads
        setBasicStats(dashboardData);
        setCropHealth(cropHealthData);
        setDiseaseCounts(diseaseCountsData);
        setMonthlyExpenses(monthlyExpensesData);
        setExpenseCategories(expenseCategoriesData);
        
        // Cache data in localStorage for performance optimization
        localStorage.setItem('analytics_basicStats', JSON.stringify(dashboardData));
        localStorage.setItem('analytics_cropHealth', JSON.stringify(cropHealthData));
        localStorage.setItem('analytics_diseaseCounts', JSON.stringify(diseaseCountsData));
        localStorage.setItem('analytics_monthlyExpenses', JSON.stringify(monthlyExpensesData));
        localStorage.setItem('analytics_expenseCategories', JSON.stringify(expenseCategoriesData));
        
      } catch (err) {
        
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
  
  // Export data as CSV
  const exportCSV = (data, filename) => {
    if (!data.length) return;
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, `${filename}.csv`);
  };

  return (
    <Layout isLoggedIn={true}>
      <Box sx={{ background: 'linear-gradient(135deg,#f0fdf4 0%,#f0f9ff 100%)', minHeight: '100vh' }}>
        <Box 
          maxWidth="xl" 
          mx="auto" 
          py={6} 
          px={{ xs: 1, sm: 2 }}
          sx={{
            maxHeight: '90vh',
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#16a34a',
              borderRadius: '10px',
              '&:hover': {
                background: '#15803d',
              },
            },
          }}
        >
        <Typography variant="h4" fontWeight={800} mb={4} sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
          <BarChart3 size={30} style={{ verticalAlign: "-6px", marginRight: 9 }}/>
          Farm Analytics
        </Typography>
        
        {loading ? (
          <Grid container spacing={3}>
            {/* Farm Overview Skeleton */}
            <Grid item xs={12} md={6} lg={3}>
              <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent>
                  <Skeleton variant="text" width="70%" height={30} sx={{ mb: 2 }} />
                  {[...Array(4)].map((_, i) => (
                    <Box key={i} mb={2}>
                      <Skeleton variant="text" width="50%" height={20} />
                      <Skeleton variant="text" width="30%" height={40} />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Monthly Expenses Skeleton */}
            <Grid item xs={12} md={6} lg={9}>
              <SkeletonCard height={300} />
            </Grid>
            
            {/* Disease Counts Skeleton */}
            <Grid item xs={12} md={6}>
              <SkeletonCard height={300} />
            </Grid>
            
            {/* Expense Categories Skeleton */}
            <Grid item xs={12} md={6}>
              <SkeletonCard height={300} />
            </Grid>
            
            {/* Crop Health Skeleton */}
            <Grid item xs={12}>
              <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
                  {[...Array(3)].map((_, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                      <Skeleton variant="text" width="20%" height={30} />
                      <Skeleton variant="text" width="15%" height={30} />
                      <Skeleton variant="rectangular" width="30%" height={20} />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : error ? (
          <Card elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography color="error">{error}</Typography>
          </Card>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ 
            padding: { xs: 1, sm: 2, md: 3 },
            maxWidth: '100%',
            margin: '0 auto',
            width: '100%',
            alignItems: { md: 'stretch' }
          }}>
            {/* Farm Overview Card with Crop Health - Full width on mobile, half on tablet, quarter on desktop */}
            <Grid item xs={12} sm={12} md={6} lg={12}>
              <Card elevation={3} sx={{ 
                borderRadius: 3, 
                height: '100%', 
                '&:hover': { elevation: 6, transform: 'translateY(-2px)' }, 
                transition: 'all 0.2s',
                minHeight: { xs: '400px', sm: '450px', md: '500px', lg: '500px' },
                width: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardContent sx={{ 
                  p: { xs: 2, sm: 3, md: 3 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
                      Farm Overview
                    </Typography>
                    {cropHealth.length > 0 && (
                      <Button 
                        startIcon={<Download />} 
                        size="small"
                        onClick={() => exportCSV(cropHealth, 'crop_health')}
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          '&:hover': { bgcolor: '#e8f5e9' }
                        }}
                      >
                        Export Crops
                      </Button>
                    )}
                  </Box>
                  
                  {/* Stats Grid */}
                  <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3} md={3}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Total Farms</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="h4" fontWeight="bold" color="primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}>{basicStats.farm_count}</Typography>
                          {monthlyExpenses.length >= 2 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', fontSize: { xs: '0.6rem', sm: '0.75rem' }, color: '#16a34a' }}>
                              <TrendingUp size={12} />
                              <Typography variant="caption" sx={{ ml: 0.5 }}>Active</Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3} md={3}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Total Crops</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="h4" fontWeight="bold" color="#16a34a" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}>{basicStats.crop_count}</Typography>
                          {cropHealth.length > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', fontSize: { xs: '0.6rem', sm: '0.75rem' }, color: '#16a34a' }}>
                              <TrendingUp size={12} />
                              <Typography variant="caption" sx={{ ml: 0.5 }}>Growing</Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3} md={3}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Disease Scans</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="h4" fontWeight="bold" color="#7c3aed" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}>
                            {basicStats.disease_scans || 0}
                          </Typography>
                          {diseaseCounts.length > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', fontSize: { xs: '0.6rem', sm: '0.75rem' }, color: '#7c3aed' }}>
                              <Typography variant="caption">Recent</Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3} md={3}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Total Expenses</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="h4" fontWeight="bold" color="#dc2626" sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '2rem' } }}>₹{basicStats.total_expenses}</Typography>
                          {monthlyExpenses.length >= 2 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
                              {(() => {
                                const current = monthlyExpenses[monthlyExpenses.length - 1]?.amount || 0;
                                const previous = monthlyExpenses[monthlyExpenses.length - 2]?.amount || 0;
                                const isUp = current > previous;
                                const change = previous ? Math.abs(((current - previous) / previous) * 100).toFixed(1) : 0;
                                
                                return (
                                  <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    color: isUp ? '#dc2626' : '#16a34a' 
                                  }}>
                                    {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    <Typography variant="caption" sx={{ ml: 0.5 }}>
                                      {change}%
                                    </Typography>
                                  </Box>
                                );
                              })()}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Crop Health Section */}
                  {cropHealth.length > 0 && (
                    <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e2e8f0' }}>
                      <Typography variant="h6" fontWeight="bold" mb={2} sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' } }}>
                        Crop Health Overview
                      </Typography>
                      <Box sx={{ 
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                        gap: 2,
                        maxHeight: '200px',
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': {
                          width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: '#f1f1f1',
                          borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: '#16a34a',
                          borderRadius: '3px',
                          '&:hover': {
                            background: '#15803d',
                          },
                        },
                      }}>
                        {cropHealth.map((crop, index) => (
                          <Box 
                            key={index}
                            sx={{ 
                              p: { xs: 1.5, sm: 2 },
                              borderRadius: 2,
                              border: '1px solid #e2e8f0',
                              bgcolor: '#fafafa',
                              '&:hover': { 
                                bgcolor: '#f8fafc',
                                borderColor: '#cbd5e1',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              },
                              transition: 'all 0.2s',
                              cursor: 'pointer'
                            }}
                          >
                            <Typography 
                              variant="subtitle2" 
                              fontWeight="bold" 
                              sx={{ 
                                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                mb: 1,
                                color: '#1f2937'
                              }}
                            >
                              {crop.crop}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Box
                                sx={{
                                  width: { xs: 60, sm: 80 },
                                  height: 6,
                                  bgcolor: '#e5e7eb',
                                  borderRadius: 3,
                                  overflow: 'hidden',
                                  flex: 1
                                }}
                              >
                                <Box
                                  sx={{
                                    width: `${crop.health_score}%`,
                                    height: '100%',
                                    bgcolor: 
                                      crop.health_score > 80 ? '#16a34a' : 
                                      crop.health_score > 60 ? '#eab308' : '#dc2626',
                                    borderRadius: 3,
                                    transition: 'width 0.3s ease'
                                  }}
                                />
                              </Box>
                              <Typography 
                                variant="caption" 
                                fontWeight="bold"
                                sx={{ 
                                  fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                  color: 
                                    crop.health_score > 80 ? '#16a34a' : 
                                    crop.health_score > 60 ? '#eab308' : '#dc2626'
                                }}
                              >
                                {crop.health_score}%
                              </Typography>
                            </Box>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                color: '#6b7280',
                                textTransform: 'capitalize'
                              }}
                            >
                              Status: {crop.status}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Disease Counts Chart */}
            <Grid item xs={12} sm={12} md={6} lg={6} sx={{ 
              order: { xs: 1, md: 1 },
              '@media (max-width: 600px)': {
                width: '100% !important',
                flexBasis: '100% !important',
                maxWidth: '100% !important'
              }
            }}>
              <Card elevation={3} sx={{ 
                borderRadius: 3,
                '&:hover': { elevation: 6, transform: 'translateY(-2px)' }, 
                transition: 'all 0.2s',
                cursor: 'pointer',
                minHeight: { xs: '350px', sm: '380px', md: '500px', lg: '500px' },
                width: '100%',
                marginBottom: { xs: 2, sm: 2, md: 0 },
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}>
                <CardContent sx={{ 
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
                      Disease Detections
                    </Typography>
                    <Button 
                      startIcon={<Download />} 
                      size="small"
                      onClick={() => exportCSV(diseaseCounts, 'disease_counts')}
                      sx={{ 
                        '&:hover': { bgcolor: '#e8f5e9' },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      Export
                    </Button>
                  </Box>
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {diseaseCounts.length === 0 ? (
                      <Typography color="text.secondary" align="center" py={4} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        No disease detection data available
                      </Typography>
                    ) : (
                      <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={diseaseCounts} margin={{ top: 5, right: 10, bottom: 60, left: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="disease" 
                          tick={{ fontSize: window.innerWidth < 600 ? '8px' : '10px' }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={window.innerWidth < 600 ? 60 : 80}
                        />
                        <YAxis tick={{ fontSize: window.innerWidth < 600 ? '8px' : '12px' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#f8fafc', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: window.innerWidth < 600 ? '10px' : '12px'
                          }}
                          formatter={(value, name, props) => {
                            const { payload } = props;
                            return [
                              `Count: ${value}`,
                              payload.avg_confidence ? `Avg Confidence: ${(payload.avg_confidence * 100).toFixed(1)}%` : '',
                              payload.last_detection ? `Last Detected: ${new Date(payload.last_detection).toLocaleDateString()}` : ''
                            ].filter(Boolean);
                          }}
                          labelFormatter={(label) => `Disease: ${label}`}
                        />
                        <Legend />
                        <Bar 
                          dataKey="count" 
                          name="Occurrences" 
                          fill="#16a34a"
                          style={{ cursor: 'pointer' }}
                          onClick={(data, index) => {
                            if (data && data.disease) {
                              
                            }
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Monthly Expenses Chart */}
            <Grid item xs={12} sm={12} md={6} lg={6} sx={{ 
              order: { xs: 2, md: 2 },
              '@media (max-width: 600px)': {
                width: '100% !important',
                flexBasis: '100% !important',
                maxWidth: '100% !important'
              }
            }}>
              <Card elevation={3} sx={{ 
                borderRadius: 3, 
                height: '100%', 
                '&:hover': { elevation: 6, transform: 'translateY(-2px)' }, 
                transition: 'all 0.2s',
                cursor: 'pointer',
                minHeight: { xs: '350px', sm: '380px', md: '500px', lg: '500px' },
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                marginBottom: { xs: 2, sm: 2, md: 0 },
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardContent sx={{ 
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
                      Monthly Expenses
                    </Typography>
                    <Button 
                      startIcon={<Download />} 
                      size="small"
                      onClick={() => exportCSV(monthlyExpenses, 'monthly_expenses')}
                      sx={{ 
                        '&:hover': { bgcolor: '#e3f2fd' },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      Export
                    </Button>
                  </Box>
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {monthlyExpenses.length === 0 ? (
                      <Typography color="text.secondary" align="center" py={4} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        No monthly expense data available
                      </Typography>
                    ) : (
                    <ResponsiveContainer width="100%" height={window.innerWidth < 600 ? 210 : window.innerWidth < 900 ? 280 : 320}>
                      <BarChart 
                        data={monthlyExpenses} 
                        margin={{ 
                          top: 5, 
                          right: window.innerWidth < 600 ? 5 : 20, 
                          bottom: window.innerWidth < 600 ? 60 : 60, 
                          left: window.innerWidth < 600 ? 5 : 0 
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: window.innerWidth < 600 ? '9px' : '12px' }}
                          interval={window.innerWidth < 600 ? 'preserveStartEnd' : 0}
                          angle={window.innerWidth < 600 ? -90 : -45}
                          textAnchor="end"
                          height={window.innerWidth < 600 ? 60 : 60}
                        />
                        <YAxis 
                          tick={{ fontSize: window.innerWidth < 600 ? '10px' : '12px' }}
                          width={window.innerWidth < 600 ? 40 : 60}
                        />
                        <Tooltip 
                          formatter={(value) => [`₹${value}`, 'Amount']}
                          labelFormatter={(label) => `Month: ${label}`}
                          contentStyle={{ 
                            backgroundColor: '#f8fafc', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: window.innerWidth < 600 ? '10px' : '12px'
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: window.innerWidth < 600 ? '10px' : '12px' }}
                        />
                        <Bar 
                          dataKey="amount" 
                          name="Expenses" 
                          fill="#0ea5e9"
                          style={{ cursor: 'pointer' }}
                          onClick={(data, index) => {
                            if (data && data.month) {
                              
                            }
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Expense Categories Chart */}
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <Card elevation={3} sx={{ 
                borderRadius: 3,
                '&:hover': { elevation: 6, transform: 'translateY(-2px)' }, 
                transition: 'all 0.2s',
                cursor: 'pointer',
                minHeight: { xs: '500px', sm: '550px', md: '600px' },
                width: '100%'
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
                      Expense Breakdown
                    </Typography>
                    <Button 
                      startIcon={<Download />} 
                      size="small"
                      onClick={() => exportCSV(expenseCategories, 'expense_categories')}
                      sx={{ 
                        '&:hover': { bgcolor: '#fef3c7' },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      Export
                    </Button>
                  </Box>
                  {expenseCategories.length === 0 ? (
                    <Typography color="text.secondary" align="center" py={4} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      No expense category data available
                    </Typography>
                  ) : (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', md: 'row' }, 
                      gap: 3, 
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '70%',
        
                    }}>
                      {/* Pie Chart */}
                      <Box sx={{ 
                        flex: { xs: '1', md: '0 0 65%' },
                        minHeight: { xs: '250px', md: '380px' },
                        minWidth: { xs: '300px', md: '400px' },
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%'
                      }}>
                        <ResponsiveContainer width="100%" height={window.innerWidth < 900 ? 300 : 350}>
                          <PieChart>
                            <Pie
                              data={expenseCategories}
                              dataKey="amount"
                              nameKey="category"
                              cx="50%"
                              cy="50%"
                              outerRadius={window.innerWidth < 600 ? 80 : window.innerWidth < 900 ? 100 : 120}
                              innerRadius={0}
                              label={false}
                              style={{ cursor: 'pointer' }}
                            >
                              {expenseCategories.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={COLORS[index % COLORS.length]}
                                  style={{ filter: 'brightness(1)', transition: 'filter 0.2s' }}
                                  onMouseEnter={(e) => { e.target.style.filter = 'brightness(1.1)'; }}
                                  onMouseLeave={(e) => { e.target.style.filter = 'brightness(1)'; }}
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value, name) => [`₹${value}`, name]}
                              labelFormatter={(label) => `Category: ${label}`}
                              contentStyle={{ 
                                backgroundColor: '#f8fafc', 
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '12px',
                                maxWidth: '250px',
                                wordWrap: 'break-word'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>

                      {/* Custom Legend */}
                      <Box sx={{ 
                        flex: { xs: '1', md: '0 0 35%' },
                        width: '100%',
                        maxHeight: { xs: '250px', md: '380px' },
                        overflowY: 'auto',
                        p: { xs: 1, sm: 2 }
                      }}>
                        <Typography variant="subtitle1" fontWeight="bold" mb={2} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          Categories
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {expenseCategories.map((entry, index) => {
                            const totalAmount = expenseCategories.reduce((sum, item) => sum + item.amount, 0);
                            const percentage = ((entry.amount / totalAmount) * 100).toFixed(1);
                            return (
                              <Box 
                                key={index}
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'flex-start', 
                                  gap: 1.5,
                                  p: 1.5,
                                  borderRadius: 2,
                                  border: '1px solid #e2e8f0',
                                  '&:hover': { 
                                    bgcolor: '#f8fafc',
                                    borderColor: '#cbd5e1'
                                  },
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                              >
                                <Box 
                                  sx={{ 
                                    width: 16, 
                                    height: 16, 
                                    backgroundColor: COLORS[index % COLORS.length],
                                    borderRadius: '4px',
                                    flexShrink: 0,
                                    mt: 0.25
                                  }}
                                />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                      fontWeight: 600,
                                      wordBreak: 'break-word',
                                      lineHeight: 1.3,
                                      mb: 0.5
                                    }}
                                  >
                                    {entry.category}
                                  </Typography>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography 
                                      variant="body2" 
                                      color="primary"
                                      sx={{ 
                                        fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                        fontWeight: 600
                                      }}
                                    >
                                      ₹{entry.amount.toLocaleString()}
                                    </Typography>
                                    <Typography 
                                      variant="caption" 
                                      color="text.secondary"
                                      sx={{ 
                                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                        bgcolor: '#f1f5f9',
                                        px: 1,
                                        py: 0.25,
                                        borderRadius: 1
                                      }}
                                    >
                                      {percentage}%
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Quick Insights Card */}
            <Grid item xs={12} sm={12} md={4} lg={4}>
              <Card elevation={3} sx={{ 
                borderRadius: 3, 
                bgcolor: '#f8fafc',
                '&:hover': { elevation: 6, transform: 'translateY(-2px)' }, 
                transition: 'all 0.2s',
                minHeight: { xs: '300px', sm: '350px', md: '550px' },
                width: '100%'
              }}>
                <CardContent sx={{ p: { xs: 3, sm: 3 } }}>
                  <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: '#16a34a', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    💡 Quick Insights
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 2,
                    maxHeight: { xs: '200px', sm: '300px' },
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f1f1f1',
                      borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#16a34a',
                      borderRadius: '10px',
                      '&:hover': {
                        background: '#15803d',
                      },
                    },
                  }}>
                    {/* Top Expense Category */}
                    {expenseCategories.length > 0 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Top Expense Category</Typography>
                        <Typography variant="body1" fontWeight="600" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {expenseCategories.reduce((max, cat) => cat.amount > max.amount ? cat : max, expenseCategories[0]).category}
                          <Typography component="span" sx={{ color: '#dc2626', ml: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            (₹{expenseCategories.reduce((max, cat) => cat.amount > max.amount ? cat : max, expenseCategories[0]).amount})
                          </Typography>
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Monthly Trend */}
                    {monthlyExpenses.length >= 2 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Monthly Trend</Typography>
                        <Typography variant="body1" fontWeight="600" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {(() => {
                            const current = monthlyExpenses[monthlyExpenses.length - 1]?.amount || 0;
                            const previous = monthlyExpenses[monthlyExpenses.length - 2]?.amount || 0;
                            const trend = current > previous ? 'increased' : current < previous ? 'decreased' : 'stable';
                            const percentage = previous ? Math.abs(((current - previous) / previous) * 100).toFixed(1) : 0;
                            
                            return (
                              <>
                                Expenses {trend} 
                                {trend !== 'stable' && (
                                  <Typography component="span" sx={{ 
                                    color: trend === 'increased' ? '#dc2626' : '#16a34a',
                                    ml: 1,
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                  }}>
                                    {trend === 'increased' ? '↗' : '↘'} {percentage}%
                                  </Typography>
                                )}
                              </>
                            );
                          })()}
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Disease Insights */}
                    {diseaseCounts.length > 0 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Most Common Disease</Typography>
                        <Typography variant="body1" fontWeight="600" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {diseaseCounts[0].disease}
                          <Typography component="span" sx={{ color: '#7c3aed', ml: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            ({diseaseCounts[0].count} detections)
                          </Typography>
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Health Status */}
                    {cropHealth.length > 0 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Farm Health</Typography>
                        <Typography variant="body1" fontWeight="600" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {(() => {
                            const avgHealth = cropHealth.reduce((sum, crop) => sum + crop.health_score, 0) / cropHealth.length;
                            const status = avgHealth > 80 ? 'Excellent' : avgHealth > 60 ? 'Good' : 'Needs Attention';
                            const color = avgHealth > 80 ? '#16a34a' : avgHealth > 60 ? '#eab308' : '#dc2626';
                            
                            return (
                              <Typography component="span" sx={{ color }}>
                                {status} ({avgHealth.toFixed(1)}% avg)
                              </Typography>
                            );
                          })()}
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Disease Detection Quality */}
                    {diseaseCounts.length > 0 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Detection Quality</Typography>
                        <Typography variant="body1" fontWeight="600" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {(() => {
                            const avgConfidence = diseaseCounts.reduce((sum, disease) => sum + (disease.avg_confidence || 0), 0) / diseaseCounts.length;
                            const quality = avgConfidence > 0.8 ? 'Excellent' : avgConfidence > 0.6 ? 'Good' : 'Fair';
                            const color = avgConfidence > 0.8 ? '#16a34a' : avgConfidence > 0.6 ? '#eab308' : '#dc2626';
                            
                            return (
                              <Typography component="span" sx={{ color }}>
                                {quality} ({(avgConfidence * 100).toFixed(1)}% avg confidence)
                              </Typography>
                            );
                          })()}
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Simple Recommendation */}
                    <Box sx={{ mt: 1, p: 2, bgcolor: '#e0f2fe', borderRadius: 2 }}>
                      <Typography variant="body2" color="#0369a1" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        💡 <strong>Tip:</strong> {(() => {
                          if (expenseCategories.length > 0) {
                            const topCategory = expenseCategories.reduce((max, cat) => cat.amount > max.amount ? cat : max, expenseCategories[0]);
                            return `Monitor your ${topCategory.category.toLowerCase()} expenses for potential savings.`;
                          }
                          return "Keep tracking your expenses to identify cost-saving opportunities.";
                        })()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
          </Grid>
        )}
      </Box>
      </Box>
    </Layout>
  );
}
