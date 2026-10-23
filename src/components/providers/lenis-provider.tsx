"use client";

import { ReactLenis } from "lenis/react";
import { usePathname } from "next/navigation";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  // In administrative dashboards with dense tables, drawers, and modal dialogs,
  // bypass Lenis scroll interception so native browser scrolling and modal focus work with zero lag.
  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
