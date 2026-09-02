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
import { ArrowRight, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DropdownNavProps, DropdownProps } from "react-day-picker";

const step1Schema = z
  .object({
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

export function Step1Identitas({ onNext }: { onNext: () => void }) {
  const { data, updateData } = useRegistrasiStore();

  const form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      namaLengkap: data.namaLengkap || "",
      tanggalLahir: data.tanggalLahir || "",
      noWa: data.noWa || "",
      email: data.email || "",
      confirmEmail: data.confirmEmail || "",
      alamatDomisili: data.alamatDomisili || "",
    },
  });

  function onSubmit(values: Step1Values) {
    updateData({ ...values });
    onNext();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              <FormItem className="flex flex-col md:col-span-2">
                <FormLabel>Tanggal Lahir</FormLabel>
                <Popover modal={false}>
                  <FormControl>
                    <PopoverTrigger
                      render={
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 py-5.5 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        />
                      }
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </PopoverTrigger>
                  </FormControl>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      captionLayout="dropdown-years"
                      defaultMonth={
                        field.value ? new Date(field.value) : new Date(2000, 0)
                      }
                      startMonth={new Date(1940, 0)}
                      endMonth={new Date()}
                      components={{
                        DropdownNav: (props: DropdownNavProps) => {
                          return (
                            <div className="flex w-full items-center justify-center gap-3 [&>span]:text-sm [&>span]:font-medium">
                              {props.children}
                            </div>
                          );
                        },
                        YearsDropdown: (props: DropdownProps) => {
                          return (
                            <Select
                              modal={false}
                              value={String(props.value)}
                              onValueChange={(value) => {
                                if (props.onChange) {
                                  const _event = {
                                    target: {
                                      value: String(value),
                                    },
                                  } as React.ChangeEvent<HTMLSelectElement>;
                                  props.onChange(_event);
                                }
                              }}
                            >
                              <SelectTrigger className="h-8 w-fit font-medium">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent
                                alignItemWithTrigger={false}
                                align="start"
                                className="max-h-[250px] overflow-y-auto overscroll-contain"
                                onWheel={(e) => e.stopPropagation()}
                              >
                                {props.options?.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={String(option.value)}
                                    disabled={option.disabled}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          );
                        },
                      }}
                    />
                  </PopoverContent>
                </Popover>
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
