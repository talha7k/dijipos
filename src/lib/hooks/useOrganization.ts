import { useEffect } from 'react';
import { useAtom } from 'jotai';
import {
  selectedOrganizationIdAtom,
  selectedOrganizationAtom,
  userOrganizationsAtom,
  organizationUserRoleAtom,
  organizationErrorAtom,
  organizationLoadingAtom
} from '@/atoms';
import { getOrganizationsForUser, getOrganizationUsers } from '../firebase/firestore/organizations';
import { useAuth } from './useAuth';
import { Organization } from '@/types';

/**
 * Helper function to add timeout to promises
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]);
}

/**
 * A hook that manages the organization state for the currently authenticated user.
 * This hook itself does not return state, it manages the global state.
 */
export function useOrganizationManager() {
  const { user } = useAuth();
  const [, setSelectedOrgId] = useAtom(selectedOrganizationIdAtom);
  const [, setSelectedOrganization] = useAtom(selectedOrganizationAtom);
  const [, setUserOrganizations] = useAtom(userOrganizationsAtom);
  const [, setOrganizationUserRole] = useAtom(organizationUserRoleAtom);
  const [, setLoading] = useAtom(organizationLoadingAtom);
  const [, setError] = useAtom(organizationErrorAtom);

  // Main effect to handle user authentication and organization loading
  useEffect(() => {
    console.log('useOrganizationManager: User:', user?.email || 'null');
    
    if (!user?.uid) {
      console.log('useOrganizationManager: No user, clearing organization state');
      setSelectedOrganization(null);
      setUserOrganizations([]);
      setOrganizationUserRole(null);
      setLoading(false);
      return;
    }

    // Always fetch organizations for authenticated users
    const fetchUserOrganizations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('useOrganizationManager: Fetching organizations for user:', user.uid);
        const orgs = await withTimeout(getOrganizationsForUser(user.uid), 10000);
        setUserOrganizations(orgs);
        
        if (orgs.length > 0) {
          console.log('useOrganizationManager: Found organizations, selecting first one:', orgs[0].id);
          setSelectedOrgId(orgs[0].id);
          setSelectedOrganization(orgs[0]);
          
          // Set user role for first organization
          const users = await withTimeout(getOrganizationUsers(orgs[0].id), 5000);
          const userAssociation = users.find(u => u.userId === user.uid);
          setOrganizationUserRole(userAssociation || null);
        } else {
          console.log('useOrganizationManager: No organizations found for user');
        }
        
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setError('Failed to load organizations');
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrganizations();
  }, [user?.uid, user?.email, setSelectedOrganization, setUserOrganizations, setOrganizationUserRole, setSelectedOrgId, setLoading, setError]);

  // TODO: Implement organization list fetching and selection logic
  // For now, this handles the basic case where org is already selected
}

import { createOrganization as createOrg, updateOrganization as updateOrg, deleteOrganization as deleteOrg } from '../firebase/firestore/organizations';
import { SubscriptionStatus } from '@/types';

// Organization actions hook
export function useOrganizationActions() {
  return {
    createOrganization: async (name: string, email: string) => {
      return await createOrg({
        name,
        email,
        subscriptionStatus: SubscriptionStatus.TRIAL, // Default to trial
      });
    },
    updateOrganization: async (id: string, updates: Partial<Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>>) => {
      return await updateOrg(id, updates);
    },
    deleteOrganization: async (id: string) => {
      return await deleteOrg(id);
    },
  };
}

// Real implementation that reads from atoms
export function useOrganization() {
  const [selectedOrganization] = useAtom(selectedOrganizationAtom);
  const [userOrganizations] = useAtom(userOrganizationsAtom);
  const [organizationLoading] = useAtom(organizationLoadingAtom);
  const [organizationError] = useAtom(organizationErrorAtom);
  const [organizationUserRole] = useAtom(organizationUserRoleAtom);
  const [selectedOrgId] = useAtom(selectedOrganizationIdAtom);

  return {
    selectedOrganization,
    userOrganizations,
    organizationLoading,
    organizationError,
    organizationUserRole,
    selectedOrgId,
  };
}