import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, MenuItem, Select, FormControl,
  Snackbar, Alert, CircularProgress, Grid
} from '@mui/material';
import { MessageSquare, Send, Check } from 'lucide-react';
import Layout from '../components/Layout';

const feedbackCategories = [
  "Bug Report",
  "Feature Request",
  "General Feedback",
  "Complaint",
  "Other"
];

export default function Feedback() {
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!category || !subject || !message) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields.',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Get API config
      const { getApiBaseUrl } = await import('../utils/apiConfig');
      const apiBaseUrl = getApiBaseUrl();
      
      const token = localStorage.getItem('access_token');
      
      // Send feedback to the API
      const response = await fetch(`${apiBaseUrl}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category,
          subject,
          message,
          email: email || undefined // Only send if provided
        })
      });
      
      if (response.ok) {
        setSubmitted(true);
        setSnackbar({
          open: true,
          message: 'Your feedback has been submitted successfully!',
          severity: 'success'
        });
        
        // Reset form
        setCategory('');
        setSubject('');
        setMessage('');
        setEmail('');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to submit feedback. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout isLoggedIn={true}>
      <Box sx={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%)' }}>
        <Box maxWidth="1000px" mx="auto" py={8} px={3}>
          <Typography variant="h3" fontWeight={800} mb={3} display="flex" alignItems="center" gap={2}>
            <MessageSquare size={40} color="#16a34a" />
            Feedback & Suggestions
          </Typography>
          
          <Typography variant="h6" color="text.secondary" mb={5} fontSize={18}>
            Help us improve PlantCare AI by sharing your thoughts, reporting issues, or suggesting new features.
          </Typography>
          
          {submitted ? (
            <Card elevation={4} sx={{ borderRadius: 0, mb: 6, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <CardContent sx={{ p: 5, textAlign: 'center' }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  bgcolor: '#dcfce7', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <Check size={50} color="#16a34a" />
                </Box>
                <Typography variant="h4" fontWeight={700} color="#166534" gutterBottom>
                  Thank You!
                </Typography>
                <Typography variant="body1" fontSize={18} color="text.secondary" mb={4}>
                  Your feedback has been submitted successfully. We appreciate your input and will review it shortly.
                </Typography>
                <Button 
                  variant="contained"
                  color="success"
                  size="large"
                  sx={{ 
                    fontSize: 16, 
                    height: '50px',
                    px: 4,
                    borderRadius: 0 // rectangular shape
                  }}
                  onClick={() => setSubmitted(false)}
                >
                  Submit Another Feedback
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card elevation={4} sx={{ borderRadius: 0, mb: 6 }}>
              <CardContent sx={{ p: 5 }}>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight={600} mb={1}  sx={{ color: 'green' }}>
                        Feedback Category *
                      </Typography>
                      <FormControl fullWidth required>
                        <Select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          displayEmpty
                          placeholder="Select a category"
                          renderValue={(selected) => {
                            if (!selected) {
                              return <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>Select a category</span>;
                            }
                            return selected;
                          }}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                borderRadius: 0
                              }
                            }
                          }}
                          sx={{ 
                            fontSize: 16,
                            borderRadius: 0,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 0,
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderRadius: 0,
                            },
                            height: '50px',
                            '& .MuiSelect-select': {
                              padding: '15px 14px',
                              display: 'flex',
                              alignItems: 'center',
                            }
                          }}
                        >
                          {feedbackCategories.map((cat) => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight={600} mb={1}  sx={{ color: 'green' }}>
                        Subject *
                      </Typography>
                      <TextField
                        required
                        fullWidth
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief summary of your feedback"
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 0,
                            height: '50px',
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: 0,
                          }
                        }}
                        InputProps={{
                          style: { 
                            fontSize: 16, 
                            padding: '15px 14px',
                            borderRadius: 0  // rectangular shape
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight={600} mb={1}  sx={{ color: 'green' }}>
                        Message *
                      </Typography>
                      <TextField
                        required
                        fullWidth
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        multiline
                        rows={5}
                        placeholder="Please provide details about your feedback, suggestion or issue"
                        variant="outlined"
                        sx={{
                          width: '180%',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 0,
                            height: '1000px',
                            minHeight: '80px',
                            maxHeight: '150px',
                            overflow: 'auto',
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: 0,
                          },
                          '& .MuiInputBase-inputMultiline': {
                            paddingTop: '20px',
                            resize: 'none'
                          }
                        }}
                        InputProps={{
                          style: { 
                            fontSize: 16,
                            borderRadius: 0  // rectangular shape
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight={600} mb={1}  sx={{ color: 'green' }}>
                        Email for Follow-up (Optional)
                      </Typography>
                      <TextField
                        fullWidth
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="We'll only use this to follow up on your feedback"
                        helperText="Leave blank if you prefer not to be contacted"
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 0,
                            height: '50px',
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: 0,
                          }
                        }}
                        InputProps={{
                          style: { 
                            fontSize: 16, 
                            padding: '15px 14px',
                            borderRadius: 0  // rectangular shape
                          }
                        }}
                        FormHelperTextProps={{
                          style: { fontSize: 14 }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={24} /> : <Send size={22} />}
                        sx={{ 
                          mt: 3,
                          height: '50px',
                          px: 6,
                          fontWeight: 600,
                          fontSize: 18,
                          background: '#16a34a',
                          borderRadius: 0, // rectangular shape
                          '&:hover': {
                            background: '#15803d'
                          }
                        }}
                      >
                        {loading ? 'Submitting...' : 'Submit Feedback'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          )}
          
          <Card elevation={4} sx={{ borderRadius: 0 }}>
            <CardContent sx={{ p: 5 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Other Ways to Reach Us
              </Typography>
              <Typography variant="body1" fontSize={16} mb={3}>
                If you prefer other communication channels, you can reach our support team through:
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" sx={{ mb: 2, fontSize: 16 }}>
                  Email: <Box component="span" fontWeight={500} fontSize={16}>support@plantcare-ai.com</Box>
                </Typography>
                <Typography component="li" sx={{ mb: 2, fontSize: 16 }}>
                  Phone: <Box component="span" fontWeight={500} fontSize={16}>+1 (555) 123-4567</Box> (Mon-Fri, 9AM-5PM)
                </Typography>
                <Typography component="li" sx={{ fontSize: 16 }}>
                  Community Forum: Visit the <Button 
                    variant="text" 
                    sx={{ p: 0, minWidth: 'auto', textTransform: 'none', fontWeight: 500, fontSize: 16 }}
                    onClick={() => window.location.href = '/forum'}
                  >Community Forum</Button> to engage with other users
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}
