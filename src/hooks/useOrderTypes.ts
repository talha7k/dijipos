'use client';

import { useCallback, useMemo } from 'react';
import { collection, doc } from 'firebase/firestore';
import { useCollectionQuery, useUpdateDocumentMutation, useAddDocumentMutation, useDeleteDocumentMutation } from '@tanstack-query-firebase/react/firestore';
import { db } from '@/lib/firebase';
import { OrderType } from '@/types';
import { useAuthState } from '@/hooks/useAuthState';

export interface UseOrderTypesResult {
  orderTypes: OrderType[];
  loading: boolean;
  error: string | null;
  
  // CRUD operations
  createOrderType: (orderTypeData: Omit<OrderType, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateOrderType: (orderTypeId: string, updates: Partial<OrderType>) => Promise<void>;
  deleteOrderType: (orderTypeId: string) => Promise<void>;
  
  // Utility functions
  refreshOrderTypes: () => void;
}

export function useOrderTypes(organizationId: string | undefined): UseOrderTypesResult {
  const { user: _user } = useAuthState();

  // Always call the hook, but conditionally enable it
  const orderTypesQuery = useCollectionQuery(
    collection(db, 'organizations', organizationId || 'dummy', 'orderTypes'),
    {
      queryKey: ['orderTypes', organizationId],
      enabled: !!organizationId,
      subscribed: true, // Enable real-time updates
    }
  );

  const orderTypesData = useMemo(() => {
    if (!orderTypesQuery.data) return [];
    return orderTypesQuery.data.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as OrderType[];
  }, [orderTypesQuery.data]);

  const addOrderTypeMutation = useAddDocumentMutation(
    collection(db, 'organizations', organizationId || 'dummy', 'orderTypes')
  );
  
  const updateOrderTypeMutation = useUpdateDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'orderTypes', 'dummy')
  );
  
  const deleteOrderTypeMutation = useDeleteDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'orderTypes', 'dummy')
  );

  // CRUD operations
  const createOrderType = useCallback(async (orderTypeData: Omit<OrderType, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!organizationId) throw new Error('Organization ID is required');

    try {
      const cleanedData = {
        ...orderTypeData,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addOrderTypeMutation.mutateAsync(cleanedData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating order type:', error);
      throw error;
    }
  }, [organizationId]);

  const updateOrderType = useCallback(async (orderTypeId: string, updates: Partial<OrderType>): Promise<void> => {
    if (!organizationId) return;

    try {
      const orderTypeRef = doc(db, 'organizations', organizationId, 'orderTypes', orderTypeId);
      await updateOrderTypeMutation.mutateAsync({
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating order type:', error);
      throw error;
    }
  }, [organizationId, updateOrderTypeMutation]);

  const deleteOrderType = useCallback(async (orderTypeId: string): Promise<void> => {
    if (!organizationId) return;

    try {
      const orderTypeRef = doc(db, 'organizations', organizationId, 'orderTypes', orderTypeId);
      await deleteOrderTypeMutation.mutateAsync();
    } catch (error) {
      console.error('Error deleting order type:', error);
      throw error;
    }
  }, [organizationId, deleteOrderTypeMutation]);

  // Refresh function (invalidate query cache)
  const refreshOrderTypes = useCallback(() => {
    orderTypesQuery.refetch();
  }, [orderTypesQuery]);

  // Return empty data when no organizationId
  if (!organizationId) {
    return {
      orderTypes: [],
      loading: false,
      error: null,

      // CRUD operations
      createOrderType: async () => { throw new Error('Organization ID is required'); },
      updateOrderType: async () => {},
      deleteOrderType: async () => {},

      // Utility functions
      refreshOrderTypes,
    };
  }

  return {
    orderTypes: orderTypesData,
    loading: orderTypesQuery.isLoading,
    error: orderTypesQuery.error?.message || null,

    // CRUD operations
    createOrderType,
    updateOrderType,
    deleteOrderType,

    // Utility functions
    refreshOrderTypes,
  };
}
