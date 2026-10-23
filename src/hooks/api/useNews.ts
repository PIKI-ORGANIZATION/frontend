import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import {
  NewsItem,
  NewsPagination,
  resolveNewsScope,
  unwrapNewsDetail,
  unwrapNewsList,
} from "@/lib/news";
import { decodeToken } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export function useNewsScope() {
  const [scope, setScope] = useState<ReturnType<typeof resolveNewsScope> | null>(null);
  useEffect(() => {
    setScope(resolveNewsScope(decodeToken(Cookies.get("token") || "")));
  }, []);
  return scope;
}

export interface NewsQueryParams {
  search?: string;
  currentPage?: number;
  pageSize?: number;
  kategori?: string;
  tag?: string;
  statusNewsUtama?: string;
  cabangUuid?: string;
  fixed?: string;
  sort?: "populer" | "terbaru";
}

export interface NewsWriteInput {
  judul: string;
  ringkasan?: string;
  konten: string;
  slug: string;
  url_thumbnail_img?: string | null;
  statusNewsUtama?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  durasi_baca?: number;
  cabangUuid?: string | null;
  kategori?: string[];
  tags?: string[];
}

async function readError(res: Response) {
  const body = await res.json().catch(() => ({}));
  const flat = body?.errors?.fieldErrors
    ? Object.values(body.errors.fieldErrors).flat().join(", ")
    : "";
  throw new Error(body?.message || flat || body?.error || "Permintaan berita gagal");
}

function authHeaders() {
  const token = Cookies.get("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchNews(params: NewsQueryParams | undefined, withAuth: boolean) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.currentPage) query.set("currentPage", String(params.currentPage));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  if (params?.kategori) query.set("kategori", params.kategori);
  if (params?.tag) query.set("tag", params.tag);
  if (params?.statusNewsUtama) query.set("statusNewsUtama", params.statusNewsUtama);
  if (params?.cabangUuid) query.set("cabangUuid", params.cabangUuid);
  if (params?.fixed) query.set("fixed", params.fixed);
  if (params?.sort) query.set("sort", params.sort);

  const res = await fetch(`${API_BASE}/news-utama/?${query.toString()}`, {
    headers: withAuth ? authHeaders() : { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) await readError(res);
  return unwrapNewsList(await res.json());
}

export function usePublicNews(params?: NewsQueryParams) {
  return useQuery({
    queryKey: ["news", "public", params],
    queryFn: () => fetchNews(params, false),
  });
}

export function useAdminNews(params?: NewsQueryParams) {
  return useQuery({
    queryKey: ["news", "admin", params],
    queryFn: () => fetchNews({ ...params, fixed: params?.fixed ?? "all" }, true),
  });
}

export function usePublicNewsBySlug(slug: string) {
  return useQuery({
    queryKey: ["news", "slug", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/news-utama/slug/${slug}`, {
        cache: "no-store",
      });
      if (!res.ok) await readError(res);
      return unwrapNewsDetail(await res.json());
    },
  });
}

export function useAdminNewsById(uuid: string) {
  return useQuery({
    queryKey: ["news", "admin", uuid],
    enabled: Boolean(uuid),
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/news-utama/${uuid}`, {
        headers: authHeaders(),
      });
      if (!res.ok) await readError(res);
      return unwrapNewsDetail(await res.json());
    },
  });
}

export function useNewsTaxonomy() {
  return useQuery({
    queryKey: ["news", "taxonomy"],
    queryFn: async () => {
      const [kategoriRes, tagRes] = await Promise.all([
        fetch(`${API_BASE}/news-kategori/?pageSize=100`),
        fetch(`${API_BASE}/news-tags/?pageSize=100`),
      ]);
      if (!kategoriRes.ok || !tagRes.ok) {
        throw new Error("Gagal memuat kategori atau tag berita");
      }
      const kategoriJson = await kategoriRes.json();
      const tagJson = await tagRes.json();
      return {
        kategori: (kategoriJson?.data?.result ?? []) as {
          uuid: string;
          nama_kategori: string;
          slug: string;
        }[],
        tags: (tagJson?.data?.result ?? []) as {
          uuid: string;
          nama_tag: string;
        }[],
      };
    },
  });
}

export function useNewsCabangOptions(enabled: boolean) {
  return useQuery({
    queryKey: ["news", "cabang-options"],
    enabled,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/cabang/?pageSize=100&currentPage=1`, {
        headers: authHeaders(),
      });
      if (!res.ok) await readError(res);
      const json = await res.json();
      const items = (json?.data?.result ?? []) as {
        uuid: string;
        namaCabang: string;
        isCabang?: boolean;
        provinsi?: string;
        kabupatenKota?: string;
        wilayah?: string | null;
      }[];
      return items;
    },
  });
}

export function useCreateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewsWriteInput) => {
      const res = await fetch(`${API_BASE}/news-utama/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(input),
      });
      if (!res.ok) await readError(res);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });
}

export function useUpdateNews(uuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewsWriteInput) => {
      const res = await fetch(`${API_BASE}/news-utama/${uuid}/update`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(input),
      });
      if (!res.ok) await readError(res);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });
}

export function useArchiveNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const res = await fetch(`${API_BASE}/news-utama/${uuid}/archive`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (!res.ok) await readError(res);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });
}

export type { NewsItem, NewsPagination };
