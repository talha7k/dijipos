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
import { Customer } from '@/types';

// Collection reference
const customersRef = collection(db, 'customers');

/**
 * Fetch all customers for an organization
 */
export async function getCustomers(organizationId: string): Promise<Customer[]> {
  try {
    const customersQuery = query(
      customersRef,
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(customersQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Customer[];
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
}

/**
 * Get a single customer by ID
 */
export async function getCustomer(customerId: string): Promise<Customer | null> {
  try {
    const customerDoc = await getDoc(doc(customersRef, customerId));
    if (!customerDoc.exists()) {
      return null;
    }

    const data = customerDoc.data();
    return {
      id: customerDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Customer;
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
}

/**
 * Create a new customer
 */
export async function createCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(customersRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
}

/**
 * Update a customer
 */
export async function updateCustomer(customerId: string, updates: Partial<Omit<Customer, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(customersRef, customerId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
}

/**
 * Delete a customer
 */
export async function deleteCustomer(customerId: string): Promise<void> {
  try {
    await deleteDoc(doc(customersRef, customerId));
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
}