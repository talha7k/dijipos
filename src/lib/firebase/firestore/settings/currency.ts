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
import { CurrencySettings } from '@/types';

const currencySettingsRef = collection(db, 'currencySettings');

/**
 * Get currency settings for an organization
 */
export async function getCurrencySettings(organizationId: string): Promise<CurrencySettings | null> {
  try {
    const currencySettingsQuery = query(currencySettingsRef, where('organizationId', '==', organizationId));
    const snapshot = await getDocs(currencySettingsQuery);

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
    } as CurrencySettings;
  } catch (error) {
    console.error('Error fetching currency settings:', error);
    throw error;
  }
}

/**
 * Create currency settings for an organization
 */
export async function createCurrencySettings(data: Omit<CurrencySettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(currencySettingsRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating currency settings:', error);
    throw error;
  }
}

/**
 * Update currency settings
 */
export async function updateCurrencySettings(currencySettingsId: string, updates: Partial<Omit<CurrencySettings, 'id' | 'organizationId' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(currencySettingsRef, currencySettingsId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating currency settings:', error);
    throw error;
  }
}