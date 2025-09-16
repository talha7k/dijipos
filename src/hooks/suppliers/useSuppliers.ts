import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Supplier } from '@/types';

// Global singleton to prevent duplicate listeners
const globalSupplierListeners = new Map<string, {
  unsubscribe: () => void;
  refCount: number;
}>();

export function useSuppliersData(organizationId: string | undefined) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    const listenerKey = `suppliers-${organizationId}`;
    
    // Check if listener already exists
    if (globalSupplierListeners.has(listenerKey)) {
      const existing = globalSupplierListeners.get(listenerKey)!;
      existing.refCount++;
      setLoading(false);
      return () => {
        existing.refCount--;
        if (existing.refCount <= 0) {
          existing.unsubscribe();
          globalSupplierListeners.delete(listenerKey);
        }
      };
    }

    // Create new listener
    setLoading(true);
    const suppliersQ = query(collection(db, 'organizations', organizationId, 'suppliers'));
    const unsubscribe = onSnapshot(suppliersQ, (querySnapshot) => {
      const suppliersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Supplier[];
      setSuppliers(suppliersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching suppliers:', error);
      setLoading(false);
    });

    // Store in global singleton
    globalSupplierListeners.set(listenerKey, {
      unsubscribe,
      refCount: 1
    });

    // Return cleanup function
    return () => {
      const listener = globalSupplierListeners.get(listenerKey);
      if (listener) {
        listener.refCount--;
        if (listener.refCount <= 0) {
          listener.unsubscribe();
          globalSupplierListeners.delete(listenerKey);
        }
      }
    };
  }, [organizationId]);

  const suppliersMemo = useMemo(() => suppliers, [suppliers]);

  return {
    suppliers: suppliersMemo,
    loading,
  };
}

export function useSupplierActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const updateSupplier = async (supplierId: string, supplierData: Partial<Supplier>) => {
    if (!organizationId) return;

    setUpdatingStatus(supplierId);
    try {
      const supplierRef = doc(db, 'organizations', organizationId, 'suppliers', supplierId);
      await updateDoc(supplierRef, {
        ...supplierData,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    } finally {
      setUpdatingStatus(null);
    }
  };

  const createSupplier = async (supplierData: Omit<Supplier, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) return;

    try {
      const cleanedData = {
        ...supplierData,
        address: supplierData.address || null,
        phone: supplierData.phone || null,
        vatNumber: supplierData.vatNumber || null,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'organizations', organizationId, 'suppliers'), cleanedData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  };

  const deleteSupplier = async (supplierId: string) => {
    if (!organizationId) return;

    try {
      await deleteDoc(doc(db, 'organizations', organizationId, 'suppliers', supplierId));
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  };

  return {
    updateSupplier,
    createSupplier,
    deleteSupplier,
    updatingStatus,
  };
}