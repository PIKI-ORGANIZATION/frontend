import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { useDpp, useDpc } from "@/hooks/api/useWilayah";
import { cn } from "@/lib/utils";

const step3Schema = z.object({
  dpp: z.string().min(1, "Pilih Provinsi (DPP) terlebih dahulu"),
  dpcId: z.string().min(1, "Pilih Kabupaten/Kota (DPC) tempat mendaftar"),
});

type Step3Values = z.infer<typeof step3Schema>;

interface DppData {
  dpp: string;
  kode_provinsi: string | null;
}

interface DpcData {
  id: string | number;
  dpp: string;
  dpc: string;
  kode_provinsi?: string;
  kode_kabupaten?: string;
}

export function Step3Wilayah({
  onNext,
  onPrev,
}: {
  onNext: () => void;
  onPrev: () => void;
}) {
  const { data, updateData } = useRegistrasiStore();

  const form = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      dpp: data.dpp || "",
      dpcId: "",
    },
  });

  const selectedDpp = form.watch("dpp");

  // Queries
  const { data: dppList, isLoading: isLoadingDpp } = useDpp();
  const { data: dpcList, isLoading: isLoadingDpc } = useDpc(selectedDpp);

  const [openDpp, setOpenDpp] = React.useState(false);
  const [openDpc, setOpenDpc] = React.useState(false);

  function onSubmit(values: Step3Values) {
    const selectedDppData = dppList?.data?.find(
      (d: DppData) => d.dpp === values.dpp,
    );
    const selectedDpcData = dpcList?.data?.find(
      (d: DpcData) => d.id.toString() === values.dpcId,
    );

    updateData({
      dpp: values.dpp,
      kode_provinsi: selectedDppData?.kode_provinsi || "",
      dpc: selectedDpcData?.dpc || "",
      kode_kabupaten: selectedDpcData?.kode_kabupaten || "",
    });

    onNext();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Pilih Cabang (DPP & DPC)</h2>
          <p className="text-muted-foreground">
            Silakan pilih di provinsi dan kabupaten mana Anda akan mendaftar
            sebagai anggota.
          </p>
        </div>

        <div className="space-y-5">
          <FormField
            control={form.control}
            name="dpp"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Provinsi (DPP)</FormLabel>
                <Popover open={openDpp} onOpenChange={setOpenDpp}>
                  <PopoverTrigger
                    render={
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openDpp}
                          className={cn(
                            "w-full justify-between h-12 font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                          disabled={isLoadingDpp}
                        >
                          {isLoadingDpp ? (
                            <span className="flex items-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                              Memuat...
                            </span>
                          ) : field.value ? (
                            dppList?.data?.find(
                              (d: DppData) => d.dpp === field.value,
                            )?.dpp
                          ) : (
                            "Pilih Provinsi..."
                          )}
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
                      <CommandInput placeholder="Cari provinsi..." />
                      <CommandList>
                        <CommandEmpty>Provinsi tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {dppList?.data?.map((dpp: DppData) => (
                            <CommandItem
                              key={dpp.dpp}
                              value={dpp.dpp}
                              onSelect={() => {
                                form.setValue("dpp", dpp.dpp, {
                                  shouldValidate: true,
                                });
                                form.setValue("dpcId", ""); // Reset DPC if DPP changes
                                setOpenDpp(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === dpp.dpp
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {dpp.dpp}
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
            name="dpcId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Kabupaten / Kota (DPC)</FormLabel>
                <Popover open={openDpc} onOpenChange={setOpenDpc}>
                  <PopoverTrigger
                    render={
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openDpc}
                          className={cn(
                            "w-full justify-between h-12 font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                          disabled={!selectedDpp || isLoadingDpc}
                        >
                          {isLoadingDpc ? (
                            <span className="flex items-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                              Memuat...
                            </span>
                          ) : field.value ? (
                            dpcList?.data?.find(
                              (d: DpcData) => d.id.toString() === field.value,
                            )?.dpc
                          ) : (
                            "Pilih Kabupaten/Kota..."
                          )}
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
                      <CommandInput placeholder="Cari kabupaten/kota..." />
                      <CommandList>
                        <CommandEmpty>
                          Kabupaten/kota tidak ditemukan.
                        </CommandEmpty>
                        <CommandGroup>
                          {dpcList?.data?.map((dpc: DpcData) => (
                            <CommandItem
                              key={dpc.id}
                              value={dpc.dpc} // Use name for fuzzy searching
                              onSelect={() => {
                                // Find ID by name (cmd value is lowercase string so we must search by lowercase)
                                const selected = dpcList?.data?.find(
                                  (d: DpcData) =>
                                    d.dpc.toLowerCase() ===
                                    dpc.dpc.toLowerCase(),
                                );
                                if (selected) {
                                  form.setValue(
                                    "dpcId",
                                    selected.id.toString(),
                                    { shouldValidate: true },
                                  );
                                }
                                setOpenDpc(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === dpc.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {dpc.dpc}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Anda akan terdaftar secara resmi di DPC ini.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="ghost" size="lg" onClick={onPrev}>
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
