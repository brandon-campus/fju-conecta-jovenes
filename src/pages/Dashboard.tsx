import { useState } from 'react';
import { Users, Sparkles, AlertTriangle, ClipboardList, X } from 'lucide-react';
import { mockJovenes, mockHistorialAsistencia } from '@/lib/mockData';
import { Button } from '@/components/ui/button';

const metrics = [
  { label: 'Total jóvenes registrados', value: 116, icon: Users, color: 'text-primary' },
  { label: 'Nuevos este mes', value: 14, icon: Sparkles, color: 'text-accent' },
  { label: 'Solo vinieron 1 vez', value: 23, icon: AlertTriangle, color: 'text-destructive' },
  { label: 'Asistencias este mes', value: 187, icon: ClipboardList, color: 'text-success' },
];

const Dashboard = () => {
  const [selectedJoven, setSelectedJoven] = useState<typeof mockJovenes[0] | null>(null);

  return (
    <div className="animate-fade-in px-4 pb-24 pt-6">
      <h1 className="mb-4 text-xl font-bold text-foreground">Dashboard</h1>

      {/* Metrics */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        {metrics.map(m => (
          <div key={m.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <m.icon size={20} className={m.color} />
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{m.value}</p>
            <p className="text-xs text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Youth table */}
      <div className="rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium text-muted-foreground">Nombre</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Edad</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Asist.</th>
              </tr>
            </thead>
            <tbody>
              {mockJovenes.map(j => (
                <tr
                  key={j.id}
                  onClick={() => setSelectedJoven(j)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50 active:bg-muted"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{j.nombre} {j.apellido}</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{j.edad}</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{j.totalAsistencias}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile modal */}
      {selectedJoven && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 sm:items-center" onClick={() => setSelectedJoven(null)}>
          <div
            className="w-full max-w-md animate-fade-in rounded-t-2xl bg-background p-5 shadow-xl sm:rounded-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Perfil del joven</h2>
              <Button variant="ghost" size="icon" onClick={() => setSelectedJoven(null)}>
                <X size={20} />
              </Button>
            </div>

            <div className="mb-4 space-y-2 text-sm">
              <InfoRow label="Nombre completo" value={`${selectedJoven.nombre} ${selectedJoven.apellido}`} />
              <InfoRow label="Edad" value={`${selectedJoven.edad} años`} />
              <InfoRow label="Dirección" value={selectedJoven.direccion} />
              <InfoRow label="WhatsApp" value={selectedJoven.whatsapp} />
              <InfoRow label="Redes sociales" value={selectedJoven.redesSociales} />
              <InfoRow label="Fecha de registro" value={selectedJoven.fechaRegistro} />
            </div>

            <span className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
              {selectedJoven.totalAsistencias} asistencias totales
            </span>

            <h3 className="mb-2 text-sm font-semibold text-foreground">Historial de asistencia</h3>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-3 py-2 font-medium text-muted-foreground">Actividad</th>
                    <th className="px-3 py-2 font-medium text-muted-foreground">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {mockHistorialAsistencia.map((h, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 text-foreground">{h.actividad}</td>
                      <td className="px-3 py-2 tabular-nums text-muted-foreground">{h.fecha}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-foreground">{value || '—'}</span>
  </div>
);

export default Dashboard;
