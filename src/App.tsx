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

const AppRoutes = () => {
  const { role, isLoggedIn } = useRole();

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <div className="pb-20">
        <Routes>
          <Route path="/" element={<Inicio />} />
          {(role === 'asistente' || role === 'coordinador') && (
            <Route path="/registro" element={<Registro />} />
          )}
          {(role === 'lider' || role === 'coordinador') && (
            <Route path="/asistencia" element={<Asistencia />} />
          )}
          {role === 'coordinador' && (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/actividades" element={<Actividades />} />
            </>
          )}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <BottomNav />
    </>
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
