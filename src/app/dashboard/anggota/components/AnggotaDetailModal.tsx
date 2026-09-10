"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useGetAnggotaDetail } from "@/hooks/api/useAnggota";
import {
  Loader2,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  CreditCard,
  Briefcase,
  GraduationCap,
  FileText,
  CheckCircle2,
  AlertCircle,
  Heart,
  Quote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { FaFacebook, FaInstagram } from "react-icons/fa";

interface AnggotaDetailModalProps {
  uuid: string | null;
  onClose: () => void;
}

interface StrukturDPP {
  jabatan?: { namaJabatan: string };
  bidang?: { namaBidang: string };
  periode?: { tahunMulai: string | number; tahunSelesai: string | number };
}

const InfoItem = ({
  icon: Icon,
  label,
  value,
  className = "",
}: {
  icon: React.ElementType;
  label: string;
  value?: React.ReactNode;
  className?: string;
}) => (
  <div className={`space-y-1 ${className}`}>
    <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
    <div className="text-sm font-medium break-words leading-relaxed text-foreground">
      {value || "-"}
    </div>
  </div>
);

export function AnggotaDetailModal({ uuid, onClose }: AnggotaDetailModalProps) {
  const { data, isLoading, error } = useGetAnggotaDetail(uuid);

  console.log("DATA >>>>>", data);

  // Backend might return { data: ... } or just the object itself
  const anggota =
    data?.success !== undefined && data?.data !== undefined ? data.data : data;

  // Render Skeleton/Loading State
  if (isLoading) {
    return (
      <Dialog open={!!uuid} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[90vw] lg:max-w-6xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl gap-0 min-h-[50vh] flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-base font-medium">Memuat detail anggota...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Render Error State
  if (error || (uuid && !anggota)) {
    return (
      <Dialog open={!!uuid} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[90vw] lg:max-w-6xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl gap-0 min-h-[50vh] flex items-center justify-center">
          <div className="flex items-center justify-center text-center">
            <div className="space-y-2">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
              <p className="text-destructive font-semibold text-lg">
                Gagal memuat detail anggota.
              </p>
              <p className="text-muted-foreground">Silakan coba lagi nanti.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!anggota) return null;

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase() || "A"
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: id });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Dialog open={!!uuid} onOpenChange={(open) => !open && onClose()}>
      {/* sm:max-w-6xl is required to override the default sm:max-w-sm in DialogContent */}
      <DialogContent className="sm:max-w-[90vw] lg:max-w-6xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl gap-0">
        <DialogTitle className="sr-only">
          Detail Anggota {anggota.namaLengkap}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Menampilkan seluruh informasi detail anggota yang tersimpan di dalam
          sistem KTA PIKI.
        </DialogDescription>

        {/* Outer bounding box ensures it doesn't grow taller than 90vh */}
        <div className="flex flex-col md:flex-row w-full max-h-[90vh] overflow-hidden">
          {/* ========================================================= */}
          {/* LEFT SIDEBAR PANEL (Profile Summary)                      */}
          {/* ========================================================= */}
          {/* On mobile it's a scrollable row/stack, on desktop it's a fixed sidebar */}
          <div className="w-full md:w-[320px] lg:w-[360px] xl:w-[400px] shrink-0 bg-muted/30 border-r border-border/40 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto h-[40vh] md:h-full">
              <div className="p-8 flex flex-col items-center text-center space-y-6">
                {/* Avatar & Identitas */}
                <div className="space-y-4 w-full flex flex-col items-center">
                  <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-background shadow-lg">
                    <AvatarImage
                      src={anggota.profileImg || ""}
                      alt={anggota.namaLengkap}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-4xl sm:text-5xl font-light bg-primary/5 text-primary">
                      {getInitials(anggota.namaLengkap || "Anggota")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      {anggota.namaLengkap}
                    </h2>
                    {anggota.namaPanggil && (
                      <p className="text-muted-foreground font-medium">
                        &quot;{anggota.namaPanggil}&quot;
                      </p>
                    )}
                  </div>

                  <Badge
                    variant={
                      anggota.statusKeanggotaan === "ACTIVE"
                        ? "default"
                        : "secondary"
                    }
                    className="rounded-full px-4 py-1 font-semibold text-sm "
                  >
                    {anggota.statusKeanggotaan === "ACTIVE"
                      ? "Keanggotaan Aktif"
                      : anggota.statusKeanggotaan || "Pending"}
                  </Badge>
                </div>

                <Separator className="w-16 h-1 bg-primary/20 rounded-full" />

                {/* KTA Number & Region Quick Info */}
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div className="text-left">
                      <p className="text-[10px] uppercase font-bold text-primary/70 tracking-wider">
                        NIA / Nomor Anggota
                      </p>
                      <p className="font-semibold text-sm sm:text-base">
                        {anggota.noKta || "Belum diterbitkan"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="p-3 rounded-xl bg-card border border-border/50">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">
                        Status KTA
                      </p>
                      <p className="text-sm font-medium">
                        {anggota.statusKta || "-"}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-card border border-border/50">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">
                        Angkatan
                      </p>
                      <p className="text-sm font-medium">
                        {anggota.angkatan || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bio Section in Sidebar */}
                {anggota.bio && (
                  <div className="w-full text-left bg-background p-4 rounded-xl  border border-border/40 mt-4 relative">
                    <Quote className="absolute top-3 right-3 w-8 h-8 text-muted/30 rotate-180" />
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2">
                      Tentang
                    </p>
                    <p className="text-sm leading-relaxed text-foreground/80 italic relative z-10">
                      {anggota.bio}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT MAIN PANEL (Data Accordion)                         */}
          {/* ========================================================= */}
          <div className="flex-1 bg-background flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
              <Accordion
                defaultValue={["organisasi"]}
                className="w-full space-y-4"
              >
                {/* Organisasi & Pendaftaran */}
                <AccordionItem
                  value="organisasi"
                  className="border rounded-xl bg-card px-6 overflow-hidden"
                >
                  <AccordionTrigger className="hover:no-underline py-5 group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg text-primary bg-primary/10 transition-colors group-hover:bg-primary/20">
                        <Building className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold tracking-tight text-foreground">
                        Data Organisasi & Pendaftaran
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pt-2">
                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
                      <InfoItem
                        icon={Building}
                        label="Cabang / DPC"
                        value={
                          anggota.cabang?.namaCabang ||
                          anggota.registrasi?.dpc ||
                          "-"
                        }
                      />
                      <InfoItem
                        icon={MapPin}
                        label="Provinsi / DPD"
                        value={
                          anggota.cabang?.provinsi ||
                          anggota.registrasi?.dpd ||
                          "-"
                        }
                      />
                      <InfoItem
                        icon={Calendar}
                        label="Terdaftar Sejak"
                        value={formatDate(anggota.tglAktivasiKta)}
                      />

                      {anggota.registrasi && (
                        <>
                          <div className="col-span-1">
                            <InfoItem
                              icon={CheckCircle2}
                              label="Verifikasi DPD/DPC"
                              value={
                                <Badge
                                  variant={
                                    anggota.registrasi.statusVerifikasi ===
                                    "APPROVED"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="mt-1 "
                                >
                                  {anggota.registrasi.statusVerifikasi ||
                                    "Menunggu"}
                                </Badge>
                              }
                            />
                          </div>
                          <div className="col-span-1">
                            <InfoItem
                              icon={CreditCard}
                              label="Status KTA"
                              value={
                                <Badge
                                  variant={
                                    anggota.statusKta === "ACTIVE"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="mt-1 "
                                >
                                  {anggota.statusKta}
                                </Badge>
                              }
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Pribadi & Kontak */}
                <AccordionItem
                  value="pribadi"
                  className="border rounded-xl bg-card px-6  overflow-hidden"
                >
                  <AccordionTrigger className="hover:no-underline py-5 group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg text-primary bg-primary/10 transition-colors group-hover:bg-primary/20">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold tracking-tight text-foreground">
                        Informasi Pribadi & Kontak
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pt-2">
                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
                      <InfoItem
                        icon={Mail}
                        label="Alamat Email"
                        value={anggota.akun?.email}
                      />
                      <InfoItem
                        icon={Phone}
                        label="No. WhatsApp"
                        value={anggota.noWa}
                      />
                      <InfoItem
                        icon={Calendar}
                        label="Tempat, Tgl Lahir"
                        value={`${anggota.tempatLahir || "-"}, ${formatDate(anggota.tanggalLahir)}`}
                      />
                      <InfoItem
                        icon={MapPin}
                        label="Provinsi / Kota"
                        value={`${anggota.provinsi || "-"} / ${anggota.kotaDomisili || "-"}`}
                        className="sm:col-span-2 xl:col-span-1"
                      />
                      <InfoItem
                        icon={MapPin}
                        label="Alamat Domisili"
                        value={anggota.alamat}
                        className="sm:col-span-2 xl:col-span-2"
                      />
                      {(anggota.instagram || anggota.facebook) && (
                        <div className="sm:col-span-2 xl:col-span-3 flex flex-wrap gap-x-8 gap-y-4 pt-4 mt-2 border-t border-border/30">
                          {anggota.instagram && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                              <FaInstagram className="w-5 h-5 text-foreground/80" />
                              @{anggota.instagram.replace("@", "")}
                            </div>
                          )}
                          {anggota.facebook && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                              <FaFacebook className="w-5 h-5 text-foreground/80" />
                              {anggota.facebook}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Pendidikan & Pekerjaan */}
                <AccordionItem
                  value="pendidikan"
                  className="border rounded-xl bg-card px-6  overflow-hidden"
                >
                  <AccordionTrigger className="hover:no-underline py-5 group cursor-pointer ">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg text-primary bg-primary/10 transition-colors group-hover:bg-primary/20">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold tracking-tight text-foreground">
                        Kualifikasi & Minat
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pt-2">
                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                      <InfoItem
                        icon={GraduationCap}
                        label="Pendidikan Terakhir"
                        value={
                          anggota.pendidikanRef?.nama ||
                          anggota.registrasi?.tingkatPendidikan ||
                          "-"
                        }
                      />
                      <InfoItem
                        icon={Briefcase}
                        label="Pekerjaan"
                        value={
                          anggota.pekerjaanRef?.nama ||
                          anggota.registrasi?.pekerjaan ||
                          "-"
                        }
                      />

                      <InfoItem
                        icon={Heart}
                        label="Bidang Minat"
                        value={
                          anggota.bidangMinatRef?.nama ||
                          anggota.registrasi?.minatBidang ||
                          "-"
                        }
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Approval Status */}
                <AccordionItem
                  value="approval"
                  className="border rounded-xl bg-card px-6  overflow-hidden"
                >
                  <AccordionTrigger className="hover:no-underline py-5 group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg text-primary bg-primary/10 transition-colors group-hover:bg-primary/20">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold tracking-tight text-foreground">
                        Validasi Keanggotaan
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pt-2">
                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                      <InfoItem
                        icon={CheckCircle2}
                        label="Status Verifikasi Akhir"
                        value={
                          <Badge
                            variant={
                              anggota.registrasi?.statusVerifikasi?.includes("APPROVED")
                                ? "default"
                                : "secondary"
                            }
                            className="mt-1"
                          >
                            {anggota.registrasi?.statusVerifikasi || "Menunggu"}
                          </Badge>
                        }
                      />
                      <InfoItem
                        icon={FileText}
                        label="Catatan Verifikasi"
                        value={anggota.registrasi?.catatanVerifikasi || "-"}
                      />
                      <InfoItem
                        icon={Calendar}
                        label="Tanggal Rekomendasi DPC"
                        value={
                          anggota.registrasi?.tglVerifikasi
                            ? formatDate(anggota.registrasi.tglVerifikasi)
                            : "-"
                        }
                      />
                      <InfoItem
                        icon={Calendar}
                        label="Tanggal Pengesahan DPP"
                        value={
                          anggota.registrasi?.tglPersetujuanPdp
                            ? formatDate(anggota.registrasi.tglPersetujuanPdp)
                            : "-"
                        }
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Struktur (If available) */}
                {anggota.strukturDPP && anggota.strukturDPP.length > 0 && (
                  <AccordionItem
                    value="struktur"
                    className="border rounded-xl bg-card px-6  overflow-hidden"
                  >
                    <AccordionTrigger className="hover:no-underline py-5 group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg text-primary bg-primary/10 transition-colors group-hover:bg-primary/20">
                          <Building className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold tracking-tight text-foreground">
                          Kepengurusan DPP
                        </h3>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 pt-2">
                      <div className="space-y-3">
                        {anggota.strukturDPP.map(
                          (struktur: StrukturDPP, idx: number) => (
                            <div
                              key={idx}
                              className="p-4 rounded-xl bg-muted/20 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div>
                                <p className="text-base font-bold text-foreground">
                                  {struktur.jabatan?.namaJabatan || "Jabatan"}
                                </p>
                                <p className="text-sm font-medium text-muted-foreground mt-1">
                                  {struktur.bidang?.namaBidang || "Bidang"}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className="w-fit shrink-0 bg-background px-4 py-1.5 "
                              >
                                Periode {struktur.periode?.tahunMulai} -{" "}
                                {struktur.periode?.tahunSelesai}
                              </Badge>
                            </div>
                          ),
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
