import { Customer } from '@/types';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';
import { createCustomer as firestoreCreateCustomer, updateCustomer as firestoreUpdateCustomer, deleteCustomer as firestoreDeleteCustomer } from '@/lib/firebase/firestore/customers';
import { toast } from 'sonner';

interface CustomersState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
}

interface CustomersActions {
  createCustomer: (customerData: Omit<Customer, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCustomer: (customerId: string, updates: Partial<Omit<Customer, 'id' | 'createdAt'>>) => Promise<void>;
  deleteCustomer: (customerId: string) => Promise<void>;
}

/**
 * Hook that provides real-time customers and CRUD operations for the selected organization
 */
export function useCustomers(): CustomersState & CustomersActions {
  const { selectedOrganization } = useOrganization();

  const { data: customers, loading, error } = useRealtimeCollection<Customer>(
    'customers',
    selectedOrganization?.id || null,
    [],
    null // Disable orderBy to prevent index errors
  );

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedOrganization?.id) {
      throw new Error('No organization selected');
    }

    try {
      const fullCustomerData = {
        ...customerData,
        organizationId: selectedOrganization.id,
      };
      const customerId = await firestoreCreateCustomer(fullCustomerData);
      toast.success('Customer created successfully');
      return customerId;
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Failed to create customer');
      throw error;
    }
  };

  const updateCustomer = async (customerId: string, updates: Partial<Omit<Customer, 'id' | 'createdAt'>>) => {
    try {
      await firestoreUpdateCustomer(customerId, updates);
      toast.success('Customer updated successfully');
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
      throw error;
    }
  };

  const deleteCustomer = async (customerId: string) => {
    try {
      await firestoreDeleteCustomer(customerId);
      toast.success('Customer deleted successfully');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
      throw error;
    }
  };

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}