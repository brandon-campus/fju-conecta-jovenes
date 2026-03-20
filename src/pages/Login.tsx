import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/lib/roleContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Role } from '@/lib/mockData';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('asistente');
  const { setRole, setIsLoggedIn } = useRole();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setRole(selectedRole);
    setIsLoggedIn(true);
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo placeholder */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <span className="text-2xl font-bold text-primary-foreground">FJU</span>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">FJU Registro</h1>
            <p className="text-sm text-muted-foreground">Fuerza Joven Universal — Argentina</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Correo electrónico</label>
            <Input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="touch-target"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Contraseña</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="touch-target"
              required
            />
          </div>

          {/* Role selector for prototype */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Rol (solo prototipo)</label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as Role)}>
              <SelectTrigger className="touch-target">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asistente">Asistente</SelectItem>
                <SelectItem value="lider">Líder</SelectItem>
                <SelectItem value="coordinador">Coordinador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="touch-target w-full text-base font-semibold">
            Ingresar
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
