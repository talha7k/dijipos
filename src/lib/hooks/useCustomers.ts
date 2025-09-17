import { Customer } from '@/types';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';

interface CustomersState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook that provides real-time customers for the selected organization
 */
export function useCustomers(): CustomersState {
  const { selectedOrganization } = useOrganization();

  const { data: customers, loading, error } = useRealtimeCollection<Customer>(
    'customers',
    selectedOrganization?.id || null,
    [],
    null // Disable orderBy to prevent index errors
  );

  return {
    customers,
    loading,
    error,
  };
}