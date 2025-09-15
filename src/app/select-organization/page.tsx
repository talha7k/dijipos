'use client';

import { useAuthState } from '@/hooks/useAuthState';
import { OrganizationManager } from '@/components/organization/OrganizationManager';

export default function SelectOrganizationPage() {
  const { authLoading: loading } = useAuthState();

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // The routing logic is now handled at the root level (app/page.tsx)
  // This page simply displays the organization selection UI
  return <OrganizationManager />;
}