import { useState, useCallback, useEffect } from 'react';
import { Button, Box, Typography, Card, CardContent, CircularProgress, Chip, LinearProgress, Divider, Modal, Alert, List, ListItem, ListItemText, Container } from '@mui/material';
import { Leaf, Upload, Camera, CheckCircle, AlertTriangle, Info, AlertCircle as Warning } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/apiUtils';
import { isAuthenticated } from '../utils/auth';
import Layout from '../components/Layout';
import { useLanguage } from '../utils/languageContext';

export default function DiseaseDetection() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);

  // Check if camera is available
  useEffect(() => {
    const checkCameraAvailability = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(device => device.kind === 'videoinput');
        setCameraAvailable(hasCamera);
        
      } catch (err) {
        
        setCameraAvailable(false);
      }
    };
    
    checkCameraAvailability();
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Function to open camera modal
  const handleCameraCapture = async () => {
    if (!cameraAvailable) {
      
      return;
    }
    
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, // Use back camera when available
        audio: false 
      });
      
      // Store the stream and show the modal
      setCameraStream(stream);
      setShowCameraModal(true);
      
      // Need a small delay to ensure DOM is updated before setting video source
      setTimeout(() => {
        const videoElement = document.getElementById('camera-preview');
        if (videoElement) {
          videoElement.srcObject = stream;
          videoElement.play();
        }
      }, 100);
      
    } catch (err) {
      
      alert('Could not access camera. Please check permissions and try again.');
      // Fallback to regular file input if camera access fails
      document.getElementById('file-upload').click();
    }
  };
  
  // Function to capture image from camera stream
  const captureImage = () => {
    const videoElement = document.getElementById('camera-preview');
    const canvas = document.createElement('canvas');
    
    if (videoElement && videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
      // Set canvas dimensions to match video
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      // Draw the video frame to canvas
      const context = canvas.getContext('2d');
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          // Create a file object from the blob
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          
          // Close camera and modal
          closeCamera();
          
          // Create a preview
          const reader = new FileReader();
          reader.onload = (e) => {
            setUploadedImage({
              file: file,
              preview: e.target.result,
              name: 'Camera Photo'
            });
            setAnalysisResult(null);
          };
          reader.readAsDataURL(file);
        }
      }, 'image/jpeg', 0.9);
    }
  };
  
  // Function to close camera modal and clean up
  const closeCamera = () => {
    // Stop all video tracks to free up the camera
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    setCameraStream(null);
    setShowCameraModal(false);
  };

  const handleFile = (file) => {
    if (file && file.type && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage({
          file: file,
          preview: e.target.result,
          name: file.name || 'Camera Photo'
        });
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    } else {
      
    }
  };

  const analyzeImage = async () => {
    if (!uploadedImage || !uploadedImage.file) {
      
      setAnalysisResult({ error: t('selectImageFirst') || 'Please select an image first.' });
      return;
    }
    
    // Check authentication status
    if (!isAuthenticated()) {
      
      setAnalysisResult({ error: t('loginRequired') || 'You must be logged in to use this feature. Please log in and try again.' });
      setTimeout(() => navigate('/login', { state: { from: '/disease-detection', message: t('loginPrompt') || 'Please log in to analyze plant diseases' }}), 2000);
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      
      const formData = new FormData();
      formData.append('image', uploadedImage.file);
      
      // Log the FormData contents (debug only)
      
      
      // We no longer need to explicitly get the token here as apiCall handles authentication
      // const token = localStorage.getItem('access_token');
      
      
      // Upload to disease scans history and use this as our main source of result
      const scanRes = await apiRequest('/disease-scans/scans', {
        method: 'POST',
        body: formData
      });
      
      
      if (!scanRes.success) {
        // Handle specific error cases
        if (scanRes.status === 401) {
          
          localStorage.removeItem('access_token'); // Clear invalid token
          throw new Error(t('sessionExpired') || 'Your session has expired. Please log in again.');
        } else {
          throw new Error(t('uploadFailed') || `Failed to upload image (Status: ${scanRes.status})`);
        }
      }
      
      const scanData = scanRes.data;
      
      
      // Get the scan information directly from the response
      const { scan } = scanData;
      
      if (!scan) {
        throw new Error('No scan information available');
      }
      
      // Store the entire diagnosis data exactly as received from the API
      // This ensures we maintain the same format as the disease scan page
      setAnalysisResult({
        ...scan,
        // If we need to map specific fields for UI compatibility
        name: scan.diagnosis?.isConfident && scan.diagnosis?.highConfidenceResult 
          ? scan.diagnosis.highConfidenceResult.diseaseName 
          : scan.diagnosis?.lowConfidenceResults?.[0]?.diseaseName || 'Unknown Disease',
        confidence: scan.diagnosis?.isConfident && scan.diagnosis?.highConfidenceResult 
          ? scan.diagnosis.highConfidenceResult.confidenceScore 
          : scan.diagnosis?.lowConfidenceResults?.[0]?.confidenceScore || 0,
        severity: 'low', // Default to low severity if not provided
        description: scan.diagnosis?.isConfident && scan.diagnosis?.highConfidenceResult 
          ? scan.diagnosis.highConfidenceResult.description 
          : scan.diagnosis?.lowConfidenceResults?.[0]?.description || '',
        scientificName: '',  // Scientific name may not be available in the scan response
        symptoms: scan.diagnosis?.isConfident && scan.diagnosis?.highConfidenceResult 
          ? scan.diagnosis.highConfidenceResult.symptoms 
          : scan.diagnosis?.lowConfidenceResults?.[0]?.symptoms || [],
        treatment: scan.diagnosis?.isConfident && scan.diagnosis?.highConfidenceResult 
          ? scan.diagnosis.highConfidenceResult.treatment 
          : scan.diagnosis?.lowConfidenceResults?.[0]?.treatment || [],
        prevention: scan.diagnosis?.isConfident && scan.diagnosis?.highConfidenceResult 
          ? scan.diagnosis.highConfidenceResult.prevention 
          : scan.diagnosis?.lowConfidenceResults?.[0]?.prevention || [],
        // Save the raw diagnosis data so we have it in exactly the same format
        rawDiagnosis: scan.diagnosis
      });
    } catch (err) {
      
      
      // Handle authentication errors
      if (err.message.includes('session has expired') || err.message.includes('log in again')) {
        setAnalysisResult({ error: err.message });
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login', { 
            state: { from: '/disease-detection', message: 'Your session expired. Please log in again.' }
          });
        }, 2000);
      } else {
        // Handle other errors
        setAnalysisResult({ error: err.message || 'Network error. Please try again.' });
      }
    }
    
    setIsAnalyzing(false);
  };

  const getSeverityColor = (severity) => {
    if (!severity) return '#16a34a'; // Default color if severity is undefined
    
    switch(String(severity).toLowerCase()) {
      case 'high': return '#dc2626';
      case 'medium': return '#f59e0b';
      case 'low': return '#16a34a';
      default: return '#16a34a';
    }
  };

  const getSeverityIcon = (severity) => {
    if (!severity) return <CheckCircle size={20} />; // Default icon if severity is undefined
    
    switch(String(severity).toLowerCase()) {
      case 'high': return <AlertTriangle size={20} />;
      case 'medium': return <Info size={20} />;
      default: return <CheckCircle size={20} />;
    }
  };

  return (
    <Layout isLoggedIn={true}>
      <Box sx={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%)' }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          
          <Box maxWidth="xl" mx="auto">
        {/* Page Header */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight="bold" color="#171717" gutterBottom>
             {language === 'Hindi' ? 'एआई रोग पहचान' : 'AI Disease Detection'}
          </Typography>
          <Typography color="text.secondary" fontSize={18}>
            {language === 'Hindi' 
              ? 'तत्काल एआई-संचालित रोग पहचान और उपचार सिफारिशों के लिए पौधे की छवियां अपलोड करें' 
              : 'Upload plant images for instant AI-powered disease identification and treatment recommendations'}
          </Typography>
        </Box>

        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
            gap: 4
          }}
        >
          {/* Left Column - Upload & Results */}
          <Box>
            {/* Upload Section */}
            <Card elevation={2} sx={{ bgcolor: "#fff", borderRadius: 3, mb: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" mb={3}>
                  {language === 'Hindi' ? 'पौधे की छवि अपलोड करें' : 'Upload Plant Image'}
                </Typography>
                
                {!uploadedImage ? (
                  <Box
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    sx={{
                      border: dragActive ? '2px dashed #16a34a' : '2px dashed #d1d5db',
                      borderRadius: 3,
                      p: 6,
                      textAlign: 'center',
                      bgcolor: dragActive ? '#f0fdf4' : '#fafafa',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      style={{ display: 'none' }}
                      id="file-upload"
                      capture={null}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      style={{ display: 'none' }}
                      id="camera-capture"
                      capture="environment"
                    />
                    <Upload size={48} color="#6b7280" style={{ marginBottom: 16 }} />
                    <Typography variant="h6" color="text.primary" gutterBottom>
                      {language === 'Hindi' ? 'अपने पौधे की छवि यहां खींचें और छोड़ें' : 'Drag & drop your plant image here'}
                    </Typography>
                    <Typography color="text.secondary" mb={2}>
                      {language === 'Hindi' ? 'या नीचे दिए गए विकल्पों में से एक चुनें' : 'or choose one of the options below'}
                    </Typography>
                    
                    <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2} mt={3}>
                      <label htmlFor="file-upload">
                        <Button 
                          variant="outlined" 
                          component="span"
                          startIcon={<Upload size={18} />}
                          sx={{ 
                            borderColor: '#16a34a', 
                            color: '#16a34a',
                            px: 3
                          }}
                        >
                          Upload Image
                        </Button>
                      </label>
                      
                      {cameraAvailable ? (
                        <Button 
                          variant="outlined" 
                          component="span"
                          startIcon={<Camera size={18} />}
                          onClick={handleCameraCapture}
                          sx={{ 
                            borderColor: '#16a34a', 
                            color: '#16a34a',
                            px: 3
                          }}
                        >
                          Take Photo
                        </Button>
                      ) : (
                        <Button 
                          variant="outlined" 
                          disabled
                          startIcon={<Camera size={18} />}
                          sx={{ 
                            px: 3,
                            borderColor: '#d1d5db',
                            color: '#9ca3af'
                          }}
                          title="Camera not available on this device"
                        >
                          Take Photo
                        </Button>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 3
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: 200, 
                          height: 200, 
                          mb: 2,
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: 2
                        }}
                      >
                        <img 
                          src={uploadedImage.preview} 
                          alt="Uploaded Plant" 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }}
                        />
                      </Box>
                      <Typography fontWeight="medium" gutterBottom>
                        {uploadedImage.name}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" gap={2} justifyContent="center">
                      <Button 
                        variant="outlined" 
                        color="error" 
                        onClick={() => setUploadedImage(null)}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                      >
                        Remove
                      </Button>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<Camera size={20} />}
                        onClick={analyzeImage}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Results Container with Scrollable Area */}
            <Box sx={{ 
              maxHeight: '60vh', 
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
              {/* Loading State */}
              {isAnalyzing && (
                <Card elevation={2} sx={{ bgcolor: "#fff", borderRadius: 3, mb: 4 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box display="flex" justifyContent="center" mb={3}>
                      <CircularProgress color="primary" size={60} />
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="h6" fontWeight="bold" mb={1}>
                        AI Analysis in Progress...
                      </Typography>
                    </Box>
                    <Typography color="text.secondary" mb={3} textAlign="center">
                      Our AI is examining your plant image for signs of disease
                    </Typography>
                    <LinearProgress 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': { bgcolor: '#16a34a' }
                      }} 
                    />
                  </CardContent>
                </Card>
              )}

              {/* Error Results */}
              {analysisResult && analysisResult.error && (
                <Card elevation={2} sx={{ bgcolor: "#fff", borderRadius: 3, mb: 4 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <AlertTriangle size={24} color="#ef4444" />
                      <Typography variant="h6" fontWeight="bold" color="#ef4444">
                        Analysis Error
                      </Typography>
                    </Box>
                    <Typography color="text.secondary" mb={3}>
                      {analysisResult.error}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      onClick={() => setAnalysisResult(null)}
                      sx={{ mt: 2 }}
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Analysis Results */}
              {analysisResult && !analysisResult.error && (
                <Card elevation={2} sx={{ bgcolor: "#fff", borderRadius: 3, mb: 4 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                      <Typography variant="h6" fontWeight="bold">
                        Analysis Results
                      </Typography>
                      <Chip 
                        icon={getSeverityIcon(analysisResult.severity)}
                        label={`${analysisResult.confidence || 0}% Confidence`}
                        sx={{ 
                          bgcolor: `${getSeverityColor(analysisResult.severity)}20`,
                          color: getSeverityColor(analysisResult.severity),
                          fontWeight: 600
                        }}
                      />
                    </Box>
                    
                    {/* Display uploaded image in results */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                      <Box 
                        component="img"
                        src={uploadedImage?.preview || analysisResult.imageUrl}
                        alt="Analyzed plant"
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

                    <Box mb={3}>
                      <Typography variant="h5" fontWeight="bold" color={getSeverityColor(analysisResult.severity)} gutterBottom>
                        {analysisResult.name || "Unknown Disease"}
                      </Typography>
                      <Typography color="text.secondary" mb={1}>
                        {analysisResult.scientificName || ""}
                      </Typography>
                      <Typography>
                        {analysisResult.description}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {analysisResult.rawDiagnosis?.isConfident && analysisResult.rawDiagnosis?.highConfidenceResult ? (
                      // High Confidence Results - similar to DiseaseScans component
                      <>
                        <Box mb={3}>
                          <Typography variant="h6" fontWeight="bold" mb={2}>
                            Symptoms Identified:
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={1}>
                            {analysisResult.rawDiagnosis.highConfidenceResult.symptoms && 
                              Array.isArray(analysisResult.rawDiagnosis.highConfidenceResult.symptoms) &&
                              analysisResult.rawDiagnosis.highConfidenceResult.symptoms.length > 0 
                              ? analysisResult.rawDiagnosis.highConfidenceResult.symptoms.map((symptom, index) => (
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

                        <Box mb={3}>
                          <Typography variant="h6" fontWeight="bold" mb={2}>
                            Recommended Treatment:
                          </Typography>
                          <Box>
                            {analysisResult.rawDiagnosis.highConfidenceResult.treatment && 
                              Array.isArray(analysisResult.rawDiagnosis.highConfidenceResult.treatment) 
                              ? analysisResult.rawDiagnosis.highConfidenceResult.treatment.map((step, index) => (
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

                        <Box>
                          <Typography variant="h6" fontWeight="bold" mb={2}>
                            Prevention Tips:
                          </Typography>
                          <Box>
                            {analysisResult.rawDiagnosis.highConfidenceResult.prevention && 
                              Array.isArray(analysisResult.rawDiagnosis.highConfidenceResult.prevention)
                              ? analysisResult.rawDiagnosis.highConfidenceResult.prevention.map((tip, index) => (
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
                        {analysisResult.rawDiagnosis.highConfidenceResult.pesticideProducts && 
                         Array.isArray(analysisResult.rawDiagnosis.highConfidenceResult.pesticideProducts) &&
                         analysisResult.rawDiagnosis.highConfidenceResult.pesticideProducts.length > 0 &&
                         !analysisResult.name.toLowerCase().includes('healthy') && (
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
                                {analysisResult.rawDiagnosis.highConfidenceResult.pesticideProducts.slice(0, 3).map((product, index) => (
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
                      </>
                    ) : (
                      // Low Confidence Results - similar to DiseaseScans component
                      <Alert 
                        severity="warning" 
                        icon={<Warning size={20} />}
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
                          {analysisResult.rawDiagnosis?.lowConfidenceResults?.map((item, index) => (
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
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Box display="flex" justifyContent="center">
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => navigate('/disease-scans')}
                        startIcon={<Leaf size={18} />}
                        sx={{ 
                          bgcolor: '#16a34a', 
                          '&:hover': { bgcolor: '#15803d' },
                          px: 4,
                          py: 1
                        }}
                      >
                        View All Scan Results
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Box>

          {/* Right Column - Tips for Farmers */}
          <Box>
            {/* View All Scans Button */}
            <Box 
              display="flex" 
              justifyContent="flex-end" 
              mb={2}
            >
              <Button
                variant="outlined"
                startIcon={<Leaf size={16} />}
                onClick={() => navigate('/disease-scans')}
                sx={{ 
                  color: "#047857", 
                  borderColor: "#047857",
                  '&:hover': { 
                    backgroundColor: "#f0fdf4", 
                    borderColor: "#047857" 
                  }
                }}
              >
                View All Scans
              </Button>
            </Box>
            
            {/* Tips for taking good plant photos */}
            <Card elevation={2} sx={{ bgcolor: "#fff", borderRadius: 3, mb: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Tips for Farmers
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" gutterBottom mb={2}>
                  How to take good pictures for better disease detection:
                </Typography>
                
                <Box>
                  {[
                    "Choose a bright place where there is enough light, but avoid direct sunlight that creates shadows.",
                    "Clean the plant leaf with a soft cloth to remove dust or dirt.",
                    "Hold your phone steady and make sure the leaf fills most of the frame.",
                    "Take pictures of both top and bottom sides of the affected leaf.",
                    "Include some healthy leaves in your picture for comparison.",
                    "Focus on spots, discoloration, or unusual growth on the leaves.",
                    "Avoid taking blurry photos - hold your camera steady."
                  ].map((tip, index) => (
                    <Box key={index} display="flex" alignItems="start" mb={2}>
                      <CheckCircle size={16} color="#16a34a" style={{ marginRight: 8, marginTop: 4, flexShrink: 0 }} />
                      <Typography variant="body2">{tip}</Typography>
                    </Box>
                  ))}
                </Box>
                
                <Typography variant="subtitle2" fontWeight="bold" mt={3} mb={2} color="#047857">
                  Why Good Images Matter:
                </Typography>
                
                <Typography variant="body2">
                  Clear images help our AI to identify diseases accurately. Better pictures mean more helpful advice for treating your crops!
                </Typography>
              </CardContent>
            </Card>

            {/* Tips for effective disease management */}
            <Card elevation={2} sx={{ bgcolor: "#fff", borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" color="#047857" mb={2}>
                  Disease Management Tips
                </Typography>
                <Box>
                  {[
                    "Check your plants regularly - especially during wet or humid seasons.",
                    "Look for early symptoms - catching diseases early makes treatment easier.",
                    "Take photos of multiple affected plants to confirm patterns.",
                    "Follow treatment advice quickly to prevent disease spread.",
                    "Keep notes about which treatments worked for future reference."
                  ].map((tip, index) => (
                    <Box key={index} display="flex" alignItems="start" mb={2}>
                      <CheckCircle size={16} color="#16a34a" style={{ marginRight: 8, marginTop: 4, flexShrink: 0 }} />
                      <Typography variant="body2">{tip}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
      
      {/* Camera Modal */}
      <Modal
        open={showCameraModal}
        onClose={closeCamera}
        aria-labelledby="camera-modal-title"
        aria-describedby="camera-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', sm: 500 },
          maxWidth: '100%',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
          outline: 'none',
        }}>
          <Typography id="camera-modal-title" variant="h6" fontWeight="bold" mb={2}>
            Take a Photo
          </Typography>
          
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: 400,
              maxHeight: '70vh',
              bgcolor: '#000',
              borderRadius: 1,
              overflow: 'hidden',
              mb: 2
            }}
          >
            <video
              id="camera-preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              autoPlay
              playsInline
              muted
            />
          </Box>
          
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button 
              variant="outlined" 
              onClick={closeCamera}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={captureImage}
              sx={{
                borderRadius: 2,
                bgcolor: '#16a34a',
                '&:hover': { bgcolor: '#15803d' }
              }}
              startIcon={<Camera size={20} />}
            >
              Take Photo
            </Button>
          </Box>
        </Box>
      </Modal>
          </Container>
        </Box>
      </Layout>
  );
}
