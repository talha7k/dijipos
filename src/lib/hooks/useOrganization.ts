// lib/hooks/useOrganization.ts
import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import {
  selectedOrganizationIdAtom,
  selectedOrganizationAtom,
  userOrganizationsAtom,
  userOrganizationAssociationsAtom,
  organizationErrorAtom,
  organizationUsersAtom
} from '@/atoms/organizationAtoms';
import { organizationsLoadingAtom, organizationDetailsLoadingAtom, organizationLoadingAtom } from '@/atoms';
import { getOrganization, getOrganizationsForUser, getOrganizationUsers } from '../firebase/firestore/organizations';
import { useAuth } from './useAuth';
import { useRealtimeCollection } from './useRealtimeCollection';
import { OrganizationUser } from '@/types';

/**
 * Helper function to add timeout to promises
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Operation timed out'));
    }, timeoutMs);

    promise.then(
      (result) => {
        clearTimeout(timeoutId);
        resolve(result);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

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
  const [, setOrganizationsLoading] = useAtom(organizationsLoadingAtom);
  const [, setOrganizationDetailsLoading] = useAtom(organizationDetailsLoadingAtom);
  const [, setError] = useAtom(organizationErrorAtom);

  // Get current loading states for the combined state
  const [organizationsLoading] = useAtom(organizationsLoadingAtom);
  const [organizationDetailsLoading] = useAtom(organizationDetailsLoadingAtom);

  // Sync overall loading state
  useEffect(() => {
    setLoading(organizationsLoading || organizationDetailsLoading);
  }, [organizationsLoading, organizationDetailsLoading, setLoading]);

  // Effect to fetch the user's list of organizations when they log in
  useEffect(() => {
    if (!user?.uid) {
      setUserOrganizations([]);
      setSelectedOrgId(null); // Clear selection on logout
      return;
    }


    const fetchUserOrgs = async () => {
      setOrganizationsLoading(true);
      setError(null);
      try {
        // Add timeout to prevent indefinite loading
        const orgs = await withTimeout(getOrganizationsForUser(user.uid), 10000); // 10 second timeout
        setUserOrganizations(orgs);

        // Also fetch organization associations with roles
        const associations = [];
        for (const org of orgs) {
          // Add timeout for each organization user fetch
          const users = await withTimeout(getOrganizationUsers(org.id), 5000); // 5 second timeout
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

        // If no org is selected, select the first one.
        // Only reset selection if selectedOrgId is explicitly null/undefined, not if it's just not in the current list
        if (orgs.length > 0 && !selectedOrgId) {
          setSelectedOrgId(orgs[0].id);
        }
      } catch (err) {
        console.error('Error fetching organizations:', err);
        if (err instanceof Error) {
          if (err.message === 'Operation timed out') {
            setError('Organization loading timed out. Please check your connection and try again.');
          } else {
            setError('Failed to load organizations: ' + err.message);
          }
        } else {
          setError('Failed to load organizations: Unknown error');
        }
      } finally {

        setOrganizationsLoading(false);
      }
    };

    fetchUserOrgs();
  }, [user?.uid, setUserOrganizations, setSelectedOrgId, setError]);

  // Effect to fetch the full details of the selected organization when the ID changes
   useEffect(() => {
     if (!selectedOrgId) {
       console.log('No selectedOrgId');
       setSelectedOrganization(null);
       return;
     }

     console.log('Fetching organization for:', selectedOrgId);

     const fetchOrgDetails = async () => {
      setOrganizationDetailsLoading(true);
      setError(null);
      try {
        // Add timeout to prevent indefinite loading
        const organization = await withTimeout(getOrganization(selectedOrgId), 10000); // 10 second timeout
        console.log('Fetched organization:', organization);
        console.log('Fetched organization:', organization);
        setSelectedOrganization(organization);
      } catch (err) {
        console.error('Error fetching organization details:', err);
        if (err instanceof Error) {
          if (err.message === 'Operation timed out') {
            setError('Organization details loading timed out. Please check your connection and try again.');
          } else {
            setError('Failed to fetch organization details: ' + err.message);
          }
        } else {
          setError('Failed to fetch organization details: Unknown error');
        }
      } finally {

        setOrganizationDetailsLoading(false);
      }
    };

    fetchOrgDetails();
  }, [selectedOrgId, setSelectedOrganization, setError]);

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
        organizationId,
        [],
        null // Disable orderBy to avoid index issues
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