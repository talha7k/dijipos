"use client";

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ReceiptTemplate } from '@/types';

export function useReceiptTemplatesData(organizationId: string | undefined) {
  const [receiptTemplates, setReceiptTemplates] = useState<ReceiptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setReceiptTemplates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const receiptTemplatesQuery = query(
      collection(db, 'organizations', organizationId, 'receiptTemplates')
    );

    const unsubscribe = onSnapshot(
      receiptTemplatesQuery,
      (querySnapshot) => {
        const templates = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as ReceiptTemplate[];
        
        setReceiptTemplates(templates);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching receipt templates:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [organizationId]);

  return { receiptTemplates, loading, error };
}