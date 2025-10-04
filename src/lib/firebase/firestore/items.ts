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
import { Item, ItemType, ProductTransactionType } from '@/types';

// Collection reference
const itemsRef = collection(db, 'items');

/**
 * Fetch all items for an organization
 */
export async function getItems(organizationId: string): Promise<Item[]> {
  try {
    const itemsQuery = query(
      itemsRef,
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(itemsQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Item[];
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
}

/**
 * Fetch items by type for an organization
 */
export async function getItemsByType(organizationId: string, itemType: ItemType): Promise<Item[]> {
  try {
    const itemsQuery = query(
      itemsRef,
      where('organizationId', '==', organizationId),
      where('itemType', '==', itemType),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(itemsQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Item[];
  } catch (error) {
    console.error('Error fetching items by type:', error);
    throw error;
  }
}

/**
 * Fetch items by transaction type for an organization
 */
export async function getItemsByTransactionType(organizationId: string, transactionType: ProductTransactionType): Promise<Item[]> {
  try {
    const itemsQuery = query(
      itemsRef,
      where('organizationId', '==', organizationId),
      where('transactionType', '==', transactionType),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(itemsQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Item[];
  } catch (error) {
    console.error('Error fetching items by transaction type:', error);
    throw error;
  }
}

/**
 * Get a single item by ID
 */
export async function getItem(itemId: string): Promise<Item | null> {
  try {
    const itemDoc = await getDoc(doc(itemsRef, itemId));
    if (!itemDoc.exists()) {
      return null;
    }

    return {
      id: itemDoc.id,
      ...itemDoc.data(),
      createdAt: itemDoc.data().createdAt?.toDate() || new Date(),
      updatedAt: itemDoc.data().updatedAt?.toDate() || new Date(),
    } as Item;
  } catch (error) {
    console.error('Error fetching item:', error);
    throw error;
  }
}

/**
 * Create a new item
 */
export async function createItem(data: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();

    // Filter out undefined values to prevent Firebase errors
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    const docRef = await addDoc(itemsRef, {
      ...cleanedData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
}

/**
 * Update an item
 */
export async function updateItem(itemId: string, updates: Partial<Omit<Item, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(itemsRef, itemId);

    // Filter out undefined values to prevent Firebase errors
    const cleanedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await updateDoc(docRef, {
      ...cleanedUpdates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
}

/**
 * Delete an item
 */
export async function deleteItem(itemId: string): Promise<void> {
  try {
    await deleteDoc(doc(itemsRef, itemId));
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
}