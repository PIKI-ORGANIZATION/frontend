"use client";

import CurvedMenu from "@/components/ui/curved-menu";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

export function Navbar() {
  const { scrollY } = useScroll();
  const [isHidden, setIsHidden] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMenuOpenRef = useRef(isMenuOpen);

  useEffect(() => {
    isMenuOpenRef.current = isMenuOpen;
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    // Safely handle potential undefined previous value
    if (previous === undefined || isMenuOpenRef.current) return;

    if (latest < 50) {
      setIsHidden(false);
      return;
    }

    const diff = latest - previous;

    if (diff > 5) {
      setIsHidden(true);
    } else if (diff < -5) {
      setIsHidden(false);
    }
  });

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={isHidden && !isMenuOpen ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 inset-x-0 z-[100] flex justify-between items-center px-6 md:px-10 lg:px-16 xl:px-24 py-5 pointer-events-none"
    >
      <Image
        src="/logo1.png"
        width={32}
        height={32}
        alt="Logo PIKI"
        style={{ width: "auto", height: "auto" }}
      />

      {/* CurvedMenu */}
      <div className="pointer-events-auto">
        <CurvedMenu isActive={isMenuOpen} setIsActive={setIsMenuOpen} />
      </div>
    </motion.nav>
  );
}
