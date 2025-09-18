import { QueryClient } from "@tanstack/react-query";

// Helper function to construct full API URLs
function getApiUrl(url: string): string {
  if (url.startsWith('http')) {
    return url; // Already a full URL
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  return `${baseUrl}${url}`;
}

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
    const response = await fetch(getApiUrl(url), {
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

export async function apiRequest(method: string, url: string, body?: any) {
  const response = await fetch(getApiUrl(url), {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}