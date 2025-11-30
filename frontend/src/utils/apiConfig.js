// apiConfig.js - Centralized API configuration

/**
 * Gets the base API URL based on the current environment
 * This function intelligently determines if we're running locally or via port forwarding
 * and returns the appropriate base URL for API calls
 */
export const getApiBaseUrl = () => {
  // If environment variable is set, use that
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  const windowOrigin = window.location.origin;
  
  // Check if we're in development mode (React dev server on port 3000)
  if (windowOrigin.includes('localhost:3000') || windowOrigin.includes('127.0.0.1:3000')) {
    return 'http://localhost:5000/api';
  }
  
  // Check if we're in integrated mode (same origin for frontend and API)
  // This covers both localhost:5000 and port-forwarded URLs
  if (windowOrigin.includes(':5000') || !windowOrigin.includes('localhost')) {
    return `${windowOrigin}/api`;
  }
  
  // Default fallback for any other scenario
  
  return `${windowOrigin}/api`;
};

/**
 * Helper to make API calls with proper URL and authorization
 * @param {string} endpoint - The API endpoint (without the base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise} - Fetch promise
 */
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');
  
  // Ensure headers exist in options
  if (!options.headers) {
    options.headers = {};
  }
  
  // Add authorization if token exists
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // If no Content-Type is specified and we're not sending FormData,
  // default to JSON
  if (!options.headers['Content-Type'] && !(options.body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
  }
  
  // Always include credentials (cookies) for CORS requests
  options.credentials = 'include';
  
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/${endpoint.startsWith('/') ? endpoint.substring(1) : endpoint}`;
  
  
  
  return fetch(url, options);
};

/**
 * Helper function to create a fetch request with proper authentication and API URL resolution
 * This is a simplified version that can be used directly in components
 * 
 * @param {string} endpoint - The API endpoint (without the base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise} - Fetch promise
 */
export const createApiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');

  // Ensure headers exist in options
  if (!options.headers) {
    options.headers = {};
  }

  // Add authorization if token exists
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  // Always include credentials
  options.credentials = 'include';

  // If no Content-Type is specified and we're not sending FormData,
  // default to JSON
  if (!options.headers['Content-Type'] && !(options.body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
  }

  const apiBaseUrl = getApiBaseUrl();
  const url = `${apiBaseUrl}/${endpoint.startsWith('/') ? endpoint.substring(1) : endpoint}`;

  try {
    const response = await fetch(url, options);

    // Check for HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    
    throw error;
  }
};

const apiConfig = {
  getApiBaseUrl,
  apiCall,
  createApiRequest
};

export default apiConfig;
