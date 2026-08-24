"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Film, Play } from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { PageHeader } from "@/components/ui/page-header";

type TabValue = "foto" | "video" | "instagram" | "youtube";

interface Tab {
  value: TabValue;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { value: "foto", label: "Galeri Foto", icon: <Camera className="w-4 h-4" /> },
  {
    value: "video",
    label: "Video Kegiatan",
    icon: <Film className="w-4 h-4" />,
  },
  {
    value: "instagram",
    label: "Instagram",
    icon: <FaInstagram className="w-4 h-4" />,
  },
  {
    value: "youtube",
    label: "YouTube",
    icon: <FaYoutube className="w-4 h-4" />,
  },
];

const DUMMY_PHOTOS = [
  "/footage/image1.webp",
  "/footage/image2.jpeg",
  "/footage/image3.jpg",
  "/footage/image1.webp",
  "/footage/image2.jpeg",
  "/footage/image3.jpg",
];

const DUMMY_VIDEOS = [
  { id: 1, title: "Highlight Kongres PIKI", thumb: "/footage/image1.webp" },
  { id: 2, title: "Sambutan Ketua Umum", thumb: "/footage/image2.jpeg" },
  { id: 3, title: "Aksi Sosial 2024", thumb: "/footage/image3.jpg" },
];

export default function GaleriPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("foto");

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <section className="flex-1 w-full pt-32 pb-24 md:pt-40 md:pb-32 px-5 md:px-10 lg:px-30 mx-auto">
        {/* Header */}
        <PageHeader 
          align="center"
          eyebrow="Dokumentasi"
          title="Galeri & Media"
          description="Rekam jejak, momen kegiatan, dan dokumentasi pergerakan PIKI di berbagai platform."
        />

        {/* Custom Tabs Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`relative px-6 py-3 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${
                activeTab === tab.value
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground bg-foreground/5 hover:bg-foreground/10"
              }`}
            >
              {activeTab === tab.value && (
                <motion.div
                  layoutId="active-tab-bg"
                  className="absolute inset-0 bg-primary rounded-full z-0"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab.icon}
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[50vh]">
          <AnimatePresence mode="wait">
            {/* FOTO TAB */}
            {activeTab === "foto" && (
              <motion.div
                key="foto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
              >
                {DUMMY_PHOTOS.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-2xl overflow-hidden group break-inside-avoid"
                  >
                    <div
                      className="w-full relative"
                      style={{ paddingTop: idx % 2 === 0 ? "75%" : "125%" }}
                    >
                      <Image
                        src={src}
                        alt={`Galeri ${idx}`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* VIDEO TAB */}
            {activeTab === "video" && (
              <motion.div
                key="video"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {DUMMY_VIDEOS.map((vid) => (
                  <div
                    key={vid.id}
                    className="group cursor-pointer flex flex-col gap-4"
                  >
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-muted">
                      <Image
                        src={vid.thumb}
                        alt={vid.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-colors group-hover:bg-black/40">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transition-transform group-hover:scale-110">
                          <Play className="w-6 h-6 text-white ml-1 fill-white" />
                        </div>
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg leading-snug group-hover:text-primary transition-colors">
                      {vid.title}
                    </h3>
                  </div>
                ))}
              </motion.div>
            )}

            {/* INSTAGRAM TAB */}
            {activeTab === "instagram" && (
              <motion.div
                key="instagram"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-3xl"
              >
                <FaInstagram className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-2xl font-bold mb-2">Feed Instagram</h3>
                <p className="text-muted-foreground max-w-md">
                  Area ini akan memuat widget feed Instagram resmi PIKI. Saat
                  ini menggunakan dummy placeholder.
                </p>
              </motion.div>
            )}

            {/* YOUTUBE TAB */}
            {activeTab === "youtube" && (
              <motion.div
                key="youtube"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-3xl"
              >
                <FaYoutube className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-2xl font-bold mb-2">Channel YouTube</h3>
                <p className="text-muted-foreground max-w-md">
                  Area ini akan memuat embed player YouTube resmi PIKI. Saat ini
                  menggunakan dummy placeholder.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
