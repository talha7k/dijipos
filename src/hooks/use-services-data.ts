import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Service } from '@/types';

export function useServicesData(organizationId: string | undefined) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    // Fetch services with real-time updates
    const servicesQ = query(collection(db, 'tenants', organizationId, 'services'));
    const unsubscribe = onSnapshot(servicesQ, (querySnapshot) => {
      const servicesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Service[];
      setServices(servicesData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching services:', error);
      setLoading(false);
    });

    // Return cleanup function
    return () => unsubscribe();
  }, [organizationId]);

  return {
    services,
    loading,
  };
}

export function useServiceActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const updateService = async (serviceId: string, serviceData: Partial<Service>) => {
    if (!organizationId) return;

    setUpdatingStatus(serviceId);
    try {
      const serviceRef = doc(db, 'tenants', organizationId, 'services', serviceId);
      await updateDoc(serviceRef, {
        ...serviceData,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    } finally {
      setUpdatingStatus(null);
    }
  };

  const createService = async (serviceData: Omit<Service, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) return;

    try {
      const cleanedData = {
        ...serviceData,
        description: serviceData.description || null,
        categoryId: serviceData.categoryId || null,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'tenants', organizationId, 'services'), cleanedData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!organizationId) return;

    try {
      await deleteDoc(doc(db, 'tenants', organizationId, 'services', serviceId));
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  };

  return {
    updateService,
    createService,
    deleteService,
    updatingStatus,
  };
}