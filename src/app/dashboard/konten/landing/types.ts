export type { HistoryEvent } from "@/features/sejarah/types";

export interface HeroContent {
  eyebrow: string;
  title: string;
  highlight: string;
  subtitle: string;
  primaryCtaText: string;
  primaryCtaUrl: string;
  secondaryCtaText: string;
  secondaryCtaUrl: string;
  updatedAt: string;
}

export interface AboutVisionContent {
  aboutTagline: string;
  aboutTitle: string;
  aboutHighlight: string;
  aboutDescription: string;
  visionTitle: string;
  visionText: string;
  missionPoints: string[];
  updatedAt: string;
}
