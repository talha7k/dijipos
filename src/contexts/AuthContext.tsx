'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User as AppUser, OrganizationUser, Organization } from '@/types';

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

  const selectOrganization = async (selectedOrganizationId: string) => {
    if (!user) return;
    
    try {
      // Find the organization user association
      const organizationAssociation = userOrganizations.find(ou => ou.organizationId === selectedOrganizationId);
      if (organizationAssociation) {
        setOrganizationUser(organizationAssociation);
        setOrganizationId(selectedOrganizationId);
        
        // Fetch organization details
        const response = await fetch(`/api/organizations/${selectedOrganizationId}`);
        if (response.ok) {
          const organizationData = await response.json();
          setCurrentOrganization(organizationData);
        }
      }
    } catch (error) {
      console.error('Error selecting organization:', error);
      setError('Failed to switch organization');
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
          
          // Fetch user's organization associations
          const response = await fetch(`/api/user-organizations/${user.uid}`);
          if (response.ok) {
            const organizationAssociations = await response.json();
            setUserOrganizations(organizationAssociations);
            
            // Auto-select first organization if available
            if (organizationAssociations.length > 0 && !organizationId) {
              await selectOrganization(organizationAssociations[0].organizationId);
            }
          }
        } else {
          setOrganizationId(null);
          setOrganizationUser(null);
          setCurrentOrganization(null);
          setUserOrganizations([]);
          setEmailVerified(false);
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
    <AuthContext.Provider value={{ user, organizationUser, currentOrganization, userOrganizations, loading, organizationId, error, emailVerified, selectOrganization }}>
      {children}
    </AuthContext.Provider>
  );
};