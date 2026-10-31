"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface GaleriDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onConfirm: () => void;
}

export function GaleriDeleteDialog({
  open,
  onOpenChange,
  title,
  onConfirm,
}: GaleriDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="gap-2">
          <div className="size-10 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="size-5" />
          </div>
          <DialogTitle className="text-lg font-bold">
            Hapus Dokumentasi Media?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Apakah Anda yakin ingin menghapus{" "}
            <span className="font-semibold text-foreground">
              &quot;{title || "media ini"}&quot;
            </span>
            ? Tindakan ini akan menghapus aset ini dari galeri dan tidak dapat
            dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="bg-rose-600 hover:bg-rose-700 text-white cursor-pointer font-medium"
          >
            Hapus Media
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

