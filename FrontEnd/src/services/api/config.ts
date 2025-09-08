export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  ENDPOINTS: {
    QUERY: '/query/',
    // Add more endpoints here as needed
    // USER: '/user/',
    // AUTH: '/auth/',
  },
  TIMEOUT: 30000, 
};

function getBaseUrl(): string {
  return 'https://askjc-chatbot.onrender.com';
  
}

export { getBaseUrl };