'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User as AppUser, TenantUser, Tenant } from '@/types';

interface AuthContextType {
  user: User | null;
  tenantUser: TenantUser | null;
  currentTenant: Tenant | null;
  userTenants: TenantUser[];
  loading: boolean;
  tenantId: string | null;
  error: string | null;
  emailVerified: boolean;
  selectTenant: (tenantId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  tenantUser: null,
  currentTenant: null,
  userTenants: [],
  loading: true,
  tenantId: null,
  error: null,
  emailVerified: false,
  selectTenant: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenantUser, setTenantUser] = useState<TenantUser | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [userTenants, setUserTenants] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);

  const selectTenant = async (selectedTenantId: string) => {
    if (!user) return;
    
    try {
      // Find the tenant user association
      const tenantAssociation = userTenants.find(tu => tu.tenantId === selectedTenantId);
      if (tenantAssociation) {
        setTenantUser(tenantAssociation);
        setTenantId(selectedTenantId);
        
        // Fetch tenant details
        const response = await fetch(`/api/tenants/${selectedTenantId}`);
        if (response.ok) {
          const tenantData = await response.json();
          setCurrentTenant(tenantData);
        }
      }
    } catch (error) {
      console.error('Error selecting tenant:', error);
      setError('Failed to switch tenant');
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
          
          // Fetch user's tenant associations
          const response = await fetch(`/api/user-tenants/${user.uid}`);
          if (response.ok) {
            const tenantAssociations = await response.json();
            setUserTenants(tenantAssociations);
            
            // Auto-select first tenant if available
            if (tenantAssociations.length > 0 && !tenantId) {
              await selectTenant(tenantAssociations[0].tenantId);
            }
          }
        } else {
          setTenantId(null);
          setTenantUser(null);
          setCurrentTenant(null);
          setUserTenants([]);
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
    <AuthContext.Provider value={{ user, tenantUser, currentTenant, userTenants, loading, tenantId, error, emailVerified, selectTenant }}>
      {children}
    </AuthContext.Provider>
  );
};