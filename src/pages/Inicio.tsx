import { useRole } from '@/lib/roleContext';
import { useNavigate } from 'react-router-dom';
import { UserPlus, CheckSquare, BarChart3, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Inicio = () => {
  const { role, setIsLoggedIn } = useRole();
  const navigate = useNavigate();

  const roleLabels = { asistente: 'Asistente', lider: 'Líder', coordinador: 'Coordinador' };

  const shortcuts = [
    { label: 'Registrar joven', icon: UserPlus, path: '/registro', roles: ['asistente', 'coordinador'] },
    { label: 'Tomar asistencia', icon: CheckSquare, path: '/asistencia', roles: ['lider', 'coordinador'] },
    { label: 'Mi Tribu', icon: UserPlus, path: '/tribu', roles: ['lider', 'coordinador'] },
    { label: 'Ver dashboard', icon: BarChart3, path: '/dashboard', roles: ['asistente', 'lider', 'coordinador'] },
    { label: 'Actividades', icon: Settings, path: '/actividades', roles: ['coordinador'] },
  ].filter(s => s.roles.includes(role));

  return (
    <div className="animate-fade-in px-4 pb-24 md:pb-8 pt-6 md:pt-10">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Bienvenido/a</p>
        <h1 className="text-2xl font-bold text-foreground">FJU Argentina</h1>
        <span className="mt-1 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          {roleLabels[role]}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {shortcuts.map(s => (
          <button
            key={s.path}
            onClick={() => navigate(s.path)}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center shadow-sm transition-shadow hover:shadow-md active:scale-[0.97]"
          >
            <s.icon size={28} className="text-primary" />
            <span className="text-sm font-medium text-foreground">{s.label}</span>
          </button>
        ))}
      </div>

      <Button
        variant="ghost"
        className="mt-8 w-full touch-target text-muted-foreground"
        onClick={() => { setIsLoggedIn(false); navigate('/login'); }}
      >
        <LogOut size={18} />
        Cerrar sesión
      </Button>
    </div>
  );
};

export default Inicio;
