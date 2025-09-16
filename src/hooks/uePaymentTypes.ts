"use client";

import { useMemo } from 'react';
import { useAtom } from 'jotai';
import { collection } from 'firebase/firestore';
import { useCollectionQuery } from '@tanstack-query-firebase/react/firestore';
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

  // Always call the hook, but conditionally enable it
  const paymentTypesQuery = useCollectionQuery(
    collection(db, 'organizations', organizationId || 'dummy', 'paymentTypes'),
    {
      queryKey: ['paymentTypes', organizationId],
      enabled: !!organizationId,
    }
  );

  const paymentTypesData = useMemo(() => {
    if (!paymentTypesQuery.data) return [];
    return paymentTypesQuery.data.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as PaymentType[];
  }, [paymentTypesQuery.data]);

  // Update atoms
  useMemo(() => {
    setPaymentTypes(paymentTypesData);
    setLoading(paymentTypesQuery.isLoading);
  }, [paymentTypesData, paymentTypesQuery.isLoading, setPaymentTypes, setLoading]);

  // Memoize paymentTypes array to prevent unnecessary re-renders
  const memoizedPaymentTypes = useMemo(() => paymentTypes, [paymentTypes]);

  // Return empty data when no organizationId
  if (!organizationId) {
    return {
      paymentTypes: [],
      loading: false,
    };
  }

  return {
    paymentTypes: memoizedPaymentTypes,
    loading,
  };
}