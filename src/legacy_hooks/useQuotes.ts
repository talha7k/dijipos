import { useState, useMemo } from 'react';
import { collection, doc } from 'firebase/firestore';
import { useCollectionQuery, useUpdateDocumentMutation, useAddDocumentMutation, useDeleteDocumentMutation } from '@tanstack-query-firebase/react/firestore';
import { db } from '@/lib/firebase';
import { Quote } from '@/types';

export function useQuotesData(organizationId: string | undefined) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  // Always call the hook, but conditionally enable it
  const quotesQuery = useCollectionQuery(
    collection(db, 'organizations', organizationId || 'dummy', 'quotes'),
    {
      queryKey: ['quotes', organizationId],
      enabled: !!organizationId,
    }
  );

  const quotesData = useMemo(() => {
    if (!quotesQuery.data) return [];
    return quotesQuery.data.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      validUntil: doc.data().validUntil?.toDate(),
    })) as Quote[];
  }, [quotesQuery.data]);

  // Update state
  useMemo(() => {
    setQuotes(quotesData);
    setLoading(quotesQuery.isLoading);
  }, [quotesData, quotesQuery.isLoading]);

  const quotesMemo = useMemo(() => quotes, [quotes]);

  // Return empty data when no organizationId
  if (!organizationId) {
    return {
      quotes: [],
      loading: false,
    };
  }

  return {
    quotes: quotesMemo,
    loading,
  };
}

export function useQuoteActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  
  const updateQuoteMutation = useUpdateDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'quotes', 'dummy')
  );
  
  const addQuoteMutation = useAddDocumentMutation(
    collection(db, 'organizations', organizationId || 'dummy', 'quotes')
  );
  
  const deleteQuoteMutation = useDeleteDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'quotes', 'dummy')
  );

  const updateQuote = async (quoteId: string, quoteData: Partial<Quote>) => {
    if (!organizationId) return;

    setUpdatingStatus(quoteId);
    try {
      const quoteRef = doc(db, 'organizations', organizationId, 'quotes', quoteId);
      await updateQuoteMutation.mutateAsync({
        ...quoteData,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating quote:', error);
      throw error;
    } finally {
      setUpdatingStatus(null);
    }
  };

  const createQuote = async (quoteData: Omit<Quote, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) return;

    try {
      const cleanedData = {
        ...quoteData,
        clientAddress: quoteData.clientAddress || null,
        notes: quoteData.notes || null,
        validUntil: quoteData.validUntil || null,
        items: quoteData.items.map(item => ({
          ...item,
          description: item.description || null,
          notes: item.notes || null,
        })),
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addQuoteMutation.mutateAsync(cleanedData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating quote:', error);
      throw error;
    }
  };

  const deleteQuote = async (quoteId: string) => {
    if (!organizationId) return;

    try {
      const quoteRef = doc(db, 'organizations', organizationId, 'quotes', quoteId);
      await deleteQuoteMutation.mutateAsync();
    } catch (error) {
      console.error('Error deleting quote:', error);
      throw error;
    }
  };

  // Return empty functions when no organizationId
  if (!organizationId) {
    return {
      updateQuote: async () => {},
      createQuote: async () => {},
      deleteQuote: async () => {},
      updatingStatus: null,
    };
  }

  return {
    updateQuote,
    createQuote,
    deleteQuote,
    updatingStatus,
  };
}