import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PaymentType } from '@/types';

export function usePaymentTypesData(organizationId: string | undefined) {
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    // Fetch payment types with real-time updates
    const paymentTypesQ = query(collection(db, 'organizations', organizationId, 'paymentTypes'));
    const unsubscribe = onSnapshot(paymentTypesQ, (querySnapshot) => {
      const paymentTypesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as PaymentType[];
      setPaymentTypes(paymentTypesData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching payment types:', error);
      setLoading(false);
    });

    // Return cleanup function
    return () => unsubscribe();
  }, [organizationId]);

  return {
    paymentTypes,
    loading,
  };
}