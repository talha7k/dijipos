import { Service } from '@/types';
import {
  getPurchaseServices,
  getPurchaseService,
  createPurchaseService,
  updatePurchaseService,
  deletePurchaseService
} from '../firebase/firestore/purchaseServices';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';

interface PurchaseServicesState {
  services: Service[];
  loading: boolean;
  error: string | null;
}

interface PurchaseServicesActions {
  getServiceById: (serviceId: string) => Promise<Service | null>;
  createNewService: (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateExistingService: (serviceId: string, updates: Partial<Omit<Service, 'id' | 'createdAt'>>) => Promise<void>;
  deleteExistingService: (serviceId: string) => Promise<void>;
}

/**
 * Hook that provides real-time purchase services for the selected organization
 */
export function usePurchaseServices(): PurchaseServicesState & PurchaseServicesActions {
  const { selectedOrganization } = useOrganization();

  const { data: services, loading, error } = useRealtimeCollection<Service>(
    'purchaseServices',
    selectedOrganization?.id || null
  );

  const getServiceById = async (serviceId: string): Promise<Service | null> => {
    try {
      return await getPurchaseService(serviceId);
    } catch (err) {
      console.error('Error fetching purchase service:', err);
      throw err;
    }
  };

  const createNewService = async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const serviceId = await createPurchaseService(serviceData);
      // Real-time listener will automatically update the services list
      return serviceId;
    } catch (err) {
      console.error('Error creating purchase service:', err);
      throw err;
    }
  };

  const updateExistingService = async (serviceId: string, updates: Partial<Omit<Service, 'id' | 'createdAt'>>): Promise<void> => {
    try {
      await updatePurchaseService(serviceId, updates);
      // Real-time listener will automatically update the services list
    } catch (err) {
      console.error('Error updating purchase service:', err);
      throw err;
    }
  };

  const deleteExistingService = async (serviceId: string): Promise<void> => {
    try {
      await deletePurchaseService(serviceId);
      // Real-time listener will automatically update the services list
    } catch (err) {
      console.error('Error deleting purchase service:', err);
      throw err;
    }
  };

  return {
    services,
    loading,
    error,
    getServiceById,
    createNewService,
    updateExistingService,
    deleteExistingService,
  };
}

/**
 * Hook that provides purchase services data only (for usePurchaseServicesData compatibility)
 */
export function usePurchaseServicesData(organizationId?: string): { services: Service[]; loading: boolean } {
  const { selectedOrganization } = useOrganization();
  const orgId = organizationId || selectedOrganization?.id;

  const { data: services, loading } = useRealtimeCollection<Service>(
    'purchaseServices',
    orgId || null
  );

  return { services, loading };
}

/**
 * Hook that provides purchase services actions only (for usePurchaseServicesActions compatibility)
 */
export function usePurchaseServicesActions(organizationId?: string): {
  createService: (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  deleteService: (serviceId: string) => Promise<void>;
} {
  const createService = async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const serviceId = await createPurchaseService(serviceData);
      return serviceId;
    } catch (err) {
      console.error('Error creating purchase service:', err);
      throw err;
    }
  };

  const deleteService = async (serviceId: string): Promise<void> => {
    try {
      await deletePurchaseService(serviceId);
    } catch (err) {
      console.error('Error deleting purchase service:', err);
      throw err;
    }
  };

  return {
    createService,
    deleteService,
  };
}