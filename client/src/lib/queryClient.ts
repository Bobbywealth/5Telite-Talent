import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
    },
  },
});

export function getQueryFn({ on401 }: { on401?: "returnNull" | "throw" } = {}) {
  return async ({ queryKey }: { queryKey: [string, ...unknown[]] }) => {
    const [url] = queryKey;
    const response = await fetch(url, {
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401 && on401 === "returnNull") {
        return null;
      }
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  };
}

export async function apiRequest(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    credentials: "include",
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}