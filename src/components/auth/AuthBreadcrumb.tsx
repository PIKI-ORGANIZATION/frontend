"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface Crumb {
  label: string;
  href?: string;
}

interface AuthBreadcrumbProps {
  crumbs: Crumb[];
  className?: string;
}

export function AuthBreadcrumb({ crumbs, className }: AuthBreadcrumbProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Breadcrumb"
      className={cn("flex items-center", className)}
    >
      <ol className="flex items-center gap-1 text-[13px]">
        {/* Beranda */}
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 text-muted-foreground/70 hover:text-foreground transition-colors duration-150"
          >
            <Home className="w-3 h-3" strokeWidth={1.75} />
            <span className="hidden sm:inline">Beranda</span>
          </Link>
        </li>

        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={crumb.label} className="flex items-center gap-1">
              <ChevronRight
                className="w-3 h-3 text-muted-foreground/40 shrink-0"
                strokeWidth={1.75}
              />
              {isLast || !crumb.href ? (
                <span
                  className={cn(
                    "font-medium",
                    isLast
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground transition-colors duration-150",
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground/70 hover:text-foreground transition-colors duration-150"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </motion.nav>
  );
}
