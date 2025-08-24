
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@/../../shared/schema";

// Singleton pattern to prevent multiple auth requests
let authQueryKey = ["/api/auth/user"];

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: authQueryKey,
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchOnMount: false, // Prevent refetch on component mount
    refetchIntervalInBackground: false,
    networkMode: 'online',
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
