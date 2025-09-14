'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { OrderType } from '@/types';

interface UseOrderTypesDataResult {
  orderTypes: OrderType[];
  loading: boolean;
  error: Error | null;
}

export function useOrderTypesData(organizationId: string | undefined): UseOrderTypesDataResult {
  const [orderTypes, setOrderTypes] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setOrderTypes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const orderTypesQuery = query(
      collection(db, 'organizations', organizationId, 'orderTypes')
    );

    const unsubscribe = onSnapshot(
      orderTypesQuery,
      (querySnapshot) => {
        const orderTypesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as OrderType[];
        setOrderTypes(orderTypesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching order types:', error);
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [organizationId]);

  return { orderTypes, loading, error };
}