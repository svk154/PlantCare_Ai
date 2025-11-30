// src/utils/errorHandler.js

/**
 * Centralized error handler for API responses
 * 
 * @param {Response} response - Fetch API Response object
 * @param {Function} setError - React state setter for error display
 * @param {Object} options - Additional options
 * @returns {Object|null} - Parsed response data if successful, null if error
 */
export const handleApiResponse = async (response, setError, options = {}) => {
  const { 
    defaultErrorMessage = 'An unexpected error occurred. Please try again later.',
    logErrors = true,
    redirectOnAuthError = false,
    navigate = null
  } = options;

  try {
    const data = await response.json();
    
    if (!response.ok) {
      // Handle specific error status codes
      switch (response.status) {
        case 400:
          setError(data.error || 'Invalid request. Please check your input and try again.');
          break;
        case 401:
          setError(data.error || 'Authentication error. Please login again.');
          if (redirectOnAuthError && navigate) {
            navigate('/login', { state: { from: window.location.pathname } });
          }
          break;
        case 403:
          setError(data.error || 'You do not have permission to perform this action.');
          break;
        case 404:
          setError(data.error || 'The requested resource was not found.');
          break;
        case 500:
          setError('A server error occurred. Our team has been notified.');
          break;
        default:
          setError(data.error || defaultErrorMessage);
      }
      
      // Log errors if enabled
      if (logErrors) {
        
      }
      
      return null;
    }
    
    return data;
  } catch (error) {
    // Handle parsing errors or network failures
    if (logErrors) {
      
    }
    
    setError('Network or server error. Please check your connection and try again.');
    return null;
  }
};

/**
 * Sends error to a centralized logging service
 * Could be expanded to send to a backend endpoint or service like Sentry
 * 
 * @param {Error} error - Error object
 * @param {string} context - Context in which the error occurred
 * @param {Object} metadata - Additional metadata about the error
 */
export const logError = (error, context, metadata = {}) => {
  // In production, this would send to a logging service
  
  
  // Example of how this could be expanded:
  // if (process.env.NODE_ENV === 'production') {
  //   fetch('/api/log-error', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       message: error.message,
  //       stack: error.stack,
  //       context,
  //       metadata,
  //       timestamp: new Date().toISOString(),
  //     })
  //   }).catch(err => 
  // }
};
