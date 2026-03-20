import { useState, useEffect } from 'react';
import { Users, Sparkles, AlertTriangle, ClipboardList, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Joven = { id: string; nombre: string; apellido: string; edad: number; fecha_registro: string; direccion: string; whatsapp: string; redes_sociales: string; totalAsistencias?: number };
type Asistencia = { joven_id: string; actividad_id: string; fecha: string };
type Actividad = { id: string; nombre: string };

const Dashboard = () => {
  const [jovenes, setJovenes] = useState<Joven[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [selectedJoven, setSelectedJoven] = useState<Joven | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [resJovenes, resAsistencias, resActividades] = await Promise.all([
        supabase.from('jovenes').select('*'),
        supabase.from('asistencias').select('*'),
        supabase.from('actividades').select('id, nombre')
      ]);

      if (resJovenes.data) setJovenes(resJovenes.data);
      if (resAsistencias.data) setAsistencias(resAsistencias.data);
      if (resActividades.data) setActividades(resActividades.data);
    };
    fetchData();
  }, []);

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  const nuevosEsteMes = jovenes.filter(j => j.fecha_registro?.startsWith(currentMonth)).length;
  const asistenciasEsteMes = asistencias.filter(a => a.fecha?.startsWith(currentMonth)).length;

  const asisPorJoven = asistencias.reduce((acc, curr) => {
    acc[curr.joven_id] = (acc[curr.joven_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const vinieronUnaVez = Object.values(asisPorJoven).filter(count => count === 1).length;

  const metrics = [
    { label: 'Total jóvenes registrados', value: jovenes.length, icon: Users, color: 'text-primary' },
    { label: 'Nuevos este mes', value: nuevosEsteMes, icon: Sparkles, color: 'text-accent' },
    { label: 'Solo vinieron 1 vez', value: vinieronUnaVez, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Asistencias este mes', value: asistenciasEsteMes, icon: ClipboardList, color: 'text-success' },
  ];

  const jovenesConAsistencia = jovenes.map(j => ({ ...j, totalAsistencias: asisPorJoven[j.id] || 0 })).sort((a,b) => (b.totalAsistencias || 0) - (a.totalAsistencias || 0));

  const historialSeleccionado = selectedJoven 
    ? asistencias.filter(a => a.joven_id === selectedJoven.id).sort((a,b) => b.fecha.localeCompare(a.fecha))
    : [];

  const getActividadNombre = (id: string) => actividades.find(a => a.id === id)?.nombre || 'Desconocida';

  return (
    <div className="animate-fade-in px-4 pb-24 md:pb-8 pt-6 md:pt-10">
      <h1 className="mb-4 text-xl font-bold text-foreground">Dashboard</h1>

      {/* Metrics */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
              {jovenesConAsistencia.map((j) => (
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
      <Dialog open={!!selectedJoven} onOpenChange={(open) => !open && setSelectedJoven(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl gap-4 p-5">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Perfil del joven</DialogTitle>
          </DialogHeader>

          {selectedJoven && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <InfoRow label="Nombre completo" value={`${selectedJoven.nombre} ${selectedJoven.apellido}`} />
                <InfoRow label="Edad" value={`${selectedJoven.edad} años`} />
                <InfoRow label="Dirección" value={selectedJoven.direccion} />
                <InfoRow label="WhatsApp" value={selectedJoven.whatsapp} />
                <InfoRow label="Redes sociales" value={selectedJoven.redes_sociales} />
                <InfoRow label="Fecha de registro" value={selectedJoven.fecha_registro} />
              </div>

              <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                {selectedJoven.totalAsistencias} asistencias totales
              </span>

              <div>
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
                      {historialSeleccionado.map((h, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="px-3 py-2 text-foreground">{getActividadNombre(h.actividad_id)}</td>
                          <td className="px-3 py-2 tabular-nums text-muted-foreground">{h.fecha}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {historialSeleccionado.length === 0 && (
                    <div className="p-3 text-center text-muted-foreground text-xs">No hay asistencias registradas</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string | undefined }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-foreground">{value || '—'}</span>
  </div>
);

export default Dashboard;
