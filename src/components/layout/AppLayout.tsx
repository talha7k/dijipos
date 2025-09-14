'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { CollapsibleSidebar } from '@/components/sidebar/collapsible-sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OrganizationManager } from '@/components/OrganizationManager';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { loading, currentOrganization, user, userOrganizations } = useAuth();
  const { isCollapsed } = useSidebar();

  const isPublicRoute = pathname === '/login' || pathname === '/register' || pathname === '/verify-email' || pathname === '/reset-password' || pathname.startsWith('/auth');

  if (isPublicRoute || pathname === '/select-organization') {
    // For public pages and select-organization page, don't show sidebar
    return <>{children}</>;
  }

  // Check if we should show organization selector
  const storedOrganizationId = typeof window !== 'undefined' ? localStorage.getItem('selectedOrganizationId') : null;
  const hasStoredOrganization = storedOrganizationId && userOrganizations.some(ou => ou.organizationId === storedOrganizationId);
  const shouldShowOrganizationSelector = !loading && user && userOrganizations.length > 0 && !currentOrganization && !hasStoredOrganization;

  // For protected pages, check if organization is selected
  return (
    <ProtectedRoute>
      {shouldShowOrganizationSelector ? (
        // Show full-page organization manager when no organization is selected
        <OrganizationManager />
      ) : (
        // Show normal app layout with sidebar when organization is selected or loading
        <div className="flex h-screen bg-background">
          <CollapsibleSidebar />
          <main className={`flex-1 overflow-auto pt-16 md:pt-0 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
            {children}
          </main>
        </div>
      )}
    </ProtectedRoute>
  );
}