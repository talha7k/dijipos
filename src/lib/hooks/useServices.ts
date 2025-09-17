import { Service } from '@/types';
import {
  getService,
  createService,
  updateService,
  deleteService
} from '../firebase/firestore/services';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';

interface ServicesState {
  services: Service[];
  loading: boolean;
  error: string | null;
}

interface ServicesActions {
  getServiceById: (serviceId: string) => Promise<Service | null>;
  createNewService: (serviceData: Omit<Service, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateExistingService: (serviceId: string, updates: Partial<Omit<Service, 'id' | 'createdAt'>>) => Promise<void>;
  deleteExistingService: (serviceId: string) => Promise<void>;
}

/**
 * Hook that provides real-time services for the selected organization
 */
export function useServices(): ServicesState & ServicesActions {
  const { selectedOrganization } = useOrganization();

  const { data: services, loading, error } = useRealtimeCollection<Service>(
    'services',
    selectedOrganization?.id || null,
    [],
    null // Disable orderBy to prevent index errors
  );

  const getServiceById = async (serviceId: string): Promise<Service | null> => {
    try {
      return await getService(serviceId);
    } catch (err) {
      console.error('Error fetching service:', err);
      throw err;
    }
  };

  const createNewService = async (serviceData: Omit<Service, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!selectedOrganization?.id) {
      throw new Error('No organization selected');
    }

    try {
      const fullServiceData = {
        ...serviceData,
        organizationId: selectedOrganization.id,
      };
      const serviceId = await createService(fullServiceData);
      // Real-time listener will automatically update the services list
      return serviceId;
    } catch (err) {
      console.error('Error creating service:', err);
      throw err;
    }
  };

  const updateExistingService = async (serviceId: string, updates: Partial<Omit<Service, 'id' | 'createdAt'>>): Promise<void> => {
    try {
      await updateService(serviceId, updates);
      // Real-time listener will automatically update the services list
    } catch (err) {
      console.error('Error updating service:', err);
      throw err;
    }
  };

  const deleteExistingService = async (serviceId: string): Promise<void> => {
    try {
      await deleteService(serviceId);
      // Real-time listener will automatically update the services list
    } catch (err) {
      console.error('Error deleting service:', err);
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