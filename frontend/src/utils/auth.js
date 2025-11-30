/**
 * Authentication utility functions
 * Centralizes authentication-related functionality
 */

import { getRequest, postRequest } from './apiClient';

/**
 * Checks if the user is authenticated by verifying token presence
 * @returns {boolean} True if user has a token
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

/**
 * Logs the user in
 * @param {Object} credentials - User credentials (email, password)
 * @returns {Promise<Object>} Login response
 */
export const login = async (credentials) => {
  try {
    const response = await postRequest('/auth/login', credentials);
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
    }
    return response;
  } catch (error) {
    
    throw error;
  }
};

/**
 * Logs the user out
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await postRequest('/auth/logout');
  } catch (error) {
    
  } finally {
    // Always clear local storage even if server request fails
    localStorage.removeItem('access_token');
  }
};

/**
 * Fetches the current user's profile
 * @returns {Promise<Object>} User profile data
 */
export const getCurrentUser = async () => {
  try {
    const response = await getRequest('/profile/me');
    return response.user || null;
  } catch (error) {
    
    return null;
  }
};

/**
 * Creates a React auth protection HOC
 * @param {Function} onUnauthenticated - Callback when user is not authenticated
 * @returns {Function} Authentication protection HOC
 */
export const withAuthProtection = (onUnauthenticated) => (Component) => (props) => {
  // Implementation would depend on your routing library
  // This is just a placeholder
  return isAuthenticated() ? <Component {...props} /> : onUnauthenticated();
};
