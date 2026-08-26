"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  useGetRegistrasiPending,
  useApproveRegistrasi,
  RegistrasiItem,
} from "@/hooks/api/useVerifikasi";
import { toast } from "sonner";
import { Loader2, Eye, Check } from "lucide-react";
import { ReviewModal } from "./components/ReviewModal";

export default function VerifikasiPage() {
  const { data, isLoading, error } = useGetRegistrasiPending();
  const { mutate: processVerifikasi, isPending } = useApproveRegistrasi();

  const [processingId, setProcessingId] = useState<string | null>(null);

  // States for Review Modal
  const [selectedItem, setSelectedItem] = useState<RegistrasiItem | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const openReview = (item: RegistrasiItem) => {
    setSelectedItem(item);
    setIsReviewOpen(true);
  };

  const handleProcess = (id: string, status: "APPROVED_DPP" | "REJECTED", catatanVerifikasi?: string) => {
    setProcessingId(id);
    processVerifikasi(
      { id, status, catatanVerifikasi },
      {
        onSuccess: () => {
          toast.success(`Berhasil memproses pendaftaran.`);
          setProcessingId(null);
          setIsReviewOpen(false);
        },
        onError: (err) => {
          toast.error(err.message || "Gagal memproses pendaftaran");
          setProcessingId(null);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">Gagal memuat data. Silakan coba lagi.</p>
      </div>
    );
  }

  const registrasiList = data?.data || [];

  return (
    <>
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-0 md:px-8">
          <h1 className="mb-8 px-4 text-3xl font-semibold md:mb-12 md:text-4xl">
            Verifikasi Keanggotaan
          </h1>
          <div className="flex flex-col">
            <Separator />
            {registrasiList.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Tidak ada antrean pendaftaran saat ini.
              </div>
            ) : (
              registrasiList.map((item: RegistrasiItem) => (
                <React.Fragment key={item.id}>
                  <div className="flex flex-col gap-4 px-4 py-5 md:flex-row md:items-center">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-muted text-xl font-semibold uppercase">
                        {item.namaLengkap.charAt(0)}
                      </span>
                      <div className="flex flex-col gap-1">
                        <h3 className="font-semibold">{item.namaLengkap}</h3>
                        <p className="text-sm text-muted-foreground break-all md:break-normal">
                          {item.email} • {item.noWa}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 flex-1 text-sm md:text-base">
                      <span className="font-medium">
                        Cabang: {item.cabang?.namaCabang || item.dpc || "-"}
                      </span>
                      <div>
                        <Badge
                          variant="secondary"
                          className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400 border-none font-medium mt-1"
                        >
                          Pending
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReview(item)}
                        className="flex-1 md:flex-none py-4 "
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                      <Button
                        size="sm"
                        disabled={isPending && processingId === item.id}
                        onClick={() => handleProcess(item.id, "APPROVED_DPP")}
                        className="flex-1 md:flex-none py-4 "
                      >
                        {isPending && processingId === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        ) : (
                          <Check className="w-4 h-4 mr-1" />
                        )}
                        Setujui
                      </Button>
                    </div>
                  </div>
                  <Separator />
                </React.Fragment>
              ))
            )}
          </div>
        </div>
      </section>

      <ReviewModal
        isOpen={isReviewOpen}
        onOpenChange={setIsReviewOpen}
        selectedItem={selectedItem}
        isPending={isPending}
        processingId={processingId}
        onApprove={(id) => handleProcess(id, "APPROVED_DPP")}
        onReject={(id, reason) => handleProcess(id, "REJECTED", reason)}
      />
    </>
  );
}
