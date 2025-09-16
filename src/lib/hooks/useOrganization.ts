import { useState, useEffect } from 'react';
import { Organization, OrganizationUser } from '@/types';
import { getOrganization, getOrganizationUsers, getOrganizationsForUser } from '../firebase/firestore/organizations';
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
  refreshOrganizationUsers: () => Promise<void>;
}

/**
 * Hook that manages the currently selected organization, its full details, and related users
 */
export function useOrganization(): OrganizationState & OrganizationActions {
  const { user } = useAuth();
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>([]);
  const [organizationUsers, setOrganizationUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user organizations when user changes
  useEffect(() => {
    if (user?.uid) {
      refreshOrganizations();
    } else {
      setUserOrganizations([]);
      setSelectedOrganization(null);
      setOrganizationUsers([]);
    }
  }, [user?.uid]);

  // Load organization users when selected organization changes
  useEffect(() => {
    if (selectedOrganization?.id) {
      refreshOrganizationUsers();
    } else {
      setOrganizationUsers([]);
    }
  }, [selectedOrganization?.id]);

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

  const refreshOrganizationUsers = async () => {
    if (!selectedOrganization?.id) return;

    try {
      const users = await getOrganizationUsers(selectedOrganization.id);
      setOrganizationUsers(users);
    } catch (err) {
      console.error('Error loading organization users:', err);
      // Don't set error state for this as it's not critical
    }
  };

  return {
    selectedOrganization,
    userOrganizations,
    organizationUsers,
    loading,
    error,
    selectOrganization,
    refreshOrganizations,
    refreshOrganizationUsers,
  };
}