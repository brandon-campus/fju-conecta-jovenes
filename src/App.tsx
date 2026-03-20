import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider, useRole } from "@/lib/roleContext";
import Login from "./pages/Login";
import Inicio from "./pages/Inicio";
import Registro from "./pages/Registro";
import Asistencia from "./pages/Asistencia";
import Dashboard from "./pages/Dashboard";
import Actividades from "./pages/Actividades";
import BottomNav from "./components/BottomNav";
import NotFound from "./pages/NotFound";
import Asistente from "./pages/Asistente";
import AppLayout from "./components/layout/AppLayout";
import MiTribu from "./pages/MiTribu";

const AppRoutes = () => {
  const { role, isLoggedIn, loading } = useRole();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  }

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Inicio />} />
        {(role === 'asistente' || role === 'coordinador') && (
          <Route path="/registro" element={<Registro />} />
        )}
        {(role === 'lider' || role === 'coordinador') && (
          <Route path="/asistencia" element={<Asistencia />} />
        )}
        {(role === 'asistente' || role === 'lider' || role === 'coordinador') && (
          <Route path="/dashboard" element={<Dashboard />} />
        )}
        {role === 'coordinador' && (
          <Route path="/actividades" element={<Actividades />} />
        )}
        {(role === 'asistente' || role === 'lider' || role === 'coordinador') && (
          <Route path="/asistente" element={<Asistente />} />
        )}
        {(role === 'lider' || role === 'coordinador') && (
          <Route path="/tribu" element={<MiTribu />} />
        )}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

const App = () => (
  <RoleProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </RoleProvider>
);

export default App;
