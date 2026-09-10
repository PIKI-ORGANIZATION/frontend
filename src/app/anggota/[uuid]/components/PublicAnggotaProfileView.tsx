"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Building2,
  Hash,
  ShieldCheck,
  Clock,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { PublicAnggotaProfile } from "@/hooks/api/usePublicAnggota";
import { cn } from "@/lib/utils";
import { PublicKtaCard } from "./PublicKtaCard";

interface Props {
  anggota: PublicAnggotaProfile;
}

// ── helpers ──────────────────────────────────────────────────────────────
function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function statusLabel(s: string | null | undefined) {
  if (!s)
    return {
      label: "Tidak Diketahui",
      color: "text-zinc-500 bg-zinc-100 dark:bg-zinc-800",
    };
  const map: Record<string, { label: string; color: string }> = {
    AKTIF: {
      label: "Aktif",
      color:
        "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400",
    },
    ACTIVE: {
      label: "Aktif",
      color:
        "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400",
    },
    NON_MEMBER: {
      label: "Non-Aktif",
      color: "text-zinc-600 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400",
    },
    INACTIVE: {
      label: "Non-Aktif",
      color: "text-zinc-600 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400",
    },
    APPROVED_DPP: {
      label: "Disetujui DPP",
      color: "text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400",
    },
  };
  return map[s] ?? { label: s, color: "text-zinc-500 bg-zinc-100" };
}

// ── InfoRow ───────────────────────────────────────────────────────────────
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium text-foreground text-right max-w-[55%] break-words">
        {value}
      </span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export function PublicAnggotaProfileView({ anggota }: Props) {
  const isKtaActive = anggota.statusKta === "ACTIVE";
  const verifikasiStatus = anggota.registrasi?.statusVerifikasi;
  const isVerified =
    verifikasiStatus === "APPROVED_DPP" ||
    anggota.statusKeanggotaan === "AKTIF";

  const membership = statusLabel(anggota.statusKeanggotaan);
  const verifikasiInfo = statusLabel(verifikasiStatus);

  const joinedDate = formatDate(anggota.insert_at);
  const ktaActiveDate = formatDate(anggota.tglAktivasiKta);
  const approvedDate = formatDate(anggota.registrasi?.tglPersetujuanPdp);

  const initials = anggota.namaLengkap
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const wilayah =
    anggota.cabang?.namaCabang ??
    anggota.registrasi?.dpc ??
    anggota.kotaDomisili;

  return (
    <div className="min-h-dvh bg-background">
      {/* ── Top Header ── */}
      <header className="sticky top-0 py-4  mb-4 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left: Logo + Org name */}
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo1.png"
              alt="PIKI"
              width={32}
              height={32}
              className="object-contain shrink-0"
            />
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground leading-none uppercase tracking-widest hidden sm:block">
                Persatuan Intelegensia Kristen Indonesia
              </span>
              <span className="text-sm font-semibold text-foreground leading-tight">
                DPP PIKI
              </span>
            </div>
          </div>

          {/* Right: Verified badge */}
          <div className="flex items-center gap-1.5 bg-primary/8 border border-primary/20 text-primary rounded-full px-3 py-1">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-semibold tracking-wide">
              Profil Resmi
            </span>
          </div>
        </div>
      </header>

      {/* ── Page Content ── */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Profile identity bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="bg-card border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
        >
          {/* Avatar */}
          <div className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 border-border shadow">
            {anggota.profileImg ? (
              <Image
                src={anggota.profileImg}
                alt={anggota.namaLengkap}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                {initials}
              </div>
            )}
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-card rounded-full p-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            )}
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground leading-tight">
              {anggota.namaLengkap}
            </h1>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full",
                  membership.color,
                )}
              >
                {isVerified ? (
                  <ShieldCheck className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                {membership.label}
              </span>
              {verifikasiStatus && (
                <span
                  className={cn(
                    "inline-flex items-center text-[11px] font-medium px-2.5 py-0.5 rounded-full",
                    verifikasiInfo.color,
                  )}
                >
                  {verifikasiInfo.label}
                </span>
              )}
            </div>
          </div>

          {/* Stats — visible on sm+ */}
          <div className="flex gap-6 shrink-0 sm:border-l sm:border-border/60 sm:pl-6">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                No. Anggota
              </span>
              <span className="text-sm font-bold text-foreground mt-0.5 font-mono">
                {anggota.noKta ?? "—"}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Status KTA
              </span>
              <span
                className={cn(
                  "text-sm font-bold mt-0.5",
                  isKtaActive ? "text-emerald-600" : "text-zinc-400",
                )}
              >
                {isKtaActive ? "Aktif" : "Non-Aktif"}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Berlaku s/d
              </span>
              <span className="text-sm font-bold text-foreground mt-0.5">
                {isKtaActive ? "31 Des 2031" : "—"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── 2-Column Grid — percis seperti /portal ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT — KTA Digital (col-span-7) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="lg:col-span-7 xl:col-span-8"
          >
            <div className="bg-card border rounded-xl p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-bold">KTA Digital</h2>
                <p className="text-sm text-muted-foreground">
                  {isKtaActive
                    ? "Kartu Tanda Anggota sudah aktif dan dapat digunakan."
                    : "Kartu Tanda Anggota sedang dalam proses verifikasi."}
                </p>
              </div>
              <div className="flex justify-center">
                <PublicKtaCard anggota={anggota} />
              </div>
            </div>
          </motion.div>

          {/* RIGHT — Info (col-span-5) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: 0.14,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="lg:col-span-5 xl:col-span-4 space-y-5"
          >
            {/* Ringkasan Keanggotaan */}
            <div className="bg-card border rounded-xl p-5">
              <h2 className="text-base font-bold mb-4">
                Ringkasan Keanggotaan
              </h2>
              <div className="space-y-0">
                <InfoRow
                  icon={Hash}
                  label="Nomor Anggota"
                  value={anggota.noKta}
                />
                <InfoRow
                  icon={Building2}
                  label="Cabang / Wilayah"
                  value={wilayah}
                />
                <InfoRow
                  icon={MapPin}
                  label="Domisili"
                  value={
                    [anggota.kotaDomisili, anggota.provinsi]
                      .filter(Boolean)
                      .join(", ") || null
                  }
                />
                <InfoRow
                  icon={Briefcase}
                  label="Pekerjaan"
                  value={anggota.pekerjaanRef?.nama}
                />
                <InfoRow
                  icon={GraduationCap}
                  label="Pendidikan"
                  value={anggota.pendidikanRef?.nama}
                />
                <InfoRow
                  icon={Calendar}
                  label="Bergabung Sejak"
                  value={joinedDate}
                />
                {ktaActiveDate && (
                  <InfoRow
                    icon={Clock}
                    label="KTA Aktif Sejak"
                    value={ktaActiveDate}
                  />
                )}
                {approvedDate && (
                  <InfoRow
                    icon={CheckCircle2}
                    label="Disetujui DPP"
                    value={approvedDate}
                  />
                )}
              </div>

              {/* Bidang tags */}
              {(anggota.bidangStudiRef?.nama ||
                anggota.bidangMinatRef?.nama) && (
                <>
                  <Separator className="my-3" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                      Bidang
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {anggota.bidangStudiRef?.nama && (
                        <Badge variant="secondary" className="text-xs">
                          {anggota.bidangStudiRef.nama}
                        </Badge>
                      )}
                      {anggota.bidangMinatRef?.nama && (
                        <Badge variant="outline" className="text-xs">
                          {anggota.bidangMinatRef.nama}
                        </Badge>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Authenticity notice */}
            <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl px-4 py-3.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                Profil resmi yang diterbitkan oleh sistem informasi{" "}
                <span className="font-semibold">DPP PIKI</span>. Keasliannya
                dapat diverifikasi melalui scan QR Code pada KTA.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-muted-foreground pt-2 pb-4">
          © DPP Persatuan Intelegensia Kristen Indonesia
        </p>
      </div>
    </div>
  );
}
