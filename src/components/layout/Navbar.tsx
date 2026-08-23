"use client";

import CurvedMenu from "@/components/ui/curved-menu";
import Image from "next/image";

export function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-[100] flex justify-between items-center px-6 md:px-10 lg:px-16 xl:px-24 py-5 pointer-events-none">
      <Image
        src="/logo1.png"
        width={32}
        height={32}
        alt="Logo PIKI"
        style={{ width: "auto", height: "auto" }}
      />

      {/* CurvedMenu */}
      <div className="pointer-events-auto">
        <CurvedMenu />
      </div>
    </nav>
  );
}
