import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Avatar, Alert
} from '@mui/material';

import { Leaf, Edit, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();

  // ========== PROFILE STATE ==========
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');

  // Smart navigation for logo click
  const handleLogoClick = () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/dashboard'); // Go to dashboard if logged in
    } else {
      navigate('/'); // Go to home if not logged in
    }
  };

  // Fetch profile from backend on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    // Import API config and fetch profile data
    import('../utils/apiConfig').then(({ getApiBaseUrl }) => {
      const apiBaseUrl = getApiBaseUrl();
      
      return fetch(`${apiBaseUrl}/profile/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.user) {
          setProfile(data.user);
        }
      })
      .catch(err => {
        
        setError('Failed to load profile data');
      });
  }, []);

  // Profile updating logic
  const handleProfileSave = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    try {
      // Import API config for dynamic base URL
      const { getApiBaseUrl } = await import('../utils/apiConfig');
      const apiBaseUrl = getApiBaseUrl();
      
      const response = await fetch(`${apiBaseUrl}/profile/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.user) {
          setProfile(data.user);
        }
        setEditMode(false);
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      
    }
  };

  // Render
  return (
    <Box minHeight="100vh" sx={{ background: 'linear-gradient(135deg,#f0fdf4 0%,#f0f9ff 100%)' }}>
      {/* Navigation Header */}
      <Box sx={{ bgcolor: "#fff", borderBottom: '1px solid #bbf7d0', position: 'sticky', top: 0, zIndex: 50 }}>
        <Box maxWidth="xl" mx="auto" px={2} height={64} display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1} onClick={handleLogoClick} sx={{ cursor: "pointer" }}>
            <Leaf size={32} color="#16a34a" />
            <Typography fontWeight="bold" variant="h5" color="#166534">PlantCare AI</Typography>
          </Box>
        </Box>
      </Box>
      <Box maxWidth={700} mx="auto" py={6} px={2}>
        {/* Error Alert */}
        {error && (
          <Box mb={3}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Box>
        )}
        {/* Profile Card */}
        <Card elevation={4} sx={{ borderRadius: 3, mb: 5 }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar sx={{ bgcolor: "#eef6e5", color: "#16a34a", height: 56, width: 56, fontSize: 28 }}>
                {profile.name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" fontWeight={800}>{profile.name}</Typography>
            </Box>
            <Box mb={2}>
              <TextField
                label="Full Name"
                value={profile.name}
                disabled={!editMode}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                sx={{ mb: 2, width: "100%" }}
              />
              <TextField
                label="Email"
                value={profile.email}
                disabled
                sx={{ mb: 2, width: "100%" }}
              />
              <TextField
                label="Phone"
                value={profile.phone}
                disabled={!editMode}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                sx={{ mb: 2, width: "100%" }}
              />
            </Box>
            <Box display="flex" gap={2}>
              <Button
                startIcon={<Edit />}
                onClick={() => setEditMode(val => !val)}
                sx={{ color: "#15803d", borderColor: "#bbf7d0" }}
                variant="outlined"
              >
                {editMode ? "Cancel" : "Edit"}
              </Button>
              {editMode && (
                <Button
                  onClick={handleProfileSave}
                  startIcon={<Save />}
                  sx={{ bgcolor: "#16a34a", color: "white", "&:hover": { bgcolor: "#15803d" } }}
                  variant="contained"
                >
                  Save
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
