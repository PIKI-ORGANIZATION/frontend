/**
 * Tipe data & model manajemen wilayah (DPD / DPC) dan cabang PIKI
 */

export interface DpdItem {
  id: string;
  kodeProvinsi: string;
  dpd: string;
  pengurus: string | null;
  noHandphone: string | null;
  keterangan: string | null;
  penerbitanSk: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  cabang?: {
    uuid: string;
    namaCabang: string;
  } | null;
}

export interface DpcItem {
  id: number;
  kode_kabupaten: string;
  kode_provinsi: string;
  dpd: string;
  dpc: string;
  pengurus: string | null;
  no_handphone: string | null;
  keterangan: string | null;
  penerbitan_sk: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  cabang?: {
    uuid: string;
    namaCabang: string;
  } | null;
}

export interface MasterProvinsi {
  kode_provinsi: string;
  nama_provinsi: string;
}

export interface MasterKabupaten {
  kode_kabupaten: string;
  nama_kabupaten: string;
  kode_provinsi: string;
}

export interface CabangItem {
  uuid: string;
  namaCabang: string;
  provinsi: string;
  kabupatenKota: string;
  alamat?: string | null;
  email: string;
  noWa: string;
  statusCabang: string;
  dpdId?: string | null;
  dpcId?: number | null;
  dpdRef?: {
    id: string;
    dpd?: string | null;
    kodeProvinsi?: string | null;
  } | null;
  dpcRef?: {
    id: number;
    dpc?: string | null;
    dpd?: string | null;
    kode_kabupaten?: string | null;
  } | null;
}

export interface RoleItem {
  uuid: string;
  namaRole: string;
  deskripsi?: string | null;
}

export interface DpdFormValues {
  kodeProvinsi: string;
  pengurus: string;
  noHandphone: string;
  keterangan: string;
  penerbitanSk: string;
}

export interface DpcFormValues {
  kode_kabupaten: string;
  pengurus: string;
  no_handphone: string;
  keterangan: string;
  penerbitan_sk: string;
}

export interface LinkCabangPayload {
  cabangUuid: string;
  dpdId?: string | null;
  dpcId?: number | null;
}

export interface AssignAdminCabangPayload {
  akunUuid: string;
  cabangUuid: string | null;
  roleUuids: string[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

