"use client";

import Image from "next/image";
import { Users, Mic2, Building2 } from "lucide-react";
import CardSwap, { Card } from "@/components/CardSwap";
import { AppCard } from "./AppCard";

const HERO_CARDS = [
  {
    icon: <Users className="w-3.5 h-3.5" />,
    label: "Kongres Nasional PIKI",
    image: "/footage/image1.webp",
  },
  {
    icon: <Mic2 className="w-3.5 h-3.5" />,
    label: "Sidang Pleno DPP",
    image: "/footage/image2.jpeg",
  },
  {
    icon: <Building2 className="w-3.5 h-3.5" />,
    label: "Pelantikan DPD",
    image: "/footage/image3.jpg",
  },
];

export function HeroCardSwap() {
  return (
    <CardSwap
      width={1300}
      height={800}
      cardDistance={55}
      verticalDistance={70}
      delay={3000}
      pauseOnHover={true}
      easing="elastic"
    >
      {HERO_CARDS.map((card, i) => (
        <Card
          key={i}
          customClass="overflow-hidden p-0 border border-white/10 !bg-transparent !rounded-2xl"
        >
          <AppCard icon={card.icon} label={card.label}>
            {/* Image container: soft black overlay always on, stronger in dark mode */}
            <div className="relative w-full h-full">
              <Image
                src={card.image}
                alt={card.label}
                fill
                className="object-cover"
                sizes="1300px"
                priority={i === 0}
              />
              {/* Soft black overlay — always on, stronger in dark */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent dark:from-black/70 dark:via-black/30" />
            </div>
          </AppCard>
        </Card>
      ))}
    </CardSwap>
  );
}
