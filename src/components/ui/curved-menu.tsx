"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

interface iNavItem {
  heading: string;
  href: string;
  subheading?: string;
  subItems?: { heading: string; href: string }[];
}

interface iNavLinkProps extends iNavItem {
  setIsActive: (isActive: boolean) => void;
  index: number;
}

interface iCurvedNavbarProps {
  setIsActive: (isActive: boolean) => void;
  navItems: iNavItem[];
}

interface iHeaderProps {
  navItems?: iNavItem[];
  footer?: React.ReactNode;
  isActive?: boolean;
  setIsActive?: (val: boolean) => void;
}

const MENU_SLIDE_ANIMATION = {
  initial: { x: "calc(100% + 100px)" },
  enter: { x: "0", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } },
  exit: {
    x: "calc(100% + 100px)",
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
  },
};

const defaultNavItems: iNavItem[] = [
  {
    heading: "Beranda",
    href: "/",
    subheading: "Kembali ke halaman utama",
  },
  {
    heading: "Tentang",
    href: "/organisasi",
    subheading: "Struktur dan informasi pengurus",
  },
  {
    heading: "Publikasi",
    href: "#",
    subheading: "Kabar, jurnal, dan galeri PIKI",
    subItems: [
      { heading: "Berita", href: "/berita" },
      { heading: "Jurnal Ilmiah", href: "/jurnal" },
      { heading: "Galeri Foto", href: "/galeri/foto" },
      { heading: "Galeri Video", href: "/galeri/video" },
      { heading: "Agenda", href: "/agenda" },
    ]
  },
  {
    heading: "Akses PIKI",
    href: "/login",
    subheading: "Platform keanggotaan terpadu",
  },
];

const CustomFooter: React.FC = () => {
  return (
    <div className="bg-background pt-4 pb-8">
      <div className="px-10 md:px-24 mb-6">
        <ThemeToggle />
      </div>
      <div className="flex flex-col gap-6 w-full text-sm text-foreground px-10 md:px-24 pt-6 border-t border-border/30">
        <div className="flex justify-between gap-4 w-full md:w-auto">
          <a
            href="https://www.youtube.com/@OfficialDPPPIKI"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            <FaYoutube size={24} strokeWidth={1.5} />
          </a>
          <a
            href="https://www.instagram.com/official.dpppiki"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            <FaInstagram size={24} strokeWidth={1.5} />
          </a>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            <FaFacebook size={24} strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </div>
  );
};

const NavLink: React.FC<iNavLinkProps> = ({
  heading,
  href,
  subItems,
  setIsActive,
  index,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLAnchorElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (subItems && subItems.length > 0) {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else {
      setIsActive(false);
    }
  };

  const isExternalLink = href.startsWith("http");
  const linkProps = isExternalLink
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <div className="flex flex-col border-b border-foreground/10 group">
      <motion.div
        initial="initial"
        whileHover="whileHover"
        className="relative flex items-center justify-between py-4 transition-colors duration-500 md:py-8 uppercase cursor-pointer"
        {...linkProps}
      >
        <Link
          ref={ref}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          href={href}
          className="w-full flex justify-between items-center"
        >
          <div className="relative flex items-start">
            {/* <span className="text-muted-foreground transition-colors duration-500 text-2xl md:text-4xl font-thin mr-2">
              {index}.
            </span> */}
            <div className="flex flex-row gap-2 overflow-hidden">
              <motion.span
                variants={{
                  initial: { x: 0 },
                  whileHover: { x: -16 },
                }}
                transition={{
                  type: "spring",
                  staggerChildren: 0.075,
                  delayChildren: 0.1,
                }}
                className="relative z-10 block text-3xl md:text-5xl font-extralight text-foreground transition-colors duration-500"
              >
                {heading.split("").map((letter, i) => {
                  return (
                    <motion.span
                      key={i}
                      variants={{
                        initial: { x: 0 },
                        whileHover: { x: 16 },
                      }}
                      transition={{ type: "spring" }}
                      className="inline-block"
                    >
                      {letter === " " ? "\u00A0" : letter}
                    </motion.span>
                  );
                })}
              </motion.span>
            </div>
          </div>
          
          {subItems && subItems.length > 0 && (
            <div className="text-3xl md:text-4xl font-extralight text-muted-foreground mr-4">
              {isOpen ? "-" : "+"}
            </div>
          )}
        </Link>
      </motion.div>
      
      <AnimatePresence>
        {isOpen && subItems && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden flex flex-col gap-4 mb-4 md:mb-8 ml-4 md:ml-8"
          >
            {subItems.map((sub, i) => (
              <Link 
                key={i} 
                href={sub.href} 
                onClick={() => setIsActive(false)} 
                className="block text-xl md:text-2xl font-light hover:text-primary transition-all text-muted-foreground hover:translate-x-2 duration-300"
              >
                {sub.heading}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Curve: React.FC = () => {
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!windowHeight) return null;

  const initialPath = `M100 0 L200 0 L200 ${windowHeight} L100 ${windowHeight} Q-100 ${windowHeight / 2} 100 0`;
  const targetPath = `M100 0 L200 0 L200 ${windowHeight} L100 ${windowHeight} Q100 ${windowHeight / 2} 100 0`;

  const curve = {
    initial: { d: initialPath },
    enter: {
      d: targetPath,
      transition: { duration: 1, ease: [0.76, 0, 0.24, 1] },
    },
    exit: {
      d: initialPath,
      transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
    },
  };

  return (
    <svg className="absolute top-0 -left-[99px] w-[100px] stroke-none h-full fill-background">
      <motion.path
        variants={curve}
        initial="initial"
        animate="enter"
        exit="exit"
      />
    </svg>
  );
};

const CurvedNavbar: React.FC<
  iCurvedNavbarProps & { footer?: React.ReactNode }
> = ({ setIsActive, navItems, footer }) => {
  return (
    <motion.div
      variants={MENU_SLIDE_ANIMATION}
      initial="initial"
      animate="enter"
      exit="exit"
      className="h-[100dvh] w-screen max-w-screen-sm fixed right-0 top-0 z-40 bg-background shadow-2xl flex flex-col"
    >
      <div className="flex-1 pt-16 md:pt-24 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col text-5xl gap-3 mt-0 px-10 md:px-24">
          <div className="text-foreground border-b border-foreground/10 uppercase text-xs tracking-[0.2em] mb-4 pb-2">
            <p>Navigasi</p>
          </div>
          <section className="bg-transparent mt-0 pb-12">
            <div className="mx-auto max-w-7xl">
              {navItems.map((item, index) => {
                return (
                  <NavLink
                    key={item.href}
                    {...item}
                    setIsActive={setIsActive}
                    index={index + 1}
                  />
                );
              })}
            </div>
          </section>
        </div>
      </div>
      <div className="shrink-0 z-10">
        {footer}
      </div>
      <Curve />
    </motion.div>
  );
};

const Header: React.FC<iHeaderProps> = ({
  navItems = defaultNavItems,
  footer = <CustomFooter />,
  isActive: externalIsActive,
  setIsActive: externalSetIsActive,
}) => {
  const [internalIsActive, setInternalIsActive] = useState(false);
  const isActive = externalIsActive !== undefined ? externalIsActive : internalIsActive;
  const setIsActive = externalSetIsActive !== undefined ? externalSetIsActive : setInternalIsActive;

  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setIsActive(false);
  }, [pathname, setIsActive]);

  const handleClick = () => {
    setIsActive(!isActive);
  };

  return (
    <>
      <div className="relative z-50">
        <button
          onClick={handleClick}
          className="fixed right-6 top-5 md:right-10 md:top-6 z-50 w-12 h-12 rounded-md flex items-center justify-center cursor-pointer bg-foreground/4 hover:bg-foreground/8 backdrop-blur-md transition-colors"
          aria-label="Toggle Menu"
        >
          <div className="relative w-6 h-5 flex flex-col justify-between items-center">
            <span
              className={`block h-[2px] w-6 bg-foreground transition-transform duration-300 ${isActive ? "rotate-45 translate-y-2.5" : ""}`}
            ></span>
            <span
              className={`block h-[2px] w-6 bg-foreground transition-opacity duration-300 ${isActive ? "opacity-0" : ""}`}
            ></span>
            <span
              className={`block h-[2px] w-6 bg-foreground transition-transform duration-300 ${isActive ? "-rotate-45 -translate-y-2" : ""}`}
            ></span>
          </div>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isActive && (
          <CurvedNavbar
            setIsActive={setIsActive}
            navItems={navItems}
            footer={footer}
          />
        )}
      </AnimatePresence>

      {/* Overlay backdrop for the rest of the screen */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClick}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
