export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  ENDPOINTS: {
    QUERY: "/query/",
    // Add more endpoints here as needed
    // USER: '/user/',
    // AUTH: '/auth/',
  },
  TIMEOUT: 30000,
};

function getBaseUrl(): string {
  console.log('Environment check:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('EXPO_PUBLIC_API_BASE_URL:', process.env.EXPO_PUBLIC_API_BASE_URL);
  console.log('VERCEL_ENV:', process.env.VERCEL_ENV);
  
  if (process.env.VERCEL_ENV || process.env.NODE_ENV === 'production') {
    console.log('Using production URL for Vercel');
    return 'https://askjc-chatbot.onrender.com';
  }

  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    console.log('Using env variable URL:', process.env.EXPO_PUBLIC_API_BASE_URL);
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  if (typeof window !== 'undefined' && window.location) {
    console.log('Using localhost for web development');
    return 'http://localhost:3000';
  }

  console.log('Using mobile development URL');
  return 'http://192.168.254.125:3000';
}

export { getBaseUrl };