import { Supplier } from '@/types';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';

interface SuppliersState {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook that provides real-time suppliers for the selected organization
 */
export function useSuppliers(): SuppliersState {
  const { selectedOrganization } = useOrganization();

  const { data: suppliers, loading, error } = useRealtimeCollection<Supplier>(
    'suppliers',
    selectedOrganization?.id || null
  );

  return {
    suppliers,
    loading,
    error,
  };
}