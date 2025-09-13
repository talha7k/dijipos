import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Organization } from '@/types';

export function useOrganizationData(organizationId: string | undefined) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setOrganization(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const organizationDoc = doc(db, 'organizations', organizationId);

    const unsubscribe = onSnapshot(
      organizationDoc,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const org = {
            ...docSnapshot.data(),
            id: docSnapshot.id,
            createdAt: docSnapshot.data().createdAt?.toDate(),
            updatedAt: docSnapshot.data().updatedAt?.toDate(),
          } as Organization;
          
          setOrganization(org);
        } else {
          setOrganization(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching organization:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [organizationId]);

  return { organization, loading, error };
}