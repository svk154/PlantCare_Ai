import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Switch, Button, MenuItem, Select, FormControl, InputLabel, Divider, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Alert, TextField, InputAdornment, IconButton
} from '@mui/material';

import { Leaf, Save, Download, Trash2, X, MessageSquare, Eye, EyeOff, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/languageContext';

export default function Settings() {
  const navigate = useNavigate();
  const { language, changeLanguage, t } = useLanguage();

  // Smart navigation for logo click
  const handleLogoClick = () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/dashboard'); // Go to dashboard if logged in
    } else {
      navigate('/'); // Go to home if not logged in
    }
  };

  // App settings state
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [theme, setTheme] = useState(localStorage.getItem("plantcare_theme") || "Light");

  // Notifications
  const [weatherNotif, setWeatherNotif] = useState(JSON.parse(localStorage.getItem("plantcare_weatherNotif") || "true"));
  const [diseaseNotif, setDiseaseNotif] = useState(JSON.parse(localStorage.getItem("plantcare_diseaseNotif") || "true"));
  const [communityNotif, setCommunityNotif] = useState(JSON.parse(localStorage.getItem("plantcare_communityNotif") || "true"));

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState(false);

  // Handlers: Save all settings to localStorage demo
  const handleSave = () => {
    changeLanguage(selectedLanguage);
    localStorage.setItem("plantcare_theme", theme);
    localStorage.setItem("plantcare_weatherNotif", weatherNotif);
    localStorage.setItem("plantcare_diseaseNotif", diseaseNotif);
    localStorage.setItem("plantcare_communityNotif", communityNotif);
  };

  const handleExport = () => {
    // Mock: In real app, compile real expense/transaction/log data here
    alert("Your data will be downloaded as CSV (demo only).");
    // Example: Download a CSV string as a file
    const csv = "Type,Amount,Date\nSeed,500,2025-08-18\nFertilizer,320,2025-08-19";
    const blob = new Blob([csv], {type: "text/csv"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "plantcare_data.csv";
    a.click();
  };

  // Delete Account implementation
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');
      if (!token) {
        setDeleteError('You must be logged in to delete your account');
        setDeleteLoading(false);
        return;
      }
      
      // Import API config for dynamic base URL
      const { getApiBaseUrl } = await import('../utils/apiConfig');
      const apiBaseUrl = getApiBaseUrl();
      
      // Call the delete account endpoint
      const response = await fetch(`${apiBaseUrl}/delete/account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        // Clear local storage and cookies
        localStorage.removeItem('access_token');
        
        // Close dialog
        setDeleteDialog(false);
        
        // Redirect to home page
        alert("Your account has been successfully deleted. You will be redirected to the home page.");
        navigate('/');
      } else {
        const errorData = await response.json();
        setDeleteError(errorData.error || 'Failed to delete account. Please try again.');
      }
    } catch (err) {
      
      setDeleteError('An error occurred. Please try again later.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Password change handler
  const handlePasswordChange = async () => {
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All password fields are required');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      setPasswordLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setPasswordError('You must be logged in to change your password');
        setPasswordLoading(false);
        return;
      }

      // Import API config for dynamic base URL
      const { getApiBaseUrl } = await import('../utils/apiConfig');
      const apiBaseUrl = getApiBaseUrl();

      const response = await fetch(`${apiBaseUrl}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword
        })
      });

      if (response.ok) {
        setPasswordSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const errorData = await response.json();
        setPasswordError(errorData.error || 'Failed to change password. Please try again.');
      }
    } catch (err) {
      setPasswordError('An error occurred. Please try again later.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    // Clear messages when user starts typing
    if (passwordError) setPasswordError('');
    if (passwordSuccess) setPasswordSuccess('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <Box minHeight="100vh" sx={{ background: 'linear-gradient(135deg,#f0fdf4 0%,#f0f9ff 100%)' }}>
      {/* Navigation Header */}
      <Box sx={{ bgcolor: "#fff", borderBottom: '1px solid #bbf7d0', position: 'sticky', top: 0, zIndex: 50 }}>
        <Box maxWidth="xl" mx="auto" px={2} height={64} display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1} onClick={handleLogoClick} sx={{ cursor: "pointer" }}>
            <Leaf size={32} color="#16a34a" />
            <Typography fontWeight="bold" variant="h5" color="#166534">PlantCare AI</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Leaf size={20} color="#16a34a" />}
              sx={{ color: "#16a34a", borderColor: "#bbf7d0", fontWeight: 600, ml: 2 }}
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
          </Box>
        </Box>
      </Box>
      <Box maxWidth={680} mx="auto" py={6} px={2}>
        <Typography variant="h4" fontWeight={800} mb={4}>{t('settings')}</Typography>
        

        {/* Notifications */}
        <Card elevation={3} sx={{ borderRadius: 3, mb: 5 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>{t('notifications')}</Typography>
            <Stack spacing={3}>
              <Box display="flex" alignItems="center" gap={2}>
                <Switch checked={weatherNotif} onChange={e => setWeatherNotif(e.target.checked)} />
                <Typography>{t('enableWeather')}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Switch checked={diseaseNotif} onChange={e => setDiseaseNotif(e.target.checked)} />
                <Typography>{t('enableDisease')}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Switch checked={communityNotif} onChange={e => setCommunityNotif(e.target.checked)} />
                <Typography>{t('enableCommunity')}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card elevation={3} sx={{ borderRadius: 3, mb: 5 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={700} mb={2} display="flex" alignItems="center" gap={1}>
              <Key size={20} color="#16a34a" />
              Change Password
            </Typography>
            
            {passwordError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {passwordError}
              </Alert>
            )}
            
            {passwordSuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {passwordSuccess}
              </Alert>
            )}
            
            <Stack spacing={3}>
              <TextField
                label="Current Password"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('current')}
                        edge="end"
                      >
                        {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <TextField
                label="New Password"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                fullWidth
                helperText="Password must be at least 6 characters long"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('new')}
                        edge="end"
                      >
                        {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <TextField
                label="Confirm New Password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('confirm')}
                        edge="end"
                      >
                        {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <Button
                variant="contained"
                color="primary"
                onClick={handlePasswordChange}
                disabled={passwordLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                sx={{
                  bgcolor: '#16a34a',
                  '&:hover': { bgcolor: '#15803d' },
                  alignSelf: 'flex-start',
                  px: 4,
                  py: 1.2
                }}
              >
                {passwordLoading ? 'Changing Password...' : 'Change Password'}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* App Customization */}
        <Card elevation={3} sx={{ borderRadius: 3, mb: 5 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>{t('appCustomization')}</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={4}>
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel>{t('language')}</InputLabel>
                <Select
                  value={selectedLanguage}
                  label={t('language')}
                  onChange={e => setSelectedLanguage(e.target.value)}
                >
                  <MenuItem value="English">English</MenuItem>
                  <MenuItem value="Hindi">हिन्दी (Hindi)</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 130 }}>
                <InputLabel>{t('theme')}</InputLabel>
                <Select
                  value={theme}
                  label={t('theme')}
                  onChange={e => setTheme(e.target.value)}
                >
                  <MenuItem value="Light">{t('light')}</MenuItem>
                  <MenuItem value="Dark">{t('dark')}</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card elevation={3} sx={{ borderRadius: 3, mb: 5 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>{t('dataManagement')}</Typography>
            <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ gap: 1 }}>
              <Button
                startIcon={<Download />}
                variant="outlined"
                onClick={handleExport}
              >
                {t('exportData')}
              </Button>
              <Button
                startIcon={<Trash2 />}
                color="error"
                variant="outlined"
                onClick={() => setDeleteDialog(true)}
              >
                {t('deleteAccount')}
              </Button>
              <Button
                startIcon={<MessageSquare size={20} />}
                variant="outlined"
                onClick={() => navigate('/feedback')}
              >
                {t('feedback')}
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.open('mailto:support@plantcare.ai?subject=Support Request', '_blank')}
              >
                {t('contactSupport')}
              </Button>
            </Stack>
          </CardContent>
        </Card>
        <Button
          variant="contained"
          color="success"
          size="large"
          startIcon={<Save />}
          sx={{ mt: 4, px: 6, fontWeight: 700 }}
          onClick={handleSave}
        >
          {t('saveSettings')}
        </Button>
        <Divider sx={{ my: 4 }} />
        <Alert severity="info">
          {language === 'Hindi' ? 
            <>नाम/फोन संपादित करने के लिए आपके <Button onClick={() => navigate('/profile')} sx={{color: "#118947", textTransform: 'none'}}>प्रोफाइल</Button> पर जाएं।</> :
            <>Editing name/phone can be done from your <Button onClick={() => navigate('/profile')} sx={{color: "#118947", textTransform: 'none'}}>Profile</Button>.</>
          }
        </Alert>

        {/* Delete Dialog */}
        <Dialog open={deleteDialog} onClose={() => !deleteLoading && setDeleteDialog(false)}>
          <DialogTitle>{t('deleteAccount')}</DialogTitle>
          <DialogContent>
            <Typography color="error" fontWeight={700} mb={2}>{t('deleteWarning')}</Typography>
            <Typography mb={2}>{t('deleteConfirm')}</Typography>
            <Typography variant="body2">
              {t('deleteItems')}
              <ul>
                <li>{t('farmData')}</li>
                <li>{t('transactionRecords')}</li>
                <li>{t('diseaseScanHistory')}</li>
                <li>{t('farmNotes')}</li>
                <li>{t('calculatorHistory')}</li>
                <li>{t('forumPosts')}</li>
              </ul>
            </Typography>
            {deleteError && (
              <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialog(false)} 
              startIcon={<X />} 
              disabled={deleteLoading}
            >
              {t('cancel')}
            </Button>
            <Button 
              onClick={handleDeleteAccount} 
              color="error" 
              startIcon={<Trash2 />}
              disabled={deleteLoading}
            >
              {deleteLoading ? t('deleting') : t('deleteAccount')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
