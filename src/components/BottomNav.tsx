import { Home, UserPlus, CheckSquare, BarChart3, Bot } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRole } from '@/lib/roleContext';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useRole();

  const tabs = [
    { path: '/', label: 'Inicio', icon: Home, roles: ['asistente', 'lider', 'coordinador'] },
    { path: '/registro', label: 'Registro', icon: UserPlus, roles: ['asistente', 'coordinador'] },
    { path: '/asistencia', label: 'Asistencia', icon: CheckSquare, roles: ['lider', 'coordinador'] },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3, roles: ['asistente', 'lider', 'coordinador'] },
    { path: '/asistente', label: 'Asistente', icon: Bot, roles: ['asistente', 'lider', 'coordinador'] },
  ];

  const visibleTabs = tabs.filter(t => t.roles.includes(role));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {visibleTabs.map(tab => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`touch-target flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-xs font-medium transition-colors active:scale-[0.97] ${
                isActive ? 'text-accent' : 'text-muted-foreground'
              }`}
            >
              <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};

export default BottomNav;
