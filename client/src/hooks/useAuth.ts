import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@/../../shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const response = await fetch(`${baseUrl}/api/user`, {
          credentials: "include",
          signal: AbortSignal.timeout(30000),
        });

        if (response.ok) {
          return await response.json();
        }

        return null;
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}

/**
 * Clear auth cache and force a refetch. Call this after login/logout
 * so the auth state updates immediately.
 */
export function clearAuthCache(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.removeQueries({ queryKey: ["/api/user"] });
  queryClient.invalidateQueries({ queryKey: ["/api/user"] });
}
