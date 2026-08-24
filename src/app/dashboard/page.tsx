export default function DashboardPage() {
  return (
    <div className="grid gap-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Selamat datang di Sistem Informasi PIKI</p>
      
      {/* Nanti diisi konten Fase 6 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-6 border rounded-xl shadow-sm bg-card text-card-foreground">
          <h3 className="font-semibold">Total Anggota</h3>
          <p className="text-3xl font-bold mt-2">1,245</p>
        </div>
      </div>
    </div>
  );
}
