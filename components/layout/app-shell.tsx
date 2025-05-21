'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { useAuth } from '@/app/providers';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const { user, isLoading: authContextLoading } = useAuth();
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  // Public paths that don't require authentication
  const publicPaths = ['/', '/login', '/signup', '/forgot-password'];

  // Check if current path is public
  const isPublicPath = publicPaths.includes(pathname);

  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle redirects - MOVED UP before any conditional returns
  useEffect(() => {
    if (isMounted && !authContextLoading) {
      // Redirect to login if not authenticated and trying to access protected route
      if (sessionStatus === 'unauthenticated' && !isPublicPath) {
        router.push('/login');
      }

      // Redirect to dashboard if authenticated and trying to access public route
      if (
        sessionStatus === 'authenticated' &&
        (pathname === '/login' || pathname === '/signup')
      ) {
        router.push('/dashboard');
      }
    }
  }, [
    isMounted,
    sessionStatus,
    authContextLoading,
    isPublicPath,
    pathname,
    router,
  ]);

  // Don't render until mounted and authentication state is determined
  if (!isMounted || sessionStatus === 'loading' || authContextLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Login page has no shell
  if (pathname === '/login' || pathname === '/signup') {
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
