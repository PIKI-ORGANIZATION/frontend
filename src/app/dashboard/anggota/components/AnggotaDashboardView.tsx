"use client";

import { DigitalKTA } from "@/components/dashboard/anggota/DigitalKTA";
import { AlertTriangle, ChevronRight, User, RefreshCcw } from "lucide-react";
import { buttonVariants, Button } from "@/components/ui/button";
import Link from "next/link";
import { useGetProfile, ProfileResponse } from "@/hooks/api/useProfile";
import { Skeleton } from "@/components/ui/skeleton";

function calculateProfileCompletion(
  profile: ProfileResponse | undefined,
): number {
  if (!profile) return 0;

  const fieldsToCheck = [
    profile.namaLengkap,
    profile.tempatLahir,
    profile.tanggalLahir,
    profile.alamat,
    profile.noWa,
    profile.provinsi,
    profile.kotaDomisili,
    profile.profileImg,
  ];

  const filledFields = fieldsToCheck.filter(
    (field) => field !== null && field !== undefined && field !== "",
  ).length;

  return Math.round((filledFields / fieldsToCheck.length) * 100);
}

export function AnggotaDashboardView() {
  const { data: profile, isLoading, isError, refetch } = useGetProfile();

  const profileCompletion = calculateProfileCompletion(profile);
  const displayName =
    profile?.namaPanggil ||
    profile?.namaLengkap ||
    profile?.username ||
    "Anggota";

  if (isError) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-20 space-y-4 animate-in fade-in duration-500">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-bold">Gagal memuat data profil</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Terjadi kesalahan saat mengambil data dari server. Pastikan koneksi
          internet stabil atau silakan coba lagi.
        </p>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          <RefreshCcw className="w-4 h-4 mr-2" /> Muat Ulang
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        {isLoading ? (
          <>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold tracking-tight">
              Halo, {displayName}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Selamat datang di portal Keanggotaan PIKI.
            </p>
          </>
        )}
      </div>

      {/* Profile Completion Alert */}
      {!isLoading && profileCompletion < 100 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-all">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-500/20 rounded-full text-orange-600 dark:text-orange-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-800 dark:text-orange-300">
                Profil Anda belum lengkap ({profileCompletion}%)
              </h3>
              <p className="text-sm text-orange-700/80 dark:text-orange-400/80 mt-0.5 max-w-2xl">
                Beberapa data diri penting belum diisi. Harap lengkapi profil
                Anda agar Kartu Tanda Anggota dapat diakses sepenuhnya.
              </p>
            </div>
          </div>
          <Link
            href="/portal/pengaturan"
            className={buttonVariants({
              variant: "outline",
              className:
                "shrink-0 border-orange-500/30 text-orange-700 dark:text-orange-400 hover:bg-orange-500/10 transition-colors",
            })}
          >
            Lengkapi Sekarang <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - KTA */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="bg-card border rounded-xl p-6 md:p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-bold">KTA Digital</h2>
              <p className="text-sm text-muted-foreground">
                Kartu Tanda Anggota Anda{" "}
                {profile?.statusAkun === "VERIFIED"
                  ? "sudah aktif dan dapat digunakan."
                  : "sedang dalam proses verifikasi."}
              </p>
            </div>
            <div className="flex justify-center">
              {isLoading ? (
                <Skeleton className="w-full max-w-[480px] aspect-[1.58/1] rounded-xl" />
              ) : (
                <DigitalKTA
                  namaLengkap={profile?.namaLengkap}
                  nomorAnggota={profile?.noKta || "BELUM ADA NIA"}
                  cabang={profile?.cabang?.namaCabang}
                  profileImg={profile?.profileImg}
                  uuid={profile?.uuid}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions / Summary */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Ringkasan Keanggotaan</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Status</span>
                {isLoading ? (
                  <Skeleton className="h-6 w-16 rounded-full" />
                ) : (
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
                      profile?.statusAkun === "VERIFIED"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                    }`}
                  >
                    {profile?.statusAkun || "MENUNGGU"}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <span className="text-sm text-muted-foreground">
                  Kelengkapan Data
                </span>
                {isLoading ? (
                  <Skeleton className="h-5 w-12" />
                ) : (
                  <span className="text-sm font-medium">
                    {profileCompletion}%
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Iuran Bulanan
                </span>
                {isLoading ? (
                  <Skeleton className="h-5 w-28" />
                ) : (
                  <span className="text-sm font-medium">Belum Tersedia</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Aksi Cepat</h2>
            <div className="grid gap-2">
              <Link
                href="/portal/pengaturan"
                className={buttonVariants({
                  variant: "secondary",
                  className:
                    "w-full justify-start text-left font-normal transition-colors",
                })}
              >
                <User className="w-4 h-4 mr-2 text-muted-foreground" /> Edit
                Data Profil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
