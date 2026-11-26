"use client";

import { useMemo, useSyncExternalStore } from "react";
import Cookies from "js-cookie";
import { decodeToken, UserPayload } from "@/lib/utils";

const AUTH_CHANGE_EVENT = "piki:auth-change";

/** Beri tahu seluruh subscriber `useCurrentUser` bahwa token sesi berubah. */
export function notifyAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

const subscribeAuth = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  window.addEventListener("focus", callback);
  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
    window.removeEventListener("focus", callback);
  };
};

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
    subscribeAuth,
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
