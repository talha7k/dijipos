'use client';

import { useEffect, useRef } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Organization, OrganizationUser } from '@/types';
import {
  selectedOrganizationAtom,
  userOrganizationsAtom,
  organizationLoadingAtom,
  organizationErrorAtom,
  selectedOrganizationIdAtom,
  organizationUserRoleAtom,
  logoutAtom,
} from '@/atoms';
import { ReactNode } from 'react';
import { autoRepairIndexedDB } from '@/lib/debug-indexeddb';
import { indexedDBStorage } from '@/lib/storage';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [selectedOrganization, setSelectedOrganization] = useAtom(selectedOrganizationAtom);
  const [userOrganizations, setUserOrganizations] = useAtom(userOrganizationsAtom);
  const [organizationLoading, setOrganizationLoading] = useAtom(organizationLoadingAtom);
  const [organizationError, setOrganizationError] = useAtom(organizationErrorAtom);
  const [organizationId, setOrganizationId] = useAtom(selectedOrganizationIdAtom);
  const [organizationUserRole, setOrganizationUserRole] = useAtom(organizationUserRoleAtom);
  const logout = useSetAtom(logoutAtom);
  
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

      try {
        if (user) {

          // Set organizationLoading to true while we fetch organization data
          setOrganizationLoading(true);

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
              // Note: organizationAssociations contains OrganizationUser objects, but userOrganizations expects Organization objects
              // We'll need to fetch the full organization details separately

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
                    setOrganizationUserRole(organizationAssociation);

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
              authProcessingRef.current = false;
              console.log('AuthProvider: Organization loading complete, auth process finished');
            }
          })();

          organizationFetchPromise.catch((error) => {
              console.error('Organization fetch promise failed:', error);
              // Ensure loading states are reset even if promise fails
              setOrganizationLoading(false);
            });
        } else {
          console.log('AuthProvider: No user, clearing state');
          logout();
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setOrganizationError(err instanceof Error ? err.message : 'An unknown error occurred');
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