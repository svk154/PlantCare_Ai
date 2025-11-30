import { getApiBaseUrl } from './apiConfig';
import { cachedFetch } from './cache';

/**
 * Makes an API request with language preference
 * 
 * @param {string} endpoint - The API endpoint
 * @param {Object} options - Fetch options
 * @param {string} language - The language preference ('English' or 'Hindi')
 * @returns {Promise<Object>} - The API response
 */
export async function apiRequestWithLanguage(endpoint, options = {}, language = 'English') {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const url = `${apiBaseUrl}${endpoint}`;
    
    // Get the token from localStorage
    const token = localStorage.getItem('access_token');
    
    // Set up the headers with language preference
    const headers = {
      ...(options.headers || {}),
      'X-Language': language,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    
    // Merge the headers with the options
    const updatedOptions = {
      ...options,
      headers,
      credentials: 'include'
    };
    
    const isGet = (updatedOptions.method || 'GET').toUpperCase() === 'GET';
    if (isGet) {
      const res = await cachedFetch(url, updatedOptions, { ttlMs: 30000, dedupe: true });
      return { 
        success: res.ok,
        status: res.status,
        data: res.data 
      };
    }

    const response = await fetch(url, updatedOptions);
    const data = await response.json();
    
    return { 
      success: response.ok, 
      status: response.status,
      data 
    };
  } catch (error) {
    
    return { 
      success: false, 
      status: 0,
      error: error.message 
    };
  }
}

/**
 * Wrapper function that gets the current language from localStorage
 * and makes an API request with that language
 * 
 * @param {string} endpoint - The API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - The API response
 */
export async function apiRequest(endpoint, options = {}) {
  const language = localStorage.getItem('plantcare_language') || 'English';
  return apiRequestWithLanguage(endpoint, options, language);
}