"use client";

import { useMemo } from 'react';
import { useAtom } from 'jotai';
import { collection, doc } from 'firebase/firestore';
import { useCollectionQuery, useUpdateDocumentMutation, useAddDocumentMutation, useDeleteDocumentMutation } from '@tanstack-query-firebase/react/firestore';
import { db } from '@/lib/firebase';
import { Table } from '@/types';
import {
  tablesAtom,
  tablesLoadingAtom,
  tablesErrorAtom
} from '@/store/atoms';

export function useTablesData(organizationId: string | undefined) {
  const [tables, setTables] = useAtom(tablesAtom);
  const [loading, setLoading] = useAtom(tablesLoadingAtom);

  // Always call the hook, but conditionally enable it
  const tablesQuery = useCollectionQuery(
    collection(db, 'organizations', organizationId || 'dummy', 'tables'),
    {
      queryKey: ['tables', organizationId],
      enabled: !!organizationId,
    }
  );

  const tablesData = useMemo(() => {
    if (!tablesQuery.data) return [];
    return tablesQuery.data.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Table[];
  }, [tablesQuery.data]);

  // Update atoms
  useMemo(() => {
    setTables(tablesData);
    setLoading(tablesQuery.isLoading);
  }, [tablesData, tablesQuery.isLoading, setTables, setLoading]);

  // Memoize the tables array to prevent unnecessary re-renders
  const memoizedTables = useMemo(() => tables, [tables]);

  // Return empty data when no organizationId
  if (!organizationId) {
    return {
      tables: [],
      loading: false,
    };
  }

  return {
    tables: memoizedTables,
    loading,
  };
}

export function useTableActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useAtom(tablesErrorAtom);
  
  const updateTableMutation = useUpdateDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'tables', 'dummy')
  );
  
  const addTableMutation = useAddDocumentMutation(
    collection(db, 'organizations', organizationId || 'dummy', 'tables')
  );
  
  const deleteTableMutation = useDeleteDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'tables', 'dummy')
  );

  const updateTable = async (tableId: string, tableData: Partial<Table>) => {
    if (!organizationId) return;

    setUpdatingStatus(tableId);
    try {
      const tableRef = doc(db, 'organizations', organizationId, 'tables', tableId);
      await updateTableMutation.mutateAsync({
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

      const docRef = await addTableMutation.mutateAsync(cleanedData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating table:', error);
      throw error;
    }
  };

  const deleteTable = async (tableId: string) => {
    if (!organizationId) return;

    try {
      const tableRef = doc(db, 'organizations', organizationId, 'tables', tableId);
      await deleteTableMutation.mutateAsync();
    } catch (error) {
      console.error('Error deleting table:', error);
      throw error;
    }
  };

  // Return empty functions when no organizationId
  if (!organizationId) {
    return {
      updateTable: async () => {},
      createTable: async () => {},
      deleteTable: async () => {},
      updatingStatus: null,
    };
  }

  return {
    updateTable,
    createTable,
    deleteTable,
    updatingStatus,
  };
}