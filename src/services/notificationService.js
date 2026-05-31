import { apiClient } from "./apiClient";

export const notificationService = {
  getNotifications: async () => {
    try {
      return await apiClient.get("/notifications/");
    } catch (err) {
      console.warn("[notificationService] Failed to load notifications:", err);
      return [];
    }
  },

  getUnreadCount: async () => {
    try {
      const res = await apiClient.get("/notifications/count");
      return res.unread_count ?? 0;
    } catch {
      return 0;
    }
  },

  markRead: async (notificationId) => {
    try {
      return await apiClient.patch(`/notifications/${notificationId}/read`, {});
    } catch (err) {
      console.warn("[notificationService] Failed to mark notification read:", err);
    }
  },

  markAllRead: async () => {
    try {
      return await apiClient.patch("/notifications/read-all", {});
    } catch (err) {
      console.warn("[notificationService] Failed to mark all read:", err);
    }
  },
};
