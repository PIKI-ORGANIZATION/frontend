"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function NewsCover({
  src,
  alt,
  className,
  priority = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={cn(
          "absolute inset-0 bg-[radial-gradient(circle_at_top_left,#1d4f91,transparent_55%),linear-gradient(160deg,#0b2340,#12385f_45%,#8a6a3b)]",
          className,
        )}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 768px) 100vw, 70vw"
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
