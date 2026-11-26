import Cookies from "js-cookie";
import { notifyAuthChange } from "@/hooks/useCurrentUser";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export interface ApiFetchOptions extends RequestInit {
  /** Jika true, header Authorization tidak disisipkan (untuk endpoint/halaman publik) */
  skipAuth?: boolean;
}

/**
 * Client fetch terpusat untuk komunikasi dengan backend API PIKI.
 * - Otomatis menyisipkan header Authorization: Bearer <token> (kecuali skipAuth: true).
 * - Mendukung FormData (Content-Type dibiarkan otomatis browser).
 * - Menangani 401 Unauthorized secara global: hapus cookie & redirect ke /login?expired=true.
 * - Menangani 403 Forbidden dengan pesan izin akses.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;
  const token = skipAuth ? undefined : Cookies.get("token");

  const headers = new Headers(fetchOptions.headers || {});

  // Jangan set Content-Type jika body adalah FormData (biarkan browser set boundary)
  if (!headers.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE}${cleanEndpoint}`;

  const res = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // 1. Tangani 401 Unauthorized (Token expired atau tidak valid)
  if (res.status === 401) {
    Cookies.remove("token");
    notifyAuthChange();
    if (typeof window !== "undefined") {
      // Cegah infinite redirect loop jika sudah di halaman login
      if (!window.location.pathname.startsWith("/login")) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/login?expired=true";
      }
    }
    throw new ApiError(
      "Sesi Anda telah kedaluwarsa. Silakan masuk kembali.",
      401,
    );
  }

  // 2. Tangani 403 Forbidden (Tidak memiliki hak akses / permission)
  if (res.status === 403) {
    const forbiddenData = await res.json().catch(() => null);
    const forbiddenMsg =
      forbiddenData?.message ||
      "Anda tidak memiliki izin untuk mengakses sumber daya ini.";
    throw new ApiError(forbiddenMsg, 403, forbiddenData);
  }

  // 3. Parse JSON response jika ada
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg =
      data?.message ||
      (typeof data === "string" ? data : `Terjadi kesalahan (Kode: ${res.status})`);
    throw new ApiError(errorMsg, res.status, data);
  }

  return data as T;
}

/**
 * Mengakhiri sesi login pengguna secara aman:
 * 1. Memanggil POST /api/v1/auth/logout untuk mem-blacklist token JWT di Redis server.
 * 2. Selalu menghapus cookie `token` di browser pada blok `finally`.
 */
export async function logoutSession(): Promise<void> {
  const token = Cookies.get("token");
  try {
    if (token) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch {
    // Abaikan kegagalan jaringan saat logout agar pencabutan sesi lokal tetap berjalan
  } finally {
    Cookies.remove("token");
    notifyAuthChange();
  }
}
