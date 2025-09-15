import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
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
  const [authInitialized, setAuthInitialized] = useAtom(authInitializedAtom);
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

  // Initialize auth state listener
  useEffect(() => {
    console.log('useAuthState: Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('useAuthState: Auth state changed, user:', user?.email || 'null');
      const startTime = Date.now();
      setAuthLoading(true);
      setAuthError(null);
      
      // Mark auth as initialized on first call
      if (!authInitialized) {
        setAuthInitialized(true);
      }

      try {
        setUser(user);
        if (user) {
          setEmailVerified(user.emailVerified || false);
          console.log('useAuthState: Basic user state set in', Date.now() - startTime, 'ms');

          // Note: OrganizationId is now persisted automatically via IndexedDB

          // Set organizationLoading to true while we fetch organization data
          setOrganizationLoading(true);
          console.log('useAuthState: Basic auth complete, organizationLoading set to true');

          // Start organization fetch in background
          const organizationFetchPromise = (async () => {
            try {
              console.log('useAuthState: Starting organization fetch');
              const orgStartTime = Date.now();
              
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

              console.log('useAuthState: Organization fetch completed in', Date.now() - orgStartTime, 'ms');
              setUserOrganizations(organizationAssociations);

              // Handle organization selection logic
              const currentOrganizationId = await organizationId;

              if (currentOrganizationId && organizationAssociations.some(ou => ou.organizationId === currentOrganizationId)) {
                console.log('useAuthState: Auto-selecting organization');
                try {
await selectOrganization(currentOrganizationId);
                } catch (selectError) {
                  console.error('Organization auto-selection error:', selectError);
                  // Don't fail the entire process if auto-selection fails
                  // User can manually select organization later
                }
              }
            } catch (orgError) {
              console.error('Organization fetch error:', orgError);
              // Don't fail the entire auth process for organization errors
              setUserOrganizations([]);
              // Don't set error state here as it will break the auth flow
            } finally {
              setOrganizationLoading(false);
              setAuthLoading(false);
              console.log('useAuthState: Organization loading complete, auth process finished');
            }
          })();

          // Fire and forget - don't await this
          organizationFetchPromise.catch(console.error);
        } else {
          console.log('useAuthState: No user, clearing state');
          resetAuthState();
          setAuthLoading(false);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setAuthError(err instanceof Error ? err.message : 'An unknown error occurred');
        setAuthLoading(false);
      }
    });

    return () => {
      console.log('useAuthState: Cleaning up auth state listener');
      unsubscribe();
    };
  }, [authInitialized, resetAuthState, setOrganizationId]);

  // Add timeouts to prevent infinite loading
  useEffect(() => {
    const authTimeout = setTimeout(() => {
      if (authLoading && !organizationLoading) {
        console.warn('useAuthState: Auth loading timeout reached, forcing loading to false');
        setAuthLoading(false);
        setAuthError('Authentication timeout - please check your internet connection and refresh the page');
      }
    }, 30000); // 30 second timeout for auth

    return () => clearTimeout(authTimeout);
  }, [authLoading, organizationLoading]);

  useEffect(() => {
    const orgTimeout = setTimeout(() => {
      if (organizationLoading) {
        console.warn('useAuthState: Organization loading timeout reached, forcing organizationLoading to false');
        setOrganizationLoading(false);
        setOrganizationError('Organization loading timeout - please check your connection and try again');
      }
    }, 9000); // 9 second timeout for organization loading

    return () => clearTimeout(orgTimeout);
  }, [organizationLoading]);

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
      const currentOrganizationId = await organizationId;
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