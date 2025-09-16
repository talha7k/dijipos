'use client';

import { useEffect, useRef } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { auth, db } from '@/lib/firebase/config';
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
import { indexedDBStorage } from '@/lib/storage';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useAtom(userAtom); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [authLoading, setAuthLoading] = useAtom(authLoadingAtom);
  const [authError, setAuthError] = useAtom(authErrorAtom); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [authInitialized, setAuthInitialized] = useAtom(authInitializedAtom);
  const [emailVerified, setEmailVerified] = useAtom(emailVerifiedAtom); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [selectedOrganization, setSelectedOrganization] = useAtom(selectedOrganizationAtom); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [organizationUser, setOrganizationUser] = useAtom(organizationUserAtom); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [userOrganizations, setUserOrganizations] = useAtom(userOrganizationsAtom); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [organizationLoading, setOrganizationLoading] = useAtom(organizationLoadingAtom);
  const [organizationError, setOrganizationError] = useAtom(organizationErrorAtom); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [organizationId, setOrganizationId] = useAtom(organizationIdAtom);
  const resetAuthState = useSetAtom(resetAuthStateAtom);
  
  // Flag to prevent multiple simultaneous auth operations
  const authProcessingRef = useRef(false);

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
    console.log('AuthProvider: Firebase auth object:', auth);
    console.log('AuthProvider: Firebase app initialized:', auth.app);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('AuthProvider: Auth state changed, user:', user?.email || 'null');
      console.log('AuthProvider: User object:', user);

      // Prevent multiple simultaneous auth operations
      if (authProcessingRef.current) {
        console.log('AuthProvider: Auth already processing, skipping duplicate call');
        return;
      }

      authProcessingRef.current = true;
      const startTime = Date.now();
      console.log('AuthProvider: Setting authLoading to true');
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
          console.log('AuthProvider: Setting organizationLoading to true');
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
              // Try to get organizationId from storage directly
              let currentOrganizationId = organizationId;
              if (!currentOrganizationId) {
                try {
                  currentOrganizationId = await indexedDBStorage.getItem('dijibill-organization-id');
                } catch (storageError) {
                  console.error('Error reading organizationId from storage:', storageError);
                }
              }

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
                      // Also update the atom to ensure consistency
                      setOrganizationId(currentOrganizationId);
                    } else {
                      // Organization doesn't exist, clear stored ID
                      setOrganizationId(null);
                      await indexedDBStorage.removeItem('dijibill-organization-id');
                    }
                  }
                } catch (selectError) {
                  console.error('Organization auto-selection error:', selectError);
                  // Clear invalid organizationId
                  setOrganizationId(null);
                  await indexedDBStorage.removeItem('dijibill-organization-id');
                }
              } else if (currentOrganizationId && !organizationAssociations.some(ou => ou.organizationId === currentOrganizationId)) {
                // organizationId exists but is not valid for this user, clear it
                console.log('AuthProvider: Clearing invalid organizationId');
                setOrganizationId(null);
                await indexedDBStorage.removeItem('dijibill-organization-id');
              }
            } catch (orgError) {
              console.error('Organization fetch error:', orgError);
              setUserOrganizations([]);
              setOrganizationError(orgError instanceof Error ? orgError.message : 'Failed to load organizations');
            } finally {
              setOrganizationLoading(false);
              console.log('AuthProvider: Setting authLoading to false in finally block');
              setAuthLoading(false);
              authProcessingRef.current = false;
              console.log('AuthProvider: Organization loading complete, auth process finished');
            }
          })();

          organizationFetchPromise.catch((error) => {
              console.error('Organization fetch promise failed:', error);
              // Ensure loading states are reset even if promise fails
              setOrganizationLoading(false);
              if (authLoading) {
                setAuthLoading(false);
              }
            });
        } else {
          console.log('AuthProvider: No user, clearing state');
          resetAuthState();
          setAuthLoading(false);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setAuthError(err instanceof Error ? err.message : 'An unknown error occurred');
        setAuthLoading(false);
        authProcessingRef.current = false;
      }
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth state listener');
      unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps



  // Add timeouts to prevent infinite loading
  useEffect(() => {
    const authTimeout = setTimeout(() => {
      if (authLoading) {
        console.warn('AuthProvider: Auth loading timeout reached, forcing loading to false');
        console.log('AuthProvider: Timeout - Setting authLoading to false and setting error');
        setAuthLoading(false);
        setAuthError('Authentication timeout - please check your internet connection and refresh the page');
      }
    }, 30000);

    return () => clearTimeout(authTimeout);
  }, [authLoading, setAuthError, setAuthLoading]);

  useEffect(() => {
    const orgTimeout = setTimeout(() => {
      if (organizationLoading) {
        console.warn('AuthProvider: Organization loading timeout reached, forcing organizationLoading to false');
        setOrganizationLoading(false);
        setOrganizationError('Organization loading timeout - please check your connection and try again');
      }
    }, 9000);

    return () => clearTimeout(orgTimeout);
  }, [organizationLoading, setOrganizationError, setOrganizationLoading]);

  return <>{children}</>;
}