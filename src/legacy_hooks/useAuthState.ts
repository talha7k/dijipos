import { useMemo } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useDocumentQuery } from '@tanstack-query-firebase/react/firestore';
import { Organization, OrganizationUser } from '@/types';
import {
  userAtom,
  authLoadingAtom,
  authErrorAtom,
  authInitializedAtom,
  emailVerifiedAtom,
  selectedOrganizationAtom,
  organizationUserAtom,
  userOrganizationsAtom,
  organizationLoadingAtom,
  organizationErrorAtom,
  organizationIdAtom,
  resetAuthStateAtom,
  isAuthenticatedAtom,
  hasOrganizationAtom,
  hasOrganizationsAtom
} from '@/store/atoms';

export function useAuthState() {
  const [user, setUser] = useAtom(userAtom);
  const [authLoading, setAuthLoading] = useAtom(authLoadingAtom);
  const [authError, setAuthError] = useAtom(authErrorAtom);
  const [authInitialized] = useAtom(authInitializedAtom);
  const [emailVerified, setEmailVerified] = useAtom(emailVerifiedAtom);
  const [selectedOrganization, setSelectedOrganization] = useAtom(selectedOrganizationAtom);
  const [organizationUser, setOrganizationUser] = useAtom(organizationUserAtom);
  const [userOrganizations, setUserOrganizations] = useAtom(userOrganizationsAtom);
  const [organizationLoading, setOrganizationLoading] = useAtom(organizationLoadingAtom);
  const [organizationError, setOrganizationError] = useAtom(organizationErrorAtom);
  const [organizationId, setOrganizationId] = useAtom(organizationIdAtom);
  const resetAuthState = useSetAtom(resetAuthStateAtom);

  // Read-only derived values
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const hasOrganization = useAtomValue(hasOrganizationAtom);
  const hasOrganizations = useAtomValue(hasOrganizationsAtom);

  const selectOrganization = async (selectedOrganizationId: string) => {
    if (!user) return;

    try {
      setOrganizationLoading(true);
      
      // Find the organization user association from current state
      const organizationAssociation = userOrganizations.find(ou => ou.organizationId === selectedOrganizationId);
      if (organizationAssociation) {
        setOrganizationUser(organizationAssociation);
        setOrganizationId(selectedOrganizationId);

        // Fetch organization details from Firebase
        const organizationDoc = await getDoc(doc(db, 'organizations', selectedOrganizationId));
        if (organizationDoc.exists()) {
          const organizationData = {
            id: organizationDoc.id,
            ...organizationDoc.data(),
            createdAt: organizationDoc.data()?.createdAt?.toDate(),
            updatedAt: organizationDoc.data()?.updatedAt?.toDate(),
          } as Organization;
          setSelectedOrganization(organizationData);
        } else {
          // Organization doesn't exist, clear stored ID
          setOrganizationId(null);
        }
      }
    } catch (error) {
      console.error('Error selecting organization:', error);
      // Don't set error state here as it might break the auth flow
      // Instead, just log the error and let the user try again
    } finally {
      setOrganizationLoading(false);
    }
  };

  const refreshUserOrganizations = async () => {
    if (!user) return;
    
    try {
      const organizationUsersQuery = query(
        collection(db, 'organizationUsers'),
        where('userId', '==', user.uid),
        where('isActive', '==', true)
      );
      const organizationUsersSnapshot = await getDocs(organizationUsersQuery);
      const organizationAssociations = organizationUsersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as OrganizationUser[];
      
      setUserOrganizations(organizationAssociations);
    } catch (error) {
      console.error('Error refreshing user organizations:', error);
    }
  };

  const retryOrganizationLoad = async () => {
    if (!user) return;
    
    console.log('useAuthState: Retrying organization load');
    setOrganizationLoading(true);
    setOrganizationError(null);
    
    try {
      const organizationUsersQuery = query(
        collection(db, 'organizationUsers'),
        where('userId', '==', user.uid),
        where('isActive', '==', true)
      );
      const organizationUsersSnapshot = await getDocs(organizationUsersQuery);
      const organizationAssociations = organizationUsersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as OrganizationUser[];

      setUserOrganizations(organizationAssociations);

      // Try to auto-select organization if one was stored
      const currentOrganizationId = organizationId;
      if (currentOrganizationId && organizationAssociations.some(ou => ou.organizationId === currentOrganizationId)) {
        await selectOrganization(currentOrganizationId);
      }
    } catch (error) {
      console.error('Retry organization load error:', error);
      setOrganizationError('Failed to load organizations. Please check your connection.');
    } finally {
      setOrganizationLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { auth } = await import('@/lib/firebase');
      await auth.signOut();
      resetAuthState();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    // State
    user,
    authLoading,
    authError,
    authInitialized,
    emailVerified,
    selectedOrganization,
    organizationUser,
    userOrganizations,
    organizationLoading,
    organizationError,
    organizationId,

    // Derived state
    isAuthenticated,
    hasOrganization,
    hasOrganizations,

    // Actions
    setUser,
    setAuthLoading,
    setAuthError,
    setEmailVerified,
    setSelectedOrganization,
    setOrganizationUser,
    setUserOrganizations,
    setOrganizationLoading,
    setOrganizationError,
    setOrganizationId,
    selectOrganization,
    refreshUserOrganizations,
    retryOrganizationLoad,
    logout,
    resetAuthState,
  };
}

// Read-only hooks for optimization
export function useUser() {
  return useAtomValue(userAtom);
}

export function useIsAuthenticated() {
  return useAtomValue(isAuthenticatedAtom);
}

export function useSelectedOrganization() {
  return useAtomValue(selectedOrganizationAtom);
}

export function useUserOrganizations() {
  return useAtomValue(userOrganizationsAtom);
}

export function useAuthLoading() {
  return useAtomValue(authLoadingAtom);
}

export function useOrganizationLoading() {
  return useAtomValue(organizationLoadingAtom);
}

export function useOrganizationId() {
  return useAtomValue(organizationIdAtom);
}

export function useEmailVerified() {
  return useAtomValue(emailVerifiedAtom);
}