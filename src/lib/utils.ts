import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type TingkatWilayah = "DPD" | "DPC";

export interface UserPayload {
  sub?: string;
  email?: string;
  username?: string;
  roles?: string[];
  permissions?: string[];
  cabangId?: string | null;
  cabang?: string | null;
  isCabang?: boolean | null;
  tingkat?: TingkatWilayah | null;
  dpdId?: string | null;
  dpcId?: number | null;
  isApprovedByDPC?: boolean;
  isApprovedByDPP?: boolean;
  isFromAdmin?: boolean;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export function decodeToken(token: string): UserPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.log(error);

    return null;
  }
}
