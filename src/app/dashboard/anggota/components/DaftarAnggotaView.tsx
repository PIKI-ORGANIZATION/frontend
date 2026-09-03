"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useGetDaftarAnggota } from "@/hooks/api/useAnggota";
import { Loader2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import { PaginationControls } from "@/components/ui/pagination-controls";

export function DaftarAnggotaView() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Reset page to 1 if search term changes
  const [prevSearch, setPrevSearch] = useState(debouncedSearch);
  if (debouncedSearch !== prevSearch) {
    setPrevSearch(debouncedSearch);
    setCurrentPage(1);
  }

  const { data, isLoading, error, isFetching } = useGetDaftarAnggota({
    search: debouncedSearch,
    currentPage,
    pageSize,
  });

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">
          Gagal memuat data anggota. Silakan coba lagi.
        </p>
      </div>
    );
  }

  const anggotaList = data?.data || [];
  const pagination = data?.pagination;

  return (
    <section className="py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="container mx-auto px-0 md:px-8 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 px-4 md:px-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
              Daftar Anggota
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Menampilkan daftar anggota PIKI yang telah terverifikasi dan
              aktif.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col items-end gap-3">
            <Input
              placeholder="Cari nama anggota..."
              className="w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col">
          <Separator />
          {isLoading && !isFetching ? (
            <div className="flex min-h-100 items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : anggotaList.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground flex flex-col items-center">
              <span className="text-4xl mb-4">👥</span>
              <p>Belum ada data anggota yang ditemukan.</p>
            </div>
          ) : (
            <>
              {anggotaList.map((item) => (
                <React.Fragment key={item.uuid}>
                  <div
                    className={`flex flex-col gap-4 px-4 py-5 md:flex-row md:items-center transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-muted text-xl font-semibold uppercase">
                        {item.namaLengkap.charAt(0)}
                      </span>
                      <div className="flex flex-col gap-1">
                        <h3 className="font-semibold">{item.namaLengkap}</h3>
                        <p className="text-sm text-muted-foreground break-all md:break-normal">
                          {item.akun?.email || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 flex-1 text-sm md:text-base">
                      <span className="font-medium">
                        Cabang:{" "}
                        {item.cabang?.namaCabang || item.kotaDomisili || "-"}
                      </span>
                      <div>
                        <Badge
                          variant="secondary"
                          className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none font-medium mt-1"
                        >
                          Aktif
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/dashboard/anggota/${item.uuid}`)
                        }
                        className="flex-1 md:flex-none py-4 "
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Detail
                      </Button>
                    </div>
                  </div>
                  <Separator />
                </React.Fragment>
              ))}

              {/* Pagination Controls */}
              {pagination && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  isFetching={isFetching}
                />
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
