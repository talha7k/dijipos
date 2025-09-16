"use client";

import { useEffect, useMemo } from 'react';
import { useAtom } from 'jotai';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PaymentType } from '@/types';
import {
  paymentTypesAtom,
  paymentTypesLoadingAtom,
  paymentTypesErrorAtom
} from '@/store/atoms';

// Global singleton to track active listeners
const globalListeners = {
  paymentTypes: null as { unsubscribe: () => void; organizationId: string } | null
};

export function usePaymentTypesData(organizationId: string | undefined) {
  const [paymentTypes, setPaymentTypes] = useAtom(paymentTypesAtom);
  const [loading, setLoading] = useAtom(paymentTypesLoadingAtom);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      setPaymentTypes([]);
      return;
    }

    // Check if we already have a listener for this organization globally
    if (globalListeners.paymentTypes && globalListeners.paymentTypes.organizationId === organizationId) {
      console.log('usePaymentTypesData: Global listener already exists for organization:', organizationId);
      return;
    }

    // Clean up existing listener if organization changed
    if (globalListeners.paymentTypes) {
      console.log('usePaymentTypesData: Cleaning up previous global listener');
      globalListeners.paymentTypes.unsubscribe();
      globalListeners.paymentTypes = null;
    }

    setLoading(true);

    // Fetch payment types with real-time updates
    const paymentTypesQ = query(collection(db, 'organizations', organizationId, 'paymentTypes'));
    console.log('usePaymentTypesData: Setting up global listener for organization:', organizationId);
    
    const unsubscribe = onSnapshot(paymentTypesQ, (querySnapshot) => {
      console.log('usePaymentTypesData: Received snapshot with', querySnapshot.size, 'documents');
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

    // Store the listener reference globally
    globalListeners.paymentTypes = { unsubscribe, organizationId };

    // Return cleanup function
    return () => {
      if (globalListeners.paymentTypes) {
        globalListeners.paymentTypes.unsubscribe();
        globalListeners.paymentTypes = null;
      }
    };
  }, [organizationId, setPaymentTypes, setLoading]);

  // Memoize paymentTypes array to prevent unnecessary re-renders
  const memoizedPaymentTypes = useMemo(() => paymentTypes, [paymentTypes]);

  return {
    paymentTypes: memoizedPaymentTypes,
    loading,
  };
}