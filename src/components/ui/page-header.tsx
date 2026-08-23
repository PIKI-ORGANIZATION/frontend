"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PageHeaderProps {
  eyebrow: ReactNode;
  title: string;
  description: string;
  align?: "left" | "center";
  border?: boolean;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  align = "left",
  border = false,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 mb-16 md:mb-24",
        align === "center" && "items-center text-center",
        border && "border-b border-foreground/10 pb-12",
        className,
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "text-sm font-semibold tracking-widest uppercase text-primary flex items-center gap-2",
          align === "center" && "justify-center",
        )}
      >
        {eyebrow}
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
      >
        {title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mt-2 leading-relaxed"
      >
        {description}
      </motion.p>
    </div>
  );
}
