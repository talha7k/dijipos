import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { OrganizationUser } from '@/types';

export function useOrganizationUsersData(organizationId: string | undefined) {
  const [organizationUsers, setOrganizationUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setOrganizationUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const organizationUsersQuery = query(
      collection(db, 'organizationUsers'),
      where('organizationId', '==', organizationId)
    );

    const unsubscribe = onSnapshot(
      organizationUsersQuery,
      (querySnapshot) => {
        const users = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as OrganizationUser[];
        
        setOrganizationUsers(users);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching organization users:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [organizationId]);

  return { organizationUsers, loading, error };
}