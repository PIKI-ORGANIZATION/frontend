"use client";

import React from "react";
import { User, Building, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ProfileResponse, useUpdateProfile } from "@/hooks/api/useProfile";

export const profileSchema = z.object({
  namaPanggil: z.string().optional(),
  noWa: z.string().min(10, "Nomor WhatsApp minimal 10 digit"),
  tempatLahir: z.string().min(3, "Tempat lahir wajib diisi"),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  alamat: z.string().optional(),
  provinsi: z.string().optional(),
  kotaDomisili: z.string().optional(),
  bio: z.string().optional(),
  pesanKesan: z.string().optional(),
  angkatan: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
});

interface ProfileFormProps {
  profile: ProfileResponse;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const updateProfile = useUpdateProfile();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      namaPanggil: profile.namaPanggil || "",
      noWa: profile.noWa || "",
      tempatLahir: profile.tempatLahir || "",
      tanggalLahir: profile.tanggalLahir
        ? new Date(profile.tanggalLahir).toISOString().split("T")[0]
        : "",
      alamat: profile.alamat || "",
      provinsi: profile.provinsi || "",
      kotaDomisili: profile.kotaDomisili || "",
      bio: profile.bio || "",
      pesanKesan: profile.pesanKesan || "",
      angkatan: profile.angkatan || "",
      instagram: profile.instagram || "",
      facebook: profile.facebook || "",
    },
  });

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    updateProfile.mutate(values, {
      onSuccess: () => {
        toast.success("Profil berhasil diperbarui");
      },
      onError: (err) => {
        toast.error(err.message || "Gagal memperbarui profil");
      },
    });
  };

  return (
    <Form {...profileForm}>
      <form onSubmit={profileForm.handleSubmit(onSubmit)} className="space-y-6">
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Informasi Pribadi</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <FormLabel>Nama Lengkap</FormLabel>
              <Input
                defaultValue={profile.namaLengkap || "-"}
                readOnly
                className="bg-muted/50 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <FormLabel>Alamat Email</FormLabel>
              <Input
                defaultValue={profile.email || "-"}
                readOnly
                className="bg-muted/50 cursor-not-allowed"
              />
            </div>

            <FormField
              control={profileForm.control}
              name="namaPanggil"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Panggilan</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama Panggilan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="noWa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor WhatsApp</FormLabel>
                  <FormControl>
                    <Input placeholder="08123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="angkatan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Angkatan</FormLabel>
                  <FormControl>
                    <Input placeholder="Tahun Angkatan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="tempatLahir"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempat Lahir</FormLabel>
                  <FormControl>
                    <Input placeholder="Jakarta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="tanggalLahir"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Lahir</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="provinsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provinsi</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: DKI Jakarta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="kotaDomisili"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kabupaten / Kota</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Jakarta Pusat" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="alamat"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Alamat Lengkap</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Detail alamat tempat tinggal saat ini"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="bio"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Bio / Profil Singkat</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ceritakan sedikit tentang Anda..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="pesanKesan"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Pesan & Kesan</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Pesan dan kesan Anda selama menjadi anggota..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username Instagram</FormLabel>
                  <FormControl>
                    <Input placeholder="@username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="facebook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Akun / Link Facebook</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama akun Facebook" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* Info Keanggotaan (Read-only) */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2 mb-4">
            <Building className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Informasi Keanggotaan</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <FormLabel>Asal DPC / Cabang</FormLabel>
              <Input
                defaultValue={profile.cabang?.namaCabang || "Belum ada DPC"}
                readOnly
                className="bg-muted/50 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <FormLabel>Status Keanggotaan</FormLabel>
              <Input
                defaultValue={
                  profile.statusAkun === "ACTIVE" ? "AKTIF" : "PENDING"
                }
                readOnly
                className={`font-semibold border-none cursor-not-allowed ${
                  profile.statusAkun === "ACTIVE"
                    ? "bg-green-500/10 text-green-700 dark:text-green-400"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                }`}
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            size="lg"
            disabled={updateProfile.isPending}
            className="font-semibold"
          >
            {updateProfile.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Simpan Profil
          </Button>
        </div>
      </form>
    </Form>
  );
}
