
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@/../../shared/schema";

// Global auth state to prevent any auth requests
let globalAuthState: {
  user: User | null;
  isLoading: boolean;
  timestamp: number;
} = {
  user: null,
  isLoading: false,
  timestamp: 0,
};

let hasInitialized = false;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export function useAuth() {
  const now = Date.now();
  
  // If we have recent cached data, return it immediately
  if (hasInitialized && (now - globalAuthState.timestamp) < CACHE_DURATION) {
    return {
      user: globalAuthState.user,
      isLoading: false,
      isAuthenticated: !!globalAuthState.user,
      error: null,
    };
  }

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async (...args) => {
      // Prevent multiple requests by checking if we already have data
      if (hasInitialized && (now - globalAuthState.timestamp) < CACHE_DURATION) {
        return globalAuthState.user;
      }

      const result = await getQueryFn({ on401: "returnNull" })(...args);
      
      // Cache the result globally
      globalAuthState = {
        user: result,
        isLoading: false,
        timestamp: now,
      };
      hasInitialized = true;
      
      return result;
    },
    enabled: !hasInitialized || (now - globalAuthState.timestamp) >= CACHE_DURATION,
    retry: false,
    staleTime: CACHE_DURATION,
    gcTime: CACHE_DURATION * 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchIntervalInBackground: false,
  });

  // Update global state when query completes
  if (user !== undefined && !isLoading) {
    globalAuthState = {
      user,
      isLoading: false,
      timestamp: now,
    };
    hasInitialized = true;
  }

  return {
    user: user ?? globalAuthState.user,
    isLoading: isLoading && !hasInitialized,
    isAuthenticated: !!(user ?? globalAuthState.user),
    error,
  };
}
