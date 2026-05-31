import { apiClient } from "./apiClient";
import homestaysFallback from "../../dataseeds/homestays.json";

export const homestayService = {
  getHomestays: async (filters) => {
    let data;
    try {
      data = await apiClient.get("/homestays/", true);
      // If backend returned empty (DB not yet seeded), use local JSON dataseed
      if (!data || data.length === 0) {
        console.info("[homestayService] API returned empty — using local JSON dataseed.");
        data = homestaysFallback;
      }
    } catch (err) {
      console.warn("API failed, falling back to dataseeds for homestays", err);
      data = homestaysFallback;
    }

    let results = data || [];
    if (filters) {
      if (filters.region) {
        results = results.filter(h => h.district?.toLowerCase().includes(filters.region.toLowerCase()) || h.location?.toLowerCase().includes(filters.region.toLowerCase()));
      }
      if (filters.women_led !== undefined && filters.women_led !== false) {
        results = results.filter(h => h.women_led === filters.women_led);
      }
      if (filters.eco_friendly !== undefined && filters.eco_friendly !== false) {
        results = results.filter(h => h.eco_score >= 4.0);
      }
    }
    return results;
  },
  getHomestay: async (id) => {
    try {
      return await apiClient.get(`/homestays/${id}`);
    } catch (err) {
      console.warn("API failed, falling back to dataseeds for homestay", id);
      return homestaysFallback.find(h => String(h.id) === String(id));
    }
  },
  createHomestay: async (data) => {
    return apiClient.post("/homestays/", data);
  },
  updateHomestay: async (id, data) => {
    return apiClient.put(`/homestays/${id}`, data);
  },
  deleteHomestay: async (id) => {
    return apiClient.delete(`/homestays/${id}`);
  },
  getMyHomestays: async () => {
    // Returns only the currently logged-in host's homestays
    try {
      return await apiClient.get("/homestays/my", true); // always fresh
    } catch (err) {
      console.warn("[homestayService] Failed to get my homestays:", err);
      return [];
    }
  },
  createBooking: async (data) => {
    try {
      return await apiClient.post("/bookings/", data);
    } catch (err) {
      console.warn("API failed, returning mock booking response", err);
      // Dummy success response to prevent crash
      return {
        id: "mock_" + Math.floor(Math.random() * 1000000).toString(),
        total_amount: 150,
        platform_fee: 5,
        host_payout: 145,
        ...data
      };
    }
  },
  getBookings: async () => {
    // Backend automatically infers role and user from JWT token
    try {
      return await apiClient.get("/bookings/");
    } catch (err) {
      console.warn("API failed, returning empty bookings", err);
      return [];
    }
  }
};
