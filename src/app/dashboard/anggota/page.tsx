import { DigitalKTA } from "@/components/dashboard/anggota/DigitalKTA";
import { AlertTriangle, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AnggotaDashboardPage() {
  // Mock data for the view
  const profileCompletion = 60; // 60% complete

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Halo, Christian!</h1>
        <p className="text-muted-foreground mt-1">
          Selamat datang di portal Keanggotaan PIKI.
        </p>
      </div>

      {/* Profile Completion Alert */}
      {profileCompletion < 100 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-500/20 rounded-full text-orange-600 dark:text-orange-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-800 dark:text-orange-300">
                Profil Anda belum lengkap ({profileCompletion}%)
              </h3>
              <p className="text-sm text-orange-700/80 dark:text-orange-400/80 mt-0.5">
                Harap lengkapi data kontak darurat dan alamat domisili agar KTA cetak fisik dapat dikirimkan.
              </p>
            </div>
          </div>
          <Button variant="outline" className="shrink-0 border-orange-500/30 text-orange-700 dark:text-orange-400 hover:bg-orange-500/10" asChild>
            <Link href="/dashboard/pengaturan">
              Lengkapi Sekarang <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - KTA */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="bg-card border shadow-sm rounded-2xl p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold">KTA Digital</h2>
              <p className="text-sm text-muted-foreground">
                Kartu Tanda Anggota Anda sudah aktif dan dapat digunakan.
              </p>
            </div>
            <div className="flex justify-center">
              <DigitalKTA />
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions / Summary */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="bg-card border shadow-sm rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Ringkasan Keanggotaan</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full">
                  Aktif
                </span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Bergabung Sejak</span>
                <span className="text-sm font-medium">28 Agustus 2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Iuran Bulanan</span>
                <span className="text-sm font-medium">Lunas (Bulan ini)</span>
              </div>
            </div>
          </div>

          <div className="bg-card border shadow-sm rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Aksi Cepat</h2>
            <div className="grid gap-2">
              <Button variant="secondary" className="w-full justify-start text-left font-normal" asChild>
                <Link href="/dashboard/pengaturan">
                  <User className="w-4 h-4 mr-2 text-muted-foreground" /> Edit Data Profil
                </Link>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
