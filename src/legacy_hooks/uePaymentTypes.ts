"use client";

import { useCallback, useMemo } from 'react';
import { collection, doc } from 'firebase/firestore';
import { useCollectionQuery, useUpdateDocumentMutation, useAddDocumentMutation, useDeleteDocumentMutation } from '@tanstack-query-firebase/react/firestore';
import { db } from '@/lib/firebase/config';
import { PaymentType } from '@/types';

export interface UsePaymentTypesResult {
  paymentTypes: PaymentType[];
  loading: boolean;
  error: string | null;
  
  // CRUD operations
  createPaymentType: (paymentTypeData: Omit<PaymentType, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updatePaymentType: (paymentTypeId: string, updates: Partial<PaymentType>) => Promise<void>;
  deletePaymentType: (paymentTypeId: string) => Promise<void>;
  
  // Utility functions
  refreshPaymentTypes: () => void;
}

export function usePaymentTypes(organizationId: string | undefined): UsePaymentTypesResult {
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

  const addPaymentTypeMutation = useAddDocumentMutation(
    collection(db, 'organizations', organizationId || 'dummy', 'paymentTypes')
  );
  
  const updatePaymentTypeMutation = useUpdateDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'paymentTypes', 'dummy')
  );
  
  const deletePaymentTypeMutation = useDeleteDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'paymentTypes', 'dummy')
  );

  // CRUD operations
  const createPaymentType = useCallback(async (paymentTypeData: Omit<PaymentType, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!organizationId) throw new Error('Organization ID is required');

    try {
      const cleanedData = {
        ...paymentTypeData,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addPaymentTypeMutation.mutateAsync(cleanedData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating payment type:', error);
      throw error;
    }
  }, [organizationId]);

  const updatePaymentType = useCallback(async (paymentTypeId: string, updates: Partial<PaymentType>): Promise<void> => {
    if (!organizationId) return;

    try {
      const paymentTypeRef = doc(db, 'organizations', organizationId, 'paymentTypes', paymentTypeId);
      await updatePaymentTypeMutation.mutateAsync({
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating payment type:', error);
      throw error;
    }
  }, [organizationId, updatePaymentTypeMutation]);

  const deletePaymentType = useCallback(async (paymentTypeId: string): Promise<void> => {
    if (!organizationId) return;

    try {
      const paymentTypeRef = doc(db, 'organizations', organizationId, 'paymentTypes', paymentTypeId);
      await deletePaymentTypeMutation.mutateAsync();
    } catch (error) {
      console.error('Error deleting payment type:', error);
      throw error;
    }
  }, [organizationId, deletePaymentTypeMutation]);

  // Refresh function
  const refreshPaymentTypes = useCallback(() => {
    paymentTypesQuery.refetch();
  }, [paymentTypesQuery]);

  // Return empty data when no organizationId
  if (!organizationId) {
    return {
      paymentTypes: [],
      loading: false,
      error: null,

      // CRUD operations
      createPaymentType: async () => { throw new Error('Organization ID is required'); },
      updatePaymentType: async () => {},
      deletePaymentType: async () => {},

      // Utility functions
      refreshPaymentTypes,
    };
  }

  return {
    paymentTypes: paymentTypesData,
    loading: paymentTypesQuery.isLoading,
    error: paymentTypesQuery.error?.message || null,

    // CRUD operations
    createPaymentType,
    updatePaymentType,
    deletePaymentType,

    // Utility functions
    refreshPaymentTypes,
  };
}
