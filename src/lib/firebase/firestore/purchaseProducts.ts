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
import { Product } from '@/types';

// Collection reference
const purchaseProductsRef = collection(db, 'purchaseProducts');

/**
 * Fetch all purchase products for an organization
 */
export async function getPurchaseProducts(organizationId: string): Promise<Product[]> {
  try {
    const productsQuery = query(
      purchaseProductsRef,
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(productsQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Product[];
  } catch (error) {
    console.error('Error fetching purchase products:', error);
    throw error;
  }
}

/**
 * Get a single purchase product by ID
 */
export async function getPurchaseProduct(productId: string): Promise<Product | null> {
  try {
    const productDoc = await getDoc(doc(purchaseProductsRef, productId));
    if (!productDoc.exists()) {
      return null;
    }

    const data = productDoc.data();
    return {
      id: productDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Product;
  } catch (error) {
    console.error('Error fetching purchase product:', error);
    throw error;
  }
}

/**
 * Create a new purchase product
 */
export async function createPurchaseProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(purchaseProductsRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating purchase product:', error);
    throw error;
  }
}

/**
 * Update a purchase product
 */
export async function updatePurchaseProduct(productId: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(purchaseProductsRef, productId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating purchase product:', error);
    throw error;
  }
}

/**
 * Delete a purchase product
 */
export async function deletePurchaseProduct(productId: string): Promise<void> {
  try {
    await deleteDoc(doc(purchaseProductsRef, productId));
  } catch (error) {
    console.error('Error deleting purchase product:', error);
    throw error;
  }
}