'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { CollapsibleSidebar } from '@/components/sidebar/collapsible-sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OrganizationSelector } from '@/components/OrganizationSelector';
import { OrganizationManager } from '@/components/OrganizationManager';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { loading, currentOrganization } = useAuth();
  const { isCollapsed } = useSidebar();

  const isPublicRoute = pathname === '/login' || pathname === '/register' || pathname === '/verify-email' || pathname === '/reset-password' || pathname.startsWith('/auth');

  if (isPublicRoute) {
    // For public pages, don't show sidebar
    return <>{children}</>;
  }

  // For protected pages, check if organization is selected
  return (
    <ProtectedRoute>
      {!currentOrganization && !loading ? (
        // Show full-page organization manager when no organization is selected
        <OrganizationManager />
      ) : (
        // Show normal app layout with sidebar when organization is selected
        <div className="flex h-screen bg-background">
          <CollapsibleSidebar />
          <main className={`flex-1 overflow-auto pt-16 md:pt-0 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
            {/* Organization Selector */}
            <div className="sticky top-0 z-10 bg-background border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-gray-500" />
                  {currentOrganization ? (
                    <div>
                      <h2 className="font-semibold">{currentOrganization.name}</h2>
                      <p className="text-sm text-gray-600">{currentOrganization.email}</p>
                    </div>
                  ) : (
                    <div>
                      <h2 className="font-semibold">Select Organization</h2>
                      <p className="text-sm text-gray-600">Choose an organization to work with</p>
                    </div>
                  )}
                </div>
                <OrganizationSelector>
                  <Button variant="outline" size="sm">
                    {currentOrganization ? 'Switch Organization' : 'Select Organization'}
                  </Button>
                </OrganizationSelector>
              </div>
            </div>
            {children}
          </main>
        </div>
      )}
    </ProtectedRoute>
  );
}