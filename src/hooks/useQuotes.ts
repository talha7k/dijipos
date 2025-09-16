import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Quote } from '@/types';

// Global singleton to prevent duplicate listeners
const globalQuoteListeners = new Map<string, {
  unsubscribe: () => void;
  refCount: number;
}>();

export function useQuotesData(organizationId: string | undefined) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    const listenerKey = `quotes-${organizationId}`;
    
    // Check if listener already exists
    if (globalQuoteListeners.has(listenerKey)) {
      const existing = globalQuoteListeners.get(listenerKey)!;
      existing.refCount++;
      setLoading(false);
      return () => {
        existing.refCount--;
        if (existing.refCount <= 0) {
          existing.unsubscribe();
          globalQuoteListeners.delete(listenerKey);
        }
      };
    }

    // Create new listener
    setLoading(true);
    const quotesQ = query(collection(db, 'organizations', organizationId, 'quotes'));
    const unsubscribe = onSnapshot(quotesQ, (querySnapshot) => {
      const quotesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        validUntil: doc.data().validUntil?.toDate(),
      })) as Quote[];
      setQuotes(quotesData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching quotes:', error);
      setLoading(false);
    });

    // Store in global singleton
    globalQuoteListeners.set(listenerKey, {
      unsubscribe,
      refCount: 1
    });

    // Return cleanup function
    return () => {
      const listener = globalQuoteListeners.get(listenerKey);
      if (listener) {
        listener.refCount--;
        if (listener.refCount <= 0) {
          listener.unsubscribe();
          globalQuoteListeners.delete(listenerKey);
        }
      }
    };
  }, [organizationId]);

  const quotesMemo = useMemo(() => quotes, [quotes]);

  return {
    quotes: quotesMemo,
    loading,
  };
}

export function useQuoteActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const updateQuote = async (quoteId: string, quoteData: Partial<Quote>) => {
    if (!organizationId) return;

    setUpdatingStatus(quoteId);
    try {
      const quoteRef = doc(db, 'organizations', organizationId, 'quotes', quoteId);
      await updateDoc(quoteRef, {
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

      const docRef = await addDoc(collection(db, 'organizations', organizationId, 'quotes'), cleanedData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating quote:', error);
      throw error;
    }
  };

  const deleteQuote = async (quoteId: string) => {
    if (!organizationId) return;

    try {
      await deleteDoc(doc(db, 'organizations', organizationId, 'quotes', quoteId));
    } catch (error) {
      console.error('Error deleting quote:', error);
      throw error;
    }
  };

  return {
    updateQuote,
    createQuote,
    deleteQuote,
    updatingStatus,
  };
}