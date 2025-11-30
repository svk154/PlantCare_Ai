import { useState, useEffect, useCallback } from 'react';
import { Button, Box, Typography, Card, CardContent, Avatar, Container, Skeleton, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Leaf, Camera, Calculator, Users, CloudRain, BarChart3, Sprout, Droplets, Sun, ArrowUpRight, FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { getRequest } from '../utils/apiClient';
import { createApiRequest } from '../utils/apiConfig';
import { useLanguage } from '../utils/languageContext';

const quickActions = [
  { titleKey: "scanPlantDisease", title: "Scan Plant Disease", descriptionKey: "uploadPlantDesc", description: "Upload plant images for AI analysis", icon: <Camera size={28} />, color: "#16a34a", path: "/disease-detection" },
  { titleKey: "calculateFertilizer", title: "Calculate Fertilizer", descriptionKey: "optimizeFertilizerDesc", description: "Optimize your fertilizer usage", icon: <Calculator size={28} />, color: "#2563eb", path: "/calculator-fertilizer" },
  { titleKey: "cropRecommendation", title: "Crop Recommendation", descriptionKey: "findBestCropDesc", description: "AI-powered crop suggestions based on soil", icon: <Sprout size={28} />, color: "#4CAF50", path: "/crop-recommendation" },
  { titleKey: "yieldPrediction", title: "Yield Prediction", descriptionKey: "predictHarvestDesc", description: "Estimate your crop yield potential", icon: <BarChart3 size={28} />, color: "#FF9800", path: "/yield-prediction" },
  { titleKey: "farmAnalytics", title: "Farm Analytics", descriptionKey: "viewStatsDesc", description: "View farm statistics & charts", icon: <BarChart3 size={28} />, color: "#7c3aed", path: "/analytics" },
  { titleKey: "pesticideCalculator", title: "Pesticide Calculator", descriptionKey: "preciseDosesDesc", description: "Precise application & safety", icon: <Droplets size={28} />, color: "#0ea5e9", path: "/pesticide-calculator" },
  { titleKey: "weatherForecast", title: "Weather Forecast", descriptionKey: "weatherInsightsDesc", description: "View farming weather insights", icon: <CloudRain size={28} />, color: "#06b6d4", path: "/weather" },
  { titleKey: "communityForum", title: "Community Forum", descriptionKey: "connectFarmersDesc", description: "Connect with other farmers", icon: <Users size={28} />, color: "#db2777", path: "/forum" }
];


// Weather icon selector based on condition
function getWeatherIcon(main, size = 36) {
  switch(main?.toLowerCase()) {
    case "clear": return <Sun size={size} color="white" />;
    case "clouds": return <CloudRain size={size} color="white" strokeOpacity={0.6} />;
    case "rain": return <CloudRain size={size} color="white" />;
    case "thunderstorm": return <CloudRain size={size} color="white" />;
    case "snow": return <CloudRain size={size} color="white" />;
    case "fog": 
    case "haze": return <CloudRain size={size} color="white" strokeWidth={1.5} />;
    default: return <Sun size={size} color="white" />;
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [user, setUser] = useState({ name: "", email: "" });
  const [weatherData, setWeatherData] = useState(null);
  const [cropCount, setCropCount] = useState(0);
  const [farmCount, setFarmCount] = useState(0);
  const [scanCount, setScanCount] = useState(0);
  const [cropsData, setCropsData] = useState({
    total: 0,
    healthy: 0,
    needsAttention: 0,
    harvested: 0
  });

  // Loading states - optimized with early returns
  const [isLoading, setIsLoading] = useState(true);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false); // Start as false since we show defaults
  
  // Weather data
  const [forecastData, setForecastData] = useState([]);

  // Notes data
  const [recentNotes, setRecentNotes] = useState([]);
  const [farms, setFarms] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);

  // Using apiClient utility for all API requests

  const [averageHealth, setAverageHealth] = useState(0);
  
  // Dynamic farm stats
  const farmStats = [
    { labelKey: "activeFarms", label: "Active Farms", value: farmCount.toString(), color: "#16a34a", icon: <Sprout size={24} />, path: "/active-farms", clickable: true },
    { labelKey: "cropsMonitored", label: "Crops Monitored", value: cropCount.toString(), color: "#2563eb", icon: <Leaf size={24} />, path: "/crops", clickable: true },
    { labelKey: "diseaseScans", label: "Disease Scans", value: scanCount.toString(), color: "#7c3aed", icon: <Camera size={24} />, path: "/disease-scans", clickable: true },
    { labelKey: "healthScore", label: "Health Score", value: averageHealth > 0 ? `${averageHealth}%` : "0%", color: "#059669", icon: <BarChart3 size={24} />, path: "/analytics", clickable: true }
  ];

  // Optimized fetch recent notes function with caching
  const fetchRecentNotes = useCallback(async (userFarms = null) => {
    try {
      // Use provided farms or fetch them
      let farms = userFarms;
      if (!farms) {
        const farmData = await getRequest('/farms/');
        if (!farmData || !farmData.farms) return;
        farms = farmData.farms;
        setFarms(farms);
      }
      
      // Limit to first 3 farms for better performance
      const limitedFarms = farms.slice(0, 3);
      
      // Fetch notes in parallel for better performance
      const notePromises = limitedFarms.map(async (farm) => {
        try {
          const notesData = await getRequest(`/farms/${farm.id}/notes`);
          if (notesData && notesData.notes) {
            return notesData.notes.map(note => ({
              ...note,
              farmName: farm.name,
              farmId: farm.id
            }));
          }
          return [];
        } catch (error) {
          
          return [];
        }
      });
      
      const allNotesArrays = await Promise.all(notePromises);
      const allNotes = allNotesArrays.flat();
      
      // Sort by date and take latest 3
      allNotes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setRecentNotes(allNotes.slice(0, 3));
    } catch (error) {
      
    }
  }, []);

  // Add new note function
  const handleAddNote = async () => {
    // Improved validation
    if (!newNote.trim()) {
      alert('Please enter a note before adding.');
      return;
    }
    
    if (!selectedFarmId) {
      alert('Please select a farm first.');
      return;
    }
    
    try {
      setNotesLoading(true);
       // Debug log
      
      const response = await createApiRequest(`farms/${selectedFarmId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content: newNote.trim() })
      });
      
       // Debug log
      
      if (response.ok) {
        const data = await response.json();
         // Debug log
        
        if (data && data.note) {
          const farmName = farms.find(f => f.id.toString() === selectedFarmId)?.name || 'Unknown Farm';
          const newNoteWithFarm = {
            ...data.note,
            farmName,
            farmId: parseInt(selectedFarmId)
          };
          
          setRecentNotes([newNoteWithFarm, ...recentNotes.slice(0, 2)]);
          setNewNote('');
          setSelectedFarmId('');
          
          // Success feedback
          
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
    } catch (error) {
      
      // Show user-friendly error message
      const errorMsg = error.message || 'Failed to add note. Please try again.';
      alert(errorMsg);
    } finally {
      setNotesLoading(false);
    }
  };

  // Check login status when component mounts
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Optimized fetch dashboard stats - all API calls in parallel
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        
        // Fetch ALL data in parallel for maximum performance
        const [userProfileData, cropData, farmData, scanData, healthData] = await Promise.all([
          getRequest('/profile/me'),
          getRequest('/crops/crops'),
          getRequest('/farms/'),
          getRequest('/disease-scans/scans/stats'),
          getRequest('/analytics/crop-health')
        ]);
        
        // Process user profile
        if (userProfileData?.user) {
          setUser(userProfileData.user);
        }
        
        // Process crop data
        if (cropData?.crops) {
          const crops = cropData.crops;
          setCropCount(crops.length || 0);
          setCropsData({
            total: crops.length || 0,
            healthy: crops.filter(crop => crop.status === 'Healthy').length || 0,
            needsAttention: crops.filter(crop => crop.status === 'Needs Attention').length || 0,
            harvested: crops.filter(crop => crop.status === 'Harvested').length || 0
          });
        }
        
        // Process farm data and fetch notes in parallel
        if (farmData?.farms) {
          setFarmCount(farmData.farms.length || 0);
          setFarms(farmData.farms || []);
          
          // Fetch notes asynchronously without blocking UI
          fetchRecentNotes(farmData.farms).catch(console.error);
        }
        
        // Process scan count
        if (scanData) {
          setScanCount(scanData.totalScans || 0);
        }
        
        // Process health data - using same calculation as Analytics page
        if (healthData?.length > 0) {
          const avgHealth = (healthData.reduce((sum, crop) => sum + (crop.health_score || 0), 0) / healthData.length);
          setAverageHealth(Math.round(avgHealth * 10) / 10); // Round to 1 decimal place like Analytics
        } else {
          setAverageHealth(0); // Default when no health data
        }
        
      } catch (error) {
        
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, [navigate, fetchRecentNotes]);
  
  // Get farming advice based on weather conditions
  function getFarmingAdvice(weather) {
    if (!weather) return "Weather conditions are favorable for most farming activities.";
    
    const temp = weather.main?.temp;
    const condition = weather.weather?.[0]?.main?.toLowerCase();
    const windSpeed = weather.wind?.speed;
    
    if (temp > 35) return "Extreme heat alert! Irrigate early morning or evening only.";
    if (temp > 30) return "High temperatures! Water crops thoroughly in the morning.";
    if (temp < 5) return "Cold conditions. Protect frost-sensitive crops with covers.";
    if (condition === "rain") return "Natural irrigation occurring. Skip manual watering.";
    if (condition === "thunderstorm") return "Storm alert! Secure infrastructure and delay spraying.";
    if (condition === "snow") return "Freezing conditions. Protect roots with mulch.";
    if (windSpeed > 10) return "Strong winds! Delay spraying operations.";
    
    return "Weather conditions are favorable for most farming activities.";
  }

  // Get weekly farming tips based on season and current date
  function getWeeklyFarmingTip() {
    const today = new Date();
    const month = today.getMonth(); // 0-11
    const tips = [
      // September tips (month 8)
      "Perfect time for fall planting - start cool-season vegetables like lettuce and spinach.",
      "Harvest summer crops before first frost. Check weather forecasts regularly.",
      "Plant cover crops to improve soil health over winter.",
      
      // October tips (month 9) 
      "Prepare frost protection for tender plants. Have row covers ready.",
      "Continue harvesting root vegetables - they sweeten after light frost.",
      "Clean up garden beds and compost healthy plant materials.",
      
      // General tips for other seasons
      "Monitor soil moisture levels - consistency is key for healthy crops.",
      "Rotate crops to prevent disease buildup and maintain soil fertility.",
      "Keep detailed records of planting dates and harvest yields for planning.",
      "Check for pest signs early - prevention is easier than treatment.",
      "Maintain tools and equipment for optimal performance and longevity."
    ];
    
    // Select tip based on current month and day for variety
    const tipIndex = (month + today.getDate()) % tips.length;
    return tips[tipIndex];
  }

  // Optimized function to load weather data from localStorage
  const loadWeatherDataFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('weatherData');
      if (!saved) return null;
      
      const weatherCache = JSON.parse(saved);
      const now = Date.now(); // More efficient than new Date().getTime()
      const cacheAge = now - weatherCache.timestamp;
      const CACHE_EXPIRY = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
      
      // Check if cache is still valid (not older than 3 hours)
      if (cacheAge < CACHE_EXPIRY) {
        return weatherCache; // Return full cache including forecast
      }
      return null;
    } catch (err) {
      
      return null;
    }
  };

  // Function to fetch forecast data from OpenWeather API
  const fetchForecastData = async (location = 'Delhi') => {
    try {
      const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
      
      // Try to get coordinates first
      let lat, lon;
      
      // Try geolocation if available
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          lat = position.coords.latitude;
          lon = position.coords.longitude;
        } catch (geoError) {
          
        }
      }
      
      // If no geolocation, use city name
      if (!lat || !lon) {
        const geoRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${API_KEY}`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          lat = geoData.coord.lat;
          lon = geoData.coord.lon;
        } else {
          throw new Error('Failed to get location coordinates');
        }
      }
      
      // Fetch forecast using One Call API
      const forecastRes = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,alerts&appid=${API_KEY}`);
      
      if (!forecastRes.ok) {
        throw new Error('Failed to fetch forecast data');
      }
      
      const forecastData = await forecastRes.json();
      return forecastData.daily ? forecastData.daily.slice(1, 4) : []; // Next 3 days (skip today)
      
    } catch (error) {
      
      return null;
    }
  };

  // Optimized weather data loading effect
  useEffect(() => {
    // Function to load the latest weather data (optimized for performance)
    const loadLatestWeatherData = () => {
      // Check cache first (synchronous and fast)
      const cachedData = loadWeatherDataFromLocalStorage();
      if (cachedData) {
        setWeatherData(cachedData.current);
        setIsWeatherLoading(false);
        
        // Load forecast data from cache
        if (cachedData.forecast && Array.isArray(cachedData.forecast)) {
          setForecastData(cachedData.forecast.slice(1, 4)); // Next 3 days
        }
        return;
      }
      
      // If no cache, set default immediately to avoid blocking
      setWeatherData({
        main: { temp: 30 }, // Default 30°C
        weather: [{ main: 'Clear', description: 'Sunny day' }],
        name: 'Your Location'
      });
      setIsWeatherLoading(false);
      
      // Fetch fresh data in background (non-blocking)
      fetchForecastData().then(forecast => {
        if (forecast) {
          setForecastData(forecast);
        }
      }).catch(console.error);
    };

    // Load weather data immediately (non-blocking)
    loadLatestWeatherData();

    // Set up event listener for weather updates from Weather page
    const handleWeatherUpdate = (event) => {
      if (event.detail && event.detail.current) {
        setWeatherData(event.detail.current);
      }
    };

    // Add event listener
    window.addEventListener('weatherDataUpdated', handleWeatherUpdate);

    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener('weatherDataUpdated', handleWeatherUpdate);
    };
  }, []);



  return (
    <Layout isLoggedIn={true}>
      <Container maxWidth="xl" sx={{ 
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2, md: 3 }
      }}>
        {/* Welcome Section */}
        <Box mb={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h4" fontWeight={700} color="#171717">
              {t('welcomeBack')}, {user.name || t('farmer')}!
            </Typography>
            <Typography color="text.secondary">
              Here's what's happening with your farms today.
            </Typography>
          </motion.div>

          {/* Farm Stats Section */}
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { 
                xs: 'repeat(1, 1fr)', 
                sm: 'repeat(2, 1fr)', 
                md: 'repeat(2, 1fr)', 
                lg: 'repeat(4, 1fr)' 
              },
              gap: { xs: 2, sm: 3, md: 3 },
              mt: { xs: 3, sm: 4 }
            }}
          >
            {isLoading ? (
              // Loading skeletons for stats
              [...Array(4)].map((_, index) => (
                <Card 
                  key={index}
                  elevation={0}
                  sx={{ 
                    borderRadius: 4,
                    border: '1px solid #e5e7eb',
                    p: { xs: 2, sm: 1.5 },
                    minHeight: { xs: 120, sm: 100, md: 110 }
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="text" width={60} height={40} />
                  </Box>
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton variant="text" width="60%" height={16} sx={{ mt: 0.5 }} />
                </Card>
              ))
            ) : farmStats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  elevation={0}
                  sx={{ 
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: `${stat.color}40`,
                    p: { xs: 2, sm: 1.5 },
                    minHeight: { xs: 120, sm: 100, md: 110 },
                    cursor: stat.clickable ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    '&:hover': stat.clickable ? {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                      borderColor: stat.color
                    } : {},
                    '&:active': stat.clickable ? {
                      transform: 'scale(0.98)',
                      backgroundColor: `${stat.color}05`
                    } : {},
                    '@media (hover: none)': {
                      '&:hover': {
                        transform: 'none'
                      }
                    }
                  }}
                  onClick={stat.clickable ? () => navigate(stat.path) : undefined}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 1.5 } }}>
                    <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 1.5 }} mb={1}>
                      <Avatar
                        sx={{ 
                          bgcolor: `${stat.color}20`, 
                          color: stat.color,
                          width: { xs: 38, sm: 42 },
                          height: { xs: 38, sm: 42 }
                        }}
                      >
                        {stat.icon}
                      </Avatar>
                      <Typography 
                        variant="h4" 
                        fontWeight="bold" 
                        color={stat.color}
                        sx={{
                          fontSize: { xs: '1.5rem', sm: '2rem' }
                        }}
                      >
                        {stat.value}
                      </Typography>
                    </Box>
                    <Typography 
                      color="text.secondary" 
                      fontWeight={600} 
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      {stat.labelKey ? t(stat.labelKey) : stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        </Box>

        {/* Crops Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Box mb={{ xs: 3, sm: 4 }}>
            <Card 
              elevation={2} 
              sx={{ 
                borderRadius: 4, 
                background: 'white',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
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
              onClick={() => navigate('/crops')}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                  <Typography 
                    variant="h5" 
                    fontWeight="bold"
                    sx={{
                      fontSize: { xs: '1.25rem', sm: '1.5rem' }
                    }}
                  >
                    Crop Monitoring
                  </Typography>
                  <ArrowUpRight size={24} color="#16a34a" />
                </Box>
                
                {/* Crops Stats Grid */}
                {isLoading ? (
                  // Loading state for crops
                  <Box 
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
                      gap: { xs: 2, sm: 3 },
                      mb: 3
                    }}
                  >
                    {[...Array(4)].map((_, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          p: { xs: 1.5, sm: 2 }, 
                          bgcolor: '#f8fafc', 
                          borderRadius: 2,
                          border: '1px solid #e5e7eb',
                          textAlign: 'center'
                        }}
                      >
                        <Skeleton variant="text" width={60} height={40} sx={{ mx: 'auto', mb: 1 }} />
                        <Skeleton variant="text" width="80%" height={20} sx={{ mx: 'auto' }} />
                      </Box>
                    ))}
                  </Box>
                ) : cropsData.total === 0 ? (
                  // Empty state for new users
                  <Box 
                    sx={{
                      textAlign: 'center',
                      py: { xs: 3, sm: 4 },
                      mb: 3
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: { xs: 60, sm: 80 }, 
                        height: { xs: 60, sm: 80 }, 
                        bgcolor: '#f0fdf4', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        border: '2px solid #bbf7d0'
                      }}
                    >
                      <Sprout size={32} color="#16a34a" />
                    </Box>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      color="#374151" 
                      mb={1}
                      sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                    >
                      No Crops Yet
                    </Typography>
                    <Typography 
                      color="text.secondary" 
                      mb={2}
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                      Start monitoring your crops to track their health and progress
                    </Typography>
                  </Box>
                ) : (
                  // Normal crops data display
                  <Box 
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
                      gap: { xs: 2, sm: 3 },
                      mb: 3
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: { xs: 1.5, sm: 2 }, 
                        bgcolor: '#f0fdf4', 
                        borderRadius: 2,
                        border: '1px solid #bbf7d0',
                        textAlign: 'center'
                      }}
                    >
                      <Typography 
                        variant="h3" 
                        fontWeight="bold" 
                        color="#16a34a"
                        sx={{
                          fontSize: { xs: '1.5rem', sm: '2rem' }
                        }}
                      >
                        {cropsData.total}
                      </Typography>
                      <Typography 
                        color="#059669" 
                        fontWeight="medium"
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        Total Crops
                      </Typography>
                    </Box>
                    
                    <Box 
                      sx={{ 
                        p: { xs: 1.5, sm: 2 }, 
                        bgcolor: '#dbeafe', 
                        borderRadius: 2,
                        border: '1px solid #93c5fd',
                        textAlign: 'center'
                      }}
                    >
                      <Typography 
                        variant="h3" 
                        fontWeight="bold" 
                        color="#2563eb"
                        sx={{
                          fontSize: { xs: '1.5rem', sm: '2rem' }
                        }}
                      >
                        {cropsData.healthy}
                      </Typography>
                      <Typography 
                        color="#1d4ed8" 
                        fontWeight="medium"
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        Healthy
                      </Typography>
                    </Box>
                    
                    <Box 
                      sx={{ 
                        p: { xs: 1.5, sm: 2 }, 
                        bgcolor: '#fef3c7', 
                        borderRadius: 2,
                        border: '1px solid #fde68a',
                        textAlign: 'center'
                      }}
                    >
                      <Typography 
                        variant="h3" 
                        fontWeight="bold" 
                        color="#d97706"
                        sx={{
                          fontSize: { xs: '1.5rem', sm: '2rem' }
                        }}
                      >
                        {cropsData.needsAttention}
                      </Typography>
                      <Typography 
                        color="#b45309" 
                        fontWeight="medium"
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        Need Attention
                      </Typography>
                    </Box>
                    
                    <Box 
                      sx={{ 
                        p: { xs: 1.5, sm: 2 }, 
                        bgcolor: '#f3e8ff', 
                        borderRadius: 2,
                        border: '1px solid #c4b5fd',
                        textAlign: 'center'
                      }}
                    >
                      <Typography 
                        variant="h3" 
                        fontWeight="bold" 
                        color="#7c3aed"
                        sx={{
                          fontSize: { xs: '1.5rem', sm: '2rem' }
                        }}
                      >
                        {cropsData.harvested}
                      </Typography>
                      <Typography 
                        color="#6d28d9" 
                        fontWeight="medium"
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        Harvested
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                {/* Action Section */}
                <Box 
                  sx={{ 
                    p: { xs: 1.5, sm: 2 }, 
                    bgcolor: '#f8fafc', 
                    borderRadius: 1.5,
                    borderLeft: '3px solid #16a34a'
                  }}
                >
                  <Typography 
                    color="#16a34a" 
                    fontWeight="medium"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    <b>Click to manage crops:</b> Add new crops, track health status, monitor growth progress, and view detailed reports
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </motion.div>

        {/* Main Content Grid */}
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: { 
              xs: '1fr',
              sm: '1fr',
              md: '1fr',
              lg: '2fr 1fr'
            },
            gap: { xs: 2, sm: 3, md: 4 },
            alignItems: 'start'
          }}
        >
          {/* Left Column */}
          <Box>
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 4, 
                  mb: { xs: 3, sm: 4 },
                  background: 'white',
                  position: 'relative',
                  overflow: 'hidden',
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
                <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                  <Typography 
                    variant="h5" 
                    fontWeight="bold" 
                    mb={{ xs: 2, sm: 3 }}
                    sx={{
                      fontSize: { xs: '1.25rem', sm: '1.5rem' }
                    }}
                  >
                    Quick Actions
                  </Typography>
                  <Box 
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { 
                        xs: '1fr',
                        sm: '1fr 1fr',
                        md: '1fr 1fr 1fr',
                        lg: '1fr 1fr 1fr 1fr'
                      },
                      gap: { xs: 2, sm: 2.5, md: 3 },
                      mt: 2
                    }}
                  >
                    {quickActions.map((action, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Box 
                          onClick={() => navigate(action.path)}
                          sx={{
                            p: { xs: 3, sm: 2.5, md: 3 },
                            minHeight: { xs: 120, sm: 100, md: 110 },
                            border: '2px solid #f3f4f6',
                            borderRadius: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: action.color,
                              transform: 'translateY(-2px)',
                              boxShadow: 3
                            },
                            '&:active': {
                              transform: 'scale(0.98)',
                              backgroundColor: `${action.color}05`
                            },
                            // Ensure touch targets are easily tappable
                            '@media (hover: none)': {
                              '&:hover': {
                                transform: 'none'
                              }
                            }
                          }}
                        >
                          <Box display="flex" alignItems="center" mb={2}>
                            <Avatar sx={{ bgcolor: `${action.color}20`, color: action.color, mr: 2 }}>
                              {action.icon}
                            </Avatar>
                            <Typography fontWeight="bold" color="#171717">
                              {action.titleKey ? t(action.titleKey) : action.title}
                            </Typography>
                          </Box>
                          <Typography color="text.secondary" fontSize={14}>
                            {action.descriptionKey ? t(action.descriptionKey) : action.description}
                          </Typography>
                        </Box>
                      </motion.div>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>

            {/* Expense Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 4, 
                  background: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: 'linear-gradient(90deg, #2563eb, #0284c7)',
                    zIndex: 1,
                  }
                }}
                onClick={() => navigate('/farm-ledger')}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography 
                      variant="h5" 
                      fontWeight="bold"
                      sx={{
                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                      }}
                    >
                      Farm Expenses
                    </Typography>
                    <ArrowUpRight size={24} color="#2563eb" />
                  </Box>
                  
                  <Typography 
                    variant="h3" 
                    fontWeight="bold" 
                    color="#dc2626" 
                    mb={1}
                    sx={{
                      fontSize: { xs: '2rem', sm: '2.5rem' }
                    }}
                  >
                    ₹{localStorage.getItem("plantcare_latestTotalExpense") || "0"}
                  </Typography>
                  
                  <Typography 
                    color="text.secondary" 
                    mb={2}
                    sx={{
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    Total expenses tracked
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      p: { xs: 1.5, sm: 2 }, 
                      bgcolor: '#f8fafc', 
                      borderRadius: 1.5,
                      borderLeft: '3px solid #2563eb'
                    }}
                  >
                    <Typography 
                      color="#2563eb" 
                      fontWeight="medium"
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      Click to manage your farm expenses, track spending, and view detailed reports
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Notes Widget */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 4, 
                  background: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  mt: 3,
                  height: '600px', // Increased height to show 3 notes comfortably
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
                <CardContent sx={{ 
                  p: { xs: 2, sm: 3, md: 4 },
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                    <Typography 
                      variant="h5" 
                      fontWeight="bold"
                      sx={{
                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                      }}
                    >
                      Quick Farm Notes
                    </Typography>
                    <FileText size={24} color="#f59e0b" />
                  </Box>
                  
                  {/* Add New Note Section */}
                  <Box 
                    sx={{ 
                      p: { xs: 1.5, sm: 2 }, 
                      bgcolor: '#fffbeb', 
                      borderRadius: 2,
                      border: '1px solid #fed7aa',
                      mb: 3
                    }}
                  >
                    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={2}>
                      <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
                        <InputLabel>Select Farm</InputLabel>
                        <Select
                          value={selectedFarmId}
                          label="Select Farm"
                          onChange={(e) => setSelectedFarmId(e.target.value)}
                          disabled={farms.length === 0}
                        >
                          {farms.map((farm) => (
                            <MenuItem key={farm.id} value={farm.id.toString()}>
                              {farm.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Add a quick note about your farm..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      multiline
                      rows={2}
                      sx={{ mb: 2 }}
                    />
                    
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Plus size={16} />}
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || !selectedFarmId || notesLoading}
                      sx={{
                        bgcolor: '#f59e0b',
                        '&:hover': { bgcolor: '#d97706' },
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      {notesLoading ? 'Adding...' : 'Add Note'}
                    </Button>
                  </Box>

                  {/* Recent Notes */}
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      mb={2}
                      sx={{ 
                        fontSize: { xs: '1rem', sm: '1.125rem' },
                        flex: '0 0 auto'
                      }}
                    >
                      Recent Notes
                    </Typography>
                    
                    <Box 
                      sx={{ 
                        flex: 1,
                        overflowY: 'auto',
                        minHeight: 0,
                        pr: 1,
                        '&::-webkit-scrollbar': {
                          width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: '#f1f1f1',
                          borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: '#d1d5db',
                          borderRadius: '3px',
                          '&:hover': {
                            background: '#9ca3af',
                          },
                        },
                      }}
                    >
                      {isLoading ? (
                        // Loading skeletons
                        [...Array(3)].map((_, index) => (
                          <Box 
                            key={index}
                            sx={{ 
                              p: 2, 
                              mb: 2, 
                              border: '1px solid #e5e7eb', 
                              borderRadius: 2,
                              bgcolor: '#f9fafb'
                            }}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Skeleton variant="text" width={100} height={16} />
                              <Skeleton variant="text" width={80} height={14} />
                            </Box>
                            <Skeleton variant="text" width="100%" height={16} />
                            <Skeleton variant="text" width="80%" height={16} />
                          </Box>
                        ))
                      ) : recentNotes.length === 0 ? (
                        // Empty state
                        <Box 
                          sx={{
                            textAlign: 'center',
                            py: 3,
                            color: 'text.secondary'
                          }}
                        >
                          <FileText size={32} color="#d1d5db" style={{ marginBottom: 8 }} />
                          <Typography variant="body2">
                            No notes yet. Add your first farm note above!
                          </Typography>
                        </Box>
                      ) : (
                        // Recent notes list
                        recentNotes.map((note, index) => (
                          <Box 
                            key={note.id || index}
                            sx={{ 
                              p: 2, 
                              mb: 2, 
                              border: '1px solid #e5e7eb', 
                              borderRadius: 2,
                              bgcolor: '#f9fafb',
                              '&:last-child': { mb: 0 }
                            }}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography 
                                variant="body2" 
                                fontWeight="bold" 
                                color="#f59e0b"
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                              >
                                {note.farmName}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                              >
                                {new Date(note.created_at).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Typography 
                              variant="body2" 
                              color="text.primary"
                              sx={{ 
                                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                lineHeight: 1.4,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {note.content}
                            </Typography>
                          </Box>
                        ))
                      )}
                    </Box>
                  </Box>

                  {/* View All Notes Link */}
                  <Box 
                    sx={{ 
                      p: { xs: 1.5, sm: 2 }, 
                      bgcolor: '#f8fafc', 
                      borderRadius: 1.5,
                      borderLeft: '3px solid #f59e0b',
                      mt: 2
                    }}
                  >
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => navigate('/active-farms')}
                      sx={{
                        color: '#f59e0b',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        p: 0
                      }}
                    >
                      View all notes in Active Farms →
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Box>
          {/* End Left column */}

          {/* Right Column */}
          <Box>
            {/* Weather Widget */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card 
                elevation={2} 
                sx={{ 
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 
                  borderRadius: 4, 
                  mb: { xs: 3, sm: 4 }, 
                  overflow: 'hidden'
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="space-between" 
                    mb={{ xs: 1.5, sm: 2 }}
                    sx={{
                      flexDirection: { xs: 'row', sm: 'row' }
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      fontWeight="bold" 
                      color="white"
                      sx={{
                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                      }}
                    >
                      Today's Weather
                    </Typography>
                    {isWeatherLoading ? (
                      <Skeleton variant="circular" width={28} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                    ) : weatherData ? (
                      getWeatherIcon(weatherData.weather?.[0]?.main, 28)
                    ) : (
                      <Sun size={28} color="white" />
                    )}
                  </Box>
                  {isWeatherLoading ? (
                    <Skeleton variant="text" width={120} height={60} sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 1 }} />
                  ) : (
                    <Typography 
                      variant="h3" 
                      fontWeight="bold" 
                      color="white" 
                      mb={1}
                      sx={{
                        fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                      }}
                    >
                      {weatherData ? `${Math.round(weatherData.main?.temp)}°C` : "30°C"}
                    </Typography>
                  )}
                  {isWeatherLoading ? (
                    <Skeleton variant="text" width={100} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 1 }} />
                  ) : (
                    <Typography 
                      color="rgba(255,255,255,0.8)" 
                      mb={1} 
                      fontWeight="medium"
                      sx={{
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}
                    >
                      {weatherData ? weatherData.weather?.[0]?.description : "Sunny day"}
                    </Typography>
                  )}
                  <Box 
                    display="flex" 
                    gap={{ xs: 2, sm: 3 }} 
                    mb={{ xs: 1.5, sm: 2 }}
                    sx={{
                      flexDirection: { xs: 'column', sm: 'row' }
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <Droplets size={18} color="rgba(255,255,255,0.8)" />
                      <Typography 
                        ml={0.8} 
                        color="rgba(255,255,255,0.8)" 
                        fontWeight="medium"
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        {weatherData ? `${weatherData.main?.humidity}% Humidity` : "65% Humidity"}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <CloudRain size={18} color="rgba(255,255,255,0.8)" />
                      <Typography 
                        ml={0.8} 
                        color="rgba(255,255,255,0.8)" 
                        fontWeight="medium"
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        {weatherData && weatherData.rain ? `${Math.round(weatherData.rain['1h'] || 0)}mm Rain` : "20% Rain"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ 
                    p: { xs: 1.5, sm: 2 }, 
                    mt: { xs: 1, sm: 1.5 },
                    bgcolor: 'rgba(255,255,255,0.15)', 
                    borderRadius: 1.5,
                    borderLeft: '3px solid rgba(255,255,255,0.5)'
                  }}>
                    <Typography 
                      color="white" 
                      fontWeight="medium"
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      <b>Farming Advice:</b> {getFarmingAdvice(weatherData)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mini 3-Day Forecast */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 4, 
                  mb: { xs: 3, sm: 4 },
                  background: 'white'
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    mb={2}
                    color="#374151"
                    sx={{
                      fontSize: { xs: '1rem', sm: '1.125rem' }
                    }}
                  >
                    3-Day Forecast
                  </Typography>
                  
                  <Box 
                    display="grid" 
                    gridTemplateColumns="repeat(3, 1fr)" 
                    gap={1.5}
                  >
                    {isWeatherLoading ? (
                      // Loading skeletons for forecast
                      [...Array(3)].map((_, index) => (
                        <Box 
                          key={index}
                          sx={{ 
                            p: 1.5, 
                            bgcolor: '#f8fafc', 
                            borderRadius: 2,
                            textAlign: 'center'
                          }}
                        >
                          <Skeleton variant="text" width="80%" height={16} sx={{ mx: 'auto', mb: 1 }} />
                          <Skeleton variant="circular" width={32} height={32} sx={{ mx: 'auto', mb: 1 }} />
                          <Skeleton variant="text" width={40} height={20} sx={{ mx: 'auto', mb: 0.5 }} />
                          <Skeleton variant="text" width={60} height={14} sx={{ mx: 'auto' }} />
                        </Box>
                      ))
                    ) : forecastData.length > 0 ? (
                      // Real forecast data from API
                      forecastData.map((forecast, index) => (
                        <Box 
                          key={index}
                          sx={{ 
                            p: 1.5, 
                            bgcolor: '#f8fafc', 
                            borderRadius: 2,
                            textAlign: 'center',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: '#f1f5f9',
                              transform: 'translateY(-1px)'
                            }
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            fontWeight="600" 
                            color="#374151"
                            mb={1}
                            sx={{
                              fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                          >
                            {new Date(forecast.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                          </Typography>
                          
                          <Box 
                            display="flex" 
                            justifyContent="center" 
                            mb={1}
                          >
                            {getWeatherIcon(forecast.weather[0].main, 24)}
                          </Box>
                          
                          <Box 
                            display="flex" 
                            justifyContent="center" 
                            alignItems="center" 
                            gap={0.5}
                            mb={0.5}
                          >
                            <Typography 
                              variant="body2" 
                              fontWeight="bold" 
                              color="#374151"
                              sx={{
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                              }}
                            >
                              {Math.round(forecast.temp.max)}°
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="#6b7280"
                              sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                              }}
                            >
                              /{Math.round(forecast.temp.min)}°
                            </Typography>
                          </Box>
                          
                          <Typography 
                            variant="caption" 
                            color="#6b7280"
                            sx={{
                              fontSize: { xs: '0.65rem', sm: '0.75rem' },
                              lineHeight: 1.2
                            }}
                          >
                            {forecast.weather[0].description}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      // Fallback mock data when no real forecast available
                      [
                        { 
                          day: 'Tomorrow', 
                          date: new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'short' }),
                          high: 32, 
                          low: 22, 
                          condition: 'Sunny',
                          icon: 'Clear'
                        },
                        { 
                          day: new Date(Date.now() + 172800000).toLocaleDateString('en-US', { weekday: 'short' }),
                          date: new Date(Date.now() + 172800000).getDate(),
                          high: 28, 
                          low: 19, 
                          condition: 'Partly Cloudy',
                          icon: 'Clouds'
                        },
                        { 
                          day: new Date(Date.now() + 259200000).toLocaleDateString('en-US', { weekday: 'short' }),
                          date: new Date(Date.now() + 259200000).getDate(),
                          high: 25, 
                          low: 16, 
                          condition: 'Rain',
                          icon: 'Rain'
                        }
                      ].map((forecast, index) => (
                        <Box 
                          key={index}
                          sx={{ 
                            p: 1.5, 
                            bgcolor: '#f8fafc', 
                            borderRadius: 2,
                            textAlign: 'center',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: '#f1f5f9',
                              transform: 'translateY(-1px)'
                            }
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            fontWeight="600" 
                            color="#374151"
                            mb={1}
                            sx={{
                              fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                          >
                            {index === 0 ? 'Tomorrow' : forecast.day}
                          </Typography>
                          
                          <Box 
                            display="flex" 
                            justifyContent="center" 
                            mb={1}
                          >
                            {getWeatherIcon(forecast.icon, 24)}
                          </Box>
                          
                          <Box 
                            display="flex" 
                            justifyContent="center" 
                            alignItems="center" 
                            gap={0.5}
                            mb={0.5}
                          >
                            <Typography 
                              variant="body2" 
                              fontWeight="bold" 
                              color="#374151"
                              sx={{
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                              }}
                            >
                              {forecast.high}°
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="#6b7280"
                              sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                              }}
                            >
                              /{forecast.low}°
                            </Typography>
                          </Box>
                          
                          <Typography 
                            variant="caption" 
                            color="#6b7280"
                            sx={{
                              fontSize: { xs: '0.65rem', sm: '0.75rem' },
                              lineHeight: 1.2
                            }}
                          >
                            {forecast.condition}
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Box>

                  {/* Forecast Tips */}
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      mt: 2,
                      bgcolor: '#eff6ff', 
                      borderRadius: 1.5,
                      borderLeft: '3px solid #3b82f6'
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      color="#1e40af"
                      fontWeight="medium"
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
                      }}
                    >
                      💡 <b>Planning Tip:</b> {getWeeklyFarmingTip()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Box>
          {/* End Right Column */}
        </Box>
      </Container>
    </Layout>
  );
}
