import { ReactNode } from 'react';
import AppSidebar from './AppSidebar';

export default function AppLayout({ children, demo = false }: { children: ReactNode; demo?: boolean }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar demo={demo} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
