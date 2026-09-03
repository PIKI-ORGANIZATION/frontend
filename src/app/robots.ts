import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://dpp-piki.org";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/portal", "/dashboard", "/api/*"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
