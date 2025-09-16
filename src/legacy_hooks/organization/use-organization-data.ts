import { useState, useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useDocumentQuery } from '@tanstack-query-firebase/react/firestore';
import { db } from '@/lib/firebase';
import { Organization } from '@/types';

export function useOrganizationData(organizationId: string | undefined) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Always call the hook, but conditionally enable it
  const organizationQuery = useDocumentQuery(
    doc(db, 'organizations', organizationId || 'dummy'),
    {
      queryKey: ['organization', organizationId],
      enabled: !!organizationId,
    }
  );

  const organizationData = useMemo(() => {
    if (!organizationQuery.data?.exists()) return null;
    return {
      ...organizationQuery.data.data(),
      id: organizationQuery.data.id,
      createdAt: organizationQuery.data.data().createdAt?.toDate(),
      updatedAt: organizationQuery.data.data().updatedAt?.toDate(),
    } as Organization;
  }, [organizationQuery.data]);

  // Update state
  useMemo(() => {
    setOrganization(organizationData);
    setLoading(organizationQuery.isLoading);
    setError(organizationQuery.error?.message || null);
  }, [organizationData, organizationQuery.isLoading, organizationQuery.error]);

  // Return empty data when no organizationId
  if (!organizationId) {
    return {
      organization: null,
      loading: false,
      error: null,
    };
  }

  return {
    organization,
    loading,
    error,
  };
}