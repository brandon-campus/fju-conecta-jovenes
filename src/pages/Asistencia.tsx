import { useState, useEffect } from 'react';
import { Search, CheckCircle, UserX, Clock, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type Joven = { id: string; nombre: string; apellido: string; edad: number };
type Actividad = { id: string; nombre: string; activa: boolean };
type Asistencia = { joven_id: string; actividad_id: string; fecha: string; created_at: string };

const Asistencia = () => {
  const [actividadId, setActividadId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [jovenes, setJovenes] = useState<Joven[]>([]); // All young people for search
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]); // Raw assistance records for current activity/date
  const [jovenesPresentes, setJovenesPresentes] = useState<Joven[]>([]); // Young people currently marked present
  const [filteredJovenes, setFilteredJovenes] = useState<Joven[]>([]); // Young people from search results

  useEffect(() => {
    const loadActividades = async () => {
      const { data } = await supabase.from('actividades').select('*').eq('activa', true);
      if (data) {
        setActividades(data);
        if (data.length > 0) setActividadId(data[0].id);
      }
    };
    loadActividades();
  }, []);

  useEffect(() => {
    if (!actividadId || !fecha) return;
    const loadAsistencias = async () => {
      const { data } = await supabase
        .from('asistencias')
        .select('*')
        .eq('actividad_id', actividadId)
        .eq('fecha', fecha);
        
      if (data) {
        setAsistencias(data);
        if (data.length > 0) {
          const ids = data.map(a => a.joven_id);
          const { data: qJovenes } = await supabase.from('jovenes').select('*').in('id', ids);
          if (qJovenes) setJovenesPresentes(qJovenes);
        } else {
          setJovenesPresentes([]);
        }
      } else {
        setAsistencias([]);
        setJovenesPresentes([]);
      }
    };
    loadAsistencias();
  }, [actividadId, fecha]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setFilteredJovenes([]);
      return;
    }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('jovenes')
        .select('*')
        .or(`nombre.ilike.%${searchQuery}%,apellido.ilike.%${searchQuery}%`)
        .limit(10);
      if (data) setFilteredJovenes(data);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const marcarPresente = async (joven: Joven) => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    const { error } = await supabase.from('asistencias').insert([{
      joven_id: joven.id,
      actividad_id: actividadId,
      fecha,
      registrado_por: userId || null
    }]);

    if (error) {
      if (error.code === '23505') {
        toast.error('Este joven ya está registrado hoy');
      } else {
        toast.error('Error al registrar asistencia');
      }
      return;
    }
    
    toast.success('Asistencia registrada');
    setAsistencias(prev => [...prev, { joven_id: joven.id, actividad_id: actividadId, fecha, created_at: new Date().toISOString() }]);
    setJovenesPresentes(prev => [...prev, joven]);
  };

  const desmarcarPresente = async (jovenId: string) => {
    const { error } = await supabase
      .from('asistencias')
      .delete()
      .eq('joven_id', jovenId)
      .eq('actividad_id', actividadId)
      .eq('fecha', fecha);

    if (error) {
      toast.error('Error al desmarcar asistencia');
      return;
    }

    toast('Asistencia removida');
    setAsistencias(prev => prev.filter(a => !(a.joven_id === jovenId && a.actividad_id === actividadId && a.fecha === fecha)));
    setJovenesPresentes(prev => prev.filter(j => j.id !== jovenId));
  };

  const actividadNombre = actividades.find(a => a.id === actividadId)?.nombre ?? '';
  const presenteIds = asistencias.map(a => a.joven_id);

  const getHora = (jovenId: string) => {
    const asis = asistencias.find(a => a.joven_id === jovenId);
    if (!asis) return '';
    return new Date(asis.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  const initials = (nombre: string, apellido: string) => `${nombre[0] || ''}${apellido[0] || ''}`.toUpperCase();

  return (
    <div className="animate-fade-in px-4 pb-24 md:pb-8 pt-6 md:pt-10 md:max-w-3xl md:mx-auto">
      <h1 className="mb-4 text-xl font-bold text-foreground">Tomar asistencia</h1>

      {/* Controls */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Actividad</label>
          <Select value={actividadId} onValueChange={setActividadId} disabled={actividades.length === 0}>
            <SelectTrigger className="touch-target">
              <SelectValue placeholder="Seleccione" />
            </SelectTrigger>
            <SelectContent>
              {actividades.map(a => (
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
      {filteredJovenes.length > 0 && (
        <div className="mb-5 rounded-lg border border-border bg-card">
          {filteredJovenes.map(j => {
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
                    onClick={() => marcarPresente(j)}
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
      {searchQuery.length > 1 && filteredJovenes.length === 0 && (
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
            {jovenesPresentes.length}
          </span>
        </div>

        {jovenesPresentes.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Aún no hay jóvenes marcados</p>
        ) : (
          <div className="space-y-2">
            {jovenesPresentes.map(j => (
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
                <button onClick={() => desmarcarPresente(j.id)} className="p-1 text-muted-foreground hover:text-destructive touch-target" title="Desmarcar">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Asistencia;
