import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InvitationCode } from '@/types';

export function useInvitationCodesData(organizationId: string | undefined) {
  const [invitationCodes, setInvitationCodes] = useState<InvitationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setInvitationCodes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const invitationCodesQuery = query(
      collection(db, 'invitationCodes'),
      where('organizationId', '==', organizationId),
      where('isUsed', '==', false)
    );

    const unsubscribe = onSnapshot(
      invitationCodesQuery,
      (querySnapshot) => {
        const codes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          expiresAt: doc.data().expiresAt?.toDate(),
        })) as InvitationCode[];
        
        setInvitationCodes(codes);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching invitation codes:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [organizationId]);

  return { invitationCodes, loading, error };
}