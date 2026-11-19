"use client";

import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AccessDeniedStateProps {
  title?: string;
  description?: string;
  scopeLabel?: string;
  backHref?: string;
  backLabel?: string;
}

export function AccessDeniedState({
  title = "Akses Tidak Diizinkan",
  description = "Akun Anda tidak memiliki izin untuk mengakses halaman atau sumber daya ini. Hubungi Administrator DPP jika Anda memerlukan hak akses tambahan.",
  scopeLabel,
  backHref = "/dashboard",
  backLabel = "Kembali ke Dashboard",
}: AccessDeniedStateProps) {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-2xl items-center justify-center py-10">
      <div className="w-full rounded-xl border border-border bg-card p-8 text-center shadow-2xs">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-6" />
        </div>

        {scopeLabel && (
          <div className="mb-3 flex justify-center">
            <Badge variant="secondary" className="text-xs font-medium">
              {scopeLabel}
            </Badge>
          </div>
        )}

        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={backHref} />}
            className="h-10 px-4"
          >
            <ArrowLeft className="mr-2 size-4" />
            {backLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
