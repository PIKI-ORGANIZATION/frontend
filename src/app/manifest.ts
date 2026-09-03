import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PIKI - Persatuan Intelegensia Kristen Indonesia",
    short_name: "PIKI",
    description: "Sistem Keanggotaan Terpadu PIKI",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#050505",
    icons: [
      {
        src: "/logo1.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo1.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
