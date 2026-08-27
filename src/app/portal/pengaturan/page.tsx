import React from "react";
import { User, Mail, Phone, MapPin, Building, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PengaturanPortalPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil Saya</h1>
        <p className="text-muted-foreground mt-1">
          Perbarui informasi pribadi dan keamanan akun Anda.
        </p>
      </div>

      <div className="bg-card border rounded-2xl p-6 md:p-8 space-y-8 shadow-sm">
        
        {/* Info Pribadi */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Informasi Pribadi</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nama Lengkap</label>
              <Input defaultValue="Christian" readOnly className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Alamat Email</label>
              <Input defaultValue="christian@example.com" readOnly className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nomor WhatsApp</label>
              <Input placeholder="08123456789" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tempat, Tanggal Lahir</label>
              <Input placeholder="Jakarta, 1 Januari 1990" />
            </div>
          </div>
        </section>

        {/* Info Keanggotaan */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2 mb-4">
            <Building className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Informasi Keanggotaan</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Asal DPC / Cabang</label>
              <Input defaultValue="PIKI DPD DKI Jakarta" readOnly className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Status Keanggotaan</label>
              <Input defaultValue="AKTIF" readOnly className="bg-green-500/10 text-green-700 dark:text-green-400 font-semibold border-none" />
            </div>
          </div>
        </section>

        {/* Keamanan */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2 mb-4">
            <Lock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Keamanan</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password Baru</label>
              <Input type="password" placeholder="Kosongkan jika tidak ingin diubah" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Konfirmasi Password Baru</label>
              <Input type="password" placeholder="Ketik ulang password baru" />
            </div>
          </div>
        </section>

        <div className="pt-6 flex justify-end">
          <Button size="lg" className="px-8 font-semibold">
            Simpan Perubahan
          </Button>
        </div>
      </div>
    </div>
  );
}
