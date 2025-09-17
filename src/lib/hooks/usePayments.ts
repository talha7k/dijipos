import { Payment } from '@/types';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';
import { createPayment as firestoreCreatePayment, updatePayment as firestoreUpdatePayment, deletePayment as firestoreDeletePayment } from '@/lib/firebase/firestore/payments';
import { toast } from 'sonner';

interface PaymentsState {
  payments: Payment[];
  loading: boolean;
  error: string | null;
}

interface PaymentsActions {
  createPayment: (paymentData: Omit<Payment, 'id' | 'organizationId' | 'createdAt'>) => Promise<string>;
  updatePayment: (paymentId: string, updates: Partial<Omit<Payment, 'id' | 'createdAt'>>) => Promise<void>;
  deletePayment: (paymentId: string) => Promise<void>;
}

/**
 * Hook that provides real-time payments and CRUD operations for the selected organization
 */
export function usePayments(): PaymentsState & PaymentsActions {
  const { selectedOrganization } = useOrganization();

  const { data: payments, loading, error } = useRealtimeCollection<Payment>(
    'payments',
    selectedOrganization?.id || null
  );

  const createPayment = async (paymentData: Omit<Payment, 'id' | 'organizationId' | 'createdAt'>) => {
    if (!selectedOrganization?.id) {
      throw new Error('No organization selected');
    }

    try {
      const fullPaymentData = {
        ...paymentData,
        organizationId: selectedOrganization.id,
      };
      const paymentId = await firestoreCreatePayment(fullPaymentData);
      toast.success('Payment created successfully');
      return paymentId;
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Failed to create payment');
      throw error;
    }
  };

  const updatePayment = async (paymentId: string, updates: Partial<Omit<Payment, 'id' | 'createdAt'>>) => {
    try {
      await firestoreUpdatePayment(paymentId, updates);
      toast.success('Payment updated successfully');
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Failed to update payment');
      throw error;
    }
  };

  const deletePayment = async (paymentId: string) => {
    try {
      await firestoreDeletePayment(paymentId);
      toast.success('Payment deleted successfully');
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Failed to delete payment');
      throw error;
    }
  };

  return {
    payments,
    loading,
    error,
    createPayment,
    updatePayment,
    deletePayment,
  };
}