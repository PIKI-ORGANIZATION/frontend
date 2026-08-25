import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useRegistrasiStore } from "@/store/useRegistrasiStore";
import { ArrowLeft, ArrowRight, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const step2Schema = z.object({
  tingkatPendidikan: z.string().min(1, "Pilih tingkat pendidikan"),
  pekerjaan: z.string().min(3, "Pekerjaan wajib diisi"),
  minatBidang: z.string().min(1, "Pilih minat bidang/pelayanan"),
  motivasiBergabung: z
    .string()
    .min(10, "Ceritakan sedikit motivasi Anda (minimal 10 karakter)"),
});

type Step2Values = z.infer<typeof step2Schema>;

const pendidikanOptions = [
  { label: "SMA / SMK Sederajat", value: "SMA/SMK" },
  { label: "Diploma (D1/D2/D3)", value: "D1/D2/D3" },
  { label: "Sarjana (S1 / D4)", value: "S1/D4" },
  { label: "Magister (S2)", value: "S2" },
  { label: "Doktoral (S3)", value: "S3" },
];

const minatOptions = [
  { label: "Kerohanian & Teologi", value: "Kerohanian & Teologi" },
  { label: "Pendidikan & SDM", value: "Pendidikan & SDM" },
  { label: "Hukum & Advokasi HAM", value: "Hukum & HAM" },
  { label: "Ekonomi & Kewirausahaan", value: "Ekonomi & Kewirausahaan" },
  { label: "Sosial & Lingkungan Hidup", value: "Sosial & Lingkungan" },
  { label: "Media & Komunikasi Publik", value: "Media & Komunikasi" },
  { label: "Lainnya", value: "Lainnya" },
];

export function Step2Kualifikasi({
  onNext,
  onPrev,
}: {
  onNext: () => void;
  onPrev: () => void;
}) {
  const { data, updateData } = useRegistrasiStore();

  const [openPendidikan, setOpenPendidikan] = React.useState(false);
  const [openBidang, setOpenBidang] = React.useState(false);

  const form = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      tingkatPendidikan: data.tingkatPendidikan || "",
      pekerjaan: data.pekerjaan || "",
      minatBidang: data.minatBidang || "",
      motivasiBergabung: data.motivasiBergabung || "",
    },
  });

  function onSubmit(values: Step2Values) {
    updateData(values);
    onNext();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="tingkatPendidikan"
            render={({ field }) => (
              <FormItem className="flex flex-col md:col-span-2">
                <FormLabel>Tingkat Pendidikan</FormLabel>
                <Popover open={openPendidikan} onOpenChange={setOpenPendidikan}>
                  <PopoverTrigger
                    render={
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openPendidikan}
                          className={cn(
                            "w-full justify-between h-12 font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? pendidikanOptions.find(
                                (opt) => opt.value === field.value,
                              )?.label
                            : "Pilih tingkat pendidikan..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    }
                  />
                  <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Cari pendidikan..." />
                      <CommandList>
                        <CommandEmpty>
                          Tingkat pendidikan tidak ditemukan.
                        </CommandEmpty>
                        <CommandGroup>
                          {pendidikanOptions.map((opt) => (
                            <CommandItem
                              key={opt.value}
                              value={opt.label} // use label for search
                              onSelect={() => {
                                form.setValue("tingkatPendidikan", opt.value, {
                                  shouldValidate: true,
                                });
                                setOpenPendidikan(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === opt.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {opt.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pekerjaan"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Pekerjaan Saat Ini</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: Wiraswasta, PNS, Pegawai Swasta..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minatBidang"
            render={({ field }) => (
              <FormItem className="flex flex-col md:col-span-2">
                <FormLabel>Minat Bidang Pelayanan</FormLabel>
                <Popover open={openBidang} onOpenChange={setOpenBidang}>
                  <PopoverTrigger
                    render={
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openBidang}
                          className={cn(
                            "w-full justify-between h-12 font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? minatOptions.find(
                                (opt) => opt.value === field.value,
                              )?.label
                            : "Pilih bidang yang diminati..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    }
                  />
                  <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Cari bidang..." />
                      <CommandList>
                        <CommandEmpty>Bidang tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {minatOptions.map((opt) => (
                            <CommandItem
                              key={opt.value}
                              value={opt.label} // use label for search
                              onSelect={() => {
                                form.setValue("minatBidang", opt.value, {
                                  shouldValidate: true,
                                });
                                setOpenBidang(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === opt.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {opt.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="motivasiBergabung"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Motivasi Bergabung</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ceritakan alasan dan motivasi Anda bergabung dengan PIKI..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="ghost" onClick={onPrev} size="lg">
            <ArrowLeft className="mr-2 w-4 h-4" /> Kembali
          </Button>
          <Button type="submit" size="lg">
            Lanjut <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
