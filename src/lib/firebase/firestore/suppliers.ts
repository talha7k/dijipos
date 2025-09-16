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
import { Supplier } from '@/types';

// Collection reference
const suppliersRef = collection(db, 'suppliers');

/**
 * Fetch all suppliers for an organization
 */
export async function getSuppliers(organizationId: string): Promise<Supplier[]> {
  try {
    const suppliersQuery = query(
      suppliersRef,
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(suppliersQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Supplier[];
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    throw error;
  }
}

/**
 * Get a single supplier by ID
 */
export async function getSupplier(supplierId: string): Promise<Supplier | null> {
  try {
    const supplierDoc = await getDoc(doc(suppliersRef, supplierId));
    if (!supplierDoc.exists()) {
      return null;
    }

    const data = supplierDoc.data();
    return {
      id: supplierDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Supplier;
  } catch (error) {
    console.error('Error fetching supplier:', error);
    throw error;
  }
}

/**
 * Create a new supplier
 */
export async function createSupplier(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(suppliersRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating supplier:', error);
    throw error;
  }
}

/**
 * Update a supplier
 */
export async function updateSupplier(supplierId: string, updates: Partial<Omit<Supplier, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(suppliersRef, supplierId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    throw error;
  }
}

/**
 * Delete a supplier
 */
export async function deleteSupplier(supplierId: string): Promise<void> {
  try {
    await deleteDoc(doc(suppliersRef, supplierId));
  } catch (error) {
    console.error('Error deleting supplier:', error);
    throw error;
  }
}