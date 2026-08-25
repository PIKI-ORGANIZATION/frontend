"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Step0ScanKTP } from "@/components/auth/register/Step0ScanKTP";
import { Step1Identitas } from "@/components/auth/register/Step1Identitas";
import { Step2Kualifikasi } from "@/components/auth/register/Step2Kualifikasi";
import { Step3Wilayah } from "@/components/auth/register/Step3Wilayah";
import { Step5Pembayaran } from "@/components/auth/register/Step5Pembayaran";
import { SuccessScreen } from "@/components/auth/register/SuccessScreen";
import {
  RegistrationStepper,
  StepProps,
} from "@/components/ui/registration-stepper";

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const onSuccess = () => setIsSuccess(true);

  if (isSuccess) {
    return <SuccessScreen />;
  }

  const steps: StepProps[] = [
    {
      step: 1,
      title: "Scan KTP",
      description: "Ambil data KTP otomatis",
      content: <Step0ScanKTP onNext={nextStep} />,
    },
    {
      step: 2,
      title: "Identitas Diri",
      description: "Lengkapi data diri",
      content: <Step1Identitas onNext={nextStep} onPrev={prevStep} />,
    },
    {
      step: 3,
      title: "Kualifikasi",
      description: "Pendidikan dan Pekerjaan",
      content: <Step2Kualifikasi onNext={nextStep} onPrev={prevStep} />,
    },
    {
      step: 4,
      title: "Pilih Wilayah",
      description: "Pilih DPC/DPP tempat mendaftar",
      content: <Step3Wilayah onNext={nextStep} onPrev={prevStep} />,
    },
    {
      step: 5,
      title: "Pembayaran",
      description: "Selesaikan Iuran Anggota",
      content: <Step5Pembayaran onSuccess={onSuccess} onPrev={prevStep} />,
    },
  ];

  return (
    <div className="flex w-full min-h-[calc(100vh-140px)] bg-background">
      {/* Right Content - Form Area */}
      <div className="flex-1 flex flex-col px-6 py-8 md:px-16 lg:px-32 lg:py-22 overflow-y-auto bg-muted/20">
        <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 mb-8 pb-4 border-b border-foreground/10">
            <Image src="/logo1.png" width={40} height={40} alt="Logo" />
            <div>
              <h1 className="font-bold text-lg leading-tight">
                Pendaftaran Anggota
              </h1>
              <p className="text-primary font-medium text-sm">PIKI</p>
            </div>
          </div>

          <div className="flex-1">
            <RegistrationStepper
              steps={steps}
              currentStep={currentStep}
              headerTitle="Formulir Pendaftaran"
              headerStatus="Step 1-5"
            />
            
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Sudah punya akun?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Masuk sekarang
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
