'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CollapsibleSidebar } from '@/components/sidebar/collapsible-sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { loading } = useAuth();

  const isPublicRoute = pathname === '/login' || pathname === '/register' || pathname === '/verify-email' || pathname === '/reset-password' || pathname.startsWith('/auth');

  if (isPublicRoute) {
    // For public pages, don't show sidebar
    return <>{children}</>;
  }

  // For protected pages, show sidebar
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <CollapsibleSidebar />
        <main className="flex-1 md:ml-16 lg:ml-64 overflow-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}