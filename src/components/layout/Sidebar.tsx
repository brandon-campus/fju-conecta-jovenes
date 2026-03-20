import { Home, UserPlus, CheckSquare, BarChart3, Settings, LogOut, Bot } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRole } from '@/lib/roleContext';
import { Button } from '@/components/ui/button';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, setIsLoggedIn } = useRole();

  const tabs = [
    { path: '/', label: 'Inicio', icon: Home, roles: ['asistente', 'lider', 'coordinador'] },
    { path: '/registro', label: 'Registro', icon: UserPlus, roles: ['asistente', 'coordinador'] },
    { path: '/asistencia', label: 'Asistencia', icon: CheckSquare, roles: ['lider', 'coordinador'] },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3, roles: ['coordinador'] },
    { path: '/actividades', label: 'Actividades', icon: Settings, roles: ['coordinador'] },
    { path: '/asistente', label: 'Asistente', icon: Bot, roles: ['asistente', 'lider', 'coordinador'] },
  ];

  const visibleTabs = tabs.filter(t => t.roles.includes(role));

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex inset-y-0 left-0 z-50 w-64 flex-col border-r border-border bg-sidebar-background px-4 py-6">
      <div className="mb-8 px-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">FJU Argentina</h2>
        <p className="text-sm font-medium capitalize text-muted-foreground">{role}</p>
      </div>

      <nav className="flex-1 space-y-2">
        {visibleTabs.map(tab => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <tab.icon size={20} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border pt-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
