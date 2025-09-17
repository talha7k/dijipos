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
import { Service } from '@/types';

// Collection reference
const purchaseServicesRef = collection(db, 'purchaseServices');

/**
 * Fetch all purchase services for an organization
 */
export async function getPurchaseServices(organizationId: string): Promise<Service[]> {
  try {
    const servicesQuery = query(
      purchaseServicesRef,
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(servicesQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Service[];
  } catch (error) {
    console.error('Error fetching purchase services:', error);
    throw error;
  }
}

/**
 * Get a single purchase service by ID
 */
export async function getPurchaseService(serviceId: string): Promise<Service | null> {
  try {
    const serviceDoc = await getDoc(doc(purchaseServicesRef, serviceId));
    if (!serviceDoc.exists()) {
      return null;
    }

    const data = serviceDoc.data();
    return {
      id: serviceDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Service;
  } catch (error) {
    console.error('Error fetching purchase service:', error);
    throw error;
  }
}

/**
 * Create a new purchase service
 */
export async function createPurchaseService(data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(purchaseServicesRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating purchase service:', error);
    throw error;
  }
}

/**
 * Update a purchase service
 */
export async function updatePurchaseService(serviceId: string, updates: Partial<Omit<Service, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(purchaseServicesRef, serviceId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating purchase service:', error);
    throw error;
  }
}

/**
 * Delete a purchase service
 */
export async function deletePurchaseService(serviceId: string): Promise<void> {
  try {
    await deleteDoc(doc(purchaseServicesRef, serviceId));
  } catch (error) {
    console.error('Error deleting purchase service:', error);
    throw error;
  }
}