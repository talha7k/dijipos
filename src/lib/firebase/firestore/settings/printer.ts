import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
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

    // Prepare the data for Firestore - ensure no undefined values
    const firestoreData: Record<string, unknown> = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    // Remove any undefined values to prevent Firestore errors
    Object.keys(firestoreData).forEach(key => {
      if (firestoreData[key] === undefined) {
        delete firestoreData[key];
      }
    });

    console.log('Creating printer settings with data:', firestoreData);

    const docRef = await addDoc(printerSettingsRef, firestoreData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating printer settings:', error);
    console.error('Data that caused error:', data);
    throw error;
  }
}

/**
 * Update printer settings
 */
export async function updatePrinterSettings(printerSettingsId: string, updates: Partial<Omit<PrinterSettings, 'id' | 'organizationId' | 'createdAt'>>): Promise<void> {
  try {
    // Prepare the update data - ensure no undefined values
    const updateData: Record<string, unknown> = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    // Remove any undefined values to prevent Firestore errors
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Clean up legacy root-level default template ID fields to prevent conflicts
    const legacyFields = ['defaultReceiptTemplateId', 'defaultInvoiceTemplateId', 'defaultQuoteTemplateId'];
    legacyFields.forEach(field => {
      // Explicitly set legacy fields to null to remove them from Firestore
      updateData[field] = null;
    });

    console.log('Updating printer settings:', printerSettingsId, 'with data:', updateData);

    const docRef = doc(printerSettingsRef, printerSettingsId);
    await setDoc(docRef, updateData, { merge: true });
  } catch (error) {
    console.error('Error updating printer settings:', error);
    console.error('Update data that caused error:', updates);
    throw error;
  }
}