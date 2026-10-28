export interface HistoryEvent {
  id: string;
  year: string;
  title: string;
  desc: string;
  fullNarrative?: string;
  image: string;
  location?: string;
  keyFigure?: string;
  order: number;
  status: "PUBLISHED" | "DRAFT";
  createdAt: string;
  updatedAt: string;
}

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
