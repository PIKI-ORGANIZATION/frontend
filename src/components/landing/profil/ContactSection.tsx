"use client";

import { Mail, MapPin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";
import ContactWithGlobe, {
  type ContactFormValues,
  type ContactLinkItem,
} from "@/components/ui/contact-with-globe";

const PIKI_CONTACT_LINKS: ContactLinkItem[] = [
  {
    icon: FaWhatsapp,
    subLabel: "WhatsApp Resmi",
    label: "+62 812-3456-7890",
    href: "https://wa.me/6281234567890",
    external: true,
  },
  {
    icon: Mail,
    subLabel: "Email Resmi",
    label: "halo@piki.or.id",
    href: "mailto:halo@piki.or.id",
  },
  {
    icon: MapPin,
    subLabel: "Kantor Sekretariat DPP PIKI",
    label:
      "Graha Oikoumene, Lt. 3, Jl. Salemba Raya No. 10, Jakarta Pusat 10430, Indonesia",
  },
];

export function ContactSection() {
  const handleSubmitMessage = (values: ContactFormValues) => {
    toast.success(
      `Terima kasih ${values.fullName}, pesan Anda telah kami catat.`,
    );
  };

  return (
    <ContactWithGlobe
      badge="Kontak"
      title="Hubungi Kami"
      description="Punya pertanyaan atau ingin berkolaborasi dengan PIKI? Jangan ragu untuk mengirimkan pesan kepada sekretariat kami."
      infoTitle="Sekretariat & Saluran Resmi"
      infoDescription="Hubungi kami melalui kanal resmi di bawah ini atau kirimkan pesan langsung melalui formulir."
      contactItems={PIKI_CONTACT_LINKS}
      formTitle="Kirim Pesan"
      formDescription="Lengkapi formulir berikut dan tim kami akan segera merespons."
      nameLabel="Nama Lengkap"
      namePlaceholder="Masukkan nama lengkap"
      organizationLabel="Asal Wilayah / Instansi"
      organizationPlaceholder="Contoh: DPD PIKI Jakarta"
      emailLabel="Alamat Email"
      emailPlaceholder="nama@email.com"
      messageLabel="Pesan Anda"
      messagePlaceholder="Tuliskan pesan, pertanyaan, atau penawaran kerja sama di sini..."
      submitLabel="Kirim Pesan"
      globeProps={{
        initialRotation: [-106.8456, 6.2088],
      }}
      onSubmitMessage={handleSubmitMessage}
    />
  );
}
