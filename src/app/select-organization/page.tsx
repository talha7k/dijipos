'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { OrganizationManager } from '@/components/OrganizationManager';

export default function SelectOrganizationPage() {
  const { user, userOrganizations, organizationId, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // If user has organizations and already has an organization selected, 
    // and they manually navigated to this page, allow them to stay
    // to switch organizations
  }, [user, userOrganizations, organizationId, router]);

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

  if (!user) {
    return null;
  }

  return <OrganizationManager />;
}