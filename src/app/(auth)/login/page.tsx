import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Masukkan email Anda untuk masuk ke akun
            </p>
          </div>
          {/* form placeholder */}
          <div className="grid gap-4">
             <p className="text-center text-sm text-muted-foreground">Form Login Akan Datang (Fase 5)</p>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <div className="h-full w-full bg-primary/20 flex items-center justify-center">
          <Image src="/logo1.png" width={200} height={200} alt="Logo PIKI" />
        </div>
      </div>
    </div>
  );
}
