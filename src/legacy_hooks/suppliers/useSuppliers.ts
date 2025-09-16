import { useState, useMemo, useEffect } from 'react';
import { collection, doc } from 'firebase/firestore';
import { useCollectionQuery, useUpdateDocumentMutation, useAddDocumentMutation, useDeleteDocumentMutation } from '@tanstack-query-firebase/react/firestore';
import { db } from '@/lib/firebase/config';
import { Supplier } from '@/types';

export function useSuppliersData(organizationId: string | undefined) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Always call the hook, but conditionally enable it
  const suppliersQuery = useCollectionQuery(
    collection(db, 'organizations', organizationId || 'dummy', 'suppliers'),
    {
      queryKey: ['suppliers', organizationId],
      enabled: !!organizationId,
      subscribed: true, // Enable real-time updates
    }
  );

  const suppliersData = useMemo(() => {
    if (!suppliersQuery.data) return [];
    return suppliersQuery.data.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Supplier[];
  }, [suppliersQuery.data]);

  // Update state
  useEffect(() => {
    setSuppliers(suppliersData);
  }, [suppliersData]);

  // Return empty data when no organizationId
  if (!organizationId) {
    return {
      suppliers: [],
      loading: false,
    };
  }

  return {
    suppliers: suppliersData,
    loading: suppliersQuery.isLoading,
  };
}

export function useSupplierActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  
  const updateSupplierMutation = useUpdateDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'suppliers', 'dummy')
  );
  
  const addSupplierMutation = useAddDocumentMutation(
    collection(db, 'organizations', organizationId || 'dummy', 'suppliers')
  );
  
  const deleteSupplierMutation = useDeleteDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'suppliers', 'dummy')
  );

  const updateSupplier = async (supplierId: string, supplierData: Partial<Supplier>) => {
    if (!organizationId) return;

    setUpdatingStatus(supplierId);
    try {
      const supplierRef = doc(db, 'organizations', organizationId, 'suppliers', supplierId);
      await updateSupplierMutation.mutateAsync({
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

      const docRef = await addSupplierMutation.mutateAsync(cleanedData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  };

  const deleteSupplier = async (supplierId: string) => {
    if (!organizationId) return;

    try {
      const supplierRef = doc(db, 'organizations', organizationId, 'suppliers', supplierId);
      await deleteSupplierMutation.mutateAsync();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  };

  // Return empty functions when no organizationId
  if (!organizationId) {
    return {
      updateSupplier: async () => {},
      createSupplier: async () => {},
      deleteSupplier: async () => {},
      updatingStatus: null,
    };
  }

  return {
    updateSupplier,
    createSupplier,
    deleteSupplier,
    updatingStatus,
  };
}