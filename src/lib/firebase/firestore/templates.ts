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
import { ReceiptTemplate, InvoiceTemplate, QuoteTemplate } from '@/types';

// Collection references
const receiptTemplatesRef = collection(db, 'receiptTemplates');
const invoiceTemplatesRef = collection(db, 'invoiceTemplates');
const quoteTemplatesRef = collection(db, 'quoteTemplates');

// Receipt Templates

/**
 * Fetch all receipt templates for an organization
 */
export async function getReceiptTemplates(organizationId: string): Promise<ReceiptTemplate[]> {
  try {
    const templatesQuery = query(
      receiptTemplatesRef,
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(templatesQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as ReceiptTemplate[];
  } catch (error) {
    console.error('Error fetching receipt templates:', error);
    throw error;
  }
}

/**
 * Create a new receipt template
 */
export async function createReceiptTemplate(data: Omit<ReceiptTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(receiptTemplatesRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating receipt template:', error);
    throw error;
  }
}

/**
 * Update a receipt template
 */
export async function updateReceiptTemplate(templateId: string, updates: Partial<Omit<ReceiptTemplate, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(receiptTemplatesRef, templateId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating receipt template:', error);
    throw error;
  }
}

/**
 * Delete a receipt template
 */
export async function deleteReceiptTemplate(templateId: string): Promise<void> {
  try {
    await deleteDoc(doc(receiptTemplatesRef, templateId));
  } catch (error) {
    console.error('Error deleting receipt template:', error);
    throw error;
  }
}

// Invoice Templates

/**
 * Fetch all invoice templates for an organization
 */
export async function getInvoiceTemplates(organizationId: string): Promise<InvoiceTemplate[]> {
  try {
    const templatesQuery = query(
      invoiceTemplatesRef,
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(templatesQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as InvoiceTemplate[];
  } catch (error) {
    console.error('Error fetching invoice templates:', error);
    throw error;
  }
}

/**
 * Create a new invoice template
 */
export async function createInvoiceTemplate(data: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(invoiceTemplatesRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating invoice template:', error);
    throw error;
  }
}

/**
 * Update an invoice template
 */
export async function updateInvoiceTemplate(templateId: string, updates: Partial<Omit<InvoiceTemplate, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(invoiceTemplatesRef, templateId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating invoice template:', error);
    throw error;
  }
}

/**
 * Delete an invoice template
 */
export async function deleteInvoiceTemplate(templateId: string): Promise<void> {
  try {
    await deleteDoc(doc(invoiceTemplatesRef, templateId));
  } catch (error) {
    console.error('Error deleting invoice template:', error);
    throw error;
  }
}

// Quote Templates

/**
 * Fetch all quote templates for an organization
 */
export async function getQuoteTemplates(organizationId: string): Promise<QuoteTemplate[]> {
  try {
    const templatesQuery = query(
      quoteTemplatesRef,
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(templatesQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as QuoteTemplate[];
  } catch (error) {
    console.error('Error fetching quote templates:', error);
    throw error;
  }
}

/**
 * Create a new quote template
 */
export async function createQuoteTemplate(data: Omit<QuoteTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(quoteTemplatesRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating quote template:', error);
    throw error;
  }
}

/**
 * Update a quote template
 */
export async function updateQuoteTemplate(templateId: string, updates: Partial<Omit<QuoteTemplate, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(quoteTemplatesRef, templateId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating quote template:', error);
    throw error;
  }
}

/**
 * Delete a quote template
 */
export async function deleteQuoteTemplate(templateId: string): Promise<void> {
  try {
    await deleteDoc(doc(quoteTemplatesRef, templateId));
  } catch (error) {
    console.error('Error deleting quote template:', error);
    throw error;
  }
}