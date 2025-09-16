"use client";

import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Service } from '@/types';

// Global singleton to prevent duplicate listeners
const globalServiceListeners = new Map<string, {
  unsubscribe: () => void;
  refCount: number;
}>();

export function useServicesData(organizationId: string | undefined) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    const listenerKey = `services-${organizationId}`;
    
    // Check if listener already exists
    if (globalServiceListeners.has(listenerKey)) {
      const existing = globalServiceListeners.get(listenerKey)!;
      existing.refCount++;
      setLoading(false);
      return () => {
        existing.refCount--;
        if (existing.refCount <= 0) {
          existing.unsubscribe();
          globalServiceListeners.delete(listenerKey);
        }
      };
    }

    // Create new listener
    setLoading(true);
    const servicesQ = query(collection(db, 'organizations', organizationId, 'services'));
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

    // Store in global singleton
    globalServiceListeners.set(listenerKey, {
      unsubscribe,
      refCount: 1
    });

    // Return cleanup function
    return () => {
      const listener = globalServiceListeners.get(listenerKey);
      if (listener) {
        listener.refCount--;
        if (listener.refCount <= 0) {
          listener.unsubscribe();
          globalServiceListeners.delete(listenerKey);
        }
      }
    };
  }, [organizationId]);

  const servicesMemo = useMemo(() => services, [services]);

  return {
    services: servicesMemo,
    loading,
  };
}

export function useServiceActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const updateService = async (serviceId: string, serviceData: Partial<Service>) => {
    if (!organizationId) return;

    setUpdatingStatus(serviceId);
    try {
      const serviceRef = doc(db, 'organizations', organizationId, 'services', serviceId);
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

      const docRef = await addDoc(collection(db, 'organizations', organizationId, 'services'), cleanedData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!organizationId) return;

    try {
      await deleteDoc(doc(db, 'organizations', organizationId, 'services', serviceId));
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