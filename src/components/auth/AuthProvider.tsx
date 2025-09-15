'use client';

import { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
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
  
} from '@/store/atoms';
import { ReactNode } from 'react';
import { autoRepairIndexedDB } from '@/lib/debug-indexeddb';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
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

  // Initialize IndexedDB auto-repair on component mount
  useEffect(() => {
    const initializeIndexedDB = async () => {
      try {
        await autoRepairIndexedDB();
      } catch (error) {
        console.error('IndexedDB auto-repair failed:', error);
      }
    };

    initializeIndexedDB();
  }, []);

  // Initialize auth state listener - only once
  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('AuthProvider: Auth state changed, user:', user?.email || 'null');
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
          console.log('AuthProvider: Basic user state set in', Date.now() - startTime, 'ms');

          // Set organizationLoading to true while we fetch organization data
          setOrganizationLoading(true);
          console.log('AuthProvider: Basic auth complete, organizationLoading set to true');

          // Start organization fetch in background
          const organizationFetchPromise = (async () => {
            try {
              console.log('AuthProvider: Starting organization fetch');
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

              console.log('AuthProvider: Organization fetch completed in', Date.now() - orgStartTime, 'ms');
              setUserOrganizations(organizationAssociations);

              // Handle organization selection logic
              const currentOrganizationId = organizationId;

              if (currentOrganizationId && organizationAssociations.some(ou => ou.organizationId === currentOrganizationId)) {
                console.log('AuthProvider: Auto-selecting organization');
                try {
                  const organizationAssociation = organizationAssociations.find(ou => ou.organizationId === currentOrganizationId);
                  if (organizationAssociation) {
                    setOrganizationUser(organizationAssociation);

                    // Fetch organization details from Firebase
                    const organizationDoc = await getDoc(doc(db, 'organizations', currentOrganizationId));
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
                } catch (selectError) {
                  console.error('Organization auto-selection error:', selectError);
                }
              }
            } catch (orgError) {
              console.error('Organization fetch error:', orgError);
              setUserOrganizations([]);
            } finally {
              setOrganizationLoading(false);
              if (authLoading) {
                setAuthLoading(false);
              }
              console.log('AuthProvider: Organization loading complete, auth process finished');
            }
          })();

          organizationFetchPromise.catch(console.error);
        } else {
          console.log('AuthProvider: No user, clearing state');
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
      console.log('AuthProvider: Cleaning up auth state listener');
      unsubscribe();
    };
  }, [authInitialized]); // Only re-run when authInitialized changes

  // Add timeouts to prevent infinite loading
  useEffect(() => {
    const authTimeout = setTimeout(() => {
      if (authLoading) {
        console.warn('AuthProvider: Auth loading timeout reached, forcing loading to false');
        setAuthLoading(false);
        setAuthError('Authentication timeout - please check your internet connection and refresh the page');
      }
    }, 30000);

    return () => clearTimeout(authTimeout);
  }, [authLoading]);

  useEffect(() => {
    const orgTimeout = setTimeout(() => {
      if (organizationLoading) {
        console.warn('AuthProvider: Organization loading timeout reached, forcing organizationLoading to false');
        setOrganizationLoading(false);
        setOrganizationError('Organization loading timeout - please check your connection and try again');
      }
    }, 9000);

    return () => clearTimeout(orgTimeout);
  }, [organizationLoading]);

  return <>{children}</>;
}