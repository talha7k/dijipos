// lib/hooks/useOrganization.ts
import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import {
  selectedOrganizationIdAtom,
  selectedOrganizationAtom,
  userOrganizationsAtom,
  userOrganizationAssociationsAtom,
  organizationUserRoleAtom,
  organizationErrorAtom,
  organizationUsersAtom
} from '@/atoms';
import { organizationsLoadingAtom, organizationDetailsLoadingAtom, organizationLoadingAtom } from '@/atoms';
import { getOrganization, getOrganizationsForUser, getOrganizationUsers } from '../firebase/firestore/organizations';
import { useAuth } from './useAuth';
import { useRealtimeCollection } from './useRealtimeCollection';
import { OrganizationUser } from '@/types';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

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
  const [previousUserId, setPreviousUserId] = useState<string | null>(null);
  const [, setSelectedOrganization] = useAtom(selectedOrganizationAtom);
  const [, setUserOrganizations] = useAtom(userOrganizationsAtom);
  const [, setUserOrganizationAssociations] = useAtom(userOrganizationAssociationsAtom);
  const [, setOrganizationUserRole] = useAtom(organizationUserRoleAtom);
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
    const currentUserId = user?.uid || null;
    console.log('useOrganizationManager: Effect running with user?.uid:', currentUserId, 'previousUserId:', previousUserId, 'selectedOrgId:', selectedOrgId);

    // Only clear organization state if user actually logged out (was authenticated, now not)
    if (!currentUserId && previousUserId) {
      console.log('useOrganizationManager: User logged out, clearing organization state');
      setUserOrganizations([]);
      console.log('useOrganizationManager: Setting selectedOrgId to null due to logout');
      setSelectedOrgId(null); // Clear selection on logout
      setPreviousUserId(null);
      return;
    }

    // Update previous user ID
    setPreviousUserId(currentUserId);

    if (!currentUserId) {
      // User not authenticated, don't fetch organizations
      return;
    }

    console.log('useOrganizationManager: User authenticated, fetching organizations for:', currentUserId);

    const fetchUserOrgs = async () => {
      setOrganizationsLoading(true);
      setError(null);
      try {
        // Add timeout to prevent indefinite loading
        const orgs = await withTimeout(getOrganizationsForUser(currentUserId), 10000); // 10 second timeout
        setUserOrganizations(orgs);

        // Also fetch organization associations with roles
        const associations = [];
        for (const org of orgs) {
          // Add timeout for each organization user fetch
          const users = await withTimeout(getOrganizationUsers(org.id), 5000); // 5 second timeout
          const userAssociation = users.find(u => u.userId === currentUserId);
          if (userAssociation) {
            associations.push({
              organizationId: org.id,
              role: userAssociation.role,
              isActive: userAssociation.isActive
            });
            
            // If this is the currently selected organization, set the user role
            if (org.id === selectedOrgId) {
              setOrganizationUserRole(userAssociation);
            }
          }
        }
        setUserOrganizationAssociations(associations);

        // If no org is selected, or if the selected org is not in the user's orgs, select the first one
        const selectedOrgExists = orgs.some(org => org.id === selectedOrgId);
        if (orgs.length > 0 && (!selectedOrgId || !selectedOrgExists)) {
          setSelectedOrgId(orgs[0].id);
        } else if (orgs.length === 0) {
          // No organizations, clear selection
          setSelectedOrgId(null);
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
  }, [user?.uid, setUserOrganizations, setSelectedOrgId, setError, setOrganizationsLoading, setUserOrganizationAssociations]);

  // Effect to fetch the full details of the selected organization when the ID changes
  useEffect(() => {
    console.log('useOrganizationManager: selectedOrgId changed to:', selectedOrgId);
    if (!selectedOrgId) {
      console.log('No selectedOrgId - clearing organization state');
      setSelectedOrganization(null);
      setOrganizationUserRole(null);
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

        // Also fetch and set the user's role for this organization
        if (user?.uid) {
          const users = await withTimeout(getOrganizationUsers(selectedOrgId), 5000); // 5 second timeout
          const userRole = users.find(u => u.userId === user.uid);
          setOrganizationUserRole(userRole || null);
          console.log('Set user role:', userRole);
        }
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
         // Clear the selected organization ID if we can't fetch the organization
         setSelectedOrgId(null);
       } finally {
         setOrganizationDetailsLoading(false);
       }
    };

    fetchOrgDetails();
   }, [selectedOrgId, setSelectedOrganization, setOrganizationUserRole, setError, setOrganizationDetailsLoading, user?.uid, setSelectedOrgId]);

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

/**
 * Hook for organization management operations (create, join, switch)
 */
export function useOrganizationActions() {
  const { user } = useAuth();
  const [, setSelectedOrganizationId] = useAtom(selectedOrganizationIdAtom);
  const [, setUserOrganizations] = useAtom(userOrganizationsAtom);
  const [, setUserOrganizationAssociations] = useAtom(userOrganizationAssociationsAtom);
  const [, setError] = useAtom(organizationErrorAtom);

  const selectOrganization = async (organizationId: string) => {
    console.log('Selecting organization:', organizationId);
    setSelectedOrganizationId(organizationId);
  };

  const refreshOrganizations = async () => {
    if (!user?.uid) return;
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
    } catch (error) {
      console.error('Error refreshing organizations:', error);
      setError('Failed to refresh organizations');
    }
  };

  const joinOrganization = async (invitationCode: string) => {
    if (!invitationCode || !user) {
      throw new Error('Invalid invitation code or user not authenticated');
    }

    try {
      // Find the invitation code
      const codesQuery = query(
        collection(db, 'invitationCodes'),
        where('code', '==', invitationCode.toUpperCase()),
        where('isUsed', '==', false)
      );
      const codesSnapshot = await getDocs(codesQuery);

      if (codesSnapshot.empty) {
        throw new Error('Invalid or expired invitation code');
      }

      const invitationCodeData = codesSnapshot.docs[0].data();
      const codeId = codesSnapshot.docs[0].id;

      // Check if code is expired
      if (invitationCodeData.expiresAt.toDate() < new Date()) {
        throw new Error('Invitation code has expired');
      }

      // Check if user is already a member
      const existingMembershipQuery = query(
        collection(db, 'organizationUsers'),
        where('userId', '==', user.uid),
        where('organizationId', '==', invitationCodeData.organizationId)
      );
      const existingMembershipSnapshot = await getDocs(existingMembershipQuery);

      if (!existingMembershipSnapshot.empty) {
        throw new Error('You are already a member of this organization');
      }

      // Add user to organization
      await addDoc(collection(db, 'organizationUsers'), {
        userId: user.uid,
        organizationId: invitationCodeData.organizationId,
        role: invitationCodeData.role,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Mark invitation code as used
      const codeDocRef = doc(db, 'invitationCodes', codeId);
      await updateDoc(codeDocRef, {
        isUsed: true,
        usedBy: user.uid,
        usedAt: serverTimestamp(),
      });

      // Refresh organizations and switch to the new one
      await refreshOrganizations();
      await selectOrganization(invitationCodeData.organizationId);

      return { success: true, organizationId: invitationCodeData.organizationId };
    } catch (error) {
      console.error('Error joining organization:', error);
      throw error;
    }
  };

  const createOrganization = async (name: string, email: string) => {
    if (!name || !email || !user) {
      throw new Error('Organization name, email, and user authentication required');
    }

    try {
      // Create new organization
      const organizationRef = await addDoc(collection(db, 'organizations'), {
        name,
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        subscriptionStatus: 'trial',
      });

      // Add creator as admin
      await addDoc(collection(db, 'organizationUsers'), {
        userId: user.uid,
        organizationId: organizationRef.id,
        role: 'admin',
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Refresh organizations and switch to the new one
      await refreshOrganizations();
      await selectOrganization(organizationRef.id);

      return { success: true, organizationId: organizationRef.id };
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  };

  return {
    selectOrganization,
    refreshOrganizations,
    joinOrganization,
    createOrganization,
  };
}