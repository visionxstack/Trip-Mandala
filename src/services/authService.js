import { apiClient } from "./apiClient";

export const authService = {
  login: async (credentials) => {
    return apiClient.post("/auth/login", credentials);
  },
  signup: async (data) => {
    return apiClient.post("/auth/signup", data);
  },
  verifyOtp: async (data) => {
    return apiClient.post("/auth/verify-otp", data);
  },
  forgotPassword: async (email) => {
    return apiClient.post("/auth/forgot-password", { email });
  },
  resetPassword: async (data) => {
    return apiClient.post("/auth/reset-password", data);
  }
};
