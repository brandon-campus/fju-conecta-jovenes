import { useState } from 'react';
import { Search, UserPlus, AlertTriangle, CheckCircle, UserX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockJovenes } from '@/lib/mockData';

const Registro = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState({ nombre: '', apellido: '', edad: '', direccion: '', whatsapp: '', redesSociales: '' });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const today = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const filtered = searchQuery.length > 1
    ? mockJovenes.filter(j =>
        `${j.nombre} ${j.apellido}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const possibleDuplicate = showForm && form.nombre && form.apellido && mockJovenes.some(
    j => j.nombre.toLowerCase() === form.nombre.toLowerCase() && j.apellido.toLowerCase() === form.apellido.toLowerCase()
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, boolean> = {};
    if (!form.nombre.trim()) newErrors.nombre = true;
    if (!form.apellido.trim()) newErrors.apellido = true;
    if (!form.edad.trim() || isNaN(Number(form.edad))) newErrors.edad = true;
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setErrors({});
    setShowForm(false);
    setShowSuccess(true);
    setForm({ nombre: '', apellido: '', edad: '', direccion: '', whatsapp: '', redesSociales: '' });
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="animate-fade-in px-4 pb-24 pt-6">
      <h1 className="mb-4 text-xl font-bold text-foreground">Registro de jóvenes</h1>

      {showSuccess && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3 text-sm font-medium text-success">
          <CheckCircle size={18} />
          Joven registrado exitosamente
        </div>
      )}

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
            <div key={j.id} className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{j.nombre} {j.apellido}</p>
                <p className="text-xs text-muted-foreground">{j.edad} años · Registrado {j.fechaRegistro}</p>
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
        <form onSubmit={handleSave} className="mt-4 animate-fade-in space-y-3 rounded-xl border border-border bg-card p-4">
          <h2 className="text-base font-semibold text-foreground">Nuevo joven</h2>

          {possibleDuplicate && (
            <div className="flex items-center gap-2 rounded-lg bg-accent/15 px-3 py-2 text-sm font-medium text-accent-foreground">
              <AlertTriangle size={16} className="text-accent" />
              Este joven podría ya estar registrado
            </div>
          )}

          <FieldInput label="Nombre *" value={form.nombre} error={errors.nombre} onChange={v => setForm(f => ({ ...f, nombre: v }))} />
          <FieldInput label="Apellido *" value={form.apellido} error={errors.apellido} onChange={v => setForm(f => ({ ...f, apellido: v }))} />
          <FieldInput label="Edad *" value={form.edad} error={errors.edad} onChange={v => setForm(f => ({ ...f, edad: v }))} type="number" />
          <FieldInput label="Dirección" value={form.direccion} onChange={v => setForm(f => ({ ...f, direccion: v }))} />
          <FieldInput label="WhatsApp" value={form.whatsapp} onChange={v => setForm(f => ({ ...f, whatsapp: v }))} />
          <FieldInput label="Redes sociales" value={form.redesSociales} onChange={v => setForm(f => ({ ...f, redesSociales: v }))} placeholder="@usuario_ig / @usuario_tt" />

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Fecha de registro</label>
            <Input value={today} disabled className="touch-target bg-muted" />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="touch-target flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" className="touch-target flex-1 text-base font-semibold">Guardar joven</Button>
          </div>
        </form>
      )}
    </div>
  );
};

const FieldInput = ({ label, value, onChange, error, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; error?: boolean; type?: string; placeholder?: string;
}) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-foreground">{label}</label>
    <Input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`touch-target ${error ? 'border-destructive ring-1 ring-destructive' : ''}`}
    />
    {error && <p className="text-xs text-destructive">Este campo es obligatorio</p>}
  </div>
);

export default Registro;
