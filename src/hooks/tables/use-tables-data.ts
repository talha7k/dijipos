"use client";

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Table } from '@/types';

export function useTablesData(organizationId: string | undefined) {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    // Fetch tables with real-time updates
    const tablesQ = query(collection(db, 'organizations', organizationId, 'tables'));
    const unsubscribe = onSnapshot(tablesQ, (querySnapshot) => {
      const tablesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Table[];
      setTables(tablesData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching tables:', error);
      setLoading(false);
    });

    // Return cleanup function
    return () => unsubscribe();
  }, [organizationId]);

  return {
    tables,
    loading,
  };
}

export function useTableActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

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