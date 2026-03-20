import React, { createContext, useContext, useState } from 'react';
import type { Role } from './mockData';

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
}

const RoleContext = createContext<RoleContextType>({
  role: 'asistente',
  setRole: () => {},
  isLoggedIn: false,
  setIsLoggedIn: () => {},
});

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('asistente');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <RoleContext.Provider value={{ role, setRole, isLoggedIn, setIsLoggedIn }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
