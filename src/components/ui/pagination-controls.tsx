import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isFetching?: boolean;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  isFetching = false,
}: PaginationControlsProps) {
  if (totalItems === 0) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  // Helper to generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col-reverse md:flex-row items-center justify-between px-2 md:px-4 py-6 mt-4 gap-4 md:gap-0">
      {/* Pagination Controls (Left side on desktop, bottom on mobile) */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 w-full md:w-auto">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground px-2 sm:px-3"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || isFetching}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </Button>

        <div className="flex items-center gap-1">
          {pages.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-muted-foreground"
                >
                  ...
                </span>
              );
            }
            const isActive = page === currentPage;
            return (
              <Button
                key={`page-${page}`}
                variant={isActive ? "default" : "ghost"}
                size="icon"
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm ring-4 ring-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => onPageChange(page as number)}
                disabled={isFetching}
              >
                {page}
              </Button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground px-2 sm:px-3"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={
            currentPage === totalPages || totalPages === 0 || isFetching
          }
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Info Text (Right side on desktop, top on mobile) */}
      <div className="text-sm text-muted-foreground text-center md:text-right">
        Menampilkan {start}-{end} dari {totalItems} data
      </div>
    </div>
  );
}
