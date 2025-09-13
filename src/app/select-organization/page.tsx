'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { OrganizationManager } from '@/components/OrganizationManager';

export default function SelectOrganizationPage() {
  const { user, userOrganizations, organizationId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Allow access to organization selection page regardless of organization count
    // Users can switch organizations or create new ones from here
  }, [user, userOrganizations, organizationId, router]);

  if (!user) {
    return null;
  }

  return <OrganizationManager />;
}