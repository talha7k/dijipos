'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, doc, getDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Customer } from '@/types';

export interface UseCustomersDataResult {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  createCustomer: (customerData: Omit<Customer, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
}

export function useCustomersData(organizationId: string | undefined): UseCustomersDataResult {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const customersQuery = query(collection(db, 'organizations', organizationId, 'customers'));

    const unsubscribe = onSnapshot(
      customersQuery,
      (snapshot) => {
        const customersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Customer[];
        setCustomers(customersData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching customers:', err);
        setError('Failed to load customers');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [organizationId]);

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) return;

    try {
      await addDoc(collection(db, 'organizations', organizationId, 'customers'), {
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
      await updateDoc(doc(db, 'organizations', organizationId, 'customers', id), {
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
      await deleteDoc(doc(db, 'organizations', organizationId, 'customers', id));
    } catch (err) {
      console.error('Error deleting customer:', err);
      throw err;
    }
  };

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer
  };
}