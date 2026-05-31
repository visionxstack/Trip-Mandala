import { apiClient } from "./apiClient";

export const trustService = {
  getScore: async (entityType, entityId) => {
    try { return await apiClient.get(`/trust/score/${entityType}/${entityId}`); } catch { return null; }
  },
  getAllScores: async (entityType = "homestay") => {
    try { return await apiClient.get(`/trust/scores/batch?entity_type=${entityType}`); } catch { return []; }
  },
  calculateScore: async (entityType, entityId) => {
    try { return await apiClient.post(`/trust/score/calculate/${entityType}/${entityId}`, {}); } catch { return null; }
  },
  submitReport: async (reportData) => apiClient.post("/trust/report", reportData),
  getPriceBenchmarks: async (category, location) => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (location) params.append("location", location);
    try { return await apiClient.get(`/trust/price-benchmarks?${params}`); } catch { return []; }
  },
  checkPriceFairness: async (category, location, price) => {
    try {
      return await apiClient.get(`/trust/price-check?category=${category}&location=${encodeURIComponent(location)}&price=${price}`);
    } catch { return null; }
  },
  getReports: async (status = "") => {
    try { return await apiClient.get(`/trust/reports${status ? `?status=${status}` : ""}`); } catch { return []; }
  },
  reviewReport: async (reportId, reviewData) => {
    return await apiClient.patch(`/trust/reports/${reportId}`, reviewData);
  }
};
