'use client';

import { useCallback, useMemo, useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { collection, doc } from 'firebase/firestore';
import { useCollectionQuery, useUpdateDocumentMutation, useAddDocumentMutation, useDeleteDocumentMutation } from '@tanstack-query-firebase/react/firestore';
import { db } from '@/lib/firebase/config';
import { Customer } from '@/types';
import {
  customersAtom,
  customersLoadingAtom,
  customersErrorAtom
} from '@/store/atoms';

export interface UseCustomersDataResult {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  createCustomer: (customerData: Omit<Customer, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
}

export function useCustomersData(organizationId: string | undefined): UseCustomersDataResult {
  const [customers, setCustomers] = useAtom(customersAtom);
  const [loading, setLoading] = useAtom(customersLoadingAtom);
  const [error, setError] = useAtom(customersErrorAtom);

  // Always call the hook, but conditionally enable it
  const customersQuery = useCollectionQuery(
    collection(db, 'organizations', organizationId || 'dummy', 'customers'),
    {
      queryKey: ['customers', organizationId],
      enabled: !!organizationId,
    }
  );

  const customersData = useMemo(() => {
    if (!customersQuery.data) return [];
    return customersQuery.data.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Customer[];
  }, [customersQuery.data]);

  // Update atoms
  useEffect(() => {
    setCustomers(customersData);
    setLoading(customersQuery.isLoading);
    setError(customersQuery.error?.message || null);
  }, [customersData, customersQuery.isLoading, customersQuery.error, setCustomers, setLoading, setError]);

  const addCustomerMutation = useAddDocumentMutation(
    collection(db, 'organizations', organizationId || 'dummy', 'customers')
  );
  
  const updateCustomerMutation = useUpdateDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'customers', 'dummy')
  );
  
  const deleteCustomerMutation = useDeleteDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'customers', 'dummy')
  );

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) return;

    try {
      await addCustomerMutation.mutateAsync({
        ...customerData,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (err) {
      console.error('Error creating customer:', err);
      throw err;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    if (!organizationId) return;

    try {
      const customerRef = doc(db, 'organizations', organizationId, 'customers', id);
      await updateCustomerMutation.mutateAsync({
        ...updates,
        updatedAt: new Date()
      });
    } catch (err) {
      console.error('Error updating customer:', err);
      throw err;
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!organizationId) return;

    try {
      const customerRef = doc(db, 'organizations', organizationId, 'customers', id);
      await deleteCustomerMutation.mutateAsync();
    } catch (err) {
      console.error('Error deleting customer:', err);
      throw err;
    }
  };

  const customersMemo = useMemo(() => customers, [customers]);

  // Return empty data when no organizationId
  if (!organizationId) {
    return {
      customers: [],
      loading: false,
      error: null,
      createCustomer: async () => {},
      updateCustomer: async () => {},
      deleteCustomer: async () => {},
    };
  }

  return {
    customers: customersMemo,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer
  };
}