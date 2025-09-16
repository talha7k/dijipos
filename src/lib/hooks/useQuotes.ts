import { Quote } from '@/types';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';

interface QuotesState {
  quotes: Quote[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook that provides real-time quotes for the selected organization
 */
export function useQuotes(): QuotesState {
  const { selectedOrganization } = useOrganization();

  const { data: quotes, loading, error } = useRealtimeCollection<Quote>(
    'quotes',
    selectedOrganization?.id || null
  );

  return {
    quotes,
    loading,
    error,
  };
}