import { RoleItem } from "@/features/wilayah/types";

export type StatusAkun = "ACTIVE" | "INACTIVE";

export interface AkunAnggotaSummary {
  uuid: string;
  namaLengkap: string;
  noKta?: string | null;
  cabangUuid?: string | null;
}

export interface AkunItem {
  uuid: string;
  email: string;
  username: string;
  statusAkun: StatusAkun;
  cabangUuid?: string | null;
  anggotaUuid?: string | null;
  anggota?: AkunAnggotaSummary | null;
  roles: RoleItem[];
  insert_at?: string;
  update_at?: string;
}

export interface AkunPagination {
  currentPage: number;
  pageSize: number;
  total: number;
}

export interface AkunListResponse {
  success?: boolean;
  message?: string;
  data?: {
    result: AkunItem[];
    pagination: AkunPagination;
  };
  result?: AkunItem[];
  pagination?: AkunPagination;
}

export interface AkunListParams {
  search?: string;
  statusAkun?: StatusAkun;
  currentPage?: number;
  pageSize?: number;
  enabled?: boolean;
}

export interface CreateAkunPayload {
  email: string;
  username: string;
  password: string;
  cabangUuid?: string;
  anggotaUuid?: string;
  roleUuids?: string[];
}

export interface UpdateAkunPayload {
  uuid: string;
  email?: string;
  username?: string;
  password?: string;
  statusAkun?: StatusAkun;
  cabangUuid?: string | null;
  roleUuids?: string[];
}
