"use client";

import { useState } from "react";
import { FlutedGlass } from "@paper-design/shaders-react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const loginSchema = z.object({
  identifier: z.string().min(1, "Email / Username tidak boleh kosong"),
  password: z.string().min(1, "Password tidak boleh kosong"),
  remember: z.boolean().default(false).optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (values: LoginValues) => {
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: values.identifier,
          password: values.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Login gagal. Periksa kembali kredensial Anda.",
        );
      }

      if (data.accessToken) {
        // Jika remember dicentang, cookie bisa disimpan lebih lama (misal 7 hari), kalau tidak 1 hari
        const expiresIn = values.remember ? 7 : 1;
        Cookies.set("token", data.accessToken, { expires: expiresIn });
        toast.success("Login berhasil!");
        router.push("/dashboard");
      } else {
        throw new Error("Token tidak ditemukan di response");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Terjadi kesalahan sistem",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-white p-3 text-black antialiased [font-synthesis:none] dark:bg-[#050505] dark:text-white">
      <div className="grid min-h-[calc(100vh-1.5rem)] gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        {/* Left Side - Login Form */}
        <div className="flex min-h-[760px] items-center justify-center rounded-md border border-black/10 bg-white px-6 py-12 dark:border-white/5 dark:bg-[#0a0a0c] lg:min-h-0 lg:px-14 lg:py-20 xl:px-20">
          <div className="mx-auto w-full max-w-[460px]">
            <div>
              <h1 className="text-3xl font-medium tracking-tight sm:text-4xl text-black dark:text-white">
                Selamat Datang
              </h1>
              <p className="mt-2 text-sm text-black/60 dark:text-white/60">
                Silakan masuk ke akun PIKI Anda.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-10 space-y-4"
              >
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Email / Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan email atau username"
                          className="bg-transparent dark:border-white/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Masukkan password Anda"
                            className="bg-transparent pr-10 dark:border-white/20"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between pt-2">
                  <FormField
                    control={form.control}
                    name="remember"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-black/50 dark:border-white/50"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-xs font-normal text-black/60 dark:text-white/60 cursor-pointer">
                            Ingat saya
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <Link
                    href="/forgot-password"
                    className={cn(
                      buttonVariants({ variant: "link", size: "sm" }),
                      "px-0",
                    )}
                  >
                    Lupa password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className={"w-full py-5 text-sm font-medium"}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Masuk
                </Button>
              </form>
            </Form>

            <p className="mt-8 text-center text-sm text-accent-foreground">
              Belum memiliki akun?{" "}
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ variant: "link", size: "sm" }),
                  "px-0",
                )}
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Marketing Testimonial and Mockup */}
        <div className="relative flex min-h-[720px] flex-col overflow-hidden rounded-md bg-linear-to-b from-black to-white p-8 text-white dark:to-[#050505] sm:p-12 lg:min-h-0 lg:p-16">
          {/* Background Shader */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <FlutedGlass
              size={0.89}
              shape="lines"
              angle={0}
              distortionShape="prism"
              distortion={0.5}
              shift={0}
              blur={0}
              edges={0.25}
              stretch={0}
              scale={1.11}
              fit="cover"
              highlights={0.1}
              shadows={0.2}
              grainMixer={0.1}
              grainOverlay={0.1}
              colorBack="#00000000"
              colorHighlight="#FFFFFF"
              colorShadow="#000000"
              className="w-full h-full bg-transparent"
            />
          </div>

          <div className="relative z-10 h-full w-full">
            <div className="max-w-[460px] lg:pt-12">
              <motion.div
                initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-4"
              >
                <img
                  src="/logo1.png"
                  alt="Member"
                  className="size-12 shrink-0 object-contain"
                />
                <div>
                  <div className="font-semibold leading-tight text-white">
                    Persatuan Inteligensia Kristen Indonesia
                  </div>
                  <div className="mt-0.5 text-xs text-white/60">
                    Sistem Keanggotaan Terpadu
                  </div>
                </div>
              </motion.div>
              <motion.blockquote
                initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{
                  duration: 0.8,
                  delay: 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mt-7 text-2xl font-light leading-tight tracking-[-0.035em] text-white/90 sm:text-3xl lg:text-[34px]"
              >
                &quot;Ad Caritas Et Veritas.&quot;
                <br />
                <span className="text-lg sm:text-xl mt-2 block opacity-80">
                  Demi kasih dan kebenaran
                </span>
              </motion.blockquote>
            </div>

            <div className="mt-10 w-full h-150 translate-y-[15%] overflow-hidden rounded-2xl border border-white/15 bg-black/70 p-2 shadow-[0_30px_90px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:translate-y-[10%] lg:absolute lg:left-[10%] lg:-bottom-24 lg:mt-0 lg:w-[80%] lg:max-w-none lg:origin-bottom-left lg:translate-y-0 lg:-rotate-3 xl:left-[13%] xl:-bottom-[800px] xl:w-[95%] 2xl:-bottom-[100px] 2xl:w-[95%]">
              <motion.div
                initial={{ opacity: 0, y: 72, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{
                  duration: 1,
                  delay: 0.22,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="overflow-hidden h-full flex flex-col rounded-xl border border-white/10 bg-black relative"
              >
                <div className="flex items-center shrink-0 gap-1.5 border-b border-white/10 bg-black/40 px-4 py-3 select-none z-20 relative">
                  <div className="size-2 rounded-full bg-white/35" />
                  <div className="size-2 rounded-full bg-white/25" />
                  <div className="size-2 rounded-full bg-white/15" />
                  <span className="ml-4 text-[9px] font-mono tracking-wider text-white/40">
                    piki.or.id/dashboard
                  </span>
                </div>
                <div className="w-full flex-1 bg-linear-to-br from-black to-slate-900 relative">
                  <Image
                    src="/footage/image2.jpeg"
                    alt="PIKI Dashboard Preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                    fill
                    priority
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
