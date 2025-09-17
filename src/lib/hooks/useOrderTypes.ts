import { OrderType } from '@/types';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useAtomValue } from 'jotai';
import { selectedOrganizationAtom } from '@/atoms/organizationAtoms';
import { createOrderType, updateOrderType, deleteOrderType } from '../firebase/firestore/settings/store';

interface OrderTypesState {
  orderTypes: OrderType[];
  loading: boolean;
  error: string | null;
}

interface OrderTypesActions {
  createNewOrderType: (orderTypeData: Omit<OrderType, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateExistingOrderType: (orderTypeId: string, updates: Partial<Omit<OrderType, 'id' | 'createdAt'>>) => Promise<void>;
  deleteExistingOrderType: (orderTypeId: string) => Promise<void>;
}

/**
 * Hook that provides real-time order types for the selected organization with CRUD operations
 */
export function useOrderTypes(): OrderTypesState & OrderTypesActions {
  const selectedOrganization = useAtomValue(selectedOrganizationAtom);

  const { data: orderTypes, loading, error } = useRealtimeCollection<OrderType>(
    'orderTypes',
    selectedOrganization?.id || null
  );

  const createNewOrderType = async (orderTypeData: Omit<OrderType, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!selectedOrganization?.id) {
      throw new Error('No organization selected');
    }

    try {
      return await createOrderType(selectedOrganization.id, orderTypeData);
    } catch (err) {
      console.error('Error creating order type:', err);
      throw err;
    }
  };

  const updateExistingOrderType = async (
    orderTypeId: string,
    updates: Partial<Omit<OrderType, 'id' | 'createdAt'>>
  ): Promise<void> => {
    try {
      await updateOrderType(orderTypeId, updates);
    } catch (err) {
      console.error('Error updating order type:', err);
      throw err;
    }
  };

  const deleteExistingOrderType = async (orderTypeId: string): Promise<void> => {
    try {
      await deleteOrderType(orderTypeId);
    } catch (err) {
      console.error('Error deleting order type:', err);
      throw err;
    }
  };

  return {
    orderTypes,
    loading,
    error,
    createNewOrderType,
    updateExistingOrderType,
    deleteExistingOrderType,
  };
}
