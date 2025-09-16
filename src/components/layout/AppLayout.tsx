'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useOrganization } from '@/lib/hooks/useOrganization';
import { useSidebarState } from '@/legacy_hooks/useSidebarState';
import { CollapsibleSidebar } from '@/components/sidebar/collapsible-sidebar';
import { OrganizationManager } from '@/components/organization/OrganizationManager';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { user, loading: authLoading, initialized } = useAuth();
  const {
    selectedOrganization: currentOrganization,
    userOrganizations,
    loading: organizationLoading
  } = useOrganization();

  const loading = authLoading;
  const { sidebarCollapsed: isCollapsed } = useSidebarState();

  const isPublicRoute = pathname ? (pathname === '/login' || pathname === '/register' || pathname === '/verify-email' || pathname === '/reset-password' || pathname.startsWith('/auth')) : false;

  if (isPublicRoute) {
    // For public pages, don't show sidebar
    return <>{children}</>;
  }

  if (pathname === '/select-organization') {
    // For select-organization page, don't show sidebar
    return <>{children}</>;
  }

  // Check if we should show organization selector
  const storedOrganizationId = typeof window !== 'undefined' ? localStorage.getItem('selectedOrganizationId') : null;
  const hasStoredOrganization = storedOrganizationId && userOrganizations.some((ou) => ou.id === storedOrganizationId);
  const shouldShowOrganizationSelector = !loading && !organizationLoading && user && userOrganizations.length > 0 && !currentOrganization && !hasStoredOrganization;

  // For protected pages, check if organization is selected
  if (shouldShowOrganizationSelector) {
    // Show full-page organization manager when no organization is selected
    return <OrganizationManager />;
  }

  // Show normal app layout with sidebar when organization is selected or loading
  return (
    <div className="flex h-screen bg-background">
      <CollapsibleSidebar />
      <main className={`flex-1 overflow-auto pt-16 md:pt-0 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        {children}
      </main>
    </div>
  );
}