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
import { OrderType } from '@/types';

const orderTypesRef = collection(db, 'orderTypes');

/**
 * Get all order types for an organization
 */
export async function getOrderTypes(organizationId: string): Promise<OrderType[]> {
  try {
    const orderTypesQuery = query(
      orderTypesRef,
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(orderTypesQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as OrderType[];
  } catch (error) {
    console.error('Error fetching order types:', error);
    throw error;
  }
}

/**
 * Create a new order type
 */
export async function createOrderType(data: Omit<OrderType, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(orderTypesRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating order type:', error);
    throw error;
  }
}

/**
 * Update an order type
 */
export async function updateOrderType(orderTypeId: string, updates: Partial<Omit<OrderType, 'id' | 'organizationId' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(orderTypesRef, orderTypeId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating order type:', error);
    throw error;
  }
}

/**
 * Delete an order type
 */
export async function deleteOrderType(orderTypeId: string): Promise<void> {
  try {
    const docRef = doc(orderTypesRef, orderTypeId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting order type:', error);
    throw error;
  }
}