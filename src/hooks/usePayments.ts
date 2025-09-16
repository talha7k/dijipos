"use client";

import { useEffect, useMemo } from 'react';
import { useAtom } from 'jotai';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Payment } from '@/types';
import {
  invoicePaymentsAtom,
  invoicePaymentsLoadingAtom,
  invoicePaymentsErrorAtom
} from '@/store/atoms';

// Global singleton to prevent duplicate listeners
const globalPaymentListeners = new Map<string, {
  unsubscribe: () => void;
  refCount: number;
}>();

export function usePaymentsData(organizationId: string | undefined) {
  const [payments, setPayments] = useAtom(invoicePaymentsAtom);
  const [loading, setLoading] = useAtom(invoicePaymentsLoadingAtom);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    const listenerKey = `payments-${organizationId}`;
    
    // Check if listener already exists
    if (globalPaymentListeners.has(listenerKey)) {
      const existing = globalPaymentListeners.get(listenerKey)!;
      existing.refCount++;
      setLoading(false);
      return () => {
        existing.refCount--;
        if (existing.refCount <= 0) {
          existing.unsubscribe();
          globalPaymentListeners.delete(listenerKey);
        }
      };
    }

    // Create new listener
    setLoading(true);
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

    // Store in global singleton
    globalPaymentListeners.set(listenerKey, {
      unsubscribe,
      refCount: 1
    });

    // Return cleanup function
    return () => {
      const listener = globalPaymentListeners.get(listenerKey);
      if (listener) {
        listener.refCount--;
        if (listener.refCount <= 0) {
          listener.unsubscribe();
          globalPaymentListeners.delete(listenerKey);
        }
      }
    };
  }, [organizationId]);

  const paymentsMemo = useMemo(() => payments, [payments]);

  return {
    payments: paymentsMemo,
    loading,
  };
}

export function usePaymentsActions(organizationId: string | undefined) {
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

    const { addDoc, collection } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase');

    const payment = {
      organizationId,
      ...paymentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, 'organizations', organizationId, 'payments'), payment);
    return docRef.id;
  };

  return {
    createPayment,
  };
}