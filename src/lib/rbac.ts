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
