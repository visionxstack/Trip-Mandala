/**
 * Trip Mandala — User-Scoped localStorage Cache
 *
 * Strategy:
 *   - On login:        fetch all critical data once, store in localStorage under userId key
 *   - Tab switching:   render from localStorage cache instantly (no extra fetch)
 *   - Page refresh:    clear session cache → fresh fetch → repopulate
 *   - Logout:          clear all user-scoped cache keys
 *   - Multiple users:  each user has their own isolated cache namespace
 *
 * Cache key format:  tm_cache_{userId}_{endpoint}
 * Session flag:      tm_session_{userId}          (set on login, cleared on refresh/logout)
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// ─── Auth headers ────────────────────────────────────────────────────────────
const getAuthHeaders = () => {
  const token = localStorage.getItem("nepal_token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
};

const getErrorMessage = (error) => {
  if (!error) return "API Request Failed";
  if (typeof error.detail === "string") return error.detail;
  if (Array.isArray(error.detail) && error.detail.length > 0)
    return error.detail[0].msg || JSON.stringify(error.detail[0]);
  if (typeof error.detail === "object") return JSON.stringify(error.detail);
  return "API Request Failed";
};

// ─── Cache helpers ───────────────────────────────────────────────────────────
const getCurrentUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("nepal_user") || "null");
    return user?.user_id || user?.id || null;
  } catch {
    return null;
  }
};

const cacheKey = (userId, endpoint) => `tm_cache_${userId}_${endpoint}`;
const sessionKey = (userId) => `tm_session_${userId}`;

/** True only if the user logged in during THIS browser session (not a refresh). */
const isActiveSession = (userId) => {
  return sessionStorage.getItem(sessionKey(userId)) === "1";
};

/** Call this immediately after a successful login to mark the session. */
export const markSessionStart = (userId) => {
  sessionStorage.setItem(sessionKey(userId), "1");
};

/** Clear all cache entries for a given user. Call on logout. */
export const clearUserCache = (userId) => {
  if (!userId) return;
  const prefix = `tm_cache_${userId}_`;
  Object.keys(localStorage)
    .filter((k) => k.startsWith(prefix))
    .forEach((k) => localStorage.removeItem(k));
  sessionStorage.removeItem(sessionKey(userId));
};

const readCache = (userId, endpoint) => {
  try {
    const raw = localStorage.getItem(cacheKey(userId, endpoint));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeCache = (userId, endpoint, data) => {
  try {
    localStorage.setItem(cacheKey(userId, endpoint), JSON.stringify(data));
  } catch {
    // quota exceeded — silently skip
  }
};

const invalidateCache = (userId, endpoint) => {
  if (userId) localStorage.removeItem(cacheKey(userId, endpoint));
};

// ─── Prefetch helper — call after login ─────────────────────────────────────
/**
 * Prefetch and cache critical endpoints once on login.
 * Components will read from cache on first render.
 */
export const prefetchUserData = async (userId) => {
  if (!userId) return;
  const criticalEndpoints = ["/profiles/me", "/bookings/", "/notifications/"];
  await Promise.allSettled(
    criticalEndpoints.map((ep) => apiClient.get(ep, true)) // force fresh
  );
};

// ─── Core API client ─────────────────────────────────────────────────────────
export const apiClient = {
  /**
   * GET with user-scoped localStorage cache.
   *
   * Cache logic:
   *   - If active session (not a page refresh) AND cached data exists → return cache instantly
   *   - Otherwise → fetch fresh, write to cache, return data
   */
  get: async (endpoint, forceRefresh = false) => {
    const userId = getCurrentUserId();

    if (!forceRefresh && userId && isActiveSession(userId)) {
      const cached = readCache(userId, endpoint);
      if (cached !== null) return JSON.parse(JSON.stringify(cached));
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(getErrorMessage(error));
    }
    const data = await res.json();

    if (userId) writeCache(userId, endpoint, data);
    return JSON.parse(JSON.stringify(data));
  },

  post: async (endpoint, data) => {
    const userId = getCurrentUserId();
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(getErrorMessage(error));
    }
    const result = await res.json();
    // Invalidate related caches on mutation
    if (userId) {
      invalidateCache(userId, "/profiles/me");
      invalidateCache(userId, "/bookings/");
      if (endpoint.startsWith("/homestays")) {
        invalidateCache(userId, "/homestays/");
        invalidateCache(userId, "/homestays/my");
      }
    }
    return result;
  },

  put: async (endpoint, data) => {
    const userId = getCurrentUserId();
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(getErrorMessage(error));
    }
    const result = await res.json();
    if (userId) {
      invalidateCache(userId, "/profiles/me");
      invalidateCache(userId, endpoint);
      if (endpoint.startsWith("/homestays")) {
        invalidateCache(userId, "/homestays/");
        invalidateCache(userId, "/homestays/my");
      }
    }
    return result;
  },

  patch: async (endpoint, data) => {
    const userId = getCurrentUserId();
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(getErrorMessage(error));
    }
    const result = await res.json();
    if (userId) invalidateCache(userId, endpoint);
    return result;
  },

  delete: async (endpoint) => {
    const userId = getCurrentUserId();
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(getErrorMessage(error));
    }
    const result = await res.json();
    if (userId) invalidateCache(userId, endpoint);
    return result;
  },

  /** Upload files (multipart/form-data — no JSON Content-Type). */
  upload: async (endpoint, formData) => {
    const token = localStorage.getItem("nepal_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(getErrorMessage(error));
    }
    return res.json();
  },
};
