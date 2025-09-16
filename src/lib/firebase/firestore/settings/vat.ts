import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../config';
import { VATSettings } from '@/types';

const vatSettingsRef = collection(db, 'vatSettings');

/**
 * Get VAT settings for an organization
 */
export async function getVATSettings(organizationId: string): Promise<VATSettings | null> {
  try {
    const vatSettingsQuery = query(vatSettingsRef, where('organizationId', '==', organizationId));
    const snapshot = await getDocs(vatSettingsQuery);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as VATSettings;
  } catch (error) {
    console.error('Error fetching VAT settings:', error);
    throw error;
  }
}

/**
 * Create VAT settings for an organization
 */
export async function createVATSettings(data: Omit<VATSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(vatSettingsRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating VAT settings:', error);
    throw error;
  }
}

/**
 * Update VAT settings
 */
export async function updateVATSettings(vatSettingsId: string, updates: Partial<Omit<VATSettings, 'id' | 'organizationId' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(vatSettingsRef, vatSettingsId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating VAT settings:', error);
    throw error;
  }
}