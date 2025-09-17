'use client';

import { usePathname } from 'next/navigation';
import { useAtomValue } from 'jotai';
import { useAuth } from '@/lib/hooks/useAuth';

import { selectedOrganizationAtom, userOrganizationsAtom } from '@/atoms/organizationAtoms';
import { organizationLoadingAtom } from '@/atoms';
import { sidebarCollapsedAtom } from '@/atoms/uiAtoms';
import { CollapsibleSidebar } from '@/components/sidebar/collapsible-sidebar';
import { OrganizationManager } from '@/components/organization/OrganizationManager';


interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const currentOrganization = useAtomValue(selectedOrganizationAtom);
  const userOrganizations = useAtomValue(userOrganizationsAtom);




  const loading = authLoading;
  const isCollapsed = useAtomValue(sidebarCollapsedAtom);

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
  // Show organization manager when user is authenticated and no organization is selected
  // We need to show it even during organization loading to allow useOrganizationManager to run
  const shouldShowOrganizationSelector = !loading && user && !currentOrganization && !hasStoredOrganization;

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