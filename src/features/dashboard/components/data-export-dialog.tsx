"use client";

import React, { useState } from "react";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Download, FileSpreadsheet, FileJson, Loader2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

type FilterScope = "all" | "active" | "inactive";

interface ExportAnggotaItem {
  namaLengkap?: string;
  noKta?: string;
  statusKta?: string;
  provinsi?: string;
  kotaDomisili?: string;
  noWa?: string;
  akun?: {
    email?: string;
  };
  cabang?: {
    namaCabang?: string;
    provinsi?: string;
  };
}

const filterOptions: Array<{ id: FilterScope; label: string; desc: string }> = [
  { id: "all", label: "Semua Anggota (Aktif & Belum Aktif)", desc: "Seluruh basis data" },
  { id: "active", label: "Hanya Anggota KTA Aktif", desc: "Telah diterbitkan nomor KTA resmi" },
  { id: "inactive", label: "Hanya Menunggu Verifikasi", desc: "Status antrean DPP / DPC" },
];

export function DataExportDialog() {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [filterScope, setFilterScope] = useState<FilterScope>("all");

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const token = Cookies.get("token");

      const queryParams = new URLSearchParams();
      queryParams.append("pageSize", "500");
      if (filterScope === "active") queryParams.append("statusKta", "ACTIVE");
      if (filterScope === "inactive") queryParams.append("statusKta", "INACTIVE");

      const res = await fetch(`${API_BASE}/anggotas/?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Gagal mengambil data untuk diekspor");
      }

      const json = await res.json();
      const records: ExportAnggotaItem[] = json.data || [];

      if (records.length === 0) {
        toast.info("Tidak ada data anggota yang sesuai dengan kriteria.");
        setIsExporting(false);
        return;
      }

      const timestamp = new Date().toISOString().slice(0, 10);

      if (format === "csv") {
        const headers = [
          "No",
          "Nama Lengkap",
          "Nomor KTA",
          "Status KTA",
          "Wilayah / DPD",
          "Cabang / DPC",
          "No WhatsApp",
          "Email Akun",
        ];

        const csvRows = [
          headers.join(","),
          ...records.map((r, idx) => {
            const no = idx + 1;
            const nama = `"${(r.namaLengkap || "").replace(/"/g, '""')}"`;
            const noKta = `"${r.noKta || "-"}"`;
            const statusKta = `"${r.statusKta || "INACTIVE"}"`;
            const prov = `"${(r.provinsi || r.cabang?.provinsi || "-").replace(/"/g, '""')}"`;
            const dpc = `"${(r.cabang?.namaCabang || r.kotaDomisili || "-").replace(/"/g, '""')}"`;
            const wa = `"${r.noWa || "-"}"`;
            const email = `"${r.akun?.email || "-"}"`;
            return [no, nama, noKta, statusKta, prov, dpc, wa, email].join(",");
          }),
        ];

        // UTF-8 BOM (\uFEFF) ensures Excel displays Indonesian characters correctly
        const blob = new Blob(["\uFEFF" + csvRows.join("\r\n")], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Data-Anggota-PIKI-${filterScope}-${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([JSON.stringify(records, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Data-Anggota-PIKI-${filterScope}-${timestamp}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      toast.success("Berhasil mengekspor data anggota PIKI!");
      setOpen(false);
    } catch (err: unknown) {
      console.error("Export Error:", err);
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat mengekspor data";
      toast.error(msg);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-border/80 hover:bg-muted/80 text-xs font-semibold rounded-lg"
          />
        }
      >
        <Download className="h-3.5 w-3.5 text-primary" />
        <span>Ekspor Satu Data</span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Ekspor Laporan & Data Anggota
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Unduh seluruh rekapan anggota terdaftar dan KTA digital resmi dalam format yang kompatibel dengan Excel atau sistem eksternal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* 1. Pilih Format File */}
          <div className="space-y-2">
            <label className="font-semibold text-foreground">Format Berkas</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  format === "csv"
                    ? "border-primary bg-primary/5 text-primary font-medium ring-1 ring-primary"
                    : "border-border hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                <FileSpreadsheet className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-foreground">Excel / CSV (.csv)</p>
                  <p className="text-[10px] text-muted-foreground">Kompatibel Ms. Excel & Sheets</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("json")}
                className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  format === "json"
                    ? "border-primary bg-primary/5 text-primary font-medium ring-1 ring-primary"
                    : "border-border hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                <FileJson className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-foreground">JSON Raw (.json)</p>
                  <p className="text-[10px] text-muted-foreground">Struktur data lengkap</p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Pilih Lingkup Data */}
          <div className="space-y-2">
            <label className="font-semibold text-foreground">Lingkup Status Anggota</label>
            <div className="space-y-1.5">
              {filterOptions.map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setFilterScope(opt.id)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    filterScope === opt.id
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border hover:bg-muted/30 text-muted-foreground"
                  }`}
                >
                  <div>
                    <p className="text-xs font-medium text-foreground">{opt.label}</p>
                    <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                  </div>
                  {filterScope === opt.id && (
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={isExporting}
            className="text-xs"
          >
            Batal
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2 text-xs font-semibold"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Memproses Data...</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>Unduh File Sekarang</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
