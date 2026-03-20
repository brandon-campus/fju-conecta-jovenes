import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, AlertCircle, Target, Loader2 } from 'lucide-react';
import PerfilJoven from '@/components/PerfilJoven';

type Joven = { id: string; nombre: string; apellido: string; edad: number; whatsapp?: string; es_visitante?: boolean };
type Tribu = { id: string; nombre: string };
type Meta = { id: string; descripcion: string; objetivo: number; progreso: number; estado: string };

const MiTribu = () => {
  const [userId, setUserId] = useState<string>();
  const [tribu, setTribu] = useState<Tribu | null>(null);
  const [jovenes, setJovenes] = useState<(Joven & { ausente: boolean })[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJoven, setSelectedJoven] = useState<Joven | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;
    setUserId(currentUserId);

    if (!currentUserId) {
      setLoading(false);
      return;
    }

    // Obtener tribu del líder
    const { data: perfil } = await supabase.from('perfiles').select('tribu_id').eq('id', currentUserId).single();
    if (!perfil || !perfil.tribu_id) {
      setLoading(false);
      return;
    }

    const { data: tribuData } = await supabase.from('tribus').select('*').eq('id', perfil.tribu_id).single();
    if (tribuData) setTribu(tribuData);

    // Obtener metas
    const { data: metasData } = await supabase.from('metas_tribu').select('*').eq('tribu_id', perfil.tribu_id).eq('estado', 'activa');
    if (metasData) setMetas(metasData);

    // Obtener jóvenes de la tribu y chequear asistencias
    const { data: jovenesData } = await supabase.from('jovenes').select('*').eq('tribu_id', perfil.tribu_id);
    
    if (jovenesData && jovenesData.length > 0) {
      const dosSemanasAtras = new Date();
      dosSemanasAtras.setDate(dosSemanasAtras.getDate() - 14);
      
      const ids = jovenesData.map(j => j.id);
      const { data: asistencias } = await supabase
        .from('asistencias')
        .select('joven_id, fecha')
        .in('joven_id', ids)
        .gte('fecha', dosSemanasAtras.toISOString().split('T')[0]);

      const asistenciasMap = new Map();
      if (asistencias) {
        asistencias.forEach(a => asistenciasMap.set(a.joven_id, true));
      }

      const jovenesConEstado = jovenesData.map(j => ({
        ...j,
        ausente: !asistenciasMap.has(j.id)
      }));

      // Ordenar: ausentes primero
      jovenesConEstado.sort((a, b) => (a.ausente === b.ausente ? 0 : a.ausente ? -1 : 1));
      setJovenes(jovenesConEstado);
    }
    setLoading(false);
  };

  const incrementarMeta = async (meta: Meta) => {
    if (meta.progreso >= meta.objetivo) return;
    const nuevoProgreso = meta.progreso + 1;
    const nuevoEstado = nuevoProgreso >= meta.objetivo ? 'completada' : 'activa';
    
    // Optistic update
    setMetas(prev => prev.map(m => m.id === meta.id ? { ...m, progreso: nuevoProgreso, estado: nuevoEstado } : m));

    await supabase.from('metas_tribu').update({ progreso: nuevoProgreso, estado: nuevoEstado }).eq('id', meta.id);
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  }

  if (!tribu) {
    return (
      <div className="px-4 pt-10 pb-24 text-center">
        <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-foreground">Aún no tienes tribu</h2>
        <p className="text-muted-foreground mt-2 text-sm">El coordinador debe asignarte una tribu para ver esta sección.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in px-4 pb-24 md:pb-8 pt-6 md:pt-10 md:max-w-2xl md:mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Mi Tribu: {tribu.nombre}</h1>
        <p className="text-sm text-muted-foreground">{jovenes.length} miembros registrados</p>
      </header>

      {/* Metas Section */}
      {metas.length > 0 && (
        <section className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Target size={16} className="text-primary" />
            Desafíos Activos
          </h2>
          <div className="space-y-3">
            {metas.map(meta => (
              <div key={meta.id} className="cursor-pointer" onClick={() => incrementarMeta(meta)}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{meta.descripcion}</span>
                  <span className="text-muted-foreground">{meta.progreso} / {meta.objetivo}</span>
                </div>
                <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out" 
                    style={{ width: `${Math.min((meta.progreso / meta.objetivo) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Jovenes List */}
      <section>
        <h2 className="text-sm font-semibold mb-3">Integrantes</h2>
        {jovenes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No hay jóvenes en tu tribu.</p>
        ) : (
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {jovenes.map(j => (
              <div 
                key={j.id} 
                className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setSelectedJoven(j)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{j.nombre} {j.apellido}</p>
                    {j.ausente && (
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                        <AlertCircle size={10} /> 2+ sem ausente
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{j.edad} años</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <PerfilJoven 
        joven={selectedJoven}
        isOpen={!!selectedJoven}
        onOpenChange={(op) => !op && setSelectedJoven(null)}
        userId={userId}
      />
    </div>
  );
};

export default MiTribu;
