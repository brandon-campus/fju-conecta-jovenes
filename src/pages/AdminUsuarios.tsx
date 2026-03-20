import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Shield, UserCog, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type Perfil = { id: string; nombre: string; apellido: string; email: string; rol: string; tribu_id: string | null };
type Tribu = { id: string; nombre: string };

const AdminUsuarios = () => {
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [tribus, setTribus] = useState<Tribu[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevaTribu, setNuevaTribu] = useState('');
  const [creandoTribu, setCreandoTribu] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    const [{ data: pData }, { data: tData }] = await Promise.all([
      supabase.from('perfiles').select('*').order('nombre'),
      supabase.from('tribus').select('*').order('nombre')
    ]);

    if (pData) setPerfiles(pData);
    if (tData) setTribus(tData);
    setLoading(false);
  };

  const actualizarRol = async (id: string, nuevoRol: string) => {
    const { error } = await supabase.from('perfiles').update({ rol: nuevoRol }).eq('id', id);
    if (error) {
      toast.error('Error al actualizar rol');
    } else {
      toast.success('Rol actualizado');
      setPerfiles(prev => prev.map(p => p.id === id ? { ...p, rol: nuevoRol } : p));
    }
  };

  const actualizarTribu = async (id: string, nuevaTribuId: string | 'none') => {
    const val = nuevaTribuId === 'none' ? null : nuevaTribuId;
    const { error } = await supabase.from('perfiles').update({ tribu_id: val }).eq('id', id);
    if (error) {
      toast.error('Error al actualizar tribu');
    } else {
      toast.success('Tribu asignada');
      setPerfiles(prev => prev.map(p => p.id === id ? { ...p, tribu_id: val } : p));
    }
  };

  const crearTribu = async () => {
    if (!nuevaTribu.trim()) return;
    setCreandoTribu(true);
    const { data, error } = await supabase.from('tribus').insert({ nombre: nuevaTribu.trim() }).select().single();
    if (error) {
      toast.error('Error al crear tribu');
    } else if (data) {
      toast.success('Tribu creada');
      setTribus(prev => [...prev, data]);
      setNuevaTribu('');
    }
    setCreandoTribu(false);
  };

  const eliminarTribu = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta tribu? Los jóvenes asignados quedarán sin tribu.')) return;
    const { error } = await supabase.from('tribus').delete().eq('id', id);
    if (error) {
      toast.error('Error al eliminar tribu');
    } else {
      toast.success('Tribu eliminada');
      setTribus(prev => prev.filter(t => t.id !== id));
      // Limpiar tribu_id de perfiles localmente
      setPerfiles(prev => prev.map(p => p.tribu_id === id ? { ...p, tribu_id: null } : p));
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  }

  return (
    <div className="animate-fade-in px-4 pb-24 md:pb-8 pt-6 md:pt-10 md:max-w-4xl md:mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield size={24} className="text-primary"/> Panel de Administración</h1>
        <p className="text-sm text-muted-foreground">Gestiona roles, accesos y tribus del sistema.</p>
      </header>

      {/* Gestión de Tribus */}
      <section className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm">
        <h2 className="text-base font-semibold mb-4">Gestión de Tribus</h2>
        
        <div className="flex gap-2 mb-4">
          <Input 
            placeholder="Nombre de la nueva tribu..." 
            value={nuevaTribu} 
            onChange={e => setNuevaTribu(e.target.value)} 
            className="max-w-xs"
          />
          <Button onClick={crearTribu} disabled={creandoTribu || !nuevaTribu.trim()}>
            {creandoTribu ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} 
            <span className="ml-2 hidden sm:inline">Crear tribu</span>
          </Button>
        </div>

        {tribus.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay tribus creadas aún.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tribus.map(t => (
              <div key={t.id} className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full text-sm">
                <span className="font-medium text-secondary-foreground">{t.nombre}</span>
                <button onClick={() => eliminarTribu(t.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Gestión de Usuarios */}
      <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-border bg-muted/20">
          <h2 className="text-base font-semibold flex items-center gap-2"><UserCog size={18} /> Usuarios Registrados</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Tribu asignada (Líderes)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {perfiles.map(p => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{p.nombre} {p.apellido}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
                  <td className="px-4 py-3">
                    <Select value={p.rol} onValueChange={(val) => actualizarRol(p.id, val)}>
                      <SelectTrigger className="h-8 w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asistente">Asistente</SelectItem>
                        <SelectItem value="lider">Líder</SelectItem>
                        <SelectItem value="coordinador">Coordinador</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Select 
                      value={p.tribu_id || 'none'} 
                      onValueChange={(val) => actualizarTribu(p.id, val)}
                      disabled={p.rol === 'asistente'}
                    >
                      <SelectTrigger className="h-8 w-[160px]">
                        <SelectValue placeholder="Sin tribu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin tribu</SelectItem>
                        {tribus.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};

export default AdminUsuarios;
