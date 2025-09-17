// lib/hooks/useOrganization.ts
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import {
  selectedOrganizationIdAtom,
  selectedOrganizationAtom,
  userOrganizationsAtom,
  userOrganizationAssociationsAtom,
  organizationLoadingAtom,
  organizationErrorAtom,
  organizationUsersAtom
} from '@/atoms/organizationAtoms';
import { getOrganization, getOrganizationsForUser, getOrganizationUsers } from '../firebase/firestore/organizations';
import { useAuth } from './useAuth';
import { useRealtimeCollection } from './useRealtimeCollection';
import { OrganizationUser } from '@/types';

/**
 * Hook that orchestrates fetching organization data and syncing it with Jotai atoms.
 * This hook itself does not return state, it manages the global state.
 */
export function useOrganizationManager() {
  const { user } = useAuth();
  const [selectedOrgId, setSelectedOrgId] = useAtom(selectedOrganizationIdAtom);
  const [, setSelectedOrganization] = useAtom(selectedOrganizationAtom);
  const [, setUserOrganizations] = useAtom(userOrganizationsAtom);
  const [, setUserOrganizationAssociations] = useAtom(userOrganizationAssociationsAtom);
  const [, setLoading] = useAtom(organizationLoadingAtom);
  const [, setError] = useAtom(organizationErrorAtom);

  // Effect to fetch the user's list of organizations when they log in
  useEffect(() => {
    if (!user?.uid) {
      setUserOrganizations([]);
      setSelectedOrgId(null); // Clear selection on logout
      return;
    }

    const fetchUserOrgs = async () => {
      setLoading(true);
      setError(null);
      try {
        const orgs = await getOrganizationsForUser(user.uid);
        setUserOrganizations(orgs);

        // Also fetch organization associations with roles
        const associations = [];
        for (const org of orgs) {
          const users = await getOrganizationUsers(org.id);
          const userAssociation = users.find(u => u.userId === user.uid);
          if (userAssociation) {
            associations.push({
              organizationId: org.id,
              role: userAssociation.role,
              isActive: userAssociation.isActive
            });
          }
        }
        setUserOrganizationAssociations(associations);

        // If no org is selected, or the selected one is not in the list, select the first one.
        if (orgs.length > 0 && (!selectedOrgId || !orgs.find(o => o.id === selectedOrgId))) {
          setSelectedOrgId(orgs[0].id);
        }
      } catch (err) {
        setError('Failed to load organizations');
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrgs();
  }, [user?.uid, setUserOrganizations, selectedOrgId, setSelectedOrgId, setLoading, setError]);

  // Effect to fetch the full details of the selected organization when the ID changes
  useEffect(() => {
    if (!selectedOrgId) {
      setSelectedOrganization(null);
      return;
    }

    const fetchOrgDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const organization = await getOrganization(selectedOrgId);
        setSelectedOrganization(organization);
      } catch (err) {
        setError('Failed to fetch organization details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrgDetails();
  }, [selectedOrgId, setSelectedOrganization, setLoading, setError]);

  // Use the real-time hook to listen to users of the selected organization
  // and sync the result directly to its atom.
  useRealtimeUsersSyncer(selectedOrgId);
}

/**
 * A helper hook to keep the real-time user list synced to the organizationUsersAtom
 */
function useRealtimeUsersSyncer(organizationId: string | null) {
    const [, setOrganizationUsers] = useAtom(organizationUsersAtom);
    const { data: users, loading, error } = useRealtimeCollection<OrganizationUser>(
        'organizationUsers',
        organizationId
    );

    useEffect(() => {
        setOrganizationUsers(users);
    }, [users, setOrganizationUsers]);

    // Optionally, you could also sync loading/error states to dedicated atoms here.
}

/**
 * Hook to get the selected organization
 */
export function useOrganization() {
  const selectedOrganization = useAtom(selectedOrganizationAtom)[0];
  return { selectedOrganization };
}