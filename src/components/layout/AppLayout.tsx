import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import BottomNav from '../BottomNav';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar for desktop */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 pb-20 md:pb-0 h-screen overflow-y-auto">
        {/* We use h-screen and overflow-y-auto so the sidebar stays fixed while the content scrolls on desktop */}
        <div className="mx-auto w-full md:max-w-5xl">
          {children}
        </div>
      </main>

      {/* Bottom nav for mobile */}
      <BottomNav />
    </div>
  );
};

export default AppLayout;
