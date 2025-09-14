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
  organizationId: string | null;
  error: string | null;
  emailVerified: boolean;
  selectOrganization: (organizationId: string) => Promise<void>;
  refreshUserOrganizations: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  organizationUser: null,
  currentOrganization: null,
  userOrganizations: [],
  loading: true,
  organizationId: null,
  error: null,
  emailVerified: false,
  selectOrganization: async () => {},
  refreshUserOrganizations: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organizationUser, setOrganizationUser] = useState<OrganizationUser | null>(null);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('AuthContext: Loading timeout reached, forcing loading to false');
        setLoading(false);
        setError('Authentication timeout - please refresh the page');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

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
        }
      }
    } catch (error) {
      console.error('Error selecting organization:', error);
      setError('Failed to switch organization');
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setError(null);

      try {
        setUser(user);
        if (user) {
          setEmailVerified(user.emailVerified || false);

          // Fetch user's organization associations from Firebase
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

           // Check if there's a previously selected organization in localStorage
           const storedOrganizationId = localStorage.getItem('selectedOrganizationId');
           if (storedOrganizationId && organizationAssociations.some(ou => ou.organizationId === storedOrganizationId)) {
             // Auto-select stored organization
             await selectOrganization(storedOrganizationId);
           } else if (organizationAssociations.length === 1) {
             // Auto-select only available organization
             await selectOrganization(organizationAssociations[0].organizationId);
           }
        } else {
          setOrganizationId(null);
          setOrganizationUser(null);
          setCurrentOrganization(null);
          setUserOrganizations([]);
          setEmailVerified(false);
          // Clear stored organization when user logs out
          localStorage.removeItem('selectedOrganizationId');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Auth state change error:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, organizationUser, currentOrganization, userOrganizations, loading, organizationId, error, emailVerified, selectOrganization, refreshUserOrganizations, logout }}>
      {children}
    </AuthContext.Provider>
  );
};