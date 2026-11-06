import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Eye, Check, AlertCircle, FileText, ExternalLink } from "lucide-react";
import { RegistrasiItem } from "@/hooks/api/useVerifikasi";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ReviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItem: RegistrasiItem | null;
  isPending: boolean;
  processingId: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

export function ReviewModal({
  isOpen,
  onOpenChange,
  selectedItem,
  isPending,
  processingId,
  onApprove,
  onReject,
}: ReviewModalProps) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setTimeout(() => {
        setIsRejecting(false);
        setRejectReason("");
      }, 300);
    }
  };

  const status = selectedItem?.statusVerifikasi || "";
  const isPendingVerifikasi =
    status.startsWith("PENDING") || status === "BYPASSED_TO_DPD";

  const renderStatusBadge = () => {
    if (status.startsWith("PENDING") || status === "BYPASSED_TO_DPD") {
      const label =
        status === "PENDING_VERIFIKASI_DPC"
          ? "Menunggu Verifikasi DPC"
          : status === "PENDING_VERIFIKASI_DPD"
          ? "Menunggu Verifikasi DPD"
          : status === "BYPASSED_TO_DPD"
          ? "Eskalasi Otomatis ke DPD"
          : status === "PENDING_VERIFIKASI_DPP"
          ? "Menunggu Verifikasi DPP"
          : "Menunggu Verifikasi";

      return (
        <Badge
          variant="secondary"
          className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-medium mt-1 inline-flex items-center gap-1.5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          {label}
        </Badge>
      );
    }

    if (status.startsWith("APPROVED")) {
      const label =
        status === "APPROVED_DPC"
          ? "Disetujui DPC"
          : status === "APPROVED_DPD"
          ? "Disetujui DPD"
          : status === "APPROVED_DPP"
          ? "Disetujui DPP (KTA Aktif)"
          : "Telah Disetujui";

      return (
        <Badge
          variant="secondary"
          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-medium mt-1 inline-flex items-center gap-1.5"
        >
          <Check className="h-3 w-3" />
          {label}
        </Badge>
      );
    }

    if (status === "REJECTED") {
      return (
        <Badge
          variant="secondary"
          className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-medium mt-1 inline-flex items-center gap-1.5"
        >
          <AlertCircle className="h-3 w-3" />
          Pendaftaran Ditolak
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="font-medium mt-1">
        {status.replace(/_/g, " ")}
      </Badge>
    );
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "dd MMMM yyyy HH:mm", {
        locale: localeId,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Detail Informasi Pendaftar
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isPendingVerifikasi
              ? "Tinjau data calon anggota sebelum memberikan keputusan persetujuan."
              : "Riwayat data lengkap pendaftaran keanggotaan."}
          </DialogDescription>
        </DialogHeader>

        {selectedItem && (
          <div className="flex flex-col gap-4 py-2">
            {/* Header info pendaftar */}
            <div className="flex items-center gap-3.5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl font-bold uppercase border border-primary/20">
                {selectedItem.namaLengkap.charAt(0)}
              </span>
              <div className="flex flex-col min-w-0">
                <h3 className="font-semibold text-base sm:text-lg text-foreground truncate">
                  {selectedItem.namaLengkap}
                </h3>
                {renderStatusBadge()}
              </div>
            </div>

            <Separator />

            {/* Grid detail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium">Email</span>
                <span className="font-medium text-foreground break-all mt-0.5">
                  {selectedItem.email}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium">No. WhatsApp</span>
                <span className="font-medium text-foreground mt-0.5">
                  {selectedItem.noWa}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium">Tingkat Cabang (DPC)</span>
                <span className="font-medium text-foreground mt-0.5">
                  {selectedItem.dpc
                    ? `DPC ${selectedItem.dpc}`
                    : selectedItem.cabang?.namaCabang || "-"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium">Tingkat Daerah (DPD)</span>
                <span className="font-medium text-foreground mt-0.5">
                  {selectedItem.dpd
                    ? `DPD ${selectedItem.dpd}`
                    : selectedItem.cabang?.provinsi || selectedItem.dpp || "-"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium">Tanggal Mendaftar</span>
                <span className="font-medium text-foreground mt-0.5">
                  {formatDate(selectedItem.created_at)}
                </span>
              </div>
              {selectedItem.tglVerifikasi && (
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground font-medium">Tanggal Verifikasi</span>
                  <span className="font-medium text-foreground mt-0.5">
                    {formatDate(selectedItem.tglVerifikasi)}
                  </span>
                </div>
              )}
            </div>

            {/* Catatan Verifikasi / Alasan Tolak jika ada */}
            {selectedItem.catatanVerifikasi && (
              <div
                className={`rounded-lg border p-3.5 text-sm space-y-1 ${
                  status === "REJECTED"
                    ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                    : "bg-muted/40 border-border"
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium">
                  {status === "REJECTED" ? (
                    <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  ) : (
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                  )}
                  <span
                    className={
                      status === "REJECTED"
                        ? "text-rose-800 dark:text-rose-300 font-semibold"
                        : "text-foreground font-semibold"
                    }
                  >
                    {status === "REJECTED"
                      ? "Alasan Penolakan:"
                      : "Catatan Verifikasi:"}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm pl-5.5">
                  {selectedItem.catatanVerifikasi}
                </p>
              </div>
            )}

            {/* Dokumen Lampiran */}
            <div className="space-y-3 pt-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Lampiran Dokumen
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedItem.fileKtpUrl ? (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          Dokumen KTP
                        </p>
                        <p className="text-xs text-muted-foreground">Identitas Resmi</p>
                      </div>
                    </div>
                    <a
                      href={selectedItem.fileKtpUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "h-8 px-2.5 text-xs text-primary hover:text-primary gap-1",
                      )}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Lihat
                      <ExternalLink className="h-3 w-3 ml-0.5 opacity-70" />
                    </a>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border border-dashed border-border text-center text-xs text-muted-foreground">
                    Dokumen KTP tidak tersedia
                  </div>
                )}

                {selectedItem.buktiBayarUrl ? (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          Bukti Bayar
                        </p>
                        <p className="text-xs text-muted-foreground">Iuran KTA</p>
                      </div>
                    </div>
                    <a
                      href={selectedItem.buktiBayarUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "h-8 px-2.5 text-xs text-primary hover:text-primary gap-1",
                      )}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Lihat
                      <ExternalLink className="h-3 w-3 ml-0.5 opacity-70" />
                    </a>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border border-dashed border-border text-center text-xs text-muted-foreground">
                    Bukti bayar tidak dilampirkan
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Input Alasan Penolakan */}
        {isRejecting && (
          <div className="flex flex-col gap-2 py-3 border-t border-border mt-1">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <Label htmlFor="reason" className="font-semibold text-sm">
                Alasan Penolakan Pendaftaran
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Alasan ini akan dicatat dalam riwayat dan dikirimkan sebagai notifikasi kepada calon anggota.
            </p>
            <Textarea
              id="reason"
              placeholder="Contoh: Foto KTP tidak terbaca jelas atau buram, silakan daftar kembali dengan melampirkan foto KTP yang terang."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[90px] text-sm resize-none focus-visible:ring-rose-500"
            />
          </div>
        )}

        {/* Tombol Aksi */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-3 border-t border-border mt-2">
          {!isPendingVerifikasi ? (
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 px-5 text-sm font-medium"
            >
              Tutup
            </Button>
          ) : !isRejecting ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-10 px-4 text-sm font-medium"
              >
                Batal
              </Button>
              <Button
                variant="outline"
                disabled={isPending && processingId === selectedItem?.id}
                onClick={() => setIsRejecting(true)}
                className="h-10 px-4 text-sm font-medium text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/20"
              >
                Tolak Pendaftaran
              </Button>
              <Button
                disabled={isPending && processingId === selectedItem?.id}
                onClick={() => {
                  if (selectedItem) {
                    onApprove(selectedItem.id);
                    onOpenChange(false);
                  }
                }}
                className="h-10 px-5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isPending && processingId === selectedItem?.id ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                ) : (
                  <Check className="w-4 h-4 mr-1.5" />
                )}
                Setujui Pendaftar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsRejecting(false)}
                className="h-10 px-4 text-sm font-medium"
                disabled={isPending && processingId === selectedItem?.id}
              >
                Kembali
              </Button>
              <Button
                variant="destructive"
                disabled={
                  (isPending && processingId === selectedItem?.id) ||
                  !rejectReason.trim()
                }
                onClick={() => {
                  if (selectedItem) {
                    onReject(selectedItem.id, rejectReason);
                  }
                }}
                className="h-10 px-5 text-sm font-medium"
              >
                {isPending && processingId === selectedItem?.id ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                ) : null}
                Konfirmasi Tolak
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
