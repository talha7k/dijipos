'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { OrganizationManager } from '@/components/organization/OrganizationManager';
import { Loader } from '@/components/ui/loader';

export default function SelectOrganizationPage() {
  const { loading } = useAuth();

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader size="lg" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // The routing logic is now handled at the root level (app/page.tsx)
  // This page simply displays the organization selection UI
  return <OrganizationManager />;
}