import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";

export interface AnggotaItem {
  uuid: string;
  namaLengkap: string;
  noWa: string;
  provinsi: string;
  kotaDomisili: string;
  statusKeanggotaan: string;
  noKta?: string;
  statusKta?: string;
  akun?: {
    email: string;
    registrasiList?: {
      id?: string;
      dpd?: string | null;
      dpc?: string | null;
      kode_provinsi?: string | null;
      kode_kabupaten?: string | null;
      statusVerifikasi?: string | null;
    } | null;
  };
  cabang?: {
    uuid?: string;
    namaCabang: string;
    provinsi: string;
  };
  created_at?: string;
  insert_at?: string;
}

export function useGetDaftarAnggota(
  params?: {
    search?: string;
    cabangUuid?: string;
    statusKta?: string;
    currentPage?: number;
    pageSize?: number;
  },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["anggota", "list", params],
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    retry: (failureCount, err) => {
      if (err instanceof ApiError && [401, 403, 404].includes(err.status)) {
        return false;
      }
      return failureCount < 2;
    },
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append("search", params.search);
      if (params?.cabangUuid)
        queryParams.append("cabangUuid", params.cabangUuid);
      if (params?.statusKta)
        queryParams.append("statusKta", params.statusKta);
      if (params?.currentPage)
        queryParams.append("currentPage", params.currentPage.toString());
      if (params?.pageSize)
        queryParams.append("pageSize", params.pageSize.toString());

      const qs = queryParams.toString();
      const endpoint = qs ? `/anggotas/?${qs}` : "/anggotas/";

      return apiFetch<{
        success: boolean;
        data: AnggotaItem[];
        pagination: {
          total: number;
          currentPage: number;
          pageSize: number;
          totalPages: number;
        };
      }>(endpoint);
    },
  });
}

export function useGetAnggotaDetail(uuid: string | null) {
  return useQuery({
    queryKey: ["anggota", "detail", uuid],
    retry: (failureCount, err) => {
      if (err instanceof ApiError && [401, 403, 404].includes(err.status)) {
        return false;
      }
      return failureCount < 2;
    },
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return apiFetch<Record<string, any>>(`/anggotas/${uuid}`);
    },
    enabled: !!uuid,
  });
}
