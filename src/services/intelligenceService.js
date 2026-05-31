import { apiClient } from "./apiClient";

export const intelligenceService = {
  trackSearch: async (searchData) => {
    try { await apiClient.post("/intelligence/track-search", searchData); } catch {}
  },
  getDashboard: async () => apiClient.get("/intelligence/dashboard"),
};

export const feedbackService = {
  submitTouristFeedback: async (data) => apiClient.post("/feedback/tourist", data),
  submitHeritageFeedback: async (data) => apiClient.post("/feedback/heritage", data),
  submitExperienceFeedback: async (data) => apiClient.post("/feedback/experience", data),
  trackHeritageEngagement: async (data) => {
    try { await apiClient.post("/feedback/heritage/track-anonymous", data); } catch {}
  },
  trackStoryCompletion: async (data) => {
    try { await apiClient.post("/feedback/story/complete", data); } catch {}
  },
  getFeedbackForTarget: async (targetId) => apiClient.get(`/feedback/target/${targetId}`),
};

export const impactService = {
  calculateImpact: async (bookingId, homestayId) =>
    apiClient.post("/impact/calculate", { booking_id: bookingId, homestay_id: homestayId }),
  getMyImpact: async () => apiClient.get("/impact/my"),
  getBookingImpact: async (bookingId) => apiClient.get(`/impact/booking/${bookingId}`),
  getPlatformSummary: async () => apiClient.get("/impact/platform-summary"),
};
