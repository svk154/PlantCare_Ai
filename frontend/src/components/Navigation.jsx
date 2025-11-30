import { useState, useEffect } from 'react';
import { AppBar, Box, Toolbar, IconButton, Typography, Button, Drawer, List, ListItem, ListItemText, ListItemIcon, Divider, Avatar, Menu, MenuItem, Tooltip } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Leaf, Menu as MenuIcon, X, User, LogOut, Settings, BarChart3, ChevronDown,
  Camera, Calculator, CloudRain, Droplets, Sprout, Users, FileText, Home, Info, BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../utils/languageContext';

// Navigation items with their icons and paths - will be translated in component
export const publicNavItems = [
  { nameKey: "home", name: "Home", path: "/", icon: <Home size={18} color="#16a34a" /> },
  { nameKey: "about", name: "About", path: "/about", icon: <Info size={18} color="#16a34a" /> },
];

export const privateNavItems = [
  { nameKey: "dashboard", name: "Dashboard", path: "/dashboard", icon: <Leaf size={18} color="#16a34a" />, description: "Farm Overview", descKey: "farmOverview" },
  { nameKey: "diseases", name: "Disease Detection", path: "/disease-detection", icon: <Camera size={18} color="#15803d" />, description: "Scan Plants", descKey: "scanPlants" },
  { nameKey: "calculator", name: "Calculators", path: "#", hasDropdown: true, icon: <Calculator size={18} color="#2563eb" />, description: "Farm Tools", descKey: "farmTools", dropdownItems: [
    { nameKey: "fertilizerCalculator", name: "Fertilizer Calculator", path: "/calculator-fertilizer", icon: <Sprout size={18} color="#16a34a" />, description: "Optimize Nutrients", descKey: "optimizeNutrients" },
    { nameKey: "pesticideCalculator", name: "Pesticide Calculator", path: "/pesticide-calculator", icon: <Droplets size={18} color="#0ea5e9" />, description: "Calculate Doses", descKey: "calculateDoses" },
    { nameKey: "profitCalculator", name: "Profit Calculator", path: "/calculator-profit", icon: <BarChart3 size={18} color="#7c3aed" />, description: "Estimate Returns", descKey: "estimateReturns" },
  ]},
  { nameKey: "cropPrediction", name: "Crop Prediction", path: "#", hasDropdown: true, icon: <Sprout size={18} color="#4CAF50" />, description: "AI Predictions", descKey: "aiPredictions", dropdownItems: [
    { nameKey: "cropRecommendation", name: "Crop Recommendation", path: "/crop-recommendation", icon: <Sprout size={18} color="#4CAF50" />, description: "Find Best Crop", descKey: "findBestCrop" },
    { nameKey: "yieldPrediction", name: "Yield Prediction", path: "/yield-prediction", icon: <BarChart3 size={18} color="#FF9800" />, description: "Predict Harvest", descKey: "predictHarvest" },
  ]},
  { nameKey: "weather", name: "Weather", path: "/weather", icon: <CloudRain size={18} color="#06b6d4" />, description: "Forecast Data", descKey: "forecastData" },
  { nameKey: "farmLedger", name: "Farm Ledger", path: "/farm-ledger", icon: <FileText size={18} color="#16a34a" />, description: "Track Expenses", descKey: "trackExpenses" },
  { nameKey: "analytics", name: "Analytics", path: "/analytics", icon: <BarChart3 size={18} color="#7c3aed" />, description: "View Insights", descKey: "viewInsights" },
  { nameKey: "forum", name: "Community", path: "/forum", icon: <Users size={18} color="#db2777" />, description: "Connect & Learn", descKey: "connectLearn" },
];

export default function Navigation({ isLoggedIn = false, showReturnToDashboard = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const [dropdownAnchorEl, setDropdownAnchorEl] = useState(null);
  const [openDropdownItem, setOpenDropdownItem] = useState(null);
  const [userData, setUserData] = useState(null);
  
  // Determine which navigation items to show based on login state
  const navItems = isLoggedIn ? privateNavItems : publicNavItems;
  
  // Get user data from localStorage and API if available
  useEffect(() => {
    if (isLoggedIn) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUserData(JSON.parse(storedUser));
        }
      } catch (error) {
        
      }
      
      const fetchUserProfile = async () => {
        try {
          const { getApiBaseUrl } = await import('../utils/apiConfig');
          const apiBaseUrl = getApiBaseUrl();
          
          const token = localStorage.getItem('access_token');
          if (!token) return;
          
          const response = await fetch(`${apiBaseUrl}/profile/me`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              setUserData(data.user);
              localStorage.setItem('user', JSON.stringify(data.user));
            }
          }
        } catch (error) {
          
        }
      };
      
      fetchUserProfile();
    }
  }, [isLoggedIn]);
  
  // Close menus when route changes
  useEffect(() => {
    setUserMenuAnchorEl(null);
    setDropdownAnchorEl(null);
    setOpenDropdownItem(null);
    setDrawerOpen(false);
  }, [location.pathname]);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleNavigation = (path) => {
    if (path && path !== '#') {
      navigate(path);
      setDrawerOpen(false);
      setDropdownAnchorEl(null);
      setOpenDropdownItem(null);
    }
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleDropdownOpen = (event, item) => {
    setDropdownAnchorEl(event.currentTarget);
    setOpenDropdownItem(item.name);
  };

  const handleDropdownClose = () => {
    setDropdownAnchorEl(null);
    setOpenDropdownItem(null);
  };

  const handleLogout = async () => {
    try {
      const { getApiBaseUrl } = await import('../utils/apiConfig');
      const apiBaseUrl = getApiBaseUrl();
      
      const token = localStorage.getItem('access_token');
      
      if (token) {
        await fetch(`${apiBaseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
      }
    } catch (error) {
      
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setUserData(null);
      handleUserMenuClose();
      setDrawerOpen(false);
      navigate('/login');
    }
  };

  const handleProfile = () => {
    navigate('/profile');
    handleUserMenuClose();
    setDrawerOpen(false);
  };

  const handleSettings = () => {
    navigate('/settings');
    handleUserMenuClose();
    setDrawerOpen(false);
  };

  const handleFarmResources = () => {
    navigate('/farm-resources');
    handleUserMenuClose();
    setDrawerOpen(false);
  };

  const renderDesktopNavItems = () => {
    return navItems.map((item) => {
      if (!item.hasDropdown) {
        return (
          <Tooltip key={item.nameKey || item.name} title={item.description || ''} placement="bottom" arrow>
            <Button
              onClick={() => handleNavigation(item.path)}
              startIcon={item.icon}
              sx={{
                color: location.pathname === item.path ? '#15803d' : 'text.primary',
                mx: 1,
                position: 'relative',
                fontWeight: location.pathname === item.path ? 600 : 400,
                '&:hover': { backgroundColor: '#f0fdf4' },
                '&::after': location.pathname === item.path ? {
                  content: '""',
                  position: 'absolute',
                  width: '70%',
                  height: '3px',
                  bottom: 0,
                  left: '15%',
                  backgroundColor: '#15803d',
                  borderRadius: '3px'
                } : {}
              }}
            >
              {item.nameKey ? t(item.nameKey) : item.name}
            </Button>
          </Tooltip>
        );
      } else {
        return (
          <Box key={item.nameKey || item.name} sx={{ position: 'relative' }}>
            <Tooltip title={item.description || ''} placement="bottom" arrow>
              <Button
                onClick={(e) => handleDropdownOpen(e, item)}
                startIcon={item.icon}
                endIcon={<ChevronDown 
                  size={16} 
                  style={{ 
                    transform: openDropdownItem === item.name ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.3s'
                  }} 
                />}
                sx={{
                  color: item.dropdownItems?.some(subItem => 
                    location.pathname === subItem.path) ? '#15803d' : 'text.primary',
                  fontWeight: item.dropdownItems?.some(subItem => 
                    location.pathname === subItem.path) ? 600 : 400,
                  mx: 1,
                  '&:hover': { backgroundColor: '#f0fdf4' }
                }}
              >
                {item.nameKey ? t(item.nameKey) : item.name}
              </Button>
            </Tooltip>
            <Menu
              anchorEl={dropdownAnchorEl}
              open={openDropdownItem === item.name}
              onClose={handleDropdownClose}
              sx={{
                mt: 1.5,
                '& .MuiPaper-root': {
                  borderRadius: 2,
                  minWidth: 220,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }
              }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
              disableScrollLock
            >
              {item.dropdownItems?.map((dropdownItem) => (
                <MenuItem 
                  key={dropdownItem.nameKey || dropdownItem.name}
                  onClick={() => handleNavigation(dropdownItem.path)}
                  sx={{ 
                    py: 1.2,
                    backgroundColor: location.pathname === dropdownItem.path ? '#f0fdf4' : 'transparent',
                    '&:hover': { backgroundColor: '#f0fdf4' }
                  }}
                >
                  <ListItemIcon>{dropdownItem.icon}</ListItemIcon>
                  <Box>
                    <Typography variant="body1" fontWeight={location.pathname === dropdownItem.path ? 600 : 400}>
                      {dropdownItem.nameKey ? t(dropdownItem.nameKey) : dropdownItem.name}
                    </Typography>
                    {dropdownItem.description && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {dropdownItem.descKey ? t(dropdownItem.descKey) : dropdownItem.description}
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        );
      }
    });
  };

  const renderMobileNavItems = () => {
    return navItems.map((item) => {
      if (!item.hasDropdown) {
        return (
          <ListItem 
            component="button"
            key={item.nameKey || item.name}
            onClick={() => handleNavigation(item.path)}
            sx={{
              borderRadius: 2,
              mb: 1,
              py: 2,
              minHeight: 56,
              bgcolor: location.pathname === item.path ? '#f0fdf4' : 'transparent',
              '&:hover': { backgroundColor: '#f7fee7' },
              '&:active': { backgroundColor: '#bbf7d0', transform: 'scale(0.98)' }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: location.pathname === item.path ? '#16a34a' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <Box>
              <Typography 
                variant="body1" 
                fontWeight={location.pathname === item.path ? 600 : 400}
                color={location.pathname === item.path ? '#16a34a' : 'text.primary'}
              >
                {item.nameKey ? t(item.nameKey) : item.name}
              </Typography>
              {item.description && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {item.descKey ? t(item.descKey) : item.description}
                </Typography>
              )}
            </Box>
          </ListItem>
        );
      } else {
        return (
          <Box key={item.nameKey || item.name}>
            <ListItem 
              component="button"
              onClick={() => setOpenDropdownItem(openDropdownItem === item.name ? null : item.name)}
              sx={{
                borderRadius: 2,
                mb: 1,
                py: 2,
                minHeight: 56,
                bgcolor: item.dropdownItems?.some(subItem => location.pathname === subItem.path) ? '#f0fdf4' : 'transparent',
                '&:hover': { backgroundColor: '#f7fee7' },
                '&:active': { backgroundColor: '#bbf7d0', transform: 'scale(0.98)' }
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 40, 
                color: item.dropdownItems?.some(subItem => location.pathname === subItem.path) ? '#16a34a' : 'inherit'
              }}>
                {item.icon}
              </ListItemIcon>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="body1"
                  fontWeight={item.dropdownItems?.some(subItem => location.pathname === subItem.path) ? 600 : 400}
                  color={item.dropdownItems?.some(subItem => location.pathname === subItem.path) ? '#16a34a' : 'text.primary'}
                >
                  {item.nameKey ? t(item.nameKey) : item.name}
                </Typography>
                {item.description && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {item.descKey ? t(item.descKey) : item.description}
                  </Typography>
                )}
              </Box>
              <ChevronDown 
                size={18} 
                style={{ 
                  transform: openDropdownItem === item.name ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.3s'
                }} 
              />
            </ListItem>
            
            {openDropdownItem === item.name && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <List disablePadding sx={{ ml: 2, borderLeft: '1px dashed #d1d5db', pl: 2 }}>
                  {item.dropdownItems?.map((dropdownItem) => (
                    <ListItem 
                      component="button"
                      key={dropdownItem.nameKey || dropdownItem.name}
                      onClick={() => handleNavigation(dropdownItem.path)}
                      sx={{
                        py: 1.5,
                        minHeight: 48,
                        borderRadius: 2,
                        mb: 0.5,
                        backgroundColor: location.pathname === dropdownItem.path ? '#f0fdf4' : 'transparent',
                        '&:hover': { backgroundColor: '#f7fee7' },
                        '&:active': { backgroundColor: '#bbf7d0', transform: 'scale(0.98)' }
                      }}
                    >
                      <ListItemIcon sx={{ 
                        minWidth: '36px', 
                        color: location.pathname === dropdownItem.path ? '#16a34a' : 'inherit' 
                      }}>
                        {dropdownItem.icon}
                      </ListItemIcon>
                      <Box>
                        <Typography 
                          variant="body2"
                          fontWeight={location.pathname === dropdownItem.path ? 600 : 400}
                          color={location.pathname === dropdownItem.path ? '#16a34a' : 'text.primary'}
                        >
                          {dropdownItem.nameKey ? t(dropdownItem.nameKey) : dropdownItem.name}
                        </Typography>
                        {dropdownItem.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {dropdownItem.descKey ? t(dropdownItem.descKey) : dropdownItem.description}
                          </Typography>
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </motion.div>
            )}
          </Box>
        );
      }
    });
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={1}
        sx={{ 
          bgcolor: 'white', 
          borderBottom: '1px solid #e5e7eb',
          zIndex: (theme) => theme.zIndex.drawer + 2, // Ensure it's above all other elements
          width: '100%',
          top: 0
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          {/* Logo */}
          <Box 
            display="flex" 
            alignItems="center" 
            sx={{ cursor: 'pointer' }}
            onClick={() => handleNavigation(isLoggedIn ? '/dashboard' : '/')}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1 }}>
              <Leaf size={28} color="#16a34a" />
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #16a34a, #059669)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                lineHeight: 1.2,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              PlantCare AI
            </Typography>
          </Box>

          {/* Desktop Navigation - Hidden on mobile */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {showReturnToDashboard ? (
              <Button
                onClick={() => handleNavigation('/dashboard')}
                startIcon={<Leaf size={18} color="#16a34a" />}
                sx={{
                  color: '#15803d',
                  fontWeight: 500,
                  '&:hover': { backgroundColor: '#dcfce7' },
                  '&:active': { backgroundColor: '#bbf7d0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
                  mx: 1
                }}
              >
                Return to Dashboard
              </Button>
            ) : (
              renderDesktopNavItems()
            )}

            {/* User menu or login button */}
            {isLoggedIn ? (
              <Box ml={2}>
                <Tooltip title="Account settings">
                  <IconButton 
                    onClick={handleUserMenuOpen} 
                    sx={{ 
                      p: 0.5,
                      border: '2px solid transparent',
                      transition: 'all 0.2s',
                      '&:hover': { border: '2px solid #dcfce7', backgroundColor: '#f0fdf4' }
                    }}
                  >
                    <Avatar sx={{ 
                      bgcolor: '#dcfce7', 
                      color: '#15803d',
                      width: 36,
                      height: 36,
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}>
                      {userData?.name ? userData.name.charAt(0).toUpperCase() : <User size={18} />}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={userMenuAnchorEl}
                  open={Boolean(userMenuAnchorEl)}
                  onClose={handleUserMenuClose}
                  sx={{
                    mt: 1.5,
                    '& .MuiPaper-root': {
                      borderRadius: 2,
                      minWidth: 200,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                    }
                  }}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  {userData && (
                    <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {userData.name || 'User'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {userData.email || 'user@example.com'}
                      </Typography>
                    </Box>
                  )}
                  <MenuItem onClick={handleProfile} sx={{ py: 1.2 }}>
                    <ListItemIcon><User size={18} /></ListItemIcon>
                    <Typography variant="body2">Profile</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleFarmResources} sx={{ py: 1.2 }}>
                    <ListItemIcon><BookOpen size={18} /></ListItemIcon>
                    <Typography variant="body2">Farm Resources</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleSettings} sx={{ py: 1.2 }}>
                    <ListItemIcon><Settings size={18} /></ListItemIcon>
                    <Typography variant="body2">Settings</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ py: 1.2 }}>
                    <ListItemIcon><LogOut size={18} /></ListItemIcon>
                    <Typography variant="body2">Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box ml={2}>
                <Button 
                  onClick={() => navigate('/login')}
                  sx={{ 
                    mr: 1,
                    color: '#15803d',
                    fontWeight: 500,
                    '&:hover': { backgroundColor: '#f0fdf4' }
                  }}
                >
                  Login
                </Button>
                <Button 
                  variant="contained"
                  onClick={() => navigate('/signup')}
                  sx={{ 
                    backgroundColor: '#16a34a',
                    '&:hover': { backgroundColor: '#15803d' },
                    borderRadius: 2,
                    fontWeight: 500
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>

          {/* Mobile menu button */}
          <IconButton
            color="inherit"
            onClick={toggleDrawer(true)}
            sx={{ 
              display: { xs: 'flex', md: 'none' },
              ml: 'auto',
              color: '#15803d',
              '&:hover': { backgroundColor: '#f0fdf4' }
            }}
          >
            <MenuIcon size={24} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        variant="temporary"
        ModalProps={{
          keepMounted: true, // Better performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '85%', sm: 350 },
            maxWidth: 400,
            bgcolor: '#fafafa',
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
            top: { xs: '56px', sm: '64px' }, // Position below the AppBar for different screen sizes
            height: { xs: 'calc(100% - 56px)', sm: 'calc(100% - 64px)' }, // Adjust height to account for AppBar
            overflow: 'auto'
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ 
            p: 3, 
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: 'white',
            borderTopLeftRadius: 16
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1 }}>
                  <Leaf size={24} color="#16a34a" />
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #16a34a, #059669)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.2,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  PlantCare AI
                </Typography>
              </Box>
              <IconButton onClick={toggleDrawer(false)} sx={{ 
                color: '#6b7280',
                '&:hover': { backgroundColor: '#f3f4f6' }
              }}>
                <X size={20} />
              </IconButton>
            </Box>
          </Box>

          {/* Navigation Items */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <List sx={{ width: '100%' }}>
              {showReturnToDashboard ? (
                <ListItem 
                  component="button"
                  onClick={() => handleNavigation('/dashboard')}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    py: 2,
                    minHeight: 56,
                    bgcolor: '#f0fdf4',
                    '&:hover': { backgroundColor: '#dcfce7' },
                    '&:active': { backgroundColor: '#bbf7d0', transform: 'scale(0.98)' }
                  }}
                >
                  <ListItemIcon>
                    <Leaf size={20} color="#16a34a" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Return to Dashboard"
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItem>
              ) : (
                renderMobileNavItems()
              )}
            </List>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {isLoggedIn ? (
            <>
              {userData && (
                <Box sx={{ mb: 2, px: 2 }}>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center', 
                    p: 2, 
                    backgroundColor: '#f0fdf4', 
                    borderRadius: 2 
                  }}>
                    <Avatar sx={{ bgcolor: '#dcfce7', color: '#15803d', width: 40, height: 40 }}>
                      {userData?.name ? userData.name.charAt(0).toUpperCase() : <User size={20} />}
                    </Avatar>
                    <Box ml={1.5}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {userData.name || 'User'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {userData.email || 'user@example.com'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
              
              <List>
                <ListItem 
                  component="button"
                  onClick={handleProfile}
                  sx={{ 
                    borderRadius: 2, 
                    mb: 1,
                    '&:hover': { backgroundColor: '#f7fee7' }
                  }}
                >
                  <ListItemIcon><User size={18} /></ListItemIcon>
                  <ListItemText primary="Profile" />
                </ListItem>
                <ListItem 
                  component="button"
                  onClick={handleFarmResources}
                  sx={{ 
                    borderRadius: 2, 
                    mb: 1,
                    '&:hover': { backgroundColor: '#f7fee7' }
                  }}
                >
                  <ListItemIcon><BookOpen size={18} /></ListItemIcon>
                  <ListItemText primary="Farm Resources" />
                </ListItem>
                <ListItem 
                  component="button"
                  onClick={handleSettings}
                  sx={{ 
                    borderRadius: 2, 
                    mb: 1,
                    '&:hover': { backgroundColor: '#f7fee7' }
                  }}
                >
                  <ListItemIcon><Settings size={18} /></ListItemIcon>
                  <ListItemText primary="Settings" />
                </ListItem>
                <ListItem 
                  component="button"
                  onClick={handleLogout}
                  sx={{ 
                    borderRadius: 2, 
                    mb: 1,
                    '&:hover': { backgroundColor: '#fef2f2' },
                    color: '#dc2626'
                  }}
                >
                  <ListItemIcon sx={{ color: '#dc2626' }}>
                    <LogOut size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItem>
              </List>
            </>
          ) : (
            <Box px={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleNavigation('/login')}
                sx={{ 
                  backgroundColor: "#16a34a",
                  color: "white",
                  borderRadius: 2,
                  py: 1.2,
                  mb: 1.5,
                  fontWeight: 500,
                  "&:hover": { 
                    backgroundColor: "#15803d",
                    boxShadow: '0 2px 10px rgba(21, 128, 61, 0.2)'
                  } 
                }}
              >
                Login
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleNavigation('/signup')}
                sx={{ 
                  borderColor: "#bbf7d0", 
                  color: "#15803d", 
                  borderRadius: 2,
                  py: 1.2,
                  fontWeight: 500,
                  "&:hover": { 
                    background: "#f0fdf4",
                    borderColor: "#86efac"
                  } 
                }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
}