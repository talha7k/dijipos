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
import { db } from '../../config';
import { PaymentType } from '@/types';

const paymentTypesRef = collection(db, 'paymentTypes');

/**
 * Get all payment types for an organization
 */
export async function getPaymentTypes(organizationId: string): Promise<PaymentType[]> {
  try {
    const paymentTypesQuery = query(
      paymentTypesRef,
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(paymentTypesQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as PaymentType[];
  } catch (error) {
    console.error('Error fetching payment types:', error);
    throw error;
  }
}

/**
 * Create a new payment type
 */
export async function createPaymentType(data: Omit<PaymentType, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(paymentTypesRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating payment type:', error);
    throw error;
  }
}

/**
 * Update a payment type
 */
export async function updatePaymentType(paymentTypeId: string, updates: Partial<Omit<PaymentType, 'id' | 'organizationId' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(paymentTypesRef, paymentTypeId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating payment type:', error);
    throw error;
  }
}

/**
 * Delete a payment type
 */
export async function deletePaymentType(paymentTypeId: string): Promise<void> {
  try {
    const docRef = doc(paymentTypesRef, paymentTypeId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting payment type:', error);
    throw error;
  }
}