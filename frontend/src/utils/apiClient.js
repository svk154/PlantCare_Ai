/**
 * API Client utility for making authenticated requests
 * This centralizes API request logic and authentication handling
 */

import { getApiBaseUrl } from './apiConfig';
import { cachedFetch } from './cache';

/**
 * Makes an authenticated API request
 * @param {string} endpoint - API endpoint without the base URL
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<any>} - Promise that resolves to JSON response
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    credentials: 'include' // Always include cookies
  };
  
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };
  
  try {
    const apiBaseUrl = getApiBaseUrl();
    const url = `${apiBaseUrl}${endpoint}`;
    // Use cachedFetch for GET requests; fallback to fetch otherwise
    const isGet = (fetchOptions.method || 'GET').toUpperCase() === 'GET';
    const response = isGet
      ? await cachedFetch(url, fetchOptions, { ttlMs: 30000, dedupe: true })
      : await fetch(url, fetchOptions);
    
    // If cachedFetch was used, response is an object { data, ok, status }
    if (isGet) {
      if (!response.ok) {
        return Promise.reject({ error: `API error: ${response.status}` });
      }
      return response.data;
    }
    // For non-GET, parse JSON and handle errors
    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        error: `API error: ${response.status} ${response.statusText}` 
      }));
      return Promise.reject(error);
    }
    return await response.json();
  } catch (error) {
    
    return Promise.reject({ error: 'Network error or server unavailable' });
  }
};

/**
 * Shorthand for GET request
 */
export const getRequest = (endpoint) => apiRequest(endpoint, { method: 'GET' });

/**
 * Shorthand for POST request
 */
export const postRequest = (endpoint, data) => apiRequest(endpoint, {
  method: 'POST',
  body: JSON.stringify(data)
});

/**
 * Shorthand for PUT request
 */
export const putRequest = (endpoint, data) => apiRequest(endpoint, {
  method: 'PUT',
  body: JSON.stringify(data)
});

/**
 * Shorthand for DELETE request
 */
export const deleteRequest = (endpoint) => apiRequest(endpoint, { method: 'DELETE' });
