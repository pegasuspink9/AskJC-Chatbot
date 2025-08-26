export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  ENDPOINTS: {
    QUERY: '/query/',
    // Add more endpoints here as needed
    // USER: '/user/',
    // AUTH: '/auth/',
  },
  TIMEOUT: 30000, // 30 seconds
};

// Helper function to determine base URL based on platform
function getBaseUrl(): string {
  if (!__DEV__) {
    return 'https://your-production-api.com';
  }
  
  if (typeof window !== 'undefined' && window.location) {
    return 'http://localhost:3000';
  } else {
    return process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.10.87:3000';
  }
}