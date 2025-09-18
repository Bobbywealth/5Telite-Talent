import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@/../../shared/schema";

// Single global flag to prevent multiple auth checks
let authCheckInProgress = false;
let authResult: { user: User | null; timestamp: number } | null = null;

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      // If we have recent cached result, use it
      if (authResult && (Date.now() - authResult.timestamp) < 5 * 60 * 1000) {
        return authResult.user;
      }

      // Only make one request if none in progress
      if (authCheckInProgress) {
        return authResult?.user || null;
      }

      authCheckInProgress = true;

      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const response = await fetch(`${baseUrl}/api/user`, {
          credentials: "include",
          // Add timeout for slow backend responses
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });

        let result = null;
        if (response.ok) {
          result = await response.json();
        }

        authResult = {
          user: result,
          timestamp: Date.now(),
        };

        return result;
      } catch (error) {
        return null;
      } finally {
        authCheckInProgress = false;
      }
    },
    enabled: !authResult || (Date.now() - authResult.timestamp) > 5 * 60 * 1000,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchIntervalInBackground: false,
  });

  return {
    user: user ?? authResult?.user ?? null,
    isLoading: isLoading && !authResult,
    isAuthenticated: !!(user ?? authResult?.user),
    error,
  };
}