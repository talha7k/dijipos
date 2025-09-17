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
import { Table } from '@/types';

// Collection reference - this will be dynamically created with organization ID
const getTablesRef = (organizationId: string) => collection(db, 'organizations', organizationId, 'tables');

/**
 * Fetch all tables for an organization
 */
export async function getTables(organizationId: string): Promise<Table[]> {
  try {
    const tablesRef = getTablesRef(organizationId);
    const tablesQuery = query(
      tablesRef,
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(tablesQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Table[];
  } catch (error) {
    console.error('Error fetching tables:', error);
    throw error;
  }
}

/**
 * Get a single table by ID
 */
export async function getTable(organizationId: string, tableId: string): Promise<Table | null> {
  try {
    const tablesRef = getTablesRef(organizationId);
    const tableDoc = await getDoc(doc(tablesRef, tableId));
    if (!tableDoc.exists()) {
      return null;
    }

    const data = tableDoc.data();
    return {
      id: tableDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Table;
  } catch (error) {
    console.error('Error fetching table:', error);
    throw error;
  }
}

/**
 * Create a new table
 */
export async function createTable(data: Omit<Table, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const tablesRef = getTablesRef(data.organizationId);
    const docRef = await addDoc(tablesRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
}

/**
 * Update a table
 */
export async function updateTable(organizationId: string, tableId: string, updates: Partial<Omit<Table, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const tablesRef = getTablesRef(organizationId);
    const docRef = doc(tablesRef, tableId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating table:', error);
    throw error;
  }
}

/**
 * Delete a table
 */
export async function deleteTable(organizationId: string, tableId: string): Promise<void> {
  try {
    const tablesRef = getTablesRef(organizationId);
    await deleteDoc(doc(tablesRef, tableId));
  } catch (error) {
    console.error('Error deleting table:', error);
    throw error;
  }
}