"use client";

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PaymentType } from '@/types';
import {
  paymentTypesAtom,
  paymentTypesLoadingAtom,
  paymentTypesErrorAtom
} from '@/store/atoms';

export function usePaymentTypesData(organizationId: string | undefined) {
  const [paymentTypes, setPaymentTypes] = useAtom(paymentTypesAtom);
  const [loading, setLoading] = useAtom(paymentTypesLoadingAtom);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      setPaymentTypes([]);
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
  }, [organizationId, setPaymentTypes, setLoading]);

  return {
    paymentTypes,
    loading,
  };
}