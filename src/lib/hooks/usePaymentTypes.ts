import { PaymentType } from '@/types';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useAtomValue } from 'jotai';
import { selectedOrganizationAtom } from '@/atoms';
import { createPaymentType, updatePaymentType, deletePaymentType } from '../firebase/firestore/settings/storeSettings';

interface PaymentTypesState {
  paymentTypes: PaymentType[];
  loading: boolean;
  error: string | null;
}

interface PaymentTypesActions {
  createNewPaymentType: (paymentTypeData: Omit<PaymentType, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateExistingPaymentType: (paymentTypeId: string, updates: Partial<Omit<PaymentType, 'id' | 'createdAt'>>) => Promise<void>;
  deleteExistingPaymentType: (paymentTypeId: string) => Promise<void>;
}

/**
 * Hook that provides real-time payment types for the selected organization with CRUD operations
 */
export function usePaymentTypes(): PaymentTypesState & PaymentTypesActions {
  const selectedOrganization = useAtomValue(selectedOrganizationAtom);

  const { data: paymentTypes, loading, error } = useRealtimeCollection<PaymentType>(
    'paymentTypes',
    selectedOrganization?.id || null,
    [],
    null // Disable orderBy to prevent index errors
  );

  const createNewPaymentType = async (paymentTypeData: Omit<PaymentType, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!selectedOrganization?.id) {
      throw new Error('No organization selected');
    }

    try {
      return await createPaymentType(selectedOrganization.id, paymentTypeData);
    } catch (err) {
      console.error('Error creating payment type:', err);
      throw err;
    }
  };

  const updateExistingPaymentType = async (
    paymentTypeId: string,
    updates: Partial<Omit<PaymentType, 'id' | 'createdAt'>>
  ): Promise<void> => {
    try {
      await updatePaymentType(paymentTypeId, updates);
    } catch (err) {
      console.error('Error updating payment type:', err);
      throw err;
    }
  };

  const deleteExistingPaymentType = async (paymentTypeId: string): Promise<void> => {
    try {
      await deletePaymentType(paymentTypeId);
    } catch (err) {
      console.error('Error deleting payment type:', err);
      throw err;
    }
  };

  return {
    paymentTypes,
    loading,
    error,
    createNewPaymentType,
    updateExistingPaymentType,
    deleteExistingPaymentType,
  };
}
