import { useState, useEffect } from 'react';
import { Organization, OrganizationUser } from '@/types';
import { getOrganization, getOrganizationsForUser } from '../firebase/firestore/organizations';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useAuth } from './useAuth';

interface OrganizationState {
  selectedOrganization: Organization | null;
  userOrganizations: Organization[];
  organizationUsers: OrganizationUser[];
  loading: boolean;
  error: string | null;
}

interface OrganizationActions {
  selectOrganization: (organizationId: string) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
}

/**
 * Hook that manages the currently selected organization, its full details, and related users
 */
export function useOrganization(): OrganizationState & OrganizationActions {
  const { user } = useAuth();
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time organization users for selected organization
  const {
    data: organizationUsers,
    loading: usersLoading,
    error: usersError
  } = useRealtimeCollection<OrganizationUser>(
    'organizationUsers',
    selectedOrganization?.id || null
  );

  // Load user organizations when user changes
  useEffect(() => {
    if (user?.uid) {
      refreshOrganizations();
    } else {
      setUserOrganizations([]);
      setSelectedOrganization(null);
    }
  }, [user?.uid]);

  const selectOrganization = async (organizationId: string) => {
    if (!organizationId) {
      setSelectedOrganization(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const organization = await getOrganization(organizationId);
      if (organization) {
        setSelectedOrganization(organization);
      } else {
        throw new Error('Organization not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select organization');
      console.error('Error selecting organization:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshOrganizations = async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);

    try {
      const organizations = await getOrganizationsForUser(user.uid);
      setUserOrganizations(organizations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organizations');
      console.error('Error loading organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Combine loading states
  const combinedLoading = loading || usersLoading;
  const combinedError = error || usersError;

  return {
    selectedOrganization,
    userOrganizations,
    organizationUsers,
    loading: combinedLoading,
    error: combinedError,
    selectOrganization,
    refreshOrganizations,
  };
}