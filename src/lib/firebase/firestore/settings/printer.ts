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
import { PrinterSettings } from '@/types';

const printerSettingsRef = collection(db, 'printerSettings');

/**
 * Get printer settings for an organization
 */
export async function getPrinterSettings(organizationId: string): Promise<PrinterSettings | null> {
  try {
    const printerSettingsQuery = query(printerSettingsRef, where('organizationId', '==', organizationId));
    const snapshot = await getDocs(printerSettingsQuery);

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
    } as PrinterSettings;
  } catch (error) {
    console.error('Error fetching printer settings:', error);
    throw error;
  }
}

/**
 * Create printer settings for an organization
 */
export async function createPrinterSettings(data: Omit<PrinterSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(printerSettingsRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating printer settings:', error);
    throw error;
  }
}

/**
 * Update printer settings
 */
export async function updatePrinterSettings(printerSettingsId: string, updates: Partial<Omit<PrinterSettings, 'id' | 'organizationId' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(printerSettingsRef, printerSettingsId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating printer settings:', error);
    throw error;
  }
}