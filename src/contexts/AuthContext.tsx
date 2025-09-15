'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { User as AppUser, OrganizationUser, Organization } from '@/types';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  organizationUser: OrganizationUser | null;
  currentOrganization: Organization | null;
  userOrganizations: OrganizationUser[];
  loading: boolean;
  organizationLoading: boolean;
  organizationId: string | null;
  error: string | null;
  emailVerified: boolean;
  selectOrganization: (organizationId: string) => Promise<void>;
  refreshUserOrganizations: () => Promise<void>;
  retryOrganizationLoad: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  organizationUser: null,
  currentOrganization: null,
  userOrganizations: [],
  loading: true,
  organizationLoading: false,
  organizationId: null,
  error: null,
  emailVerified: false,
  selectOrganization: async () => {},
  refreshUserOrganizations: async () => {},
  retryOrganizationLoad: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organizationUser, setOrganizationUser] = useState<OrganizationUser | null>(null);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationLoading, setOrganizationLoading] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);

  // Add timeouts to prevent infinite loading
  useEffect(() => {
    const authTimeout = setTimeout(() => {
      if (loading && !organizationLoading) {
        console.warn('AuthContext: Auth loading timeout reached, forcing loading to false');
        setLoading(false);
        setError('Authentication timeout - please refresh the page');
      }
    }, 12000); // 12 second timeout for auth (increased)

    return () => clearTimeout(authTimeout);
  }, [loading, organizationLoading]);

  useEffect(() => {
    const orgTimeout = setTimeout(() => {
      if (organizationLoading) {
        console.warn('AuthContext: Organization loading timeout reached, forcing organizationLoading to false');
        setOrganizationLoading(false);
        setError('Organization loading timeout - please check your connection and try again');
      }
    }, 15000); // 15 second timeout for organization loading (increased)

    return () => clearTimeout(orgTimeout);
  }, [organizationLoading]);

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

  const selectOrganization = async (selectedOrganizationId: string) => {
    if (!user) return;

    try {
      setOrganizationLoading(true);
      
      // Find the organization user association from current state
      const organizationAssociation = userOrganizations.find(ou => ou.organizationId === selectedOrganizationId);
      if (organizationAssociation) {
        setOrganizationUser(organizationAssociation);
        setOrganizationId(selectedOrganizationId);

        // Persist selected organization to localStorage
        localStorage.setItem('selectedOrganizationId', selectedOrganizationId);

        // Fetch organization details from Firebase
        const organizationDoc = await getDoc(doc(db, 'organizations', selectedOrganizationId));
        if (organizationDoc.exists()) {
          const organizationData = {
            id: organizationDoc.id,
            ...organizationDoc.data(),
            createdAt: organizationDoc.data()?.createdAt?.toDate(),
            updatedAt: organizationDoc.data()?.updatedAt?.toDate(),
          } as Organization;
          setCurrentOrganization(organizationData);
        } else {
          // Organization doesn't exist, clear stored ID
          localStorage.removeItem('selectedOrganizationId');
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

  const retryOrganizationLoad = async () => {
    if (!user) return;
    
    console.log('AuthContext: Retrying organization load');
    setOrganizationLoading(true);
    setError(null);
    
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
      const storedOrganizationId = localStorage.getItem('selectedOrganizationId');
      if (storedOrganizationId && organizationAssociations.some(ou => ou.organizationId === storedOrganizationId)) {
        await selectOrganization(storedOrganizationId);
      }
    } catch (error) {
      console.error('Retry organization load error:', error);
      setError('Failed to load organizations. Please check your connection.');
    } finally {
      setOrganizationLoading(false);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setOrganizationUser(null);
      setCurrentOrganization(null);
      setUserOrganizations([]);
      setOrganizationId(null);
      setEmailVerified(false);
      // Clear stored organization when user logs out
      localStorage.removeItem('selectedOrganizationId');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('AuthContext: Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('AuthContext: Auth state changed, user:', user?.email || 'null');
      const startTime = Date.now();
      setLoading(true);
      setError(null);

      try {
        setUser(user);
        if (user) {
          setEmailVerified(user.emailVerified || false);
          console.log('AuthContext: Basic user state set in', Date.now() - startTime, 'ms');

          // Set loading to false immediately after basic auth is complete
          // But set organizationLoading to true while we fetch organization data
          setLoading(false);
          setOrganizationLoading(true);
          console.log('AuthContext: Basic auth complete, loading set to false, organizationLoading set to true');

          // Start organization fetch in background
          const organizationFetchPromise = (async () => {
            try {
              console.log('AuthContext: Starting organization fetch');
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

              console.log('AuthContext: Organization fetch completed in', Date.now() - orgStartTime, 'ms');
              setUserOrganizations(organizationAssociations);

              // Handle organization selection logic
              const storedOrganizationId = localStorage.getItem('selectedOrganizationId');

              if (storedOrganizationId && organizationAssociations.some(ou => ou.organizationId === storedOrganizationId)) {
                console.log('AuthContext: Auto-selecting organization');
                try {
                  await selectOrganization(storedOrganizationId);
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
              // Instead, let the timeout handle it if needed
            } finally {
              setOrganizationLoading(false);
              console.log('AuthContext: Organization loading complete');
            }
          })();

          // Fire and forget - don't await this
          organizationFetchPromise.catch(console.error);
        } else {
          console.log('AuthContext: No user, clearing state');
          setOrganizationId(null);
          setOrganizationUser(null);
          setCurrentOrganization(null);
          setUserOrganizations([]);
          setEmailVerified(false);
          setOrganizationLoading(false);
          localStorage.removeItem('selectedOrganizationId');
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    });

    return () => {
      console.log('AuthContext: Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, organizationUser, currentOrganization, userOrganizations, loading, organizationLoading, organizationId, error, emailVerified, selectOrganization, refreshUserOrganizations, retryOrganizationLoad, logout }}>
      {children}
    </AuthContext.Provider>
  );
};