import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["ckeditor5", "@ckeditor/ckeditor5-react"],
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
