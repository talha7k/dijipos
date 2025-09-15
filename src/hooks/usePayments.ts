"use client";

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Payment } from '@/types';
import {
  invoicePaymentsAtom,
  invoicePaymentsLoadingAtom,
  invoicePaymentsErrorAtom
} from '@/store/atoms';

export function usePaymentsData(organizationId: string | undefined) {
  const [payments, setPayments] = useAtom(invoicePaymentsAtom);
  const [loading, setLoading] = useAtom(invoicePaymentsLoadingAtom);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    // Fetch payments with real-time updates
    const paymentsQ = query(collection(db, 'organizations', organizationId, 'payments'));
    const unsubscribe = onSnapshot(paymentsQ, (querySnapshot) => {
      const paymentsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          organizationId: data.organizationId || '',
          invoiceId: data.invoiceId || '',
          amount: data.amount || 0,
          paymentDate: data.paymentDate?.toDate() || new Date(),
          paymentMethod: data.paymentMethod || '',
          reference: data.reference,
          notes: data.notes,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Payment;
      });
      setPayments(paymentsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching payments:', error);
      setLoading(false);
    });

    // Return cleanup function
    return () => unsubscribe();
  }, [organizationId]);

  return {
    payments,
    loading,
  };
}