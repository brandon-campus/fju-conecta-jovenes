import { useState } from 'react';
import { Search, CheckCircle, UserX, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockJovenes, mockActividades, mockAsistenciasHoy, type Asistencia } from '@/lib/mockData';

const Asistencia = () => {
  const [actividadId, setActividadId] = useState('a1');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [asistencias, setAsistencias] = useState<Asistencia[]>(mockAsistenciasHoy);

  const actividadesActivas = mockActividades.filter(a => a.activa);
  const actividadNombre = mockActividades.find(a => a.id === actividadId)?.nombre ?? '';

  const presenteIds = asistencias
    .filter(a => a.actividadId === actividadId && a.fecha === fecha)
    .map(a => a.jovenId);

  const presentes = mockJovenes.filter(j => presenteIds.includes(j.id));

  const filtered = searchQuery.length > 1
    ? mockJovenes.filter(j =>
        `${j.nombre} ${j.apellido}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const marcarPresente = (jovenId: string) => {
    const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    setAsistencias(prev => [...prev, { jovenId, actividadId, fecha, hora }]);
  };

  const getHora = (jovenId: string) =>
    asistencias.find(a => a.jovenId === jovenId && a.actividadId === actividadId && a.fecha === fecha)?.hora;

  const initials = (nombre: string, apellido: string) =>
    `${nombre[0]}${apellido[0]}`.toUpperCase();

  return (
    <div className="animate-fade-in px-4 pb-24 pt-6">
      <h1 className="mb-4 text-xl font-bold text-foreground">Tomar asistencia</h1>

      {/* Controls */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Actividad</label>
          <Select value={actividadId} onValueChange={setActividadId}>
            <SelectTrigger className="touch-target">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {actividadesActivas.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Fecha</label>
          <Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="touch-target" />
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar joven por nombre o apellido..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="touch-target pl-10"
        />
      </div>

      {/* Search results */}
      {filtered.length > 0 && (
        <div className="mb-5 rounded-lg border border-border bg-card">
          {filtered.map(j => {
            const yaPresente = presenteIds.includes(j.id);
            return (
              <div key={j.id} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {initials(j.nombre, j.apellido)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{j.nombre} {j.apellido}</p>
                  <p className="text-xs text-muted-foreground">{j.edad} años</p>
                </div>
                {yaPresente ? (
                  <span className="flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                    <CheckCircle size={14} /> Ya registrado hoy
                  </span>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => marcarPresente(j.id)}
                    className="touch-target bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97]"
                  >
                    Marcar presente
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
      {searchQuery.length > 1 && filtered.length === 0 && (
        <div className="mb-5 flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
          <UserX size={32} />
          <p className="text-sm">No se encontraron jóvenes</p>
        </div>
      )}

      {/* Present list */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Presentes hoy — {actividadNombre} — {fecha}
          </h2>
          <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
            {presentes.length}
          </span>
        </div>

        {presentes.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Aún no hay jóvenes marcados</p>
        ) : (
          <div className="space-y-2">
            {presentes.map(j => (
              <div key={j.id} className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {initials(j.nombre, j.apellido)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{j.nombre} {j.apellido}</p>
                  <p className="text-xs text-muted-foreground">{j.edad} años</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={12} /> {getHora(j.id)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Asistencia;
