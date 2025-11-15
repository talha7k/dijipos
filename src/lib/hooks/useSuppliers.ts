import { Supplier } from '@/types';
import { useMemo } from 'react';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';
import { createSupplier as firestoreCreateSupplier, updateSupplier as firestoreUpdateSupplier, deleteSupplier as firestoreDeleteSupplier } from '@/lib/firebase/firestore/suppliers';
import { toast } from 'sonner';

interface SuppliersState {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
}

interface SuppliersActions {
  createSupplier: (supplierData: Omit<Supplier, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateSupplier: (supplierId: string, updates: Partial<Omit<Supplier, 'id' | 'createdAt'>>) => Promise<void>;
  deleteSupplier: (supplierId: string) => Promise<void>;
}

/**
 * Hook that provides real-time suppliers and CRUD operations for the selected organization
 */
export function useSuppliers(): SuppliersState & SuppliersActions {
  const { selectedOrganization } = useOrganization();

  const additionalConstraints = useMemo(() => [], []);

  const { data: suppliers, loading, error } = useRealtimeCollection<Supplier>(
    'suppliers',
    selectedOrganization?.id || null,
    additionalConstraints,
    null // Disable orderBy to prevent index errors
  );

  const createSupplier = async (supplierData: Omit<Supplier, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedOrganization?.id) {
      throw new Error('No organization selected');
    }

    try {
      const fullSupplierData = {
        ...supplierData,
        organizationId: selectedOrganization.id,
      };
      const supplierId = await firestoreCreateSupplier(fullSupplierData);
      toast.success('Supplier created successfully');
      return supplierId;
    } catch (error) {
      console.error('Error creating supplier:', error);
      toast.error('Failed to create supplier');
      throw error;
    }
  };

  const updateSupplier = async (supplierId: string, updates: Partial<Omit<Supplier, 'id' | 'createdAt'>>) => {
    try {
      await firestoreUpdateSupplier(supplierId, updates);
      toast.success('Supplier updated successfully');
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast.error('Failed to update supplier');
      throw error;
    }
  };

  const deleteSupplier = async (supplierId: string) => {
    try {
      await firestoreDeleteSupplier(supplierId);
      toast.success('Supplier deleted successfully');
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast.error('Failed to delete supplier');
      throw error;
    }
  };

  return {
    suppliers,
    loading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
}