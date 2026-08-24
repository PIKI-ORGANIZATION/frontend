import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function SuccessScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-card border border-foreground/5 p-8 rounded-3xl shadow-lg text-center flex flex-col items-center"
      >
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 text-green-500">
          <CheckCircle2 size={40} />
        </div>

        <h2 className="text-3xl font-bold mb-4">Pendaftaran Berhasil!</h2>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          Terima kasih telah mendaftar. Data Anda telah kami terima dan saat ini
          sedang dalam proses verifikasi (SLA 3 Hari Kerja).
        </p>

        <div className="w-full flex flex-col gap-3">
          <Button
            render={<Link href="/dashboard" />}
            size="lg"
            className="w-full"
          >
            Cek Status Pendaftaran <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button
            render={<Link href="/" />}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
