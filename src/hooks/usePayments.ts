"use client";

import { useMemo } from 'react';
import { useAtom } from 'jotai';
import { collection } from 'firebase/firestore';
import { useCollectionQuery, useAddDocumentMutation } from '@tanstack-query-firebase/react/firestore';
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

  // Always call the hook, but conditionally enable it
  const paymentsQuery = useCollectionQuery(
    collection(db, 'organizations', organizationId || 'dummy', 'payments'),
    {
      queryKey: ['payments', organizationId],
      enabled: !!organizationId,
    }
  );

  const paymentsData = useMemo(() => {
    if (!paymentsQuery.data) return [];
    return paymentsQuery.data.docs.map(doc => {
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
  }, [paymentsQuery.data]);

  // Update atoms
  useMemo(() => {
    setPayments(paymentsData);
    setLoading(paymentsQuery.isLoading);
  }, [paymentsData, paymentsQuery.isLoading, setPayments, setLoading]);

  const paymentsMemo = useMemo(() => payments, [payments]);

  // Return empty data when no organizationId
  if (!organizationId) {
    return {
      payments: [],
      loading: false,
    };
  }

  return {
    payments: paymentsMemo,
    loading,
  };
}

export function usePaymentsActions(organizationId: string | undefined) {
  const addPaymentMutation = useAddDocumentMutation(
    collection(db, 'organizations', organizationId || 'dummy', 'payments')
  );

  const createPayment = async (paymentData: {
    invoiceId: string;
    amount: number;
    paymentDate: Date;
    paymentMethod: string;
    notes?: string;
    reference?: string;
  }) => {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    const payment = {
      organizationId,
      ...paymentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addPaymentMutation.mutateAsync(payment);
    return docRef.id;
  };

  // Return empty function when no organizationId
  if (!organizationId) {
    return {
      createPayment: async () => { throw new Error('Organization ID is required'); },
    };
  }

  return {
    createPayment,
  };
}