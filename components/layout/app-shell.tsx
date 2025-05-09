'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { useAuth } from '@/app/providers';
import { redirect } from 'next/navigation';

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  // Public paths that don't require authentication
  const publicPaths = ['/', '/login'];

  // Check if current path is public
  const isPublicPath = publicPaths.includes(pathname);

  // Don't redirect during loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated and trying to access protected route
  if (!user?.isAuthenticated && !isPublicPath) {
    redirect('/login');
    return null;
  }

  // Login page has no shell
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[100dvh] flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:block w-64 shrink-0 overflow-hidden">
          <Sidebar />
        </aside>
        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden pb-16 lg:pb-0 px-2 sm:px-4">
          {children}
        </main>
      </div>
    </div>
  );
};
