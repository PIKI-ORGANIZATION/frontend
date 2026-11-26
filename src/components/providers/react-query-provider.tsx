"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useRef, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  const { user, isReady } = useCurrentUser();
  const sessionKey = user
    ? `${user.sub}:${user.cabangId ?? ""}`
    : "guest";
  const prevSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (
      prevSessionRef.current !== null &&
      prevSessionRef.current !== sessionKey
    ) {
      void queryClient.cancelQueries();
      queryClient.clear();
    }
    prevSessionRef.current = sessionKey;
  }, [isReady, sessionKey, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
