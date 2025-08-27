export interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    queryId: number;
    chatbotResponse: string;
    responseTime: string;
  };
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}