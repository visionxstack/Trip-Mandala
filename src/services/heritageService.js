import { apiClient } from "./apiClient";
import heritageData from "../../dataseeds/heritage.json";

export const heritageService = {
  getHeritageSites: async () => {
    try {
      // Attempt to fetch from real backend first
      const data = await apiClient.get("/heritage/");
      // If backend returns empty or no data, fall back to local seeds
      if (data && data.length > 0) {
        return data;
      }
      return heritageData;
    } catch {
      // Backend not available — use local dataseeds silently
      return heritageData;
    }
  },

  getHeritageSite: async (id) => {
    try {
      return await apiClient.get(`/heritage/${id}`);
    } catch {
      return heritageData.find((h) => h.id === id) || null;
    }
  }
};
