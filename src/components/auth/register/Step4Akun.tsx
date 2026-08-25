import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  useRegistrasiStore,
  type RegistrasiData,
} from "@/store/useRegistrasiStore";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useSubmitRegistrasi } from "@/hooks/api/useRegistrasi";
import { toast } from "sonner";

const step4Schema = z.object({
  password: z.string().min(6, "Password minimal 6 karakter"),
  setujuKebenaranData: z
    .boolean()
    .refine(
      (val) => val === true,
      "Anda harus menyetujui pernyataan kebenaran data",
    ),
  setujuPengelolaanData: z
    .boolean()
    .refine(
      (val) => val === true,
      "Anda harus menyetujui pengelolaan data pribadi",
    ),
  setujuKerahasiaanData: z
    .boolean()
    .refine(
      (val) => val === true,
      "Anda harus menyetujui jaminan kerahasiaan data",
    ),
});

type Step4Values = z.infer<typeof step4Schema>;

interface Props {
  onPrev: () => void;
  onNext: () => void;
}

export function Step4Akun({ onPrev, onNext }: Props) {
  const { data, updateData } = useRegistrasiStore();

  const form = useForm<Step4Values>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      password: data.password || "",
      setujuKebenaranData: data.setujuKebenaranData || false,
      setujuPengelolaanData: data.setujuPengelolaanData || false,
      setujuKerahasiaanData: data.setujuKerahasiaanData || false,
    },
  });

  function onSubmit(values: Step4Values) {
    updateData({
      password: values.password,
      setujuKebenaranData: values.setujuKebenaranData,
      setujuPengelolaanData: values.setujuPengelolaanData,
      setujuKerahasiaanData: values.setujuKerahasiaanData,
    });

    onNext();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-5">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password Akun</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Minimal 6 karakter"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="setujuKebenaranData"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Kebenaran Data</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Saya menyatakan bahwa seluruh data yang diberikan adalah
                    benar dan dapat dipertanggungjawabkan.
                  </p>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="setujuPengelolaanData"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Pengelolaan Data (UU PDP)</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Saya menyetujui data pribadi saya dikelola oleh organisasi
                    sesuai dengan Undang-Undang Pelindungan Data Pribadi (UU
                    PDP).
                  </p>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="setujuKerahasiaanData"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Kerahasiaan Data</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Saya menyetujui jaminan kerahasiaan data yang ditetapkan
                    oleh organisasi.
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={onPrev}
          >
            <ArrowLeft className="mr-2 w-4 h-4" /> Kembali
          </Button>
          <Button type="submit" size="lg" className="px-8">
            Lanjut ke Pembayaran
          </Button>
        </div>
      </form>
    </Form>
  );
}
