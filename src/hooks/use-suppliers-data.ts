import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Supplier } from '@/types';

export function useSuppliersData(organizationId: string | undefined) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    // Fetch suppliers with real-time updates
    const suppliersQ = query(collection(db, 'tenants', organizationId, 'suppliers'));
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

    // Return cleanup function
    return () => unsubscribe();
  }, [organizationId]);

  return {
    suppliers,
    loading,
  };
}

export function useSupplierActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const updateSupplier = async (supplierId: string, supplierData: Partial<Supplier>) => {
    if (!organizationId) return;

    setUpdatingStatus(supplierId);
    try {
      const supplierRef = doc(db, 'tenants', organizationId, 'suppliers', supplierId);
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

      const docRef = await addDoc(collection(db, 'tenants', organizationId, 'suppliers'), cleanedData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  };

  const deleteSupplier = async (supplierId: string) => {
    if (!organizationId) return;

    try {
      await deleteDoc(doc(db, 'tenants', organizationId, 'suppliers', supplierId));
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