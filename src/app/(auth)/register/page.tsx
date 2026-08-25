"use client";

import { useState } from "react";
import Image from "next/image";
import { Step0ScanKTP } from "@/components/auth/register/Step0ScanKTP";
import { Step1Identitas } from "@/components/auth/register/Step1Identitas";
import { Step2Kualifikasi } from "@/components/auth/register/Step2Kualifikasi";
import { Step3Wilayah } from "@/components/auth/register/Step3Wilayah";
import { Step4Akun } from "@/components/auth/register/Step4Akun";
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
      title: "Keamanan Akun",
      description: "Buat password",
      content: <Step4Akun onSuccess={onSuccess} onPrev={prevStep} />,
    },
  ];

  return (
    <div className="flex w-full min-h-screen bg-background">
      {/* Left Sidebar - Brand (Hidden on Mobile) */}
      {/* <div className="hidden lg:flex w-[400px] xl:w-[450px] flex-col justify-between p-12 bg-primary/5 border-r border-foreground/5 relative overflow-hidden">}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 flex flex-col gap-16">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <Image src="/logo1.png" width={48} height={48} alt="Logo" />
            </div>
            <div>
              <h1 className="font-bold text-xl leading-tight">Pendaftaran</h1>
              <p className="text-primary font-medium">Anggota Baru PIKI</p>
            </div>
          </div>
          
          <div className="text-muted-foreground leading-relaxed">
            <p className="mb-4">
              Selamat datang di portal pendaftaran anggota Persatuan Intelegensia Kristen Indonesia (PIKI).
            </p>
            <p>
              Silakan lengkapi formulir pendaftaran di samping untuk bergabung bersama kami. Pastikan data yang Anda masukkan valid dan sesuai.
            </p>
          </div>
        </div>
        
        <div className="relative z-10 text-sm text-muted-foreground font-medium">
          © {new Date().getFullYear()} Persatuan Intelegensia Kristen Indonesia
        </div>
      </div> */}

      {/* Right Content - Form Area */}
      <div className="flex-1 flex flex-col px-6 py-8 md:px-16 lg:px-32 lg:py-16 overflow-y-auto bg-muted/20">
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
          </div>
        </div>
      </div>
    </div>
  );
}
