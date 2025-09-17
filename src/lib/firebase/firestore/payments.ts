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
import { Payment } from '@/types';

// Collection reference
const paymentsRef = collection(db, 'payments');

/**
 * Fetch all payments for an organization
 */
export async function getPayments(organizationId: string): Promise<Payment[]> {
  try {
    const paymentsQuery = query(
      paymentsRef,
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(paymentsQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      paymentDate: doc.data().paymentDate?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Payment[];
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
}

/**
 * Get a single payment by ID
 */
export async function getPayment(paymentId: string): Promise<Payment | null> {
  try {
    const paymentDoc = await getDoc(doc(paymentsRef, paymentId));
    if (!paymentDoc.exists()) {
      return null;
    }

    const data = paymentDoc.data();
    return {
      id: paymentDoc.id,
      ...data,
      paymentDate: data.paymentDate?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Payment;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw error;
  }
}

/**
 * Create a new payment
 */
export async function createPayment(data: Omit<Payment, 'id' | 'createdAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(paymentsRef, {
      ...data,
      paymentDate: Timestamp.fromDate(data.paymentDate),
      createdAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
}

/**
 * Update a payment
 */
export async function updatePayment(paymentId: string, updates: Partial<Omit<Payment, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const updateData: Record<string, unknown> = { ...updates };
    if (updates.paymentDate) {
      updateData.paymentDate = Timestamp.fromDate(updates.paymentDate);
    }
    const docRef = doc(paymentsRef, paymentId);
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
}

/**
 * Delete a payment
 */
export async function deletePayment(paymentId: string): Promise<void> {
  try {
    await deleteDoc(doc(paymentsRef, paymentId));
  } catch (error) {
    console.error('Error deleting payment:', error);
    throw error;
  }
}