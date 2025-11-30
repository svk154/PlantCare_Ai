// Test script to verify authentication with port forwarding
// To be run in the browser console when accessing the app via port forwarding

async function testAuthentication() {
  // Get the current origin
  const origin = window.location.origin;
  
  
  // Get the API base URL using our utility
  const { getApiBaseUrl } = await import('./utils/apiConfig.js');
  const apiBaseUrl = getApiBaseUrl();
  
  
  // Test a login request
  
  try {
    // Create test credentials - DO NOT USE REAL CREDENTIALS
    const testCredentials = {
      email: 'test@example.com',
      password: 'testpassword'
    };
    
    // Use the API base URL for the login request
    const loginResponse = await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCredentials),
      credentials: 'include'
    });
    
    
    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      
    } else {
      
      const responseData = await loginResponse.json();
      
    }
  } catch (error) {
    
  }
}



