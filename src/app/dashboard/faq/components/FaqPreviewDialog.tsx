"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FaqAccordion from "@/components/ui/cue-split-panel-image-synced-faq-features";
import { FaqApiItem } from "@/features/faq/types";
import { FaqKategoriBadge, FaqStatusBadge } from "./FaqBadges";

interface FaqPreviewDialogProps {
  item: FaqApiItem | null;
  onClose: () => void;
}

/** Pratinjau FAQ dengan tampilan yang sama seperti halaman publik. */
export function FaqPreviewDialog({ item, onClose }: FaqPreviewDialogProps) {
  return (
    <Dialog open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-6 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Pratinjau FAQ</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Seperti inilah FAQ ini tampil di halaman publik.
          </DialogDescription>
        </DialogHeader>

        {item && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <FaqKategoriBadge item={item} />
              <FaqStatusBadge item={item} />
            </div>
            <FaqAccordion
              key={item.uuid}
              eyebrow=""
              defaultOpen={0}
              items={[
                { id: item.uuid, question: item.pertanyaan, answer: item.jawaban },
              ]}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
