import { Quote } from '@/types';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';
import { createQuote as firestoreCreateQuote, updateQuote as firestoreUpdateQuote, deleteQuote as firestoreDeleteQuote } from '@/lib/firebase/firestore/quotes';
import { toast } from 'sonner';

interface QuotesState {
  quotes: Quote[];
  loading: boolean;
  error: string | null;
}

interface QuotesActions {
  createQuote: (quoteData: Omit<Quote, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateQuote: (quoteId: string, updates: Partial<Omit<Quote, 'id' | 'createdAt'>>) => Promise<void>;
  deleteQuote: (quoteId: string) => Promise<void>;
}

/**
 * Hook that provides real-time quotes and CRUD operations for the selected organization
 */
export function useQuotes(): QuotesState & QuotesActions {
  const { selectedOrganization } = useOrganization();

  const { data: quotes, loading, error } = useRealtimeCollection<Quote>(
    'quotes',
    selectedOrganization?.id || null
  );

  const createQuote = async (quoteData: Omit<Quote, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedOrganization?.id) {
      throw new Error('No organization selected');
    }

    try {
      const fullQuoteData = {
        ...quoteData,
        organizationId: selectedOrganization.id,
      };
      const quoteId = await firestoreCreateQuote(fullQuoteData);
      toast.success('Quote created successfully');
      return quoteId;
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error('Failed to create quote');
      throw error;
    }
  };

  const updateQuote = async (quoteId: string, updates: Partial<Omit<Quote, 'id' | 'createdAt'>>) => {
    try {
      await firestoreUpdateQuote(quoteId, updates);
      toast.success('Quote updated successfully');
    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error('Failed to update quote');
      throw error;
    }
  };

  const deleteQuote = async (quoteId: string) => {
    try {
      await firestoreDeleteQuote(quoteId);
      toast.success('Quote deleted successfully');
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast.error('Failed to delete quote');
      throw error;
    }
  };

  return {
    quotes,
    loading,
    error,
    createQuote,
    updateQuote,
    deleteQuote,
  };
}