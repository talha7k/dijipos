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
const servicesRef = collection(db, 'services');

/**
 * Fetch all services for an organization
 */
export async function getServices(organizationId: string): Promise<Service[]> {
  try {
    const servicesQuery = query(
      servicesRef,
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
    console.error('Error fetching services:', error);
    throw error;
  }
}

/**
 * Get a single service by ID
 */
export async function getService(serviceId: string): Promise<Service | null> {
  try {
    const serviceDoc = await getDoc(doc(servicesRef, serviceId));
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
    console.error('Error fetching service:', error);
    throw error;
  }
}

/**
 * Create a new service
 */
export async function createService(data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();

    // Filter out undefined values to prevent Firestore errors
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    const docRef = await addDoc(servicesRef, {
      ...filteredData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
}

/**
 * Update a service
 */
export async function updateService(serviceId: string, updates: Partial<Omit<Service, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(servicesRef, serviceId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
}

/**
 * Delete a service
 */
export async function deleteService(serviceId: string): Promise<void> {
  try {
    await deleteDoc(doc(servicesRef, serviceId));
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
}