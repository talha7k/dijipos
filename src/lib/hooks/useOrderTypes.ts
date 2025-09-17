import { OrderType } from '../../types';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';

interface OrderTypesState {
  orderTypes: OrderType[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook that provides real-time order types for the selected organization
 */
export function useOrderTypes(): OrderTypesState {
  const { selectedOrganization } = useOrganization();

  const { data: orderTypes, loading, error } = useRealtimeCollection<OrderType>(
    'orderTypes',
    selectedOrganization?.id || null
  );

  return {
    orderTypes,
    loading,
    error,
  };
}