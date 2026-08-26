import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Eye, Check, AlertCircle } from "lucide-react";
import { RegistrasiItem } from "@/hooks/api/useVerifikasi";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
      }, 300); // clear state after dialog closes
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detail Pendaftar</DialogTitle>
          <DialogDescription>
            Review informasi calon anggota sebelum memberikan persetujuan.
          </DialogDescription>
        </DialogHeader>

        {selectedItem && (
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-muted text-2xl font-semibold uppercase">
                {selectedItem.namaLengkap.charAt(0)}
              </span>
              <div>
                <h3 className="font-semibold text-lg">
                  {selectedItem.namaLengkap}
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-orange-500/10 text-orange-600 border-none font-medium mt-1"
                >
                  Pending
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium break-all">
                  {selectedItem.email}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">No. WhatsApp</span>
                <span className="font-medium">{selectedItem.noWa}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Cabang (DPC)</span>
                <span className="font-medium">
                  {selectedItem.cabang?.namaCabang || selectedItem.dpc || "-"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Wilayah (DPP)</span>
                <span className="font-medium">{selectedItem.dpp || "-"}</span>
              </div>
              <div className="flex flex-col col-span-2">
                <span className="text-muted-foreground">Tanggal Daftar</span>
                <span className="font-medium">
                  {selectedItem.created_at
                    ? new Date(selectedItem.created_at).toLocaleDateString(
                        "id-ID",
                        { year: "numeric", month: "long", day: "numeric" },
                      )
                    : "-"}
                </span>
              </div>
            </div>

            {selectedItem.fileKtpUrl && (
              <>
                <Separator />
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">
                    Dokumen KTP
                  </span>
                  <div className="rounded-md border p-3 bg-muted/30">
                    <a
                      href={selectedItem.fileKtpUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Lihat Dokumen KTP
                    </a>
                  </div>
                </div>
              </>
            )}

            {selectedItem.buktiBayarUrl && (
              <>
                <Separator />
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">
                    Bukti Pembayaran / Transfer
                  </span>
                  <div className="rounded-md border p-3 bg-muted/30">
                    <a
                      href={selectedItem.buktiBayarUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Lihat Bukti Transfer
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {isRejecting && (
          <div className="flex flex-col gap-3 py-4 mt-2">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <Label htmlFor="reason" className="font-semibold text-base">Alasan Penolakan</Label>
            </div>
            <p className="text-sm text-muted-foreground">Alasan ini akan dikirimkan ke email pendaftar.</p>
            <Textarea
              id="reason"
              placeholder="Contoh: Foto KTP terlalu buram, silakan daftar ulang dengan foto yang jelas."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px] resize-none focus-visible:ring-destructive"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 justify-end mt-4">
          {!isRejecting ? (
            <>
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="py-4 px-4"
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                disabled={isPending && processingId === selectedItem?.id}
                onClick={() => setIsRejecting(true)}
                className="py-4 px-4"
              >
                Tolak
              </Button>
              <Button
                disabled={isPending && processingId === selectedItem?.id}
                onClick={() => {
                  if (selectedItem) {
                    onApprove(selectedItem.id);
                    onOpenChange(false);
                  }
                }}
                className="py-4 px-4"
              >
                {isPending && processingId === selectedItem?.id ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Check className="w-4 h-4 mr-1" />
                )}
                Setujui Pendaftar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => setIsRejecting(false)}
                className="py-4 px-4"
                disabled={isPending && processingId === selectedItem?.id}
              >
                Kembali
              </Button>
              <Button
                variant="destructive"
                disabled={(isPending && processingId === selectedItem?.id) || !rejectReason.trim()}
                onClick={() => {
                  if (selectedItem) {
                    onReject(selectedItem.id, rejectReason);
                    // Do not close immediately, wait for onSuccess from parent via isPending
                  }
                }}
                className="py-4 px-4"
              >
                {isPending && processingId === selectedItem?.id ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : null}
                Konfirmasi Penolakan
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
