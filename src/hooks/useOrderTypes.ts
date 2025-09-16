'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { OrderType } from '@/types';
import { useAuthState } from '@/hooks/useAuthState';
import {
  orderTypesAtom,
  orderTypesLoadingAtom,
  orderTypesErrorAtom,
  orderTypesRefreshKeyAtom
} from '@/store/atoms';

// Global singleton to track active listeners
const globalListeners = {
  orderTypes: null as { unsubscribe: () => void; organizationId: string } | null
};

export interface UseOrderTypesResult {
  orderTypes: OrderType[];
  loading: boolean;
  error: string | null;
  
  // CRUD operations
  createOrderType: (orderTypeData: Omit<OrderType, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateOrderType: (orderTypeId: string, updates: Partial<OrderType>) => Promise<void>;
  deleteOrderType: (orderTypeId: string) => Promise<void>;
  
  // Utility functions
  refreshOrderTypes: () => void;
}

export function useOrderTypes(organizationId: string | undefined): UseOrderTypesResult {
  const { user: _user } = useAuthState();
  
  // Order types state
  const [orderTypes, setOrderTypes] = useAtom(orderTypesAtom);
  const [loading, setLoading] = useAtom(orderTypesLoadingAtom);
  const [error, setError] = useAtom(orderTypesErrorAtom);
  
  // Refresh key
  const [_orderTypesRefreshKey, setOrderTypesRefreshKey] = useAtom(orderTypesRefreshKeyAtom);

  // Fetch order types
  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      setOrderTypes([]);
      return;
    }

    // Check if we already have a listener for this organization globally
    if (globalListeners.orderTypes && globalListeners.orderTypes.organizationId === organizationId) {
      console.log('useOrderTypes: Global listener already exists for organization:', organizationId);
      return;
    }

    // Clean up existing listener if organization changed
    if (globalListeners.orderTypes) {
      console.log('useOrderTypes: Cleaning up previous global listener');
      globalListeners.orderTypes.unsubscribe();
      globalListeners.orderTypes = null;
    }

    setLoading(true);
    setError(null);

    const orderTypesQuery = query(collection(db, 'organizations', organizationId, 'orderTypes'));
    console.log('useOrderTypes: Setting up global listener for organization:', organizationId);
    
    const unsubscribe = onSnapshot(orderTypesQuery, (querySnapshot) => {
      console.log('useOrderTypes: Received snapshot with', querySnapshot.size, 'documents');
      try {
        const orderTypesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as OrderType[];
        setOrderTypes(orderTypesData);
        setLoading(false);
      } catch (err) {
        console.error('Error processing order types:', err);
        setError('Failed to process order types');
        setLoading(false);
      }
    }, (error) => {
      console.error('Error fetching order types:', error);
      setError('Failed to fetch order types');
      setLoading(false);
    });

    // Store the listener reference globally
    globalListeners.orderTypes = { unsubscribe, organizationId };

    return () => {
      if (globalListeners.orderTypes) {
        globalListeners.orderTypes.unsubscribe();
        globalListeners.orderTypes = null;
      }
    };
  }, [organizationId, setOrderTypes, setLoading, setError]);

  // CRUD operations
  const createOrderType = useCallback(async (orderTypeData: Omit<OrderType, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!organizationId) throw new Error('Organization ID is required');

    try {
      const cleanedData = {
        ...orderTypeData,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'organizations', organizationId, 'orderTypes'), cleanedData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating order type:', error);
      throw error;
    }
  }, [organizationId]);

  const updateOrderType = useCallback(async (orderTypeId: string, updates: Partial<OrderType>): Promise<void> => {
    if (!organizationId) return;

    try {
      const orderTypeRef = doc(db, 'organizations', organizationId, 'orderTypes', orderTypeId);
      await updateDoc(orderTypeRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating order type:', error);
      throw error;
    }
  }, [organizationId]);

  const deleteOrderType = useCallback(async (orderTypeId: string): Promise<void> => {
    if (!organizationId) return;

    try {
      await deleteDoc(doc(db, 'organizations', organizationId, 'orderTypes', orderTypeId));
    } catch (error) {
      console.error('Error deleting order type:', error);
      throw error;
    }
  }, [organizationId]);

  // Refresh function
  const refreshOrderTypes = useCallback(() => {
    setOrderTypesRefreshKey(prev => prev + 1);
  }, [setOrderTypesRefreshKey]);

  // Memoize array to prevent unnecessary re-renders
  const memoizedOrderTypes = useMemo(() => orderTypes, [orderTypes]);

  return {
    orderTypes: memoizedOrderTypes,
    loading,
    error,
    
    // CRUD operations
    createOrderType,
    updateOrderType,
    deleteOrderType,
    
    // Utility functions
    refreshOrderTypes,
  };
}

// Read-only hook for optimization
export function useOrderTypesData() {
  return useAtomValue(orderTypesAtom);
}

// Hook for loading state
export function useOrderTypesLoading() {
  return useAtomValue(orderTypesLoadingAtom);
}

// Hook for error state
export function useOrderTypesError() {
  return useAtomValue(orderTypesErrorAtom);
}