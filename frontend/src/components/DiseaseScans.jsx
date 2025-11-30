import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider
} from '@mui/material';
import { 
  Camera, 
  Upload, 
  Warning, 
  CheckCircle, 
  Delete,
  PhotoCamera
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Styled components matching dashboard theme
const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '10px 20px',
}));

const UploadArea = styled(Box)(({ theme }) => ({
  border: '2px dashed #ccc',
  borderRadius: '12px',
  padding: '40px',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: 'rgba(25, 118, 210, 0.04)',
  },
  '&.dragover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
  }
}));

const ScanCard = ({ scan, onDelete, apiBaseUrl }) => {
  const { diagnosis, image, timestamp, status, processingTime } = scan;
  
  // Construct full image URL (strip out the leading /api if it exists in both apiBaseUrl and image path)
  const imageUrl = image.startsWith('http') 
    ? image 
    : image.startsWith('/api/') 
      ? `${apiBaseUrl.replace(/\/api$/, '')}${image}` 
      : `${apiBaseUrl}${image}`;
  
  const getStatusChip = () => {
    switch (status) {
      case 'completed':
        return <Chip label="Completed" color="success" size="small" />;
      case 'pending':
        return <Chip label="Processing..." color="warning" size="small" />;
      case 'failed':
        return <Chip label="Failed" color="error" size="small" />;
      default:
        return <Chip label="Unknown" color="default" size="small" />;
    }
  };

  return (
    <StyledCard sx={{ mb: 4 }}>
      <CardContent sx={{ p: 4 }}>
        {/* Header with timestamp and actions */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {timestamp}
              {processingTime && ` • Processed in ${processingTime}s`}
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            {getStatusChip()}
            <IconButton 
              size="small" 
              color="error" 
              onClick={() => onDelete(scan.id)}
              title="Delete scan"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Centered Image */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box
            component="img"
            src={imageUrl}
            alt="Scanned plant"
            sx={{
              maxWidth: '100%',
              maxHeight: 300,
              objectFit: 'contain',
              borderRadius: 2,
              boxShadow: 2
            }}
            onError={(e) => {
              e.target.src = '/placeholder-plant.svg'; // Fallback image
            }}
          />
        </Box>

        {/* Analysis Results */}
        {status === 'completed' && diagnosis && (
          <>
            {diagnosis.isConfident && diagnosis.highConfidenceResult ? (
              <Box>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Analysis Results
                  </Typography>
                  <Chip 
                    icon={<CheckCircle fontSize="small" />}
                    label={`${diagnosis.highConfidenceResult.confidenceScore || 0}% Confidence`}
                    sx={{ 
                      bgcolor: '#dcfce720',
                      color: '#16a34a',
                      fontWeight: 600
                    }}
                  />
                </Box>

                <Box mb={3}>
                  <Typography variant="h5" fontWeight="bold" color="#16a34a" gutterBottom>
                    {diagnosis.highConfidenceResult.diseaseName}
                  </Typography>
                  <Typography color="text.secondary" mb={2}>
                    {diagnosis.highConfidenceResult.description}
                  </Typography>
                </Box>
                
                {/* Divider */}
                <Divider sx={{ my: 3 }} />
                
                {/* Symptoms */}
                <Box mb={3}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Symptoms Identified:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {diagnosis.highConfidenceResult.symptoms && Array.isArray(diagnosis.highConfidenceResult.symptoms) && diagnosis.highConfidenceResult.symptoms.length > 0 
                      ? diagnosis.highConfidenceResult.symptoms.map((symptom, index) => (
                        <Chip 
                          key={index}
                          label={symptom}
                          size="small"
                          sx={{ bgcolor: '#f3f4f6' }}
                        />
                      ))
                      : <Typography color="text.secondary">No symptoms information available</Typography>
                    }
                  </Box>
                </Box>
                
                {/* Treatment */}
                <Box mb={3}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Recommended Treatment:
                  </Typography>
                  <Box>
                    {diagnosis.highConfidenceResult.treatment && Array.isArray(diagnosis.highConfidenceResult.treatment)
                      ? diagnosis.highConfidenceResult.treatment.map((step, index) => (
                        <Box key={index} display="flex" alignItems="start" mb={1}>
                          <Box sx={{ 
                            bgcolor: '#16a34a', 
                            color: 'white', 
                            borderRadius: '50%', 
                            width: 20, 
                            height: 20, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mr: 1,
                            mt: 0.5,
                            fontSize: 12
                          }}>
                            {index + 1}
                          </Box>
                          <Typography>{step}</Typography>
                        </Box>
                      ))
                      : <Typography color="text.secondary">No treatment information available</Typography>
                    }
                  </Box>
                </Box>
                
                {/* Prevention */}
                <Box>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Prevention Tips:
                  </Typography>
                  <Box>
                    {diagnosis.highConfidenceResult.prevention && Array.isArray(diagnosis.highConfidenceResult.prevention)
                      ? diagnosis.highConfidenceResult.prevention.map((tip, index) => (
                        <Box key={index} display="flex" alignItems="start" mb={1}>
                          <CheckCircle size={16} color="#16a34a" style={{ marginRight: 8, marginTop: 4 }} />
                          <Typography>{tip}</Typography>
                        </Box>
                      ))
                      : <Typography color="text.secondary">No prevention information available</Typography>
                    }
                  </Box>
                </Box>

                {/* Pesticide Products Section - Only show for diseased plants (not healthy) */}
                {diagnosis.highConfidenceResult.pesticideProducts && 
                 Array.isArray(diagnosis.highConfidenceResult.pesticideProducts) &&
                 diagnosis.highConfidenceResult.pesticideProducts.length > 0 &&
                 !diagnosis.highConfidenceResult.diseaseName?.toLowerCase().includes('healthy') && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold" mb={2} color="#047857">
                        🛒 Recommended Pesticide Products
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={3}>
                        Buy these products from trusted Indian agricultural suppliers:
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {diagnosis.highConfidenceResult.pesticideProducts.slice(0, 3).map((product, index) => (
                          <Card key={index} elevation={1} sx={{ 
                            border: '1px solid #e5e7eb',
                            borderRadius: 2,
                            transition: 'all 0.2s',
                            '&:hover': {
                              boxShadow: 3,
                              transform: 'translateY(-2px)'
                            }
                          }}>
                            <CardContent sx={{ p: 2.5 }}>
                              <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                                <Box flex={1}>
                                  <Typography variant="subtitle1" fontWeight="bold" color="#171717" gutterBottom>
                                    {product.productName}
                                  </Typography>
                                  <Chip 
                                    label={product.type || 'Pesticide'}
                                    size="small"
                                    sx={{ 
                                      bgcolor: product.type?.toLowerCase().includes('organic') ? '#dcfce7' : '#dbeafe',
                                      color: product.type?.toLowerCase().includes('organic') ? '#166534' : '#1e40af',
                                      fontWeight: 600,
                                      fontSize: '0.75rem',
                                      mb: 1
                                    }}
                                  />
                                </Box>
                              </Box>
                              
                              {product.activeIngredient && (
                                <Typography variant="body2" color="text.secondary" mb={1}>
                                  <strong>Active Ingredient:</strong> {product.activeIngredient}
                                </Typography>
                              )}
                              
                              {product.price && (
                                <Typography variant="body2" color="text.secondary" mb={1}>
                                  <strong>Price:</strong> {product.price}
                                </Typography>
                              )}
                              
                              {product.seller && (
                                <Typography variant="body2" color="text.secondary" mb={2}>
                                  <strong>Available at:</strong> {product.seller}
                                </Typography>
                              )}
                              
                              {product.purchaseUrl && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  fullWidth
                                  onClick={() => window.open(product.purchaseUrl, '_blank', 'noopener,noreferrer')}
                                  sx={{
                                    bgcolor: '#16a34a',
                                    color: 'white',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    '&:hover': {
                                      bgcolor: '#15803d'
                                    }
                                  }}
                                >
                                  Buy Now →
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                      
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="caption">
                          <strong>Note:</strong> These are AI-recommended products. Always read product labels, follow safety instructions, 
                          and consult with local agricultural experts before application.
                        </Typography>
                      </Alert>
                    </Box>
                  </>
                )}
              </Box>
            ) : (
              <Alert 
                severity="warning" 
                icon={<Warning />}
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle2" fontWeight="bold" display="flex" alignItems="center">
                  <Warning sx={{ mr: 1 }} fontSize="small" />
                  AI Confidence was Low
                </Typography>
                <Typography variant="body2" color="warning.dark" sx={{ mb: 1 }}>
                  Possible diseases identified:
                </Typography>
                <List dense>
                  {diagnosis.lowConfidenceResults?.map((item, index) => (
                    <ListItem key={index} sx={{ py: 0 }}>
                      <ListItemText 
                        primary={
                          <Typography variant="body2">
                            <strong>{item.diseaseName}</strong>
                            {item.confidenceScore && (
                              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                ({item.confidenceScore}%)
                              </Typography>
                            )}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Alert>
            )}
          </>
        )}

        {/* Pending Analysis */}
        {status === 'pending' && (
          <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" p={3}>
            <CircularProgress size={40} color="primary" />
            <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
              Analysis in progress...
            </Typography>
          </Box>
        )}

        {/* Error Message */}
        {status === 'failed' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              Analysis Failed
            </Typography>
            <Typography variant="body2">
              {scan.errorMessage || 'An error occurred during the analysis'}
            </Typography>
          </Alert>
        )}
      </CardContent>
    </StyledCard>
  );
};

const UploadModal = ({ open, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file && file.type && file.type.startsWith('image/')) {
      setSelectedFile(file);
    } else {
      
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      onClose();
    } catch (error) {
      
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PhotoCamera color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Upload Plant Image for Disease Detection
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <UploadArea
          className={dragOver ? 'dragover' : ''}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
          
          {selectedFile ? (
            <Box>
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: 200, 
                  borderRadius: 8,
                  marginBottom: 16
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </Typography>
            </Box>
          ) : (
            <Box>
              <Upload size={48} color="primary" style={{ marginBottom: 16 }} />
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                Drag & Drop Image Here
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to browse your files
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                Supports JPG, PNG and JPEG (Max: 10MB)
              </Typography>
            </Box>
          )}
        </UploadArea>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button 
          onClick={handleUploadClick} 
          variant="contained"
          disabled={!selectedFile || uploading}
          startIcon={uploading ? <CircularProgress size={16} /> : <Upload />}
        >
          {uploading ? 'Uploading...' : 'Upload and Analyze'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DiseaseScans = () => {
  const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // API Base URL (default to localhost if not set in .env)
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchScans = async () => {
    try {
      // Request 10 scans maximum as per requirement
      const response = await fetch(`${API_BASE_URL}/disease-scans/scans?limit=10`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setScans(data.scans || []);
      } else {
        
        showSnackbar('Failed to load disease scans', 'error');
      }
    } catch (error) {
      
      showSnackbar('Error loading disease scans', 'error');
    }
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_BASE_URL}/disease-scans/scans`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });

      if (response.ok) {
        showSnackbar('Image uploaded and analyzed successfully!');
        await fetchScans(); // Refresh the list
      } else {
        const errorData = await response.json();
        showSnackbar(errorData.error || 'Failed to analyze image', 'error');
      }
    } catch (error) {
      
      showSnackbar('Error uploading image', 'error');
    }
  };

  const handleDeleteScan = async (scanId) => {
    if (!window.confirm('Are you sure you want to delete this scan?')) return;

    // Optimistic UI update - remove from list immediately
    const originalScans = [...scans];
    setScans(prevScans => prevScans.filter(scan => scan.id !== scanId));

    try {
      const response = await fetch(`${API_BASE_URL}/disease-scans/scans/${scanId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        showSnackbar('Scan deleted successfully');
        // Already removed from UI, just confirm with server
        await fetchScans(); // Refresh to ensure consistency
      } else {
        // Rollback on error - restore the original list
        setScans(originalScans);
        const errorData = await response.json();
        showSnackbar(errorData.error || 'Failed to delete scan', 'error');
      }
    } catch (error) {
      // Rollback on error - restore the original list
      setScans(originalScans);
      showSnackbar('Error deleting scan', 'error');
    }
  };

  useEffect(() => {
    const loadScans = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/disease-scans/scans?limit=10`, {
          headers: getAuthHeaders()
        });
        
        if (response.ok) {
          const data = await response.json();
          setScans(data.scans || []);
        } else {
          
          showSnackbar('Failed to load disease scans', 'error');
        }
      } catch (error) {
        
        showSnackbar('Error loading disease scans', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadScans();
  }, [API_BASE_URL]);

  return (
    <Box>
      <UploadModal 
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary" display="flex" alignItems="center" gap={1}>
            <Camera fontSize="large" />
            {scans.length > 0 ? (
              <>
                <span>{scans.length}</span> Disease Scans
              </>
            ) : (
              <>Recent Disease Scans</>
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Showing up to 10 most recent scans. New scans will replace the oldest ones.
          </Typography>
        </Box>
        <StyledButton
          variant="contained"
          startIcon={<Camera />}
          onClick={() => navigate('/disease-detection')}
          color="primary"
        >
          New Scan
        </StyledButton>
      </Box>

      {loading ? (
        <Box textAlign="center" py={4}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading disease scans...
          </Typography>
        </Box>
      ) : scans.length > 0 ? (
        <Box sx={{ 
          maxHeight: '65vh', 
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
          {scans.map((scan) => (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ScanCard scan={scan} onDelete={handleDeleteScan} apiBaseUrl={API_BASE_URL} />
            </motion.div>
          ))}
        </Box>
      ) : (
        <StyledCard>
          <CardContent sx={{ py: 8, textAlign: "center" }}>
            <Camera sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" fontWeight="bold">
              You haven't performed any scans yet.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              Your most recent scans (up to 10) will appear here.
            </Typography>
            <StyledButton
              variant="contained"
              startIcon={<Camera />}
              onClick={() => navigate('/disease-detection')}
              color="primary"
            >
              Start Your First Scan
            </StyledButton>
          </CardContent>
        </StyledCard>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DiseaseScans;
