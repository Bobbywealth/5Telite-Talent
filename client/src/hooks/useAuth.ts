
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@/../../shared/schema";

// Global singleton to prevent multiple simultaneous requests
let isAuthRequestInProgress = false;
let cachedAuthResult: { user: User | null; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

const authQueryKey = ["/api/auth/user"];

export function useAuth() {
  // Check cache first
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
      // Prevent multiple simultaneous requests
      if (isAuthRequestInProgress) {
        // Return cached result if available
        if (cachedAuthResult) {
          return cachedAuthResult.user;
        }
        // Wait a bit and try again
        await new Promise(resolve => setTimeout(resolve, 100));
        return null;
      }

      try {
        isAuthRequestInProgress = true;
        const result = await getQueryFn({ on401: "returnNull" })(...args);
        
        // Cache the result
        cachedAuthResult = {
          user: result,
          timestamp: Date.now()
        };
        
        return result;
      } finally {
        isAuthRequestInProgress = false;
      }
    },
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchIntervalInBackground: false,
    enabled: !cachedAuthResult || (now - cachedAuthResult.timestamp) >= CACHE_DURATION,
  });

  return {
    user: user ?? cachedAuthResult?.user ?? null,
    isLoading: isLoading && !cachedAuthResult,
    isAuthenticated: !!(user ?? cachedAuthResult?.user),
    error,
  };
}
