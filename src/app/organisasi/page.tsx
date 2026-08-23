"use client";

import { VisionMissionSection } from "@/components/landing/profil/VisionMissionSection";
import { HistorySection } from "@/components/landing/profil/HistorySection";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { PageHeader } from "@/components/ui/page-header";

export default function OrganisasiPage() {
  return (
    <main className="w-full bg-background flex flex-col">
      {/* Header Section */}
      <section className="flex-1 w-full pt-32 pb-24 md:pt-40 md:pb-32 px-5 md:px-10 lg:px-30 mx-auto">
        <PageHeader 
          eyebrow="Profil Organisasi"
          title="Tentang PIKI"
          description="Persatuan Intelegensia Kristen Indonesia hadir sebagai wadah pergerakan dan pemikiran bagi kaum intelektual Kristen untuk melayani nusa dan bangsa berlandaskan nilai-keadilan dan kebenaran."
        />
      </section>

      {/* Visi Misi Section (Reusable) */}
      <VisionMissionSection />

      {/* Sejarah Section (Reusable) */}
      <HistorySection />

      {/* Contact Section */}
      <section className="w-full py-24 md:py-32 bg-card relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] rounded-t-[3rem] md:rounded-t-[5rem]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row gap-16 lg:gap-24">
            
            {/* Contact Info */}
            <div className="md:w-1/2 flex flex-col gap-10">
              <div className="flex flex-col gap-4">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Hubungi Kami
                </h2>
                <p className="text-lg text-muted-foreground font-light leading-relaxed">
                  Punya pertanyaan atau ingin berkolaborasi dengan PIKI? Jangan
                  ragu untuk mengirimkan pesan. Tim kami akan segera merespons
                  pertanyaan Anda.
                </p>
              </div>

              <div className="flex flex-col gap-8 mt-4">
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                    <FaWhatsapp className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-muted-foreground">WhatsApp Resmi</span>
                    <span className="text-lg font-medium group-hover:text-primary transition-colors">+62 812-3456-7890</span>
                  </div>
                </a>

                <a
                  href="mailto:halo@piki.or.id"
                  className="flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <Mail className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-muted-foreground">Email</span>
                    <span className="text-lg font-medium group-hover:text-primary transition-colors">halo@piki.or.id</span>
                  </div>
                </a>

                <div className="flex gap-4 group">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-foreground/5 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-foreground/70" />
                  </div>
                  <div className="flex flex-col pt-2">
                    <span className="text-sm font-semibold text-muted-foreground">Kantor Sekretariat DPP PIKI</span>
                    <span className="text-base font-medium leading-relaxed mt-1">
                      Graha Oikoumene, Lt. 3<br />
                      Jl. Salemba Raya No. 10, Jakarta Pusat<br />
                      10430, Indonesia
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:w-1/2 bg-background p-8 md:p-10 rounded-3xl border border-foreground/5 shadow-sm">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col gap-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      Nama Depan
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="Masukkan nama depan"
                      className="bg-muted/50 border-foreground/10 focus-visible:ring-primary h-12"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Nama Belakang
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Masukkan nama belakang"
                      className="bg-muted/50 border-foreground/10 focus-visible:ring-primary h-12"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Alamat Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    className="bg-muted/50 border-foreground/10 focus-visible:ring-primary h-12"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="message" className="text-sm font-medium">
                    Pesan Anda
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Tuliskan pesan, pertanyaan, atau penawaran kerja sama di sini..."
                    className="bg-muted/50 border-foreground/10 focus-visible:ring-primary min-h-[120px] resize-none"
                  />
                </div>

                <Button className="h-12 text-base font-medium mt-2 w-full sm:w-auto self-start">
                  Kirim Pesan
                </Button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
