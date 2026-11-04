"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  Building,
  MapPin,
  Link2,
  Unlink,
  Search,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CabangItem, DpdItem, DpcItem } from "@/features/wilayah/types";
import { useTautkanCabang } from "@/features/wilayah/hooks/useWilayah";

interface CabangTabProps {
  cabangList: CabangItem[];
  dpdList: DpdItem[];
  dpcList: DpcItem[];
  isLoading: boolean;
}

export function CabangTab({
  cabangList,
  dpdList,
  dpcList,
  isLoading,
}: CabangTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCabang, setSelectedCabang] = useState<CabangItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form states in Dialog
  const [linkType, setLinkType] = useState<"NONE" | "DPD" | "DPC">("NONE");
  const [targetId, setTargetId] = useState<string>("");

  const tautkanCabangMutation = useTautkanCabang();

  const safeCabangList = useMemo(
    () => (Array.isArray(cabangList) ? cabangList : []),
    [cabangList],
  );

  const filteredCabang = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return safeCabangList.filter((c) => {
      return (
        !q ||
        c.namaCabang.toLowerCase().includes(q) ||
        c.provinsi.toLowerCase().includes(q) ||
        c.kabupatenKota.toLowerCase().includes(q)
      );
    });
  }, [safeCabangList, searchTerm]);

  const dpdOptions = useMemo(() => {
    return dpdList.map((d) => ({
      value: d.id,
      label: `DPD ${d.dpd}`,
      subLabel: d.kodeProvinsi,
    }));
  }, [dpdList]);

  const dpcOptions = useMemo(() => {
    return dpcList.map((d) => ({
      value: String(d.id),
      label: `DPC ${d.dpc}`,
      subLabel: `${d.kode_kabupaten} - ${d.dpd}`,
    }));
  }, [dpcList]);

  const handleOpenManageLink = (cabang: CabangItem) => {
    setSelectedCabang(cabang);
    if (cabang.dpdId) {
      setLinkType("DPD");
      setTargetId(cabang.dpdId);
    } else if (cabang.dpcId) {
      setLinkType("DPC");
      setTargetId(String(cabang.dpcId));
    } else {
      setLinkType("NONE");
      setTargetId("");
    }
    setDialogOpen(true);
  };

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCabang) return;

    if (linkType === "NONE") {
      await tautkanCabangMutation.mutateAsync({
        cabangUuid: selectedCabang.uuid,
        dpdId: null,
        dpcId: null,
      });
    } else if (linkType === "DPD") {
      await tautkanCabangMutation.mutateAsync({
        cabangUuid: selectedCabang.uuid,
        dpdId: targetId || null,
        dpcId: null,
      });
    } else if (linkType === "DPC") {
      await tautkanCabangMutation.mutateAsync({
        cabangUuid: selectedCabang.uuid,
        dpdId: null,
        dpcId: targetId ? Number(targetId) : null,
      });
    }

    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Cari profil cabang, provinsi, kota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>
      </div>

      {/* 2. Data Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-xs font-semibold">Nama Profil Cabang</TableHead>
              <TableHead className="text-xs font-semibold">Domisili Wilayah</TableHead>
              <TableHead className="text-xs font-semibold">Status Cabang</TableHead>
              <TableHead className="text-xs font-semibold">Tautan Hierarki Wilayah</TableHead>
              <TableHead className="text-right text-xs font-semibold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-xs">Memuat daftar cabang...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCabang.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-44 text-center text-muted-foreground text-xs">
                  <Building2 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="font-medium text-foreground">Tidak ada data profil cabang.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredCabang.map((item) => {
                const linkedDpd = item.dpdId ? dpdList.find((d) => d.id === item.dpdId) : null;
                const linkedDpc = item.dpcId ? dpcList.find((d) => d.id === item.dpcId) : null;

                return (
                  <TableRow key={item.uuid} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-foreground text-xs md:text-sm">
                        {item.namaCabang}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{item.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <div className="font-medium flex items-center gap-1.5 text-foreground">
                          <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span>{item.kabupatenKota}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground pl-4">
                          {item.provinsi}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-2 py-0.5 font-medium rounded-full ${
                          item.statusCabang === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {item.statusCabang}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.dpdId ? (
                        <Badge
                          variant="outline"
                          className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium flex items-center gap-1.5 w-fit"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          Tingkat DPD: {linkedDpd?.dpd || item.dpdRef?.dpd || "Provinsi"}
                        </Badge>
                      ) : item.dpcId ? (
                        <Badge
                          variant="outline"
                          className="text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-medium flex items-center gap-1.5 w-fit"
                        >
                          <Building className="w-3.5 h-3.5" />
                          Tingkat DPC: {linkedDpc?.dpc || item.dpcRef?.dpc || "Kabupaten/Kota"}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                          <Unlink className="w-3 h-3 opacity-60" /> Belum Tertaut
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenManageLink(item)}
                        className="text-xs h-8 gap-1.5"
                      >
                        <Link2 className="w-3.5 h-3.5 text-primary" />
                        <span>Atur Tautan</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Atur Tautan Cabang */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              Atur Tautan Wilayah: {selectedCabang?.namaCabang}
            </DialogTitle>
            <DialogDescription>
              Tautkan profil cabang ini ke struktur kepengurusan DPD (Provinsi) atau DPC (Kab/Kota).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveLink} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tingkat Organisasi</Label>
              <Select
                value={linkType}
                onValueChange={(val) => {
                  if (val) {
                    setLinkType(val as "NONE" | "DPD" | "DPC");
                    setTargetId("");
                  }
                }}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Pilih tingkat..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE" className="text-xs">
                    Lepaskan Tautan (Tanpa Wilayah)
                  </SelectItem>
                  <SelectItem value="DPD" className="text-xs">
                    Tingkat Daerah / Provinsi (DPD)
                  </SelectItem>
                  <SelectItem value="DPC" className="text-xs">
                    Tingkat Cabang / Kab-Kota (DPC)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {linkType === "DPD" && (
              <div className="space-y-1.5">
                <Label htmlFor="select-dpd-target" className="text-xs font-semibold">
                  Pilih DPD (Provinsi)
                </Label>
                <SearchableSelect
                  id="select-dpd-target"
                  value={targetId}
                  onValueChange={(val) => setTargetId(val)}
                  options={dpdOptions}
                  placeholder="Pilih DPD..."
                  searchPlaceholder="Cari provinsi / DPD..."
                  emptyMessage="DPD tidak ditemukan"
                />
              </div>
            )}

            {linkType === "DPC" && (
              <div className="space-y-1.5">
                <Label htmlFor="select-dpc-target" className="text-xs font-semibold">
                  Pilih DPC (Kabupaten/Kota)
                </Label>
                <SearchableSelect
                  id="select-dpc-target"
                  value={targetId}
                  onValueChange={(val) => setTargetId(val)}
                  options={dpcOptions}
                  placeholder="Pilih DPC..."
                  searchPlaceholder="Cari kabupaten/kota / DPC..."
                  emptyMessage="DPC tidak ditemukan"
                />
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
                disabled={tautkanCabangMutation.isPending}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={
                  tautkanCabangMutation.isPending ||
                  (linkType !== "NONE" && !targetId)
                }
              >
                {tautkanCabangMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                )}
                Simpan Tautan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

