import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Error de autenticación", {
        description: error.message
      });
      setLoading(false);
      return;
    }
    
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in">
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
              disabled={loading}
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
              disabled={loading}
              required
            />
          </div>

          <Button type="submit" className="touch-target w-full text-base font-semibold" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
