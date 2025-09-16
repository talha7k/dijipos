import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';
import { Quote, QuoteStatus } from '@/types';

// Collection reference
const quotesRef = collection(db, 'quotes');

/**
 * Fetch all quotes for an organization
 */
export async function getQuotes(organizationId: string): Promise<Quote[]> {
  try {
    const quotesQuery = query(
      quotesRef,
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(quotesQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      validUntil: doc.data().validUntil?.toDate(),
    })) as Quote[];
  } catch (error) {
    console.error('Error fetching quotes:', error);
    throw error;
  }
}

/**
 * Fetch quotes by status
 */
export async function getQuotesByStatus(organizationId: string, status: QuoteStatus): Promise<Quote[]> {
  try {
    const quotesQuery = query(
      quotesRef,
      where('organizationId', '==', organizationId),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(quotesQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      validUntil: doc.data().validUntil?.toDate(),
    })) as Quote[];
  } catch (error) {
    console.error('Error fetching quotes by status:', error);
    throw error;
  }
}

/**
 * Get a single quote by ID
 */
export async function getQuote(quoteId: string): Promise<Quote | null> {
  try {
    const quoteDoc = await getDoc(doc(quotesRef, quoteId));
    if (!quoteDoc.exists()) {
      return null;
    }

    const data = quoteDoc.data();
    return {
      id: quoteDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      validUntil: data.validUntil?.toDate(),
    } as Quote;
  } catch (error) {
    console.error('Error fetching quote:', error);
    throw error;
  }
}

/**
 * Create a new quote
 */
export async function createQuote(data: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(quotesRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating quote:', error);
    throw error;
  }
}

/**
 * Update a quote
 */
export async function updateQuote(quoteId: string, updates: Partial<Omit<Quote, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(quotesRef, quoteId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating quote:', error);
    throw error;
  }
}

/**
 * Delete a quote
 */
export async function deleteQuote(quoteId: string): Promise<void> {
  try {
    await deleteDoc(doc(quotesRef, quoteId));
  } catch (error) {
    console.error('Error deleting quote:', error);
    throw error;
  }
}

/**
 * Convert a quote to an invoice (update quote status and return quote data for invoice creation)
 */
export async function convertQuoteToInvoice(quoteId: string): Promise<Quote> {
  try {
    const quote = await getQuote(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    // Update quote status to indicate it's been converted
    await updateQuote(quoteId, { status: QuoteStatus.ACCEPTED });

    return quote;
  } catch (error) {
    console.error('Error converting quote to invoice:', error);
    throw error;
  }
}