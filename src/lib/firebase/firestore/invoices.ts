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
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';
import { SalesInvoice, PurchaseInvoice, Payment } from '@/types';

// Collection references
const invoicesRef = collection(db, 'invoices');

/**
 * Fetch all invoices for an organization
 */
export async function getInvoices(organizationId: string): Promise<(SalesInvoice | PurchaseInvoice)[]> {
  try {
    const invoicesQuery = query(
      invoicesRef,
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(invoicesQuery);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      const baseData = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        invoiceDate: data.invoiceDate?.toDate(),
        dueDate: data.dueDate?.toDate(),
        validUntil: data.validUntil?.toDate(),
      };

      return baseData as unknown as SalesInvoice | PurchaseInvoice;
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
}

/**
 * Fetch sales invoices for an organization
 */
export async function getSalesInvoices(organizationId: string): Promise<SalesInvoice[]> {
  try {
    const invoicesQuery = query(
      invoicesRef,
      where('organizationId', '==', organizationId),
      where('type', '==', 'sales'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(invoicesQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      dueDate: doc.data().dueDate?.toDate() || new Date(),
    })) as SalesInvoice[];
  } catch (error) {
    console.error('Error fetching sales invoices:', error);
    throw error;
  }
}

/**
 * Fetch purchase invoices for an organization
 */
export async function getPurchaseInvoices(organizationId: string): Promise<PurchaseInvoice[]> {
  try {
    const invoicesQuery = query(
      invoicesRef,
      where('organizationId', '==', organizationId),
      where('type', '==', 'purchase'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(invoicesQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      invoiceDate: doc.data().invoiceDate?.toDate() || new Date(),
      dueDate: doc.data().dueDate?.toDate() || new Date(),
    })) as PurchaseInvoice[];
  } catch (error) {
    console.error('Error fetching purchase invoices:', error);
    throw error;
  }
}

/**
 * Get a single invoice by ID
 */
export async function getInvoice(invoiceId: string): Promise<SalesInvoice | PurchaseInvoice | null> {
  try {
    const invoiceDoc = await getDoc(doc(invoicesRef, invoiceId));
    if (!invoiceDoc.exists()) {
      return null;
    }

    const data = invoiceDoc.data();
    const baseData = {
      id: invoiceDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      invoiceDate: data.invoiceDate?.toDate(),
      dueDate: data.dueDate?.toDate(),
      validUntil: data.validUntil?.toDate(),
    };

    return baseData as unknown as SalesInvoice | PurchaseInvoice;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }
}

/**
 * Create a new sales invoice
 */
export async function createSalesInvoice(data: Omit<SalesInvoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();

    // Helper function to recursively remove undefined values
    const removeUndefined = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(removeUndefined);
      }
      if (obj !== null && typeof obj === 'object') {
        return Object.entries(obj).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = removeUndefined(value);
          }
          return acc;
        }, {} as any);
      }
      return obj;
    };

    const filteredData = removeUndefined(data);

    const docRef = await addDoc(invoicesRef, {
      ...filteredData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating sales invoice:', error);
    throw error;
  }
}

/**
 * Create a new purchase invoice
 */
export async function createPurchaseInvoice(data: Omit<PurchaseInvoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(invoicesRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating purchase invoice:', error);
    throw error;
  }
}

/**
 * Update an invoice
 */
export async function updateInvoice(
  invoiceId: string,
  updates: Partial<Omit<SalesInvoice | PurchaseInvoice, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const docRef = doc(invoicesRef, invoiceId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }
}

/**
 * Delete an invoice and all its payments
 */
export async function deleteInvoice(invoiceId: string): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Delete invoice document
    batch.delete(doc(invoicesRef, invoiceId));

    // Delete all invoice payments
    const paymentsRef = collection(doc(invoicesRef, invoiceId), 'payments');
    const paymentsSnapshot = await getDocs(paymentsRef);
    paymentsSnapshot.docs.forEach(paymentDoc => {
      batch.delete(paymentDoc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
}

// Invoice Payments functions

/**
 * Get invoice payments sub-collection reference
 */
function getInvoicePaymentsRef(invoiceId: string) {
  return collection(doc(invoicesRef, invoiceId), 'payments');
}

/**
 * Fetch all payments for an invoice
 */
export async function getInvoicePayments(invoiceId: string): Promise<Payment[]> {
  try {
    const paymentsRef = getInvoicePaymentsRef(invoiceId);
    const paymentsQuery = query(paymentsRef, orderBy('paymentDate', 'desc'));
    const snapshot = await getDocs(paymentsQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      paymentDate: doc.data().paymentDate?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Payment[];
  } catch (error) {
    console.error('Error fetching invoice payments:', error);
    throw error;
  }
}

/**
 * Add a payment to an invoice
 */
export async function addInvoicePayment(
  invoiceId: string,
  paymentData: Omit<Payment, 'id' | 'invoiceId' | 'createdAt'>
): Promise<string> {
  try {
    const paymentsRef = getInvoicePaymentsRef(invoiceId);
    const now = Timestamp.now();
    const docRef = await addDoc(paymentsRef, {
      ...paymentData,
      invoiceId,
      createdAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding invoice payment:', error);
    throw error;
  }
}

/**
 * Update an invoice payment
 */
export async function updateInvoicePayment(
  invoiceId: string,
  paymentId: string,
  updates: Partial<Omit<Payment, 'id' | 'invoiceId' | 'createdAt'>>
): Promise<void> {
  try {
    const paymentsRef = getInvoicePaymentsRef(invoiceId);
    const paymentDocRef = doc(paymentsRef, paymentId);
    await updateDoc(paymentDocRef, updates);
  } catch (error) {
    console.error('Error updating invoice payment:', error);
    throw error;
  }
}

/**
 * Delete an invoice payment
 */
export async function deleteInvoicePayment(invoiceId: string, paymentId: string): Promise<void> {
  try {
    const paymentsRef = getInvoicePaymentsRef(invoiceId);
    await deleteDoc(doc(paymentsRef, paymentId));
  } catch (error) {
    console.error('Error deleting invoice payment:', error);
    throw error;
  }
}