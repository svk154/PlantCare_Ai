import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Alert, Stack, Switch, 
  TextField, FormControlLabel, Container, IconButton, Autocomplete, InputAdornment } from '@mui/material';
import { CloudRain, Sun, Droplets, Search, MapPin, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

// OpenWeather API key loaded from environment variables
const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;

// Function to load search history from localStorage
// eslint-disable-next-line no-unused-vars
function loadSearchHistory() {
  try {
    const saved = localStorage.getItem('weatherSearchHistory');
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    
    return [];
  }
}

// Function to save search history to localStorage
// eslint-disable-next-line no-unused-vars
function saveSearchHistory(history) {
  try {
    // Keep only the most recent 5 searches
    const limitedHistory = history.slice(0, 5);
    localStorage.setItem('weatherSearchHistory', JSON.stringify(limitedHistory));
  } catch (err) {
    
  }
}

// Weather icon selector based on condition
function getWeatherIcon(main, size = 36) {
  switch(main?.toLowerCase()) {
    case "clear": return <Sun size={size} color="#facc15" />;
    case "clouds": return <CloudRain size={size} color="#60a5fa" strokeOpacity={0.6} />;
    case "rain": return <CloudRain size={size} color="#2563eb" />;
    case "thunderstorm": return <CloudRain size={size} color="#7c3aed" />;
    case "snow": return <CloudRain size={size} color="#e2e8f0" />;
    case "fog": 
    case "haze": return <CloudRain size={size} color="#94a3b8" strokeWidth={1.5} />;
    default: return <Sun size={size} color="#f59e0b" />;
  }
}

// Get farming advice based on weather conditions
function getFarmingAdvice(weather) {
  if (!weather) return null;
  
  const temp = weather.main?.temp;
  const condition = weather.weather?.[0]?.main?.toLowerCase();
  const windSpeed = weather.wind?.speed;
  
  if (temp > 35) return "Extreme heat alert! Irrigate early morning or evening only. Provide shade for sensitive crops.";
  if (temp > 30) return "High temperatures! Water crops thoroughly, preferably during early morning.";
  if (temp < 5) return "Cold conditions. Protect frost-sensitive crops with covers. Limit irrigation.";
  if (condition === "rain") return "Natural irrigation occurring. Skip manual watering and consider harvesting sensitive crops.";
  if (condition === "thunderstorm") return "Storm alert! Secure infrastructure and delay spraying operations.";
  if (condition === "snow") return "Freezing conditions. Protect roots with mulch and monitor greenhouse temperatures.";
  if (windSpeed > 10) return "Strong winds! Delay spraying operations and check supports for tall crops.";
  
  return "Weather conditions are favorable for most farming activities.";
}

export default function Weather() {
  const navigate = useNavigate();
  
  // Check login status when component mounts
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Popular farming regions for quick access
  const popularCities = [
    "New Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", 
    "Kolkata", "Pune", "Chandigarh", "Lucknow", "Jaipur"
  ];

  const [loc, setLoc] = useState({ city: "Delhi", lat: null, lon: null });
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [error, setError] = useState("");
  const [useGeolocation, setUseGeolocation] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [forceRefresh, setForceRefresh] = useState(false);

  // ========== GEOLOCATION ==========
  useEffect(() => {
    if (!useGeolocation) return;
    
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLoc({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            city: "Current Location"
          });
        },
        (error) => {
          
          setError("Could not get your location. Using default city.");
          setLoc(l => ({ ...l, lat: null, lon: null })); // fallback to default
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, [useGeolocation]); // re-run when user toggles geolocation
  
  // Handle search form submission
  const handleSearch = () => {
    if (searchInput.trim()) {
      // When searching a new location, we should force a refresh
      setLoc({ city: searchInput, lat: null, lon: null });
      setForceRefresh(true);
      setSearchInput("");
    } else {
      setError("Please enter a location to search");
    }
  };
  
  // Handle city selection from autocomplete
  const handleCitySelect = (city) => {
    if (!city) return;
    // When selecting a new city, we should force a refresh
    setLoc({ city: city, lat: null, lon: null });
    setForceRefresh(true);
    setSearchInput("");
  };

  // Function to save weather data to localStorage
  const saveWeatherDataToLocalStorage = (current, forecast, hourly) => {
    try {
      // Make sure we only save valid data
      if (!current) {
        
        return;
      }
      
      const weatherCache = {
        current,
        forecast: Array.isArray(forecast) ? forecast : [],
        hourly: Array.isArray(hourly) ? hourly : [],
        timestamp: new Date().getTime(), // Add timestamp for cache expiration
        location: loc.city
      };
      localStorage.setItem('weatherData', JSON.stringify(weatherCache));
      
      
      // Dispatch a custom event to notify other components that weather data has changed
      const weatherUpdateEvent = new CustomEvent('weatherDataUpdated', { detail: weatherCache });
      window.dispatchEvent(weatherUpdateEvent);
    } catch (err) {
      
    }
  };

  // Function to load weather data from localStorage
  const loadWeatherDataFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('weatherData');
      if (!saved) return null;
      
      const weatherCache = JSON.parse(saved);
      
      // Validate the cache structure
      if (!weatherCache || !weatherCache.timestamp || !weatherCache.location) {
        
        localStorage.removeItem('weatherData');
        return null;
      }
      
      const now = new Date().getTime();
      const cacheAge = now - weatherCache.timestamp;
      const CACHE_EXPIRY = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
      
      // Check if cache is still valid (not older than 3 hours and same location)
      if (cacheAge < CACHE_EXPIRY && weatherCache.location === loc.city) {
        return weatherCache;
      }
      return null;
    } catch (err) {
      
      localStorage.removeItem('weatherData'); // Clear invalid cache
      return null;
    }
  };

  // ========== WEATHER FETCH ==========
  useEffect(() => {
    async function fetchWeather() {
      // Try to get data from cache first if we're not forcing a refresh
      const cachedData = loadWeatherDataFromLocalStorage();
      if (cachedData && !forceRefresh) {
        setCurrent(cachedData.current || null);
        setForecast(Array.isArray(cachedData.forecast) ? cachedData.forecast : []);
        setHourly(Array.isArray(cachedData.hourly) ? cachedData.hourly : []);
        setLoading(false);
        // Reset forceRefresh flag after using it
        if (forceRefresh) setForceRefresh(false);
        return;
      }
      
      setLoading(true);
      setError("");
      try {
        let lat = loc.lat, lon = loc.lon, city = loc.city;
        
        // If no coords yet, fetch by city to get them
        if (!lat || !lon) {
          
          const res1 = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`);
          const data1 = await res1.json();
          
          if (data1.cod !== 200) {
            throw new Error(data1.message || "Failed to fetch weather data for this location");
          }
          
          lat = data1.coord.lat;
          lon = data1.coord.lon; 
          city = data1.name;
          setCurrent(data1);
        } else {
          // If coords, fetch current conditions by lat/lon
          
          const res1 = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
          const data1 = await res1.json();
          
          if (data1.cod !== 200) {
            throw new Error(data1.message || "Failed to fetch weather data for these coordinates");
          }
          
          setCurrent(data1);
        }

        // 7-day/hourly via One Call API (now called OpenWeather 3.0)
        
        const res2 = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,alerts&appid=${API_KEY}`);
        const data2 = await res2.json();
        
        let dailyData = [];
        let hourlyData = [];
        
        // Check if we got valid forecast data
        if (data2.daily && Array.isArray(data2.daily)) {
          dailyData = data2.daily.slice(0, 7);
          setForecast(dailyData);
        } else {
          
          setForecast([]);
        }
        
        // Check if we got valid hourly data
        if (data2.hourly && Array.isArray(data2.hourly)) {
          hourlyData = data2.hourly.slice(0, 24); // Next 24 hours
          setHourly(hourlyData);
        } else {
          
          setHourly([]);
        }
        
        // Save successfully fetched weather data to localStorage
        saveWeatherDataToLocalStorage(current, dailyData, hourlyData);
      } catch (e) {
        
        setError("Unable to fetch weather data: " + (e.message || "Unknown error occurred"));
      } finally {
        setLoading(false);
      }
    }
    
    fetchWeather();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.lat, loc.lon, loc.city, forceRefresh]); // re-run if coords, city change, or manual refresh requested

  // Format hourly and daily for recharts
  const hourlyChart = hourly && Array.isArray(hourly) ? hourly.map(h => ({
    time: new Date(h.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temp: h.temp,
    rain: h.rain ? h.rain['1h'] : 0
  })) : [];

  // eslint-disable-next-line no-unused-vars
  const dailyChart = forecast && Array.isArray(forecast) ? forecast.map(d => ({
    day: new Date(d.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' }),
    temp: d.temp.day,
    min: d.temp.min,
    max: d.temp.max,
    rain: d.rain || 0
  })) : [];

  return (
    <Layout isLoggedIn={true}>
      <Box sx={{ 
        bgcolor: "#f8fafc", 
        minHeight: "calc(100vh - 64px)"
      }}>
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Typography variant="h4" fontWeight={800} color="#0f172a">
                  Weather Intelligence
                </Typography>
                <Typography color="text.secondary">
                  Farm-specific forecasts and agricultural insights
                </Typography>
              </motion.div>
            </Box>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'center' }} gap={2}>
              {/* Refresh button */}
              <IconButton 
                color="primary" 
                onClick={() => setForceRefresh(true)}
                sx={{ mr: 1 }}
                disabled={loading}
                title="Refresh weather data"
              >
                <RefreshCw size={20} />
              </IconButton>
              
              {/* Search bar with autocomplete */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Autocomplete
                  freeSolo
                  options={popularCities}
                  sx={{ width: { xs: '100%', sm: 250 } }}
                  value={searchInput}
                  onChange={(_, newValue) => {
                    if (newValue) handleCitySelect(newValue);
                  }}
                  onInputChange={(_, newInputValue) => {
                    setSearchInput(newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search location..."
                      variant="outlined"
                      fullWidth
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search size={18} />
                          </InputAdornment>
                        )
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleSearch();
                      }}
                    />
                  )}
                />
                
                <IconButton 
                  color="primary" 
                  onClick={handleSearch}
                  sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                >
                  <Search size={20} />
                </IconButton>
              </Box>
              
              <FormControlLabel
                control={<Switch checked={useGeolocation} onChange={e => setUseGeolocation(e.target.checked)} />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <MapPin size={16} />
                    <Typography variant="body2">
                      {useGeolocation ? "Using my location" : "Use my location"}
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Box>
          
          {/* Current */}
          <Card sx={{ mb: 4, borderRadius: 4 }} elevation={3}>
            <CardContent sx={{ py: 4 }}>
              {loading ? (
                <Box display="flex" py={7} alignItems="center" justifyContent="center">
                  <CircularProgress color="primary" />
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : current && (
                <Box>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Box display="flex" alignItems="center" gap={4} mb={3}>
                      <Box flexGrow={1}>
                        <Typography variant="h4" fontWeight="bold">
                          {current.name} {current.sys?.country && `(${current.sys.country})`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {localStorage.getItem('weatherData') ? 
                            `Last updated: ${new Date(JSON.parse(localStorage.getItem('weatherData')).timestamp).toLocaleString()}` : 
                            "No previous data"}
                        </Typography>
                        <Typography color="text.secondary">
                          {new Date().toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h3" fontWeight="bold">
                          {Math.round(current.main?.temp)}°C
                        </Typography>
                        <Typography color="text.secondary">
                          Feels like {Math.round(current.main?.feels_like)}°C
                        </Typography>
                      </Box>
                      <Box sx={{ fontSize: 48 }}>
                        {getWeatherIcon(current.weather?.[0]?.main, 64)}
                      </Box>
                    </Box>

                    <Box display="flex" flexWrap="wrap" gap={2}>
                      <Card sx={{ flexGrow: 1, minWidth: 200, bgcolor: '#f0f9ff' }}>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">Weather</Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="h6">{current.weather?.[0]?.main}</Typography>
                            <Typography variant="body2">({current.weather?.[0]?.description})</Typography>
                          </Box>
                        </CardContent>
                      </Card>

                      <Card sx={{ flexGrow: 1, minWidth: 200, bgcolor: '#f0fdf4' }}>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">Humidity</Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Droplets size={20} color="#10b981" />
                            <Typography variant="h6">{current.main?.humidity}%</Typography>
                          </Box>
                        </CardContent>
                      </Card>

                      <Card sx={{ flexGrow: 1, minWidth: 200, bgcolor: '#fffbeb' }}>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">Wind</Typography>
                          <Typography variant="h6">
                            {current.wind?.speed} m/s {current.wind?.deg && `(${current.wind.deg}°)`}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>

                    <Box mt={4}>
                      <Typography variant="h6" fontWeight="bold" mb={2}>
                        Agricultural Advice
                      </Typography>
                      <Alert severity="info">
                        {getFarmingAdvice(current)}
                      </Alert>
                    </Box>
                  </motion.div>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Hourly forecast */}
          {!loading && !error && hourly && hourly.length > 0 && (
            <Card sx={{ mb: 4, p: 2, borderRadius: 4 }} elevation={3}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>24-Hour Forecast</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hourlyChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" label={{ value: 'Rain (mm)', angle: 90, position: 'insideRight' }} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="temp" 
                        stroke="#0ea5e9" 
                        dot={false}
                        name="Temperature" 
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="rain" 
                        stroke="#0f766e" 
                        dot={false}
                        name="Rain"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* 7-day forecast */}
          {!loading && !error && forecast && forecast.length > 0 && (
            <Card sx={{ mb: 4, borderRadius: 4 }} elevation={3}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>7-Day Forecast</Typography>
                <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
                  {forecast.map((day, index) => (
                    <Card 
                      variant="outlined" 
                      key={index} 
                      sx={{ 
                        minWidth: 160, 
                        flex: '0 0 auto'
                      }}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                          <Typography fontWeight="bold">
                            {new Date(day.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' })}
                          </Typography>
                          {getWeatherIcon(day.weather?.[0]?.main, 28)}
                        </Box>
                        <Box display="flex" gap={2} alignItems="center" justifyContent="space-between">
                          <Typography variant="h6">{Math.round(day.temp.day)}°C</Typography>
                          <Typography color="text.secondary" variant="body2">
                            {Math.round(day.temp.min)}° / {Math.round(day.temp.max)}°
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {day.weather?.[0]?.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Additional Agricultural Insights */}
          {!loading && !error && current && (
            <Card sx={{ mb: 4, borderRadius: 4 }} elevation={3}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Agricultural Insights
                </Typography>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Irrigation Recommendation
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: "#f0f9ff", borderRadius: 2 }}>
                      {current.main?.humidity < 40 ? (
                        <Typography>
                          <b>Water needed.</b> Low humidity and dry conditions require irrigation for optimal crop growth.
                        </Typography>
                      ) : current.main?.humidity > 80 ? (
                        <Typography>
                          <b>No irrigation needed.</b> High humidity levels indicate adequate moisture for most crops.
                        </Typography>
                      ) : (
                        <Typography>
                          <b>Moderate irrigation may be required</b> depending on specific crop needs and soil conditions.
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Planting Conditions
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: "#f0fdf4", borderRadius: 2 }}>
                      {current.main?.temp > 30 ? (
                        <Typography>
                          <b>Hot conditions:</b> Consider heat-resistant crops. Plant during early morning or evening.
                        </Typography>
                      ) : current.main?.temp < 10 ? (
                        <Typography>
                          <b>Cold conditions:</b> Focus on cold-hardy varieties. Protect seedlings with covers.
                        </Typography>
                      ) : (
                        <Typography>
                          <b>Favorable planting conditions</b> for most crops. Moderate temperatures are ideal for germination.
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Stack>
                <Box mt={3}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Risk Assessment
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
                    <Card sx={{ minWidth: 200, bgcolor: current.wind?.speed > 8 ? '#fff1f2' : '#f8fafc', flex: '1 0 auto' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">Wind Damage</Typography>
                        <Typography variant="h6" color={current.wind?.speed > 8 ? 'error' : 'text.primary'}>
                          {current.wind?.speed > 15 ? 'High Risk' : current.wind?.speed > 8 ? 'Medium Risk' : 'Low Risk'}
                        </Typography>
                      </CardContent>
                    </Card>
                    
                    <Card sx={{ 
                      minWidth: 200, 
                      bgcolor: current.weather?.[0]?.main.toLowerCase() === 'rain' ? '#eff6ff' : '#f8fafc',
                      flex: '1 0 auto'
                    }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">Flooding</Typography>
                        <Typography variant="h6" color={current.weather?.[0]?.main.toLowerCase() === 'rain' ? 'primary' : 'text.primary'}>
                          {current.weather?.[0]?.main.toLowerCase() === 'thunderstorm' ? 'High Risk' : 
                          current.weather?.[0]?.main.toLowerCase() === 'rain' ? 'Medium Risk' : 'Low Risk'}
                        </Typography>
                      </CardContent>
                    </Card>
                    
                    <Card sx={{ 
                      minWidth: 200, 
                      bgcolor: current.main?.temp > 35 ? '#fef2f2' : '#f8fafc',
                      flex: '1 0 auto'
                    }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">Heat Stress</Typography>
                        <Typography variant="h6" color={current.main?.temp > 35 ? 'error' : 'text.primary'}>
                          {current.main?.temp > 35 ? 'High Risk' : 
                          current.main?.temp > 30 ? 'Medium Risk' : 'Low Risk'}
                        </Typography>
                      </CardContent>
                    </Card>
                    
                    <Card sx={{ 
                      minWidth: 200, 
                      bgcolor: current.main?.temp < 5 ? '#eff6ff' : '#f8fafc',
                      flex: '1 0 auto'
                    }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">Frost Damage</Typography>
                        <Typography variant="h6" color={current.main?.temp < 0 ? 'primary' : 'text.primary'}>
                          {current.main?.temp < 0 ? 'High Risk' : 
                          current.main?.temp < 5 ? 'Medium Risk' : 'Low Risk'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>
    </Layout>
  );
}
