"use client";

import { useState, useMemo } from 'react';
import { useCollectionQuery, useUpdateDocumentMutation, useAddDocumentMutation, useDeleteDocumentMutation, useDocumentQuery, useSetDocumentMutation, useClearIndexedDbPersistenceMutation, useRunTransactionMutation, useWaitForPendingWritesQuery, useDisableNetworkMutation,useEnableNetworkMutation,useGetAggregateFromServerQuery,useGetCountFromServerQuery,useNamedQuery,useWriteBatchCommitMutation } from '@tanstack-query-firebase/react/firestore';
import { db } from '@/lib/firebase';
import { Service } from '@/types';

export function useServicesData(organizationId: string | undefined) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Always call the hook, but conditionally enable it
  const servicesQuery = useCollectionQuery(
    collection(db, 'organizations', organizationId || 'dummy', 'services'),
    {
      queryKey: ['services', organizationId],
      enabled: !!organizationId,
    }
  );

  const servicesData = useMemo(() => {
    if (!servicesQuery.data) return [];
    return servicesQuery.data.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Service[];
  }, [servicesQuery.data]);

  // Update state
  useMemo(() => {
    setServices(servicesData);
    setLoading(servicesQuery.isLoading);
  }, [servicesData, servicesQuery.isLoading]);

  const servicesMemo = useMemo(() => services, [services]);

  // Return empty data when no organizationId
  if (!organizationId) {
    return {
      services: [],
      loading: false,
    };
  }

  return {
    services: servicesMemo,
    loading,
  };
}

export function useServiceActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  
  const updateServiceMutation = useUpdateDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'services', 'dummy')
  );
  
  const addServiceMutation = useAddDocumentMutation(
    collection(db, 'organizations', organizationId || 'dummy', 'services')
  );
  
  const deleteServiceMutation = useDeleteDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'services', 'dummy')
  );

  const updateService = async (serviceId: string, serviceData: Partial<Service>) => {
    if (!organizationId) return;

    setUpdatingStatus(serviceId);
    try {
      const serviceRef = doc(db, 'organizations', organizationId, 'services', serviceId);
      await updateServiceMutation.mutateAsync({
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

      const docRef = await addServiceMutation.mutateAsync(cleanedData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!organizationId) return;

    try {
      const serviceRef = doc(db, 'organizations', organizationId, 'services', serviceId);
      await deleteServiceMutation.mutateAsync();
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  };

  // Return empty functions when no organizationId
  if (!organizationId) {
    return {
      updateService: async () => {},
      createService: async () => {},
      deleteService: async () => {},
      updatingStatus: null,
    };
  }

  return {
    updateService,
    createService,
    deleteService,
    updatingStatus,
  };
}