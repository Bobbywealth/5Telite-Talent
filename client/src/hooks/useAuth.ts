import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@/../../shared/schema";

// Single global flag to prevent multiple auth checks
let authCheckInProgress = false;
let authResult: { user: User | null; timestamp: number } | null = null;

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async (...args) => {
      // If auth check is already in progress, wait for it
      if (authCheckInProgress) {
        return new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (!authCheckInProgress && authResult) {
              clearInterval(checkInterval);
              resolve(authResult.user);
            }
          }, 10);
        });
      }

      // If we have recent cached result (less than 5 minutes old), use it
      if (authResult && (Date.now() - authResult.timestamp) < 5 * 60 * 1000) {
        return authResult.user;
      }

      // Set flag to prevent concurrent requests
      authCheckInProgress = true;

      try {
        const result = await getQueryFn({ on401: "returnNull" })(...args);

        // Cache the result
        authResult = {
          user: result,
          timestamp: Date.now(),
        };

        return result;
      } finally {
        authCheckInProgress = false;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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