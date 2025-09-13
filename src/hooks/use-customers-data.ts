import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, doc, getDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Customer } from '@/types';

export function useCustomersData(organizationId: string | undefined) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    // Fetch customers with real-time updates
    const customersQ = query(collection(db, 'tenants', organizationId, 'customers'));
    const unsubscribe = onSnapshot(customersQ, (querySnapshot) => {
      const customersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Customer[];
      setCustomers(customersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching customers:', error);
      setLoading(false);
    });

    // Return cleanup function
    return () => unsubscribe();
  }, [organizationId]);

  return {
    customers,
    loading,
  };
}

export function useCustomerActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const updateCustomer = async (customerId: string, customerData: Partial<Customer>) => {
    if (!organizationId) return;

    setUpdatingStatus(customerId);
    try {
      const customerRef = doc(db, 'tenants', organizationId, 'customers', customerId);
      await updateDoc(customerRef, {
        ...customerData,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    } finally {
      setUpdatingStatus(null);
    }
  };

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) return;

    try {
      const cleanedData = {
        ...customerData,
        address: customerData.address || null,
        phone: customerData.phone || null,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'tenants', organizationId, 'customers'), cleanedData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  };

  const deleteCustomer = async (customerId: string) => {
    if (!organizationId) return;

    try {
      await deleteDoc(doc(db, 'tenants', organizationId, 'customers', customerId));
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  };

  return {
    updateCustomer,
    createCustomer,
    deleteCustomer,
    updatingStatus,
  };
}