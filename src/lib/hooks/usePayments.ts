import { Payment } from '@/types';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';

interface PaymentsState {
  payments: Payment[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook that provides real-time payments for the selected organization
 */
export function usePayments(): PaymentsState {
  const { selectedOrganization } = useOrganization();

  const { data: payments, loading, error } = useRealtimeCollection<Payment>(
    'payments',
    selectedOrganization?.id || null
  );

  return {
    payments,
    loading,
    error,
  };
}