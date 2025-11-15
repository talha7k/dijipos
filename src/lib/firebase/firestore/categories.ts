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
import { Category, CategoryType } from '@/types';

// Collection reference
const categoriesRef = collection(db, 'categories');

/**
 * Fetch all categories for an organization
 */
export async function getCategories(organizationId: string): Promise<Category[]> {
  try {
    const categoriesQuery = query(
      categoriesRef,
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(categoriesQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Category[];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

/**
 * Fetch categories filtered by type (PRODUCT or SERVICE)
 */
export async function getCategoriesByType(organizationId: string, type: CategoryType): Promise<Category[]> {
  try {
    const categoriesQuery = query(
      categoriesRef,
      where('organizationId', '==', organizationId),
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(categoriesQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Category[];
  } catch (error) {
    console.error('Error fetching categories by type:', error);
    throw error;
  }
}

/**
 * Get a single category by ID
 */
export async function getCategory(categoryId: string): Promise<Category | null> {
  try {
    const categoryDoc = await getDoc(doc(categoriesRef, categoryId));
    if (!categoryDoc.exists()) {
      return null;
    }

    const data = categoryDoc.data();
    return {
      id: categoryDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Category;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
}

/**
 * Create a new category
 */
export async function createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();

    // Filter out undefined values to prevent Firestore errors
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    );

    const docRef = await addDoc(categoriesRef, {
      ...filteredData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

/**
 * Update a category
 */
export async function updateCategory(categoryId: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(categoriesRef, categoryId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    await deleteDoc(doc(categoriesRef, categoryId));
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}