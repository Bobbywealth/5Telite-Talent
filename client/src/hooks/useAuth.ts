
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@/../../shared/schema";

// Global cache to prevent multiple requests
let cachedAuthResult: { user: User | null; timestamp: number } | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Singleton pattern to prevent multiple auth requests
const authQueryKey = ["/api/auth/user"];

export function useAuth() {
  // Check if we have a valid cached result
  const now = Date.now();
  if (cachedAuthResult && (now - cachedAuthResult.timestamp) < CACHE_DURATION) {
    return {
      user: cachedAuthResult.user,
      isLoading: false,
      isAuthenticated: !!cachedAuthResult.user,
      error: null,
    };
  }

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: authQueryKey,
    queryFn: async (...args) => {
      const result = await getQueryFn({ on401: "returnNull" })(...args);
      // Cache the result
      cachedAuthResult = {
        user: result,
        timestamp: Date.now()
      };
      return result;
    },
    retry: false,
    staleTime: Infinity, // Never consider stale
    gcTime: Infinity, // Never garbage collect
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchIntervalInBackground: false,
    networkMode: 'online',
    enabled: !cachedAuthResult || (now - cachedAuthResult.timestamp) >= CACHE_DURATION,
  });

  return {
    user: user ?? cachedAuthResult?.user ?? null,
    isLoading,
    isAuthenticated: !!(user ?? cachedAuthResult?.user),
    error,
  };
}
