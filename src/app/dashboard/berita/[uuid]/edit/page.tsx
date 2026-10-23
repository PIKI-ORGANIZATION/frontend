"use client";

import { use } from "react";
import { Loader2 } from "lucide-react";
import { NewsForm } from "../../components/NewsForm";
import { useAdminNewsById } from "@/hooks/api/useNews";

export default function EditBeritaPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = use(params);
  const query = useAdminNewsById(uuid);

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <p className="text-sm text-red-600">
        {(query.error as Error | null)?.message || "Berita tidak ditemukan."}
      </p>
    );
  }

  return <NewsForm mode="edit" initial={query.data} />;
}
