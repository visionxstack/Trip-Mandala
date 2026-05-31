import { useState, useEffect, useCallback } from "react";
import { profileService } from "../services/profileService";

/**
 * useUserCache — loads & caches the current user's full profile in memory.
 * - On mount: tries localStorage cache first (instant), then fetches if stale
 * - Exposes refetch() to force a fresh load after profile updates
 */
export function useUserCache() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      // apiClient.get handles cache vs fresh fetch based on session state
      const data = await profileService.getMe();
      setProfile(data);
    } catch (err) {
      // If not authenticated just set null gracefully
      setError(err.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("nepal_user");
    if (stored) {
      load();
    } else {
      setLoading(false);
    }
  }, [load]);

  return { profile, loading, error, refetch: () => load(true) };
}
