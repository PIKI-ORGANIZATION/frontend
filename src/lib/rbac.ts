import { UserPayload } from "./utils";

// Definisi Role berdasarkan schema Prisma
export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN_DPP: "ADMIN_DPP",   // Nantinya SUPER_ADMIN akan berubah menjadi ini
  ADMIN_CABANG: "ADMIN_CABANG",
  ADMIN_DPC: "ADMIN_DPC",   // Nantinya ADMIN_CABANG akan berubah menjadi ini
  KETUA_CABANG: "KETUA_CABANG",
  USER: "USER",
  MEMBER: "MEMBER",
} as const;

export type RoleKey = keyof typeof ROLES;

/**
 * Memeriksa apakah user memiliki salah satu dari role yang diizinkan.
 * Bersifat case-insensitive.
 */
export function hasRole(user: UserPayload | null | undefined, allowedRoles: string[]): boolean {
  if (!user || !user.roles || !Array.isArray(user.roles)) return false;

  const userRolesUpper = user.roles.map(r => r.toUpperCase());
  return allowedRoles.some(role => userRolesUpper.includes(role.toUpperCase()));
}

/**
 * Role groups untuk mempermudah pengecekan
 */
export const ROLE_GROUPS = {
  // Semua role yang dianggap sebagai 'Admin' (memiliki akses dashboard manajemen)
  ADMINS: [
    ROLES.SUPER_ADMIN, 
    ROLES.ADMIN_DPP, 
    ROLES.ADMIN_CABANG, 
    ROLES.ADMIN_DPC, 
    ROLES.KETUA_CABANG
  ],
  // Role anggota biasa
  USERS: [
    ROLES.USER, 
    ROLES.MEMBER
  ],
};

/**
 * Memeriksa apakah user adalah Super Admin (DPP)
 */
export function isSuperAdmin(user: UserPayload | null | undefined): boolean {
  if (!user) return false;
  const isSuperRole = hasRole(user, [ROLES.SUPER_ADMIN, ROLES.ADMIN_DPP]);
  const hasManageAll = user.permissions?.includes("MANAGE_ALL_CABANG");
  return Boolean(isSuperRole || hasManageAll);
}

/**
 * Memeriksa apakah user adalah admin DPD
 */
export function isDpdAdmin(user: UserPayload | null | undefined): boolean {
  return user?.tingkat === "DPD" && Boolean(user?.dpdId);
}

/**
 * Memeriksa apakah user adalah admin DPC
 */
export function isDpcAdmin(user: UserPayload | null | undefined): boolean {
  return user?.tingkat === "DPC" && Boolean(user?.dpcId);
}

/**
 * Memeriksa apakah user memiliki permission tertentu (Superadmin selalu true)
 */
export function hasPermission(
  user: UserPayload | null | undefined,
  requiredPermission: string,
): boolean {
  if (!user || !user.permissions || !Array.isArray(user.permissions)) return false;
  if (isSuperAdmin(user)) return true;
  return user.permissions.includes(requiredPermission);
}

/**
 * Memeriksa apakah user memiliki minimal satu permission dalam daftar yang diberikan.
 * Jika daftar kosong, mengembalikan true. Superadmin selalu true.
 */
export function hasAnyPermission(
  user: UserPayload | null | undefined,
  requiredPermissions: readonly string[],
): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  if (!user.permissions || !Array.isArray(user.permissions)) return false;
  return requiredPermissions.some((perm) => user.permissions!.includes(perm));
}

export interface DashboardRoutePolicy {
  /** Path pattern (mendukung wildcard '*' per segmen, mis. '/dashboard/berita/*\/edit') */
  pattern: string;
  /** Jika true, hanya cocok untuk path persis (tanpa sub-path) */
  exact?: boolean;
  /** Daftar permission yang mengizinkan akses (OR logic). Kosong = semua admin terautentikasi. */
  requiredPermissions: readonly string[];
  /** Jika true, hanya Super Admin / Admin DPP yang diizinkan */
  requireSuperAdmin?: boolean;
}

/**
 * Single Source of Truth kebijakan rute `/dashboard/*` (Deny-by-Default).
 * Digunakan bersama oleh Next.js Middleware, AppSidebar, Command Palette, dan Header.
 * Urutan penting: rute paling spesifik harus ditempatkan lebih awal.
 * Rute `/dashboard/*` yang tidak terdaftar otomatis DITOLAK (deny-by-default).
 */
export const DASHBOARD_ROUTE_POLICIES: readonly DashboardRoutePolicy[] = [
  {
    pattern: "/dashboard",
    exact: true,
    requiredPermissions: [],
  },
  {
    pattern: "/dashboard/pengaturan",
    requiredPermissions: [],
  },
  {
    pattern: "/dashboard/anggota",
    requiredPermissions: ["ANGGOTA_READ", "SENIOR_READ", "MANAGE_ALL_CABANG"],
  },
  {
    pattern: "/dashboard/verifikasi",
    requiredPermissions: ["REGISTRASI_APPROVE"],
  },
  {
    pattern: "/dashboard/wilayah",
    requiredPermissions: ["MANAGE_ALL_CABANG", "CABANG_READ", "CABANG_UPDATE"],
  },
  {
    pattern: "/dashboard/akun",
    requiredPermissions: ["AKUN_CREATE", "AKUN_UPDATE"],
  },
  {
    pattern: "/dashboard/konten/landing",
    requiredPermissions: [
      "SEJARAH_MANAGE",
      "APP_SETTING_MANAGE",
      "MANAGE_PAGE_SETTINGS",
      "MANAGE_ALL_CABANG",
    ],
  },
  {
    pattern: "/dashboard/berita/baru",
    requiredPermissions: ["NEWS_UTAMA_CREATE", "MANAGE_ALL_CABANG"],
  },
  {
    pattern: "/dashboard/berita/*/edit",
    requiredPermissions: ["NEWS_UTAMA_UPDATE", "MANAGE_ALL_CABANG"],
  },
  {
    pattern: "/dashboard/berita",
    requiredPermissions: [
      "NEWS_UTAMA_READ",
      "NEWS_UTAMA_CREATE",
      "NEWS_UTAMA_UPDATE",
      "MANAGE_ALL_CABANG",
    ],
  },
  {
    pattern: "/dashboard/galeri",
    requiredPermissions: ["GALERI_MANAGE", "GALERI_READ", "MANAGE_ALL_CABANG"],
  },
  {
    pattern: "/dashboard/faq",
    requiredPermissions: [
      "FAQ_READ",
      "FAQ_CREATE",
      "FAQ_UPDATE",
      "FAQ_ARCHIVE",
      "FAQ_MANAGE",
      "MANAGE_ALL_CABANG",
    ],
  },
  {
    pattern: "/dashboard/pengurus",
    requiredPermissions: [
      "STRUKTUR_READ",
      "STRUKTUR_UPDATE",
      "MANAGE_ALL_CABANG",
    ],
  },
];

function normalizePath(pathname: string): string {
  const clean = pathname.split(/[?#]/)[0] || "/";
  if (clean.length > 1 && clean.endsWith("/")) {
    return clean.slice(0, -1);
  }
  return clean;
}

function matchRoutePattern(
  pathname: string,
  policy: DashboardRoutePolicy,
): boolean {
  const clean = normalizePath(pathname);

  if (policy.exact) {
    return clean === policy.pattern;
  }

  if (policy.pattern.includes("*")) {
    const patternSegments = policy.pattern.split("/").filter(Boolean);
    const pathSegments = clean.split("/").filter(Boolean);
    if (pathSegments.length !== patternSegments.length) return false;
    return patternSegments.every(
      (seg, idx) => seg === "*" || seg === pathSegments[idx],
    );
  }

  return clean === policy.pattern || clean.startsWith(`${policy.pattern}/`);
}

export function resolveDashboardRoutePolicy(
  pathname: string,
): DashboardRoutePolicy | null {
  for (const policy of DASHBOARD_ROUTE_POLICIES) {
    if (matchRoutePattern(pathname, policy)) {
      return policy;
    }
  }
  return null;
}

/**
 * Evaluasi akses rute `/dashboard/*` secara terpusat dengan prinsip Deny-by-Default.
 * - Non-admin atau belum login -> ditolak.
 * - Rute tidak terdaftar di DASHBOARD_ROUTE_POLICIES -> ditolak.
 * - Permission tidak terpenuhi -> ditolak.
 */
export function canAccessDashboardPath(
  pathname: string,
  user: UserPayload | null | undefined,
): boolean {
  if (!user || !hasRole(user, ROLE_GROUPS.ADMINS)) return false;

  const policy = resolveDashboardRoutePolicy(pathname);
  if (!policy) return false;

  if (policy.requireSuperAdmin && !isSuperAdmin(user)) {
    return false;
  }

  if (policy.requiredPermissions.length > 0) {
    return hasAnyPermission(user, policy.requiredPermissions);
  }

  return true;
}

export type AdminScope = "DPP" | "DPD" | "DPC" | "UNLINKED";

export function resolveAdminScope(
  user: UserPayload | null | undefined,
): AdminScope {
  if (isSuperAdmin(user)) return "DPP";
  if (isDpdAdmin(user)) return "DPD";
  if (isDpcAdmin(user)) return "DPC";
  return "UNLINKED";
}

export interface GaleriAccess {
  scope: AdminScope;
  canView: boolean;
  canManage: boolean;
  canViewStats: boolean;
  canSelectCabang: boolean;
  isUnlinkedBranchAdmin: boolean;
}

/**
 * Mengecek apakah admin yang sedang login berhak mengubah/menghapus item milik `targetCabangUuid`.
 * Selaras dengan backend `assertCanWriteCabangItem`:
 * - SuperAdmin (DPP): bebas mengelola seluruh item (Pusat, DPD, DPC).
 * - Admin DPD / DPC: hanya boleh mengelola item milik cabangnya sendiri (`targetCabangUuid === user.cabangId`).
 */
export function canWriteCabangItem(
  user: UserPayload | null | undefined,
  targetCabangUuid?: string | null,
): boolean {
  if (!user || !hasRole(user, ROLE_GROUPS.ADMINS)) return false;
  if (isSuperAdmin(user)) return true;
  return Boolean(user.cabangId && targetCabangUuid === user.cabangId);
}

/**
 * Matriks hak akses CMS Galeri selaras dengan backend (/api/v1/galeri).
 * - SuperAdmin (DPP): melihat & mengelola semua galeri (Pusat, DPD, DPC).
 * - Admin DPD: melihat galeri miliknya + DPC se-provinsinya, namun hanya bisa mengubah miliknya sendiri.
 * - Admin DPC: melihat & mengelola galeri milik cabangnya sendiri (wajib tertaut ke Cabang).
 * - GALERI_READ: mode baca saja.
 */
export function resolveGaleriAccess(
  user: UserPayload | null | undefined,
): GaleriAccess {
  if (!user || !hasRole(user, ROLE_GROUPS.ADMINS)) {
    return {
      scope: "UNLINKED",
      canView: false,
      canManage: false,
      canViewStats: false,
      canSelectCabang: false,
      isUnlinkedBranchAdmin: false,
    };
  }

  const scope = resolveAdminScope(user);
  const superAdmin = isSuperAdmin(user);
  const canManage = superAdmin || hasPermission(user, "GALERI_MANAGE");
  const canView = canManage || hasPermission(user, "GALERI_READ");
  const isUnlinkedBranchAdmin = !superAdmin && canManage && !user.cabangId;

  return {
    scope,
    canView,
    canManage,
    canViewStats: canManage,
    canSelectCabang: superAdmin,
    isUnlinkedBranchAdmin,
  };
}

export interface LandingCmsAccess {
  scope: AdminScope;
  canView: boolean;
  canManageSejarah: boolean;
  canManagePageSettings: boolean;
  canSelectCabang: boolean;
  isUnlinkedBranchAdmin: boolean;
}

/**
 * Matriks hak akses CMS Landing Page selaras dengan backend (/api/v1/sejarah & /page-settings).
 */
export function resolveLandingCmsAccess(
  user: UserPayload | null | undefined,
): LandingCmsAccess {
  if (!user || !hasRole(user, ROLE_GROUPS.ADMINS)) {
    return {
      scope: "UNLINKED",
      canView: false,
      canManageSejarah: false,
      canManagePageSettings: false,
      canSelectCabang: false,
      isUnlinkedBranchAdmin: false,
    };
  }

  const scope = resolveAdminScope(user);
  const superAdmin = isSuperAdmin(user);
  const canManageSejarah =
    superAdmin || hasPermission(user, "SEJARAH_MANAGE");
  const canManagePageSettings =
    superAdmin ||
    hasAnyPermission(user, ["APP_SETTING_MANAGE", "MANAGE_PAGE_SETTINGS"]);
  const isUnlinkedBranchAdmin = !superAdmin && canManageSejarah && !user.cabangId;

  return {
    scope,
    canView: canManageSejarah || canManagePageSettings,
    canManageSejarah,
    canManagePageSettings,
    canSelectCabang: superAdmin,
    isUnlinkedBranchAdmin,
  };
}

export interface PengurusCmsAccess {
  scope: AdminScope;
  canView: boolean;
  canManage: boolean;
  canDelete: boolean;
  canManageMaster: boolean;
  canSelectCabang: boolean;
  isUnlinkedBranchAdmin: boolean;
}

/**
 * Matriks hak akses CMS Data Pengurus (Periode Kepengurusan & Struktur Organisasi).
 * Selaras dengan permission di periodeKepengurusan.routes.ts & strukturOrganisasi.routes.ts.
 */
export function resolvePengurusCmsAccess(
  user: UserPayload | null | undefined,
): PengurusCmsAccess {
  if (!user || !hasRole(user, ROLE_GROUPS.ADMINS)) {
    return {
      scope: "UNLINKED",
      canView: false,
      canManage: false,
      canDelete: false,
      canManageMaster: false,
      canSelectCabang: false,
      isUnlinkedBranchAdmin: false,
    };
  }

  const scope = resolveAdminScope(user);
  const superAdmin = isSuperAdmin(user);
  const canManage =
    superAdmin ||
    hasAnyPermission(user, ["STRUKTUR_CREATE", "STRUKTUR_UPDATE", "CABANG_UPDATE"]);
  const canView =
    canManage ||
    hasAnyPermission(user, ["STRUKTUR_READ", "CABANG_READ"]);
  const canDelete =
    superAdmin ||
    hasAnyPermission(user, ["STRUKTUR_DELETE", "CABANG_DELETE", "CABANG_UPDATE"]);
  const canManageMaster =
    superAdmin || hasAnyPermission(user, ["CABANG_CREATE", "CABANG_UPDATE"]);
  const isUnlinkedBranchAdmin = !superAdmin && canManage && !user.cabangId;

  return {
    scope,
    canView,
    canManage,
    canDelete,
    canManageMaster,
    canSelectCabang: superAdmin,
    isUnlinkedBranchAdmin,
  };
}

export type WilayahScope = "DPP" | "DPD" | "DPC" | "UNLINKED";

export interface WilayahAccess {
  scope: WilayahScope;
  canViewDpd: boolean;
  canCreateDpd: boolean;
  canEditDpd: boolean;
  canDeleteDpd: boolean;
  canViewDpc: boolean;
  canCreateDpc: boolean;
  canEditDpc: boolean;
  canDeleteDpc: boolean;
  canViewCabang: boolean;
  canCreateCabang: boolean;
  canEditSelfCabang: boolean;
  canDeleteCabang: boolean;
  canManageCabangLink: boolean;
  canFilterProvinsi: boolean;
  isSelfEditOnly: boolean;
}

/**
 * Menentukan matriks hak akses UI halaman Manajemen Wilayah & Cabang
 * selaras dengan aturan backend (/api/v1/dpd, /api/v1/dpd-dpc, & /api/v1/cabang).
 */
export function resolveWilayahAccess(
  user: UserPayload | null | undefined,
): WilayahAccess {
  if (isSuperAdmin(user)) {
    return {
      scope: "DPP",
      canViewDpd: true,
      canCreateDpd: true,
      canEditDpd: true,
      canDeleteDpd: true,
      canViewDpc: true,
      canCreateDpc: true,
      canEditDpc: true,
      canDeleteDpc: true,
      canViewCabang: true,
      canCreateCabang: true,
      canEditSelfCabang: true,
      canDeleteCabang: true,
      canManageCabangLink: true,
      canFilterProvinsi: true,
      isSelfEditOnly: false,
    };
  }

  const canReadCabang = hasAnyPermission(user, ["CABANG_READ", "CABANG_UPDATE"]);
  const canUpdateCabang = hasPermission(user, "CABANG_UPDATE");
  const hasLinkedCabang = Boolean(user?.cabangId);

  if (isDpdAdmin(user)) {
    return {
      scope: "DPD",
      canViewDpd: true,
      canCreateDpd: false,
      canEditDpd: canUpdateCabang,
      canDeleteDpd: false,
      canViewDpc: true,
      canCreateDpc: false,
      canEditDpc: false, // Backend: Admin DPD hanya read-only pada data DPC
      canDeleteDpc: false,
      canViewCabang: hasLinkedCabang && canReadCabang,
      canCreateCabang: false,
      canEditSelfCabang: hasLinkedCabang && canUpdateCabang,
      canDeleteCabang: false,
      canManageCabangLink: false,
      canFilterProvinsi: false,
      isSelfEditOnly: true,
    };
  }

  if (isDpcAdmin(user)) {
    return {
      scope: "DPC",
      canViewDpd: false, // Backend: GET /dpd oleh DPC -> 403
      canCreateDpd: false,
      canEditDpd: false,
      canDeleteDpd: false,
      canViewDpc: true,
      canCreateDpc: false,
      canEditDpc: canUpdateCabang,
      canDeleteDpc: false,
      canViewCabang: hasLinkedCabang && canReadCabang,
      canCreateCabang: false,
      canEditSelfCabang: hasLinkedCabang && canUpdateCabang,
      canDeleteCabang: false,
      canManageCabangLink: false,
      canFilterProvinsi: false,
      isSelfEditOnly: true,
    };
  }

  return {
    scope: "UNLINKED",
    canViewDpd: false,
    canCreateDpd: false,
    canEditDpd: false,
    canDeleteDpd: false,
    canViewDpc: false,
    canCreateDpc: false,
    canEditDpc: false,
    canDeleteDpc: false,
    canViewCabang: false,
    canCreateCabang: false,
    canEditSelfCabang: false,
    canDeleteCabang: false,
    canManageCabangLink: false,
    canFilterProvinsi: false,
    isSelfEditOnly: false,
  };
}

export interface FaqCmsAccess {
  scope: AdminScope;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canArchive: boolean;
  canSelectCabang: boolean;
  isUnlinkedBranchAdmin: boolean;
}

/**
 * Matriks hak akses CMS FAQ selaras dengan backend (/api/v1/faq).
 */
export function resolveFaqCmsAccess(
  user: UserPayload | null | undefined,
): FaqCmsAccess {
  if (!user || !hasRole(user, ROLE_GROUPS.ADMINS)) {
    return {
      scope: "UNLINKED",
      canView: false,
      canCreate: false,
      canUpdate: false,
      canArchive: false,
      canSelectCabang: false,
      isUnlinkedBranchAdmin: false,
    };
  }

  const scope = resolveAdminScope(user);
  const superAdmin = isSuperAdmin(user);
  const manage = superAdmin || hasPermission(user, "FAQ_MANAGE");
  const canCreate = manage || hasPermission(user, "FAQ_CREATE");
  const canUpdate = manage || hasPermission(user, "FAQ_UPDATE");
  const canArchive = manage || hasPermission(user, "FAQ_ARCHIVE");
  const canView =
    canCreate || canUpdate || canArchive || hasPermission(user, "FAQ_READ");
  const isUnlinkedBranchAdmin =
    !superAdmin && (canCreate || canUpdate || canArchive) && !user.cabangId;

  return {
    scope,
    canView,
    canCreate,
    canUpdate,
    canArchive,
    canSelectCabang: superAdmin,
    isUnlinkedBranchAdmin,
  };
}
