"use client";

import React from "react";
import { Lock, Loader2 } from "lucide-react";
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
import { useChangePassword } from "@/hooks/api/useProfile";

export const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "Password lama wajib diisi"),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export function PasswordForm() {
  const changePassword = useChangePassword();

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof passwordSchema>) => {
    changePassword.mutate(
      {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          toast.success("Password berhasil diubah");
          passwordForm.reset();
        },
        onError: (err) => {
          toast.error(err.message || "Gagal mengubah password");
        },
      }
    );
  };

  return (
    <Form {...passwordForm}>
      <form onSubmit={passwordForm.handleSubmit(onSubmit)} className="space-y-6">
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2 mb-4">
            <Lock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Keamanan Akun</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={passwordForm.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Lama</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Masukkan password lama"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Baru</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Masukkan password baru"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konfirmasi Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Ketik ulang password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            size="lg"
            variant="outline"
            disabled={changePassword.isPending}
            className="font-semibold border-primary text-primary hover:bg-primary/5"
          >
            {changePassword.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Ubah Password
          </Button>
        </div>
      </form>
    </Form>
  );
}
