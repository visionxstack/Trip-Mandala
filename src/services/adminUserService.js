import { apiClient } from "./apiClient";

const BASE = "/admin";

export const adminUserService = {
  /** List all users with optional filters */
  listUsers: (params = {}) => {
    const q = new URLSearchParams();
    if (params.role)               q.set("role", params.role);
    if (params.search)             q.set("search", params.search);
    if (params.account_status)     q.set("account_status", params.account_status);
    if (params.verified_host != null)    q.set("verified_host", params.verified_host);
    if (params.women_led_verified != null) q.set("women_led_verified", params.women_led_verified);
    const qs = q.toString();
    return apiClient.get(`${BASE}/users${qs ? "?" + qs : ""}`, true); // always fresh for admin
  },

  /** Full profile of a single user (with bookings + analytics) */
  getUserDetail: (userId) => apiClient.get(`${BASE}/users/${userId}`, true),

  /** Suspend / restore / delete a user */
  setUserStatus: (userId, status) =>
    apiClient.put(`${BASE}/users/${userId}/status?status=${status}`, {}),

  /** Verify / unverify a host */
  verifyHost: (userId, verified) =>
    apiClient.put(`${BASE}/users/${userId}/verify?verified=${verified}`, {}),

  /** Verify / unverify women-led status */
  verifyWomenLed: (userId, verified) =>
    apiClient.put(`${BASE}/users/${userId}/women-led?verified=${verified}`, {}),

  /** Hard-delete a user */
  deleteUser: (userId) => apiClient.delete(`${BASE}/users/${userId}`),

  /** Overview stats */
  getOverview: () => apiClient.get(`${BASE}/overview`, true),

  /** List verification requests */
  listVerificationRequests: (status) => {
    const qs = status ? `?status=${status}` : "";
    return apiClient.get(`${BASE}/verification-requests${qs}`, true);
  },

  /** Approve or reject a verification request */
  reviewVerificationRequest: (requestId, action, admin_notes = "") => {
    const qs = new URLSearchParams({ action });
    if (admin_notes) qs.set("admin_notes", admin_notes);
    return apiClient.put(`${BASE}/verification-requests/${requestId}?${qs}`, {});
  },

  /** Audit logs */
  getAuditLogs: (limit = 50) =>
    apiClient.get(`${BASE}/audit-logs?limit=${limit}`, true),
};
