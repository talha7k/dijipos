import { PaymentType } from '../../types';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';

interface PaymentTypesState {
  paymentTypes: PaymentType[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook that provides real-time payment types for the selected organization
 */
export function usePaymentTypes(): PaymentTypesState {
  const { selectedOrganization } = useOrganization();

  const { data: paymentTypes, loading, error } = useRealtimeCollection<PaymentType>(
    'paymentTypes',
    selectedOrganization?.id || null
  );

  return {
    paymentTypes,
    loading,
    error,
  };
}