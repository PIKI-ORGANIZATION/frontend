import Cookies from "js-cookie";

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

/**
 * Client fetch terpusat untuk komunikasi dengan backend API PIKI.
 * - Otomatis menyisipkan header Authorization: Bearer <token>.
 * - Mendukung FormData (Content-Type dibiarkan otomatis browser).
 * - Menangani 401 Unauthorized secara global: hapus cookie & redirect ke /login?expired=true.
 * - Menangani 403 Forbidden dengan pesan izin akses.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = Cookies.get("token");

  const headers = new Headers(options.headers || {});

  // Jangan set Content-Type jika body adalah FormData (biarkan browser set boundary)
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
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
    ...options,
    headers,
  });

  // 1. Tangani 401 Unauthorized (Token expired atau tidak valid)
  if (res.status === 401) {
    Cookies.remove("token");
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
    throw new ApiError(
      "Anda tidak memiliki izin untuk mengakses sumber daya ini.",
      403,
    );
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
