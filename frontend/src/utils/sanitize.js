// src/utils/sanitize.js
import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * 
 * @param {string} html - HTML content to sanitize
 * @param {Object} options - Optional DOMPurify configuration
 * @returns {string} - Sanitized HTML
 */
export const sanitizeHtml = (html, options = {}) => {
  return DOMPurify.sanitize(html, options);
};

/**
 * Sanitizes text content (strips all HTML)
 * 
 * @param {string} text - Text content to sanitize
 * @returns {string} - Sanitized text with all HTML removed
 */
export const sanitizeText = (text) => {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
};

/**
 * Sanitizes user input for form submissions
 * 
 * @param {Object} data - Object containing form data
 * @returns {Object} - Object with sanitized form data
 */
export const sanitizeFormData = (data) => {
  const sanitized = {};
  
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      sanitized[key] = sanitizeText(data[key]);
    } else if (typeof data[key] === 'object' && data[key] !== null) {
      sanitized[key] = sanitizeFormData(data[key]);
    } else {
      sanitized[key] = data[key];
    }
  });
  
  return sanitized;
};
