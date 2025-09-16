"use client";

import { useEffect, useMemo } from 'react';
import { useAtom } from 'jotai';
import { collection, query, onSnapshot, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Table } from '@/types';
import {
  tablesAtom,
  tablesLoadingAtom,
  tablesErrorAtom
} from '@/store/atoms';

// Global singleton to prevent duplicate listeners
const globalTableListeners = new Map<string, {
  unsubscribe: () => void;
  refCount: number;
}>();

export function useTablesData(organizationId: string | undefined) {
  const [tables, setTables] = useAtom(tablesAtom);
  const [loading, setLoading] = useAtom(tablesLoadingAtom);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      setTables([]);
      return;
    }

    const listenerKey = `tables-${organizationId}`;
    
    // Check if listener already exists
    if (globalTableListeners.has(listenerKey)) {
      const existing = globalTableListeners.get(listenerKey)!;
      existing.refCount++;
      console.log('useTablesData: Global listener already exists for organization:', organizationId);
      setLoading(false);
      return () => {
        existing.refCount--;
        if (existing.refCount <= 0) {
          existing.unsubscribe();
          globalTableListeners.delete(listenerKey);
        }
      };
    }

    // Set loading to true when starting to fetch
    setLoading(true);

    // Fetch tables with real-time updates
    const tablesQ = query(collection(db, 'organizations', organizationId, 'tables'));
    console.log('useTablesData: Setting up global listener for organization:', organizationId);
    
    const unsubscribe = onSnapshot(tablesQ, (querySnapshot) => {
      console.log('useTablesData: Received snapshot with', querySnapshot.size, 'documents');
      const tablesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Table[];
      setTables(tablesData);
      setLoading(false);
    }, (error) => {
      console.error('useTablesData: Error fetching tables:', error);
      setLoading(false);
    });

    // Store in global singleton
    globalTableListeners.set(listenerKey, {
      unsubscribe,
      refCount: 1
    });

    // Return cleanup function
    return () => {
      const listener = globalTableListeners.get(listenerKey);
      if (listener) {
        listener.refCount--;
        if (listener.refCount <= 0) {
          listener.unsubscribe();
          globalTableListeners.delete(listenerKey);
        }
      }
    };
  }, [organizationId, setTables, setLoading]);

  // Memoize the tables array to prevent unnecessary re-renders
  const memoizedTables = useMemo(() => tables, [tables]);

  return {
    tables: memoizedTables,
    loading,
  };
}

export function useTableActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useAtom(tablesErrorAtom);

  const updateTable = async (tableId: string, tableData: Partial<Table>) => {
    if (!organizationId) return;

    setUpdatingStatus(tableId);
    try {
      const tableRef = doc(db, 'organizations', organizationId, 'tables', tableId);
      await updateDoc(tableRef, {
        ...tableData,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating table:', error);
      throw error;
    } finally {
      setUpdatingStatus(null);
    }
  };

  const createTable = async (tableData: Omit<Table, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) return;

    try {
      const cleanedData = {
        ...tableData,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'organizations', organizationId, 'tables'), cleanedData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating table:', error);
      throw error;
    }
  };

  const deleteTable = async (tableId: string) => {
    if (!organizationId) return;

    try {
      await deleteDoc(doc(db, 'organizations', organizationId, 'tables', tableId));
    } catch (error) {
      console.error('Error deleting table:', error);
      throw error;
    }
  };

  return {
    updateTable,
    createTable,
    deleteTable,
    updatingStatus,
  };
}