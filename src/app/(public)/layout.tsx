import { Navbar } from "@/components/layout/Navbar";
import { MinimalFooter } from "@/components/ui/minimal-footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
      <MinimalFooter />
    </>
  );
}
