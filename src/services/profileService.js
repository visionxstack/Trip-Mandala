import { apiClient } from "./apiClient";

export const profileService = {
  /** Get the logged-in user's full profile */
  getMe: () => apiClient.get("/profiles/me"),

  /** Update profile fields */
  updateMe: (data) => apiClient.put("/profiles/me", data),

  /** Upload avatar image — returns { url, path } */
  uploadAvatar: async (file) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.upload("/upload/profiles", form);
  },

  /** Get a public profile by user ID */
  getProfile: (userId) => apiClient.get(`/profiles/${userId}`),

  /** Submit host verification request */
  submitVerificationRequest: (data) => apiClient.post("/verification/request", data),

  /** Get own verification status */
  getVerificationStatus: () => apiClient.get("/verification/status"),
};
