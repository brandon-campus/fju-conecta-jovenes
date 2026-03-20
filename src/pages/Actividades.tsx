import { useState, useEffect } from 'react';
import { Plus, Pencil, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  nombre: z.string().min(2, 'El nombre es obligatorio'),
  tipo: z.string().optional(),
  descripcion: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;
type Actividad = { id: string; nombre: string; tipo: string; descripcion: string; activa: boolean };

const Actividades = () => {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: '', tipo: '', descripcion: '' }
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('actividades').select('*').order('created_at', { ascending: true });
      if (data) setActividades(data);
    };
    fetchData();
  }, []);

  const toggleActiva = async (a: Actividad) => {
    const newVal = !a.activa;
    const { error } = await supabase.from('actividades').update({ activa: newVal }).eq('id', a.id);
    if (!error) {
      setActividades(prev => prev.map(act => act.id === a.id ? { ...act, activa: newVal } : act));
      toast.success('Estado actualizado');
    } else {
      toast.error('Error al actualizar');
    }
  };

  const openEdit = (a: Actividad) => {
    reset({ nombre: a.nombre, tipo: a.tipo || '', descripcion: a.descripcion || '' });
    setEditingId(a.id);
    setShowForm(true);
  };

  const openNew = () => {
    reset({ nombre: '', tipo: '', descripcion: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    if (editingId) {
      const { error } = await supabase.from('actividades').update({
        nombre: data.nombre,
        tipo: data.tipo,
        descripcion: data.descripcion
      }).eq('id', editingId);

      if (!error) {
        setActividades(prev => prev.map(a => a.id === editingId ? { ...a, ...data } : a));
        toast.success('Actividad actualizada');
        setShowForm(false);
      } else {
        toast.error('Error al actualizar');
      }
    } else {
      const { data: newData, error } = await supabase.from('actividades').insert([{
        nombre: data.nombre,
        tipo: data.tipo,
        descripcion: data.descripcion,
        activa: true
      }]).select().single();

      if (!error && newData) {
        setActividades(prev => [...prev, newData]);
        toast.success('Actividad creada exitosamente');
        setShowForm(false);
      } else {
        toast.error('Error al crear');
      }
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="animate-fade-in px-4 pb-24 md:pb-8 pt-6 md:pt-10 md:max-w-3xl md:mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Actividades</h1>
        <Button onClick={openNew} className="touch-target gap-1.5">
          <Plus size={18} /> Nueva
        </Button>
      </div>

      <div className="space-y-2">
        {actividades.map((a) => (
          <div key={a.id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{a.nombre}</p>
              <p className="text-xs text-muted-foreground">{a.tipo}</p>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${a.activa ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
              {a.activa ? 'Activa' : 'Inactiva'}
            </span>
            <Switch checked={a.activa} onCheckedChange={() => toggleActiva(a)} />
            <button onClick={() => openEdit(a)} className="touch-target flex items-center justify-center text-muted-foreground hover:text-foreground">
              <Pencil size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Form modal */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!isSubmitting) setShowForm(open); }}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl gap-4 p-5">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingId ? 'Editar actividad' : 'Nueva actividad'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Nombre *</label>
              <Input {...register('nombre')} className={`touch-target ${errors.nombre ? 'border-destructive ring-1 ring-destructive' : ''}`} />
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Tipo</label>
              <Input {...register('tipo')} className="touch-target" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Descripción</label>
              <Input {...register('descripcion')} className="touch-target" />
            </div>
            <Button type="submit" className="touch-target w-full text-base font-semibold" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (editingId ? 'Guardar cambios' : 'Crear actividad')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Actividades;
