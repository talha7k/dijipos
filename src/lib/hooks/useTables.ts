import { Table } from '@/types';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';

interface TablesState {
  tables: Table[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook that provides real-time tables for the selected organization
 */
export function useTables(): TablesState {
  const { selectedOrganization } = useOrganization();

  const { data: tables, loading, error } = useRealtimeCollection<Table>(
    'tables',
    selectedOrganization?.id || null,
    [],
    null // Disable orderBy to prevent index errors
  );

  return {
    tables,
    loading,
    error,
  };
}