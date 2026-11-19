"use client";

import { useMemo, useSyncExternalStore } from "react";
import Cookies from "js-cookie";
import { decodeToken, UserPayload } from "@/lib/utils";

const subscribeNoop = () => () => {};
const getClientToken = (): string | null => Cookies.get("token") ?? null;
const getServerToken = (): undefined => undefined;

export interface CurrentUserState {
  user: UserPayload | null;
  isReady: boolean;
}

/**
 * Membaca dan men-decode payload JWT user saat ini secara aman terhadap SSR hydration.
 * - Saat SSR / belum terhidrasi: `{ user: null, isReady: false }`
 * - Setelah terhidrasi di client: `{ user: UserPayload | null, isReady: true }`
 */
export function useCurrentUser(): CurrentUserState {
  const rawToken = useSyncExternalStore(
    subscribeNoop,
    getClientToken,
    getServerToken,
  );

  const isReady = rawToken !== undefined;

  const user = useMemo<UserPayload | null>(() => {
    if (!rawToken) return null;
    return decodeToken(rawToken);
  }, [rawToken]);

  return { user, isReady };
}
