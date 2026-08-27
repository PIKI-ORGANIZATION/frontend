import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRegistrasiStore } from "@/store/useRegistrasiStore";
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

const step1Schema = z
  .object({
    nik: z
      .string()
      .min(16, "NIK minimal 16 digit")
      .max(16, "NIK maksimal 16 digit")
      .regex(/^[0-9]+$/, "NIK harus berupa angka"),
    namaLengkap: z.string().min(3, "Nama lengkap minimal 3 karakter"),
    tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
    noWa: z
      .string()
      .min(8, "Nomor WhatsApp minimal 8 digit")
      .max(20, "Nomor WhatsApp maksimal 20 digit")
      .regex(/^[0-9+]+$/, "Nomor WhatsApp harus berupa angka"),
    email: z.string().email("Format email tidak valid"),
    confirmEmail: z.string().email("Format email tidak valid"),
    alamatDomisili: z.string().min(3, "Alamat domisili wajib diisi"),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: "Email tidak cocok",
    path: ["confirmEmail"],
  });

type Step1Values = z.infer<typeof step1Schema>;

export function Step1Identitas({
  onNext,
}: {
  onNext: () => void;
}) {
  const { data, updateData } = useRegistrasiStore();



  const form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      nik: data.nik || "",
      namaLengkap: data.namaLengkap || "",
      tanggalLahir: data.tanggalLahir || "",
      noWa: data.noWa || "",
      email: data.email || "",
      confirmEmail: data.confirmEmail || "",
      alamatDomisili: data.alamatDomisili || "",
    },
  });

  function onSubmit(values: Step1Values) {
    updateData(values);
    onNext();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">


        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="nik"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Nomor Induk Kependudukan (NIK)</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan 16 digit NIK" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="namaLengkap"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Nama Lengkap</FormLabel>
                <FormControl>
                  <Input placeholder="Nama lengkap sesuai KTP" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tanggalLahir"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Tanggal Lahir</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="nama@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konfirmasi Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="nama@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="noWa"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Nomor WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="0812xxxxxx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="alamatDomisili"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Alamat Domisili</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Alamat lengkap tempat tinggal saat ini"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg">
            Lanjut <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
