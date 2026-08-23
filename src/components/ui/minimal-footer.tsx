import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaFacebook, FaYoutube, FaTwitter } from "react-icons/fa";

export function MinimalFooter() {
  const year = new Date().getFullYear();

  const company = [
    {
      title: "Tentang PIKI",
      href: "/organisasi",
    },
    {
      title: "Sejarah",
      href: "/sejarah",
    },
    {
      title: "Visi & Misi",
      href: "/visi-misi",
    },
    {
      title: "Struktur Pengurus",
      href: "/struktur",
    },
  ];

  const resources = [
    {
      title: "Berita & Artikel",
      href: "/berita",
    },
    {
      title: "Galeri Kegiatan",
      href: "/galeri",
    },
    {
      title: "Satu Data",
      href: "/satu-data",
    },
    {
      title: "Hubungi Kami",
      href: "/kontak",
    },
  ];

  const socialLinks = [
    {
      icon: <FaYoutube className="size-4" />,
      link: "https://www.youtube.com/@OfficialDPPPIKI",
    },
    {
      icon: <FaInstagram className="size-4" />,
      link: "https://www.instagram.com/official.dpppiki",
    },
    {
      icon: <FaFacebook className="size-4" />,
      link: "https://facebook.com",
    },
    {
      icon: <FaTwitter className="size-4" />,
      link: "https://twitter.com",
    },
  ];

  return (
    <footer className="relative bg-background">
      <div className="bg-background dark:bg-[radial-gradient(35%_80%_at_30%_0%,--theme(--color-foreground/.1),transparent)] mx-auto max-w-6xl md:border-x border-border/30">
        <div className="bg-border/50 absolute inset-x-0 h-px w-full" />
        <div className="grid max-w-6xl grid-cols-6 gap-6 p-8 md:p-12">
          <div className="col-span-6 flex flex-col gap-6 md:col-span-4">
            <Link
              href="/"
              className="w-max opacity-80 hover:opacity-100 transition-opacity"
            >
              <Image
                src="/logo1.png"
                width={40}
                height={40}
                alt="Logo PIKI"
                style={{ width: "auto", height: "auto" }}
              />
            </Link>
            <p className="text-muted-foreground max-w-sm text-sm text-balance leading-relaxed">
              Wadah perhimpunan dan pergerakan kaum intelektual Kristen
              Indonesia untuk melayani gereja, masyarakat, bangsa, dan negara.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((item, i) => (
                <a
                  key={i}
                  className="hover:bg-accent hover:text-foreground text-muted-foreground rounded-md border border-border/50 p-2 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={item.link}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="col-span-3 w-full md:col-span-1">
            <span className="text-foreground font-medium mb-3 block text-sm">
              Navigasi
            </span>
            <div className="flex flex-col gap-2">
              {resources.map(({ href, title }, i) => (
                <Link
                  key={i}
                  className="w-max text-sm text-muted-foreground duration-200 hover:text-primary hover:underline"
                  href={href}
                >
                  {title}
                </Link>
              ))}
            </div>
          </div>
          <div className="col-span-3 w-full md:col-span-1">
            <span className="text-foreground font-medium mb-3 block text-sm">
              Organisasi
            </span>
            <div className="flex flex-col gap-2">
              {company.map(({ href, title }, i) => (
                <a
                  key={i}
                  className="w-max text-sm text-muted-foreground duration-200 hover:text-primary hover:underline"
                  href={href}
                >
                  {title}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-border/50 absolute inset-x-0 h-px w-full" />
        <div className="flex max-w-6xl flex-col justify-between gap-2 pt-6 pb-8 px-8 md:px-12">
          <p className="text-muted-foreground text-center text-xs">
            © {year} DPP Persatuan Intelegensia Kristen Indonesia. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
