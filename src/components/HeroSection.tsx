"use client";

import { ReactNode } from "react";
import CardSwap, { Card } from "@/components/CardSwap";

export interface HeroCardItem {
  id: string | number;
  icon: ReactNode;
  label: string;
  content: ReactNode;
}

export interface HeroSectionProps {
  title: ReactNode;
  subtitle: ReactNode;
  cards: HeroCardItem[];
}

export function HeroSection({ title, subtitle, cards }: HeroSectionProps) {
  return (
    <div className="w-full max-w-5xl mx-auto p-8 md:p-12 rounded-[2rem] border border-white/10 bg-[#09090b] flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
      
      {/* Left Text */}
      <div className="flex-1 z-10">
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-white leading-tight mb-4">
          {title}
        </h2>
        <div className="text-gray-400 text-lg">
          {subtitle}
        </div>
      </div>

      {/* Right CardSwap */}
      <div className="flex-1 relative h-[350px] md:h-[450px] w-full flex items-center justify-center lg:justify-end z-10">
        <CardSwap
          width={380}
          height={260}
          cardDistance={35}
          verticalDistance={25}
          delay={3000}
          pauseOnHover={true}
        >
          {cards.map((card) => (
            <Card key={card.id} customClass="overflow-hidden p-0 border-white/20 rounded-2xl bg-black flex flex-col shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-[#111] text-sm text-gray-300 font-medium">
                {card.icon}
                <span>{card.label}</span>
              </div>
              <div className="relative flex-1 w-full h-full overflow-hidden">
                {card.content}
              </div>
            </Card>
          ))}
        </CardSwap>
      </div>

      {/* Subtle Background Glow inside the container */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}
