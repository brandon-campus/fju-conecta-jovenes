import { useState, useEffect } from 'react';
import { Search, UserPlus, AlertTriangle, UserX, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import PerfilJoven from '@/components/PerfilJoven';

const formSchema = z.object({
  nombre: z.string().min(2, 'El nombre es obligatorio'),
  apellido: z.string().min(2, 'El apellido es obligatorio'),
  edad: z.coerce.number().min(1, 'La edad es obligatoria'),
  direccion: z.string().optional(),
  whatsapp: z.string().optional(),
  redesSociales: z.string().optional(),
  esVisitante: z.boolean().default(false)
});

type FormValues = z.infer<typeof formSchema>;
type Joven = { id: string; nombre: string; apellido: string; edad: number; fecha_registro: string };

const Registro = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filtered, setFiltered] = useState<Joven[]>([]);
  const [selectedJoven, setSelectedJoven] = useState<Joven | null>(null);
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id);
    });
  }, []);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: '', apellido: '', direccion: '', whatsapp: '', redesSociales: '', esVisitante: false }
  });

  const watchedNombre = watch('nombre');
  const watchedApellido = watch('apellido');

  const today = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  useEffect(() => {
    if (searchQuery.length < 2) {
      setFiltered([]);
      return;
    }
    const fetchJovenes = async () => {
      const { data, error } = await supabase
        .from('jovenes')
        .select('*')
        .or(`nombre.ilike.%${searchQuery}%,apellido.ilike.%${searchQuery}%`)
        .limit(10);
      
      if (!error && data) {
        setFiltered(data);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchJovenes();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const possibleDuplicate = showForm && watchedNombre && watchedApellido && filtered.some(
    j => j.nombre.toLowerCase() === watchedNombre.toLowerCase() && j.apellido.toLowerCase() === watchedApellido.toLowerCase()
  );

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const { error } = await supabase.from('jovenes').insert([{
      nombre: data.nombre,
      apellido: data.apellido,
      edad: data.edad,
      direccion: data.direccion || null,
      whatsapp: data.whatsapp || null,
      redes_sociales: data.redesSociales || null,
      es_visitante: data.esVisitante
    }]);

    setIsSubmitting(false);

    if (error) {
      toast.error('Error al registrar', { description: error.message });
      return;
    }

    setShowForm(false);
    reset();
    toast.success('Joven registrado exitosamente');
    setSearchQuery('');
  };

  return (
    <div className="animate-fade-in px-4 pb-24 md:pb-8 pt-6 md:pt-10 md:max-w-2xl md:mx-auto">
      <h1 className="mb-4 text-xl font-bold text-foreground">Registro de jóvenes</h1>

      {/* Search */}
      <div className="relative mb-3">
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
        <div className="mb-4 rounded-lg border border-border bg-card">
          {filtered.map(j => (
            <div 
              key={j.id} 
              onClick={() => setSelectedJoven(j)}
              className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{j.nombre} {j.apellido}</p>
                <p className="text-xs text-muted-foreground">{j.edad} años · Registrado {j.fecha_registro || 'Recientemente'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {searchQuery.length > 1 && filtered.length === 0 && (
        <div className="mb-4 flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
          <UserX size={32} />
          <p className="text-sm">No se encontraron jóvenes</p>
        </div>
      )}

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="touch-target w-full gap-2 text-base font-semibold">
          <UserPlus size={20} />
          Registrar nuevo joven
        </Button>
      )}

      {/* Registration form */}
      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 animate-fade-in space-y-3 rounded-xl border border-border bg-card p-4">
          <h2 className="text-base font-semibold text-foreground">Nuevo joven</h2>

          {possibleDuplicate && (
            <div className="flex items-center gap-2 rounded-lg bg-accent/15 px-3 py-2 text-sm font-medium text-accent-foreground">
              <AlertTriangle size={16} className="text-accent" />
              Este joven podría ya estar registrado
            </div>
          )}

          <div className="flex items-center space-x-2 pb-2">
            <input 
              type="checkbox" 
              id="esVisitante" 
              {...register('esVisitante')} 
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary" 
            />
            <label htmlFor="esVisitante" className="text-sm font-medium text-foreground">
              Es un visitante (registro rápido)
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Nombre *</label>
            <Input {...register('nombre')} className={`touch-target ${errors.nombre ? 'border-destructive ring-1 ring-destructive' : ''}`} />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Apellido *</label>
            <Input {...register('apellido')} className={`touch-target ${errors.apellido ? 'border-destructive ring-1 ring-destructive' : ''}`} />
            {errors.apellido && <p className="text-xs text-destructive">{errors.apellido.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Edad *</label>
            <Input type="number" {...register('edad')} className={`touch-target ${errors.edad ? 'border-destructive ring-1 ring-destructive' : ''}`} />
            {errors.edad && <p className="text-xs text-destructive">{errors.edad.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Dirección</label>
            <Input {...register('direccion')} className="touch-target" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">WhatsApp</label>
            <Input {...register('whatsapp')} className="touch-target" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Redes sociales</label>
            <Input {...register('redesSociales')} placeholder="@usuario_ig / @usuario_tt" className="touch-target" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Fecha de registro</label>
            <Input value={today} disabled className="touch-target bg-muted" />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="touch-target flex-1" onClick={() => { setShowForm(false); reset(); }} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" className="touch-target flex-1 text-base font-semibold" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Guardar joven'}
            </Button>
          </div>
        </form>
      )}

      <PerfilJoven 
        joven={selectedJoven}
        isOpen={!!selectedJoven}
        onOpenChange={(open) => !open && setSelectedJoven(null)}
        userId={userId}
      />
    </div>
  );
};

export default Registro;
