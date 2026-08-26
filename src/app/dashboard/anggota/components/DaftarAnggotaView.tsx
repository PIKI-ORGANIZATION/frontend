"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGetDaftarAnggota } from "@/hooks/api/useAnggota";
import { Loader2, Mail, Phone, MapPin } from "lucide-react";

export function DaftarAnggotaView() {
  const { data, isLoading, error } = useGetDaftarAnggota();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">Gagal memuat data anggota. Silakan coba lagi.</p>
      </div>
    );
  }

  const anggotaList = data?.data || [];

  return (
    <section className="py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="container mx-auto px-0 md:px-8 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 px-4 md:px-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
              Daftar Anggota
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Menampilkan daftar anggota PIKI yang telah terverifikasi dan aktif.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Badge variant="secondary" className="px-4 py-1.5 text-sm">
              Total: {data?.meta?.total || 0} Anggota
            </Badge>
          </div>
        </div>

        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
          {anggotaList.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground flex flex-col items-center">
              <span className="text-4xl mb-4">👥</span>
              <p>Belum ada data anggota yang aktif.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {anggotaList.map((item, index) => (
                <React.Fragment key={item.id}>
                  <div className="flex flex-col gap-4 px-6 py-6 md:flex-row md:items-center hover:bg-muted/50 transition-colors">
                    {/* Avatar & Name */}
                    <div className="flex items-center gap-4 flex-1">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold uppercase">
                        {item.namaLengkap.charAt(0)}
                      </span>
                      <div className="flex flex-col gap-1">
                        <h3 className="font-semibold text-base">{item.namaLengkap}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground break-all md:break-normal">
                          <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {item.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact & Branch */}
                    <div className="flex flex-col gap-2 flex-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4 shrink-0" />
                        <span>{item.noWa || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span>{item.cabang?.namaCabang || item.dpc || "-"}</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex md:flex-col gap-2 w-full md:w-32 shrink-0 items-start md:items-end mt-2 md:mt-0">
                      <Badge
                        variant="secondary"
                        className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none font-medium"
                      >
                        Aktif
                      </Badge>
                      <span className="text-xs text-muted-foreground self-center md:self-end">
                        {new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                  </div>
                  {index < anggotaList.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
