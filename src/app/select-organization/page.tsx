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

    // Only auto-redirect if user has exactly one organization
    // This allows users with multiple organizations to access the selection page
    if (userOrganizations.length === 1) {
      router.push('/dashboard');
    }
  }, [user, userOrganizations, organizationId, router]);

  if (!user) {
    return null;
  }

  return <OrganizationManager />;
}