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
  if (process.env.NODE_ENV === "production") {
    return "https://your-production-api.com";
  }

  //https://askjc-chatbot.onrender.com/

  // For web development
  if (typeof window !== "undefined" && window.location) {
    return "http://localhost:3000";
  }

  // For mobile development (Expo Go)
  return process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.254.109:3000";
}

export { getBaseUrl };
