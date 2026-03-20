import { useState } from 'react';
import { Plus, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { mockActividades, type Actividad } from '@/lib/mockData';

const Actividades = () => {
  const [actividades, setActividades] = useState<Actividad[]>(mockActividades);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', tipo: '', descripcion: '' });

  const toggleActiva = (id: string) => {
    setActividades(prev => prev.map(a => a.id === id ? { ...a, activa: !a.activa } : a));
  };

  const openEdit = (a: Actividad) => {
    setForm({ nombre: a.nombre, tipo: a.tipo, descripcion: a.descripcion });
    setEditingId(a.id);
    setShowForm(true);
  };

  const openNew = () => {
    setForm({ nombre: '', tipo: '', descripcion: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    if (editingId) {
      setActividades(prev => prev.map(a => a.id === editingId ? { ...a, ...form } : a));
    } else {
      setActividades(prev => [...prev, { id: `a${Date.now()}`, ...form, activa: true }]);
    }
    setShowForm(false);
  };

  return (
    <div className="animate-fade-in px-4 pb-24 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Actividades</h1>
        <Button onClick={openNew} className="touch-target gap-1.5">
          <Plus size={18} /> Nueva actividad
        </Button>
      </div>

      <div className="space-y-2">
        {actividades.map(a => (
          <div key={a.id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{a.nombre}</p>
              <p className="text-xs text-muted-foreground">{a.tipo}</p>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${a.activa ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
              {a.activa ? 'Activa' : 'Inactiva'}
            </span>
            <Switch checked={a.activa} onCheckedChange={() => toggleActiva(a.id)} />
            <button onClick={() => openEdit(a)} className="touch-target flex items-center justify-center text-muted-foreground hover:text-foreground">
              <Pencil size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 sm:items-center" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md animate-fade-in rounded-t-2xl bg-background p-5 shadow-xl sm:rounded-2xl" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{editingId ? 'Editar actividad' : 'Nueva actividad'}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X size={20} />
              </Button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Nombre *</label>
                <Input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className="touch-target" required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Tipo</label>
                <Input value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} className="touch-target" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Descripción</label>
                <Input value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} className="touch-target" />
              </div>
              <Button type="submit" className="touch-target w-full text-base font-semibold">
                {editingId ? 'Guardar cambios' : 'Crear actividad'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Actividades;
