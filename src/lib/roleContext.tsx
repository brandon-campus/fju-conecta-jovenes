import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

export type Role = 'asistente' | 'lider' | 'coordinador';

interface RoleContextType {
  role: Role | null;
  setRole: (role: Role | null) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  loading: boolean;
}

const RoleContext = createContext<RoleContextType>({
  role: null,
  setRole: () => {},
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  loading: true,
});

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsLoggedIn(true);
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        fetchUserRole(session.user.id);
      } else {
        setIsLoggedIn(false);
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', userId)
        .single();
      
      if (data) {
        setRole(data.rol as Role);
      }
    } catch (err) {
      console.error("Error fetching role", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleContext.Provider value={{ role, setRole, isLoggedIn, setIsLoggedIn, loading }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
