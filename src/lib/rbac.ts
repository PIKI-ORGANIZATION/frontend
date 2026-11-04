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
