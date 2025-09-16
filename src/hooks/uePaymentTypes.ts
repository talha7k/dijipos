"use client";

import { useMemo, useEffect } from 'react';
import { useAtom } from 'jotai';
import { collection } from 'firebase/firestore';
import { useCollectionQuery } from '@tanstack-query-firebase/react/firestore';
import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  // Always call the hook, but conditionally enable it
  const paymentTypesQuery = useCollectionQuery(
    collection(db, 'organizations', organizationId || 'dummy', 'paymentTypes'),
    {
      queryKey: ['paymentTypes', organizationId],
      enabled: !!organizationId,
      subscribed: true, // Enable real-time updates
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
  useEffect(() => {
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