import { useState } from 'react';
import { collection, addDoc, deleteDoc, doc, runTransaction, Transaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Table, Order } from '@/types';
import { toast } from 'sonner';
import { getTableStatusColor } from '@/lib/utils';

export function useTableManagement(organizationId: string | undefined) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTableId, setDeleteTableId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newTable, setNewTable] = useState({
    name: '',
    capacity: 1,
    status: 'available' as 'available' | 'occupied' | 'reserved' | 'maintenance'
  });

  const handleAddTable = async (onRefresh?: () => void) => {
    if (!organizationId || !newTable.name.trim()) return;

    try {
      await addDoc(collection(db, 'organizations', organizationId, 'tables'), {
        ...newTable,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setNewTable({ name: '', capacity: 1, status: 'available' });
      setDialogOpen(false);
      onRefresh?.();
      toast.success('Table added successfully');
    } catch (error) {
      console.error('Error adding table:', error);
      toast.error('Failed to add table');
    }
  };

  const handleDeleteTable = (id: string) => {
    setDeleteTableId(id);
  };

  const confirmDeleteTable = async (onRefresh?: () => void) => {
    if (!organizationId || !deleteTableId) return;

    try {
      await deleteDoc(doc(db, 'organizations', organizationId, 'tables', deleteTableId));
      toast.success('Table deleted successfully');
      onRefresh?.();
    } catch (error) {
      console.error('Error deleting table:', error);
      toast.error('Failed to delete table');
    } finally {
      setDeleteTableId(null);
    }
  };

  const resetForm = () => {
    setNewTable({ name: '', capacity: 1, status: 'available' });
  };

  const getStatusColor = (status: string, withBorder = true) => {
    return getTableStatusColor(status, withBorder);
  };

  const isAvailable = (status: string) => {
    return status === 'available';
  };

  const isOccupied = (status: string) => {
    return status === 'occupied';
  };

  const isReserved = (status: string) => {
    return status === 'reserved';
  };

  const isMaintenance = (status: string) => {
    return status === 'maintenance';
  };

  const releaseTable = async (tableId: string, order: Order) => {
    if (!organizationId) return false;

    setUpdating(true);
    try {
      // Use Firestore transaction for atomic updates
      await runTransaction(db, async (transaction: Transaction) => {
        // Update table status to available
        const tableRef = doc(db, 'organizations', organizationId, 'tables', tableId);
        transaction.update(tableRef, {
          status: 'available',
          updatedAt: new Date(),
        });

        // Update order to remove table assignment
        const orderRef = doc(db, 'organizations', organizationId, 'orders', order.id);
        transaction.update(orderRef, {
          tableId: null,
          tableName: null,
          updatedAt: new Date(),
        });
      });

      toast.success('Table released successfully');
      return true;
    } catch (error) {
      console.error('Error releasing table:', error);
      toast.error('Failed to release table');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const moveOrderToTable = async (order: Order, fromTableId: string, toTableId: string, targetTableName: string) => {
    if (!organizationId) return false;

    setUpdating(true);
    try {
      // Use Firestore transaction for atomic updates
      await runTransaction(db, async (transaction: Transaction) => {
        // Update order with new table
        const orderRef = doc(db, 'organizations', organizationId, 'orders', order.id);
        transaction.update(orderRef, {
          tableId: toTableId,
          tableName: targetTableName,
          updatedAt: new Date(),
        });

        // Update source table to available
        const fromTableRef = doc(db, 'organizations', organizationId, 'tables', fromTableId);
        transaction.update(fromTableRef, {
          status: 'available',
          updatedAt: new Date(),
        });

        // Update target table to occupied
        const toTableRef = doc(db, 'organizations', organizationId, 'tables', toTableId);
        transaction.update(toTableRef, {
          status: 'occupied',
          updatedAt: new Date(),
        });
      });

      toast.success('Order moved successfully');
      return true;
    } catch (error) {
      console.error('Error moving order:', error);
      toast.error('Failed to move order');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return {
    // State
    dialogOpen,
    setDialogOpen,
    deleteTableId,
    setDeleteTableId,
    updating,
    newTable,
    setNewTable,

    // Actions
    handleAddTable,
    handleDeleteTable,
    confirmDeleteTable,
    releaseTable,
    moveOrderToTable,
    resetForm,

    // Utilities
    getStatusColor,
    isAvailable,
    isOccupied,
    isReserved,
    isMaintenance,
  };
}