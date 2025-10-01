import { SalesInvoice, PurchaseInvoice, Payment } from '@/types';
import {
  getInvoice,
  createSalesInvoice,
  createPurchaseInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoicePayments,
  addInvoicePayment,
  updateInvoicePayment,
  deleteInvoicePayment
} from '../firebase/firestore/invoices';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';

interface InvoicesState {
  salesInvoices: SalesInvoice[];
  purchaseInvoices: PurchaseInvoice[];
  loading: boolean;
  error: string | null;
}

interface InvoicesActions {
  getInvoiceById: (invoiceId: string) => Promise<SalesInvoice | PurchaseInvoice | null>;
  createSalesInvoice: (invoiceData: Omit<SalesInvoice, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  createPurchaseInvoice: (invoiceData: Omit<PurchaseInvoice, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateExistingInvoice: (invoiceId: string, updates: Partial<Omit<SalesInvoice | PurchaseInvoice, 'id' | 'createdAt'>>) => Promise<void>;
  deleteExistingInvoice: (invoiceId: string) => Promise<void>;
  getPaymentsForInvoice: (invoiceId: string) => Promise<Payment[]>;
  addPaymentToInvoice: (invoiceId: string, paymentData: Omit<Payment, 'id' | 'invoiceId' | 'createdAt'>) => Promise<string>;
  updatePaymentInInvoice: (invoiceId: string, paymentId: string, updates: Partial<Omit<Payment, 'id' | 'invoiceId' | 'createdAt'>>) => Promise<void>;
  deletePaymentFromInvoice: (invoiceId: string, paymentId: string) => Promise<void>;
}

/**
 * Hook that provides sales/purchase invoices for the selected organization
 */
import { useMemo } from 'react';
import { where } from 'firebase/firestore';

// ... (rest of the imports)

export function useInvoices(): InvoicesState & InvoicesActions {
  const { selectedOrganization } = useOrganization();

  const organizationId = selectedOrganization?.id || null;

  const salesConstraints = useMemo(() => [where('type', '==', 'sales')], []);
  const purchaseConstraints = useMemo(() => [where('type', '==', 'purchase')], []);

  const {
    data: salesInvoices,
    loading: salesLoading,
    error: salesError
  } = useRealtimeCollection<SalesInvoice>('invoices', organizationId, salesConstraints);

  const {
    data: purchaseInvoices,
    loading: purchaseLoading,
    error: purchaseError
  } = useRealtimeCollection<PurchaseInvoice>('invoices', organizationId, purchaseConstraints);

  const loading = salesLoading || purchaseLoading;
  const error = salesError || purchaseError;

  const getInvoiceById = async (invoiceId: string): Promise<SalesInvoice | PurchaseInvoice | null> => {
    try {
      return await getInvoice(invoiceId);
    } catch (err) {
      console.error('Error fetching invoice:', err);
      throw err;
    }
  };

  const createNewSalesInvoice = async (invoiceData: Omit<SalesInvoice, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!selectedOrganization?.id) {
      throw new Error('No organization selected');
    }

    try {
      const fullInvoiceData = {
        ...invoiceData,
        organizationId: selectedOrganization.id,
      };
      const invoiceId = await createSalesInvoice(fullInvoiceData);
      // Real-time listener will automatically update the invoices list
      return invoiceId;
    } catch (err) {
      console.error('Error creating sales invoice:', err);
      throw err;
    }
  };

  const createNewPurchaseInvoice = async (invoiceData: Omit<PurchaseInvoice, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!selectedOrganization?.id) {
      throw new Error('No organization selected');
    }

    try {
      const fullInvoiceData = {
        ...invoiceData,
        organizationId: selectedOrganization.id,
      };
      const invoiceId = await createPurchaseInvoice(fullInvoiceData);
      // Real-time listener will automatically update the invoices list
      return invoiceId;
    } catch (err) {
      console.error('Error creating purchase invoice:', err);
      throw err;
    }
  };

  const updateExistingInvoice = async (
    invoiceId: string,
    updates: Partial<Omit<SalesInvoice | PurchaseInvoice, 'id' | 'createdAt'>>
  ): Promise<void> => {
    try {
      await updateInvoice(invoiceId, updates);
      // Real-time listener will automatically update the invoices list
    } catch (err) {
      console.error('Error updating invoice:', err);
      throw err;
    }
  };

  const deleteExistingInvoice = async (invoiceId: string): Promise<void> => {
    try {
      await deleteInvoice(invoiceId);
      // Real-time listener will automatically update the invoices list
    } catch (err) {
      console.error('Error deleting invoice:', err);
      throw err;
    }
  };

  const getPaymentsForInvoice = async (invoiceId: string): Promise<Payment[]> => {
    try {
      return await getInvoicePayments(invoiceId);
    } catch (err) {
      console.error('Error fetching invoice payments:', err);
      throw err;
    }
  };

  const addPaymentToInvoice = async (
    invoiceId: string,
    paymentData: Omit<Payment, 'id' | 'invoiceId' | 'createdAt'>
  ): Promise<string> => {
    try {
      return await addInvoicePayment(invoiceId, paymentData);
    } catch (err) {
      console.error('Error adding payment to invoice:', err);
      throw err;
    }
  };

  const updatePaymentInInvoice = async (
    invoiceId: string,
    paymentId: string,
    updates: Partial<Omit<Payment, 'id' | 'invoiceId' | 'createdAt'>>
  ): Promise<void> => {
    try {
      await updateInvoicePayment(invoiceId, paymentId, updates);
    } catch (err) {
      console.error('Error updating invoice payment:', err);
      throw err;
    }
  };

  const deletePaymentFromInvoice = async (invoiceId: string, paymentId: string): Promise<void> => {
    try {
      await deleteInvoicePayment(invoiceId, paymentId);
    } catch (err) {
      console.error('Error deleting invoice payment:', err);
      throw err;
    }
  };

  return {
    salesInvoices,
    purchaseInvoices,
    loading,
    error,
    getInvoiceById,
    createSalesInvoice: createNewSalesInvoice,
    createPurchaseInvoice: createNewPurchaseInvoice,
    updateExistingInvoice,
    deleteExistingInvoice,
    getPaymentsForInvoice,
    addPaymentToInvoice,
    updatePaymentInInvoice,
    deletePaymentFromInvoice,
  };
}