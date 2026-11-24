"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Loader2,
  Plus,
  Trash2,
  Link2,
  Building2,
  Phone,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  CabangItem,
  CabangFormValues,
  DpdItem,
  DpcItem,
  MasterProvinsi,
} from "@/features/wilayah/types";
import { useMasterKabupaten } from "@/features/wilayah/hooks/useWilayah";

interface CabangEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cabang: CabangItem | null;
  cabangList: CabangItem[];
  dpdList: DpdItem[];
  dpcList: DpcItem[];
  masterProvinsi: MasterProvinsi[];
  isSuperAdmin?: boolean;
  onSave: (payload: CabangFormValues) => Promise<unknown>;
  isSubmitting: boolean;
}

interface CabangFormInnerProps {
  cabang: CabangItem | null;
  cabangList: CabangItem[];
  dpdList: DpdItem[];
  dpcList: DpcItem[];
  masterProvinsi: MasterProvinsi[];
  isSuperAdmin: boolean;
  onSave: (payload: CabangFormValues) => Promise<unknown>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const TINGKAT_TAUTAN_OPTIONS = [
  {
    value: "NONE",
    label: "Tanpa Tautan Wilayah",
    subLabel: "Belum ditautkan ke DPD/DPC",
  },
  {
    value: "DPD",
    label: "Tingkat Daerah (DPD)",
    subLabel: "Kepengurusan tingkat provinsi",
  },
  {
    value: "DPC",
    label: "Tingkat Cabang (DPC)",
    subLabel: "Kepengurusan tingkat kab/kota",
  },
];

const STATUS_CABANG_OPTIONS = [
  { value: "ACTIVE", label: "Aktif (Publik)" },
  { value: "NON_ACTIVE", label: "Nonaktif" },
];

type FormErrors = Partial<Record<string, string>>;

function CabangFormInner({
  cabang,
  cabangList,
  dpdList,
  dpcList,
  masterProvinsi,
  isSuperAdmin,
  onSave,
  onCancel,
  isSubmitting,
}: CabangFormInnerProps) {
  const isEditing = Boolean(cabang);

  // Urutkan provinsi berdasarkan kode terkecil
  const sortedProvinsi = useMemo(() => {
    return [...masterProvinsi].sort(
      (a, b) => Number(a.kode_provinsi) - Number(b.kode_provinsi),
    );
  }, [masterProvinsi]);

  // Tentukan kode provinsi awal jika sedang mengedit data cabang
  const initialKodeProvinsi = useMemo(() => {
    if (!cabang?.provinsi) return "";
    const match = sortedProvinsi.find(
      (p) => p.nama_provinsi.toLowerCase() === cabang.provinsi.toLowerCase(),
    );
    return match?.kode_provinsi || "";
  }, [cabang, sortedProvinsi]);

  // 1. State Tautan Wilayah
  const [linkType, setLinkType] = useState<"NONE" | "DPD" | "DPC">(() => {
    if (cabang?.dpdId) return "DPD";
    if (cabang?.dpcId) return "DPC";
    return "NONE";
  });
  const [targetId, setTargetId] = useState<string>(() => {
    if (cabang?.dpdId) return cabang.dpdId;
    if (cabang?.dpcId) return String(cabang.dpcId);
    return "";
  });

  // 2. State Identitas & Lokasi
  const [namaCabang, setNamaCabang] = useState<string>(cabang?.namaCabang || "");
  const [selectedKodeProvinsi, setSelectedKodeProvinsi] =
    useState<string>(initialKodeProvinsi);
  const [provinsi, setProvinsi] = useState<string>(cabang?.provinsi || "");
  const [kabupatenKota, setKabupatenKota] = useState<string>(
    cabang?.kabupatenKota || "",
  );
  const [alamat, setAlamat] = useState<string>(cabang?.alamat || "");
  const [statusCabang, setStatusCabang] = useState<"ACTIVE" | "NON_ACTIVE">(
    cabang?.statusCabang === "NON_ACTIVE" ? "NON_ACTIVE" : "ACTIVE",
  );

  // 3. State Kontak & Media Sosial
  const [email, setEmail] = useState<string>(cabang?.email || "");
  const [noWa, setNoWa] = useState<string>(cabang?.noWa || "");
  const [instagram, setInstagram] = useState<string>(cabang?.instagram || "");
  const [facebook, setFacebook] = useState<string>(cabang?.facebook || "");
  const [youtube, setYoutube] = useState<string>(cabang?.youtube || "");

  // 4. State Profil, Visi & Misi
  const [deskripsiCabang, setDeskripsiCabang] = useState<string>(
    cabang?.deskripsiCabang || "",
  );
  const [visi, setVisi] = useState<string>(cabang?.visi || "");
  const [misiList, setMisiList] = useState<string[]>(() => {
    if (cabang?.misi && cabang.misi.length > 0) {
      return cabang.misi.map((m) => m.teks);
    }
    return [""];
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Fetch daftar kabupaten berdasarkan kode provinsi terpilih
  const { data: kabupatenList = [], isLoading: isLoadingKab } =
    useMasterKabupaten(selectedKodeProvinsi || null);

  // Filter DPD yang belum dipakai oleh cabang lain (cegah error 409)
  const availableDpdOptions = useMemo(() => {
    const usedDpdIds = new Set(
      cabangList
        .filter((c) => c.dpdId && c.uuid !== cabang?.uuid)
        .map((c) => c.dpdId as string),
    );

    return [...dpdList]
      .filter(
        (d) =>
          !usedDpdIds.has(d.id) &&
          (!d.cabang || d.cabang.uuid === cabang?.uuid),
      )
      .sort((a, b) => Number(a.kodeProvinsi) - Number(b.kodeProvinsi))
      .map((d) => ({
        value: d.id,
        label: `DPD ${d.dpd}`,
        searchKey: `DPD ${d.dpd}`,
      }));
  }, [dpdList, cabangList, cabang?.uuid]);

  // Filter DPC yang belum dipakai oleh cabang lain (cegah error 409)
  const availableDpcOptions = useMemo(() => {
    const usedDpcIds = new Set(
      cabangList
        .filter((c) => c.dpcId && c.uuid !== cabang?.uuid)
        .map((c) => c.dpcId as number),
    );

    return [...dpcList]
      .filter(
        (d) =>
          !usedDpcIds.has(d.id) &&
          (!d.cabang || d.cabang.uuid === cabang?.uuid),
      )
      .sort((a, b) => {
        const provDiff = Number(a.kode_provinsi) - Number(b.kode_provinsi);
        if (provDiff !== 0) return provDiff;
        return Number(a.kode_kabupaten) - Number(b.kode_kabupaten);
      })
      .map((d) => ({
        value: String(d.id),
        label: `DPC ${d.dpc}`,
        subLabel: `Provinsi ${d.dpd}`,
        searchKey: `DPC ${d.dpc} ${d.dpd}`,
      }));
  }, [dpcList, cabangList, cabang?.uuid]);

  // Pilihan Provinsi (nama bersih tanpa kode angka)
  const provinsiOptions = useMemo(() => {
    const base = sortedProvinsi.map((p) => ({
      value: p.nama_provinsi,
      label: p.nama_provinsi,
      searchKey: p.nama_provinsi,
    }));

    if (
      provinsi &&
      !base.some((o) => o.value.toLowerCase() === provinsi.toLowerCase())
    ) {
      return [{ value: provinsi, label: provinsi, searchKey: provinsi }, ...base];
    }

    return base;
  }, [sortedProvinsi, provinsi]);

  // Pilihan Kabupaten/Kota (nama bersih tanpa kode angka)
  const kabupatenOptions = useMemo(() => {
    const base = [...kabupatenList]
      .sort((a, b) => Number(a.kode_kabupaten) - Number(b.kode_kabupaten))
      .map((k) => ({
        value: k.nama_kabupaten,
        label: k.nama_kabupaten,
        searchKey: k.nama_kabupaten,
      }));

    if (
      kabupatenKota &&
      !base.some((o) => o.value.toLowerCase() === kabupatenKota.toLowerCase())
    ) {
      return [
        { value: kabupatenKota, label: kabupatenKota, searchKey: kabupatenKota },
        ...base,
      ];
    }

    return base;
  }, [kabupatenList, kabupatenKota]);

  // Smart Auto-Fill saat DPP memilih target DPD/DPC
  const handleSelectTarget = (val: string) => {
    setTargetId(val);
    setErrors((prev) => ({ ...prev, targetId: undefined }));

    if (linkType === "DPD") {
      const dpd = dpdList.find((d) => d.id === val);
      if (dpd && !isEditing) {
        if (
          !namaCabang.trim() ||
          namaCabang.startsWith("DPD PIKI ") ||
          namaCabang.startsWith("DPC PIKI ")
        ) {
          setNamaCabang(`DPD PIKI ${dpd.dpd}`);
        }
        setProvinsi(dpd.dpd);
        setSelectedKodeProvinsi(dpd.kodeProvinsi || "");
        setKabupatenKota("");
      }
    } else if (linkType === "DPC") {
      const dpc = dpcList.find((d) => String(d.id) === val);
      if (dpc && !isEditing) {
        if (
          !namaCabang.trim() ||
          namaCabang.startsWith("DPD PIKI ") ||
          namaCabang.startsWith("DPC PIKI ")
        ) {
          setNamaCabang(`DPC PIKI ${dpc.dpc}`);
        }
        setProvinsi(dpc.dpd);
        setSelectedKodeProvinsi(dpc.kode_provinsi || "");
        setKabupatenKota(dpc.dpc);
      }
    }
  };

  const handleProvinsiChange = (namaProv: string) => {
    setProvinsi(namaProv);
    const match = sortedProvinsi.find(
      (p) => p.nama_provinsi.toLowerCase() === namaProv.toLowerCase(),
    );
    setSelectedKodeProvinsi(match?.kode_provinsi || "");
    setKabupatenKota("");
    setErrors((prev) => ({ ...prev, provinsi: undefined }));
  };

  const handleAddMisi = () => {
    setMisiList((prev) => [...prev, ""]);
  };

  const handleChangeMisi = (index: number, value: string) => {
    setMisiList((prev) => prev.map((item, i) => (i === index ? value : item)));
    setErrors((prev) => ({ ...prev, misi: undefined }));
  };

  const handleRemoveMisi = (index: number) => {
    setMisiList((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const validate = (): { valid: boolean; cleanNoWa: string; cleanMisi: string[] } => {
    const nextErrors: FormErrors = {};
    const cleanNoWa = noWa.replace(/[\s\-()]/g, "").trim();
    const cleanMisi = misiList.map((m) => m.trim()).filter(Boolean);

    if (linkType !== "NONE" && !targetId) {
      nextErrors.targetId =
        linkType === "DPD"
          ? "Pilih DPD yang ingin ditautkan atau ubah tingkat ke Tanpa Tautan."
          : "Pilih DPC yang ingin ditautkan atau ubah tingkat ke Tanpa Tautan.";
    }

    if (namaCabang.trim().length < 3) {
      nextErrors.namaCabang = "Nama profil cabang minimal 3 karakter.";
    }

    if (provinsi.trim().length < 3) {
      nextErrors.provinsi = "Provinsi wajib dipilih (minimal 3 karakter).";
    }

    if (kabupatenKota.trim().length < 3) {
      nextErrors.kabupatenKota = "Kabupaten / Kota wajib diisi (minimal 3 karakter).";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      nextErrors.email = "Format email resmi cabang tidak valid.";
    }

    if (!cleanNoWa || !/^[0-9+]+$/.test(cleanNoWa)) {
      nextErrors.noWa =
        "No. WhatsApp wajib diisi dan hanya boleh berisi angka atau awalan '+'.";
    }

    if (deskripsiCabang.trim().length < 5) {
      nextErrors.deskripsiCabang = "Deskripsi cabang minimal 5 karakter.";
    }

    if (visi.trim().length < 5) {
      nextErrors.visi = "Visi cabang minimal 5 karakter.";
    }

    if (cleanMisi.length === 0) {
      nextErrors.misi = "Tambahkan minimal 1 poin misi cabang.";
    }

    setErrors(nextErrors);
    return {
      valid: Object.keys(nextErrors).length === 0,
      cleanNoWa,
      cleanMisi,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { valid, cleanNoWa, cleanMisi } = validate();
    if (!valid) return;

    const payload: CabangFormValues = {
      namaCabang: namaCabang.trim(),
      provinsi: provinsi.trim(),
      kabupatenKota: kabupatenKota.trim(),
      alamat: alamat.trim() || null,
      deskripsiCabang: deskripsiCabang.trim(),
      visi: visi.trim(),
      misi: cleanMisi,
      email: email.trim(),
      noWa: cleanNoWa,
      // Backend baseCabangSchema mewajibkan tipe string (boleh string kosong "")
      instagram: instagram.trim(),
      facebook: facebook.trim(),
      youtube: youtube.trim(),
      // Field struktural (isCabang, statusCabang, dpdId, dpcId) hanya boleh dikirim oleh SuperAdmin DPP;
      // Admin DPD/DPC akan ditolak 403 oleh backend jika mengirimkannya.
      ...(isSuperAdmin && {
        isCabang: true,
        ...(isEditing && { statusCabang }),
        dpdId: linkType === "DPD" ? targetId || null : null,
        dpcId: linkType === "DPC" && targetId ? Number(targetId) : null,
      }),
    };

    await onSave(payload);
  };

  const errorCount = Object.keys(errors).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-2">
      {errorCount > 0 && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Mohon lengkapi atau perbaiki {errorCount} kolom yang ditandai merah di bawah.</span>
        </div>
      )}

      {/* BAGIAN 1: TAUTAN WILAYAH & IDENTITAS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Link2 className="w-4 h-4 text-primary" />
          <span>1. Tautan Wilayah &amp; Identitas Cabang</span>
        </div>

        {isSuperAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border border-border/80 bg-muted/20 p-4">
            <div className="space-y-2">
              <Label htmlFor="cabang-link-type" className="text-sm font-medium text-foreground">
                Tingkat Tautan Organisasi
              </Label>
              <SearchableSelect
                id="cabang-link-type"
                value={linkType}
                onValueChange={(val) => {
                  setLinkType(val as "NONE" | "DPD" | "DPC");
                  setTargetId("");
                  setErrors((prev) => ({ ...prev, targetId: undefined }));
                }}
                options={TINGKAT_TAUTAN_OPTIONS}
                placeholder="Pilih tingkat tautan..."
                searchPlaceholder="Cari tingkat..."
              />
            </div>

            {linkType === "DPD" && (
              <div className="space-y-2">
                <Label htmlFor="cabang-target-dpd" className="text-sm font-medium text-foreground">
                  Pilih DPD (Provinsi) <span className="text-destructive">*</span>
                </Label>
                <SearchableSelect
                  id="cabang-target-dpd"
                  value={targetId}
                  onValueChange={handleSelectTarget}
                  options={availableDpdOptions}
                  placeholder="Pilih DPD yang belum tertaut..."
                  searchPlaceholder="Cari nama DPD..."
                  emptyMessage="Semua DPD sudah tertaut atau tidak ditemukan"
                />
                {errors.targetId && (
                  <p className="text-xs text-destructive">{errors.targetId}</p>
                )}
              </div>
            )}

            {linkType === "DPC" && (
              <div className="space-y-2">
                <Label htmlFor="cabang-target-dpc" className="text-sm font-medium text-foreground">
                  Pilih DPC (Kabupaten/Kota) <span className="text-destructive">*</span>
                </Label>
                <SearchableSelect
                  id="cabang-target-dpc"
                  value={targetId}
                  onValueChange={handleSelectTarget}
                  options={availableDpcOptions}
                  placeholder="Pilih DPC yang belum tertaut..."
                  searchPlaceholder="Cari nama DPC atau provinsi..."
                  emptyMessage="Semua DPC sudah tertaut atau tidak ditemukan"
                />
                {errors.targetId && (
                  <p className="text-xs text-destructive">{errors.targetId}</p>
                )}
              </div>
            )}

            {linkType === "NONE" && (
              <div className="flex items-center text-xs text-muted-foreground leading-relaxed sm:pt-6">
                Anda tetap dapat menautkan cabang ini ke DPD atau DPC kapan saja melalui tombol &ldquo;Atur Tautan&rdquo;.
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="cabang-nama" className="text-sm font-medium text-foreground">
              Nama Profil Cabang <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cabang-nama"
              placeholder="Contoh: DPD PIKI Jambi atau DPC PIKI Kota Medan"
              value={namaCabang}
              onChange={(e) => {
                setNamaCabang(e.target.value);
                setErrors((prev) => ({ ...prev, namaCabang: undefined }));
              }}
              className="h-10 text-sm"
            />
            {errors.namaCabang && (
              <p className="text-xs text-destructive">{errors.namaCabang}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cabang-provinsi" className="text-sm font-medium text-foreground">
              Provinsi <span className="text-destructive">*</span>
            </Label>
            <SearchableSelect
              id="cabang-provinsi"
              value={provinsi}
              onValueChange={handleProvinsiChange}
              options={provinsiOptions}
              placeholder="Pilih provinsi..."
              searchPlaceholder="Cari provinsi..."
              emptyMessage="Provinsi tidak ditemukan"
            />
            {errors.provinsi && (
              <p className="text-xs text-destructive">{errors.provinsi}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cabang-kabkota" className="text-sm font-medium text-foreground">
              Kabupaten / Kota <span className="text-destructive">*</span>
            </Label>
            {selectedKodeProvinsi ? (
              <SearchableSelect
                id="cabang-kabkota"
                value={kabupatenKota}
                onValueChange={(val) => {
                  setKabupatenKota(val);
                  setErrors((prev) => ({ ...prev, kabupatenKota: undefined }));
                }}
                options={kabupatenOptions}
                placeholder={
                  isLoadingKab ? "Memuat kabupaten/kota..." : "Pilih kabupaten/kota..."
                }
                searchPlaceholder="Cari kabupaten/kota..."
                emptyMessage="Kabupaten/kota tidak ditemukan"
                disabled={isLoadingKab}
              />
            ) : (
              <Input
                id="cabang-kabkota"
                placeholder="Pilih provinsi dahulu atau ketik kota/kab..."
                value={kabupatenKota}
                onChange={(e) => {
                  setKabupatenKota(e.target.value);
                  setErrors((prev) => ({ ...prev, kabupatenKota: undefined }));
                }}
                className="h-10 text-sm"
              />
            )}
            {errors.kabupatenKota && (
              <p className="text-xs text-destructive">{errors.kabupatenKota}</p>
            )}
          </div>

          <div className={isEditing && isSuperAdmin ? "space-y-2" : "space-y-2 sm:col-span-2"}>
            <Label htmlFor="cabang-alamat" className="text-sm font-medium text-foreground">
              Alamat Sekretariat
            </Label>
            <Input
              id="cabang-alamat"
              placeholder="Contoh: Jl. Sudirman No. 12, Kec. Pasar Jambi"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="h-10 text-sm"
            />
          </div>

          {isEditing && isSuperAdmin && (
            <div className="space-y-2">
              <Label htmlFor="cabang-status" className="text-sm font-medium text-foreground">
                Status Publik
              </Label>
              <SearchableSelect
                id="cabang-status"
                value={statusCabang}
                onValueChange={(val) =>
                  setStatusCabang(val as "ACTIVE" | "NON_ACTIVE")
                }
                options={STATUS_CABANG_OPTIONS}
                placeholder="Pilih status..."
              />
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* BAGIAN 2: KONTAK & MEDIA SOSIAL */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Phone className="w-4 h-4 text-primary" />
          <span>2. Kontak Resmi &amp; Media Sosial</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cabang-email" className="text-sm font-medium text-foreground">
              Email Resmi Cabang <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cabang-email"
              type="email"
              placeholder="Contoh: dpd.jambi@piki.or.id"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className="h-10 text-sm"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cabang-nowa" className="text-sm font-medium text-foreground">
              No. WhatsApp <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cabang-nowa"
              placeholder="Contoh: 081234567890 atau +6281234567890"
              value={noWa}
              onChange={(e) => {
                setNoWa(e.target.value);
                setErrors((prev) => ({ ...prev, noWa: undefined }));
              }}
              className="h-10 text-sm"
            />
            {errors.noWa && (
              <p className="text-xs text-destructive">{errors.noWa}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cabang-ig" className="text-sm font-medium text-foreground">
              Instagram
            </Label>
            <Input
              id="cabang-ig"
              placeholder="@piki_jambi"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="h-10 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cabang-fb" className="text-sm font-medium text-foreground">
              Facebook
            </Label>
            <Input
              id="cabang-fb"
              placeholder="PIKI Jambi"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              className="h-10 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cabang-yt" className="text-sm font-medium text-foreground">
              YouTube
            </Label>
            <Input
              id="cabang-yt"
              placeholder="Channel PIKI Jambi"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              className="h-10 text-sm"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* BAGIAN 3: PROFIL, VISI & MISI */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <FileText className="w-4 h-4 text-primary" />
          <span>3. Deskripsi, Visi &amp; Misi Cabang</span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cabang-deskripsi" className="text-sm font-medium text-foreground">
            Deskripsi Singkat Cabang <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="cabang-deskripsi"
            placeholder="Jelaskan profil singkat dan peran strategis cabang PIKI di wilayah ini..."
            value={deskripsiCabang}
            onChange={(e) => {
              setDeskripsiCabang(e.target.value);
              setErrors((prev) => ({ ...prev, deskripsiCabang: undefined }));
            }}
            className="min-h-[84px] text-sm resize-y"
          />
          {errors.deskripsiCabang && (
            <p className="text-xs text-destructive">{errors.deskripsiCabang}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cabang-visi" className="text-sm font-medium text-foreground">
            Visi Cabang <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="cabang-visi"
            placeholder="Tuliskan visi pelayanan dan kontribusi cendekiawan Kristen di wilayah ini..."
            value={visi}
            onChange={(e) => {
              setVisi(e.target.value);
              setErrors((prev) => ({ ...prev, visi: undefined }));
            }}
            className="min-h-[76px] text-sm resize-y"
          />
          {errors.visi && (
            <p className="text-xs text-destructive">{errors.visi}</p>
          )}
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">
              Poin Misi Cabang <span className="text-destructive">*</span>
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddMisi}
              className="h-8 px-3 text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Poin Misi
            </Button>
          </div>

          <div className="space-y-2.5">
            {misiList.map((misiItem, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground w-5 text-right shrink-0">
                  {idx + 1}.
                </span>
                <Input
                  placeholder={`Tuliskan poin misi ke-${idx + 1}...`}
                  value={misiItem}
                  onChange={(e) => handleChangeMisi(idx, e.target.value)}
                  className="h-10 text-sm flex-1"
                />
                {misiList.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMisi(idx)}
                    className="h-9 w-9 text-destructive hover:bg-destructive/10 shrink-0"
                    title="Hapus poin misi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          {errors.misi && (
            <p className="text-xs text-destructive">{errors.misi}</p>
          )}
        </div>
      </div>

      <DialogFooter className="pt-3 border-t border-border gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-10 px-4 text-sm"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-10 px-5 text-sm font-medium gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{isEditing ? "Simpan Perubahan" : "Simpan Profil Cabang"}</span>
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CabangEditorDialog({
  open,
  onOpenChange,
  cabang,
  cabangList,
  dpdList,
  dpcList,
  masterProvinsi,
  isSuperAdmin = true,
  onSave,
  isSubmitting,
}: CabangEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Building2 className="w-5 h-5 text-primary" />
            <span>
              {cabang
                ? `Edit Profil Cabang: ${cabang.namaCabang}`
                : "Tambah Profil Cabang Baru"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {cabang
              ? "Perbarui informasi profil publik, kontak, visi-misi, serta tautan wilayah cabang."
              : "Buat profil cabang resmi PIKI dan tautkan langsung ke DPD (Provinsi) atau DPC (Kabupaten/Kota) agar siap menugaskan admin wilayah."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <CabangFormInner
            key={cabang?.uuid || "new-cabang"}
            cabang={cabang}
            cabangList={cabangList}
            dpdList={dpdList}
            dpcList={dpcList}
            masterProvinsi={masterProvinsi}
            isSuperAdmin={isSuperAdmin}
            onSave={onSave}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
