/**
 * Port Forwarding Test Script
 * 
 * This script checks if all API endpoints are properly configured
 * for port forwarding by verifying URL resolution and authentication.
 * 
 * HOW TO USE:
 * 1. Open your port-forwarded PlantCare AI application in a browser
 * 2. Login to the application
 * 3. Open the browser's developer console (F12)
 * 4. Copy and paste this entire script into the console
 * 5. Call the testAllEndpoints() function in the console
 */

async function testApiEndpoint(endpoint, options = {}) {
  try {
    // Import the API config helpers
    const { getApiBaseUrl } = await import('./utils/apiConfig.js');
    const apiBaseUrl = getApiBaseUrl();
    
    // Build the full URL
    const url = `${apiBaseUrl}/${endpoint.startsWith('/') ? endpoint.substring(1) : endpoint}`;
    
    // Default options
    const defaultOptions = {
      method: 'GET',
      headers: {},
      credentials: 'include'
    };
    
    // Add authorization header if token exists
    const token = localStorage.getItem('access_token');
    if (token) {
      defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Merge default options with provided options
    const fetchOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };
    
    
    const start = performance.now();
    const response = await fetch(url, fetchOptions);
    const end = performance.now();
    
    return {
      endpoint,
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      time: Math.round(end - start),
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return {
      endpoint,
      error: error.message,
      ok: false
    };
  }
}

async function testAllEndpoints() {
  
  
  
  // Get API base URL
  const { getApiBaseUrl } = await import('./utils/apiConfig.js');
  const apiBaseUrl = getApiBaseUrl();
  
  
  // Test authentication
  
  const token = localStorage.getItem('access_token');
  
  
  // List of key endpoints to test
  const endpoints = [
    { endpoint: 'auth/me', name: 'Authentication Status' },
    { endpoint: 'profile/me', name: 'User Profile' },
    { endpoint: 'farms/farms', name: 'Farms List' },
    { endpoint: 'profile/transactions', name: 'Transactions' },
    { endpoint: 'crops', name: 'Crops List' },
    { endpoint: 'disease-scans/scans', name: 'Disease Scans' }
  ];
  
  // Test each endpoint
  const results = [];
  for (const endpoint of endpoints) {
    const result = await testApiEndpoint(endpoint.endpoint);
    result.name = endpoint.name;
    results.push(result);
  }
  
  // Display results table
  console.table(results.map(r => ({
    'Endpoint': r.name,
    'Status': r.status,
    'Success': r.ok ? '✅ Yes' : '❌ No',
    'Response Time': r.time ? `${r.time}ms` : 'N/A',
    'CORS Headers': r.headers && r.headers['access-control-allow-origin'] ? '✅ Yes' : '❌ No'
  })));
  
  // Overall assessment
  const successCount = results.filter(r => r.ok).length;
  
  
  if (successCount === results.length) {
    
  } else {
    
  }
}



