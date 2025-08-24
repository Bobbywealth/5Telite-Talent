
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@/../../shared/schema";

const authQueryKey = ["/api/auth/user"];

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: authQueryKey,
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider stale after 5 minutes
    gcTime: 10 * 60 * 1000, // Garbage collect after 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchOnMount: true, // Fetch on mount only once
    refetchIntervalInBackground: false,
    networkMode: 'online',
  });

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
