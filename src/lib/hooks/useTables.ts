import { Table } from '@/types';
import { useMemo } from 'react';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';
import { createTable as firestoreCreateTable, updateTable as firestoreUpdateTable, deleteTable as firestoreDeleteTable } from '@/lib/firebase/firestore/tables';
import { TableStatus } from '@/types/enums';
import { toast } from 'sonner';

interface TablesState {
  tables: Table[];
  loading: boolean;
  error: string | null;
}

interface TableActions {
  createTable: (tableData: { name: string; capacity: number; status: TableStatus }) => Promise<string>;
  updateTable: (tableId: string, updates: Partial<Omit<Table, 'id'>>) => Promise<void>;
  deleteTable: (tableId: string) => Promise<void>;
}

/**
 * Hook that provides real-time tables and CRUD operations for the selected organization
 */
export function useTables(): TablesState & TableActions {
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization?.id;

  const additionalConstraints = useMemo(() => [], []);

  const { data: tables, loading, error } = useRealtimeCollection<Table>(
    organizationId ? `organizations/${organizationId}/tables` : 'tables',
    organizationId || null,
    additionalConstraints,
    null // Disable orderBy to prevent index errors
  );

  const createTable = async (tableData: { name: string; capacity: number; status: TableStatus }) => {
    if (!organizationId) {
      throw new Error('No organization selected');
    }

    try {
      const fullTableData = {
        ...tableData,
        organizationId,
      };
      const tableId = await firestoreCreateTable(fullTableData);
      toast.success('Table created successfully');
      return tableId;
    } catch (error) {
      console.error('Error creating table:', error);
      toast.error('Failed to create table');
      throw error;
    }
  };

  const updateTable = async (tableId: string, updates: Partial<Omit<Table, 'id'>>) => {
    if (!organizationId) {
      throw new Error('No organization selected');
    }
    try {
      await firestoreUpdateTable(organizationId, tableId, updates);
      toast.success('Table updated successfully');
    } catch (error) {
      console.error('Error updating table:', error);
      toast.error('Failed to update table');
      throw error;
    }
  };

  const deleteTable = async (tableId: string) => {
    if (!organizationId) {
      throw new Error('No organization selected');
    }

    try {
      await firestoreDeleteTable(organizationId, tableId);
      toast.success('Table deleted successfully');
    } catch (error) {
      console.error('Error deleting table:', error);
      toast.error('Failed to delete table');
      throw error;
    }
  };

  return {
    tables,
    loading,
    error,
    createTable,
    updateTable,
    deleteTable,
  };
}