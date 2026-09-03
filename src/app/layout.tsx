import type { Metadata } from "next";
import { Geist, Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ReactQueryProvider } from "@/components/providers/react-query-provider";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dpp-piki.org/"),
  title: {
    default: "PIKI - Persatuan Intelegensia Kristen Indonesia",
    template: "%s | PIKI",
  },
  description:
    "Website Resmi dan Sistem Informasi Persatuan Intelegensia Kristen Indonesia (PIKI). Pendaftaran anggota dan informasi organisasi.",
  applicationName: "PIKI",
  authors: [{ name: "DPP PIKI", url: "https://dpp-piki.org/" }],
  creator: "PIKI",
  publisher: "PIKI",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://dpp-piki.org/",
    title: "PIKI - Persatuan Intelegensia Kristen Indonesia",
    description: "Website Resmi dan Sistem Informasi Persatuan Intelegensia Kristen Indonesia (PIKI). Pendaftaran anggota dan informasi organisasi.",
    siteName: "PIKI",
    images: [
      {
        url: "/logo1.png",
        width: 800,
        height: 800,
        alt: "Logo PIKI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PIKI - Persatuan Intelegensia Kristen Indonesia",
    description: "Website Resmi dan Sistem Informasi Persatuan Intelegensia Kristen Indonesia (PIKI). Pendaftaran anggota dan informasi organisasi.",
    images: ["/logo1.png"],
    creator: "@dpp_piki",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo1.png",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/logo1.png",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col font-sans" suppressHydrationWarning>
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <LenisProvider>
              {children}
              <Toaster position="top-center" />
            </LenisProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
