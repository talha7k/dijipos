import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../config';
import { StoreSettings, VATSettings, CurrencySettings, OrderType, PaymentType, PrinterSettings, FontSize } from '@/types';

// Collection references
const storeSettingsRef = collection(db, 'storeSettings');
const vatSettingsRef = collection(db, 'vatSettings');
const currencySettingsRef = collection(db, 'currencySettings');
const orderTypesRef = collection(db, 'orderTypes');
const paymentTypesRef = collection(db, 'paymentTypes');
const printerSettingsRef = collection(db, 'printerSettings');

// =====================
// STORE SETTINGS
// =====================

/**
 * Get store settings for an organization (aggregated with all related settings)
 */
export async function getStoreSettings(organizationId: string): Promise<StoreSettings | null> {
  try {
    // Get store settings document
    const storeSettingsQuery = query(storeSettingsRef, where('organizationId', '==', organizationId));
    const storeSettingsSnapshot = await getDocs(storeSettingsQuery);

    if (storeSettingsSnapshot.empty) {
      return null;
    }

    const storeSettingsDoc = storeSettingsSnapshot.docs[0];
    const storeSettingsData = storeSettingsDoc.data();

    // Get VAT settings
    const vatSettingsDoc = await getDoc(doc(vatSettingsRef, storeSettingsData.vatSettingsId));
    const vatSettings: VATSettings = {
      id: vatSettingsDoc.id,
      ...vatSettingsDoc.data(),
      createdAt: vatSettingsDoc.data()?.createdAt?.toDate() || new Date(),
      updatedAt: vatSettingsDoc.data()?.updatedAt?.toDate() || new Date(),
    } as VATSettings;

    // Get currency settings
    const currencySettingsDoc = await getDoc(doc(currencySettingsRef, storeSettingsData.currencySettingsId));
    const currencySettings: CurrencySettings = {
      id: currencySettingsDoc.id,
      ...currencySettingsDoc.data(),
      createdAt: currencySettingsDoc.data()?.createdAt?.toDate() || new Date(),
      updatedAt: currencySettingsDoc.data()?.updatedAt?.toDate() || new Date(),
    } as CurrencySettings;

    // Get order types
    const orderTypesQuery = query(orderTypesRef, where('organizationId', '==', organizationId));
    const orderTypesSnapshot = await getDocs(orderTypesQuery);
    const orderTypes: OrderType[] = orderTypesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as OrderType[];

    // Get payment types
    const paymentTypesQuery = query(paymentTypesRef, where('organizationId', '==', organizationId));
    const paymentTypesSnapshot = await getDocs(paymentTypesQuery);
    const paymentTypes: PaymentType[] = paymentTypesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as PaymentType[];

    // Get printer settings
    const printerSettingsQuery = query(printerSettingsRef, where('organizationId', '==', organizationId));
    const printerSettingsSnapshot = await getDocs(printerSettingsQuery);
    let printerSettings: PrinterSettings;

    if (printerSettingsSnapshot.empty) {
      // Create default printer settings if none exist
      const defaultPrinterSettings = {
        organizationId,
        receipts: {
          includeQRCode: true,
          paperWidth: 80,
          fontSize: FontSize.MEDIUM,
          headingFont: 'Arial',
          bodyFont: 'Helvetica',
          lineSpacing: 1.2,
          autoPrint: false,
          defaultTemplateId: 'english-thermal', // Default receipt template
        },
        invoices: {
          paperWidth: 210,
          fontSize: FontSize.MEDIUM,
          headingFont: 'Arial',
          bodyFont: 'Helvetica',
          defaultTemplateId: 'english-invoice', // Default invoice template
        },
        quotes: {
          paperWidth: 210,
          fontSize: FontSize.MEDIUM,
          headingFont: 'Arial',
          bodyFont: 'Helvetica',
          defaultTemplateId: 'english-quote', // Default quote template
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      const printerDocRef = await addDoc(printerSettingsRef, defaultPrinterSettings);
      printerSettings = {
        id: printerDocRef.id,
        ...defaultPrinterSettings,
        createdAt: defaultPrinterSettings.createdAt.toDate(),
        updatedAt: defaultPrinterSettings.updatedAt.toDate(),
      } as PrinterSettings;
    } else {
      const printerDoc = printerSettingsSnapshot.docs[0];
      const printerData = printerDoc.data();
      // Filter out any legacy root-level default template fields
      const printerDataRecord = printerData as Record<string, unknown>;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { defaultReceiptTemplateId: _, defaultInvoiceTemplateId: __, defaultQuoteTemplateId: ___, ...cleanPrinterData } = printerDataRecord;
      printerSettings = {
        id: printerDoc.id,
        ...cleanPrinterData,
        createdAt: printerData.createdAt?.toDate() || new Date(),
        updatedAt: printerData.updatedAt?.toDate() || new Date(),
      } as PrinterSettings;
    }

    return {
      id: storeSettingsDoc.id,
      organizationId,
      vatSettings,
      currencySettings,
      orderTypes,
      paymentTypes,
      printerSettings,
      createdAt: storeSettingsData.createdAt?.toDate() || new Date(),
      updatedAt: storeSettingsData.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error fetching store settings:', error);
    throw error;
  }
}

/**
 * Create default store settings for an organization
 */
export async function createDefaultStoreSettings(organizationId: string): Promise<StoreSettings> {
  try {
    // Create VAT settings
    const vatSettingsData = {
      rate: 15,
      isEnabled: true,
      organizationId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const vatSettingsRef = await addDoc(collection(db, 'vatSettings'), vatSettingsData);

    // Create currency settings
    const currencySettingsData = {
      locale: 'ar-SA',
      currency: 'SAR',
      organizationId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const currencySettingsRef = await addDoc(collection(db, 'currencySettings'), currencySettingsData);

    // Create default order types
    const defaultOrderTypes = [
      { name: 'Dine-in', description: 'Eat in the restaurant', organizationId },
      { name: 'Take-away', description: 'Take food to go', organizationId },
      { name: 'Delivery', description: 'Deliver to customer', organizationId },
    ];

    const orderTypesPromises = defaultOrderTypes.map(orderType =>
      addDoc(orderTypesRef, {
        ...orderType,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
    );
    await Promise.all(orderTypesPromises);

    // Create default payment types
    const defaultPaymentTypes = [
      { name: 'Cash', description: 'Cash payment', organizationId },
      { name: 'Card', description: 'Credit/Debit card', organizationId },
      { name: 'Online', description: 'Online payment', organizationId },
    ];

    const paymentTypesPromises = defaultPaymentTypes.map(paymentType =>
      addDoc(paymentTypesRef, {
        ...paymentType,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
    );
    await Promise.all(paymentTypesPromises);

    // Create default printer settings
    const printerSettingsData = {
      organizationId,
      receipts: {
        includeQRCode: true,
        paperWidth: 80,
        fontSize: FontSize.MEDIUM,
        headingFont: 'Arial',
        bodyFont: 'Helvetica',
        lineSpacing: 1.2,
        autoPrint: false,
        defaultTemplateId: 'english-thermal', // Default receipt template
      },
      invoices: {
        paperWidth: 210,
        fontSize: FontSize.MEDIUM,
        headingFont: 'Arial',
        bodyFont: 'Helvetica',
        defaultTemplateId: 'english-invoice', // Default invoice template
      },
      quotes: {
        paperWidth: 210,
        fontSize: FontSize.MEDIUM,
        headingFont: 'Arial',
        bodyFont: 'Helvetica',
        defaultTemplateId: 'english-quote', // Default quote template
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const printerSettingsRef = await addDoc(collection(db, 'printerSettings'), printerSettingsData);

    // Create store settings document
    const storeSettingsData = {
      organizationId,
      vatSettingsId: vatSettingsRef.id,
      currencySettingsId: currencySettingsRef.id,
      printerSettingsId: printerSettingsRef.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    await addDoc(storeSettingsRef, storeSettingsData);

    // Return the complete store settings
    return await getStoreSettings(organizationId) as StoreSettings;
  } catch (error) {
    console.error('Error creating default store settings:', error);
    throw error;
  }
}

/**
 * Update store settings
 */
export async function updateStoreSettings(storeSettingsId: string, updates: Partial<Omit<StoreSettings, 'id' | 'organizationId' | 'createdAt' | 'vatSettings' | 'currencySettings' | 'orderTypes' | 'paymentTypes'>>): Promise<void> {
  try {
    const docRef = doc(storeSettingsRef, storeSettingsId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating store settings:', error);
    throw error;
  }
}

// =====================
// VAT SETTINGS
// =====================

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

// =====================
// CURRENCY SETTINGS
// =====================

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

// =====================
// PRINTER SETTINGS
// =====================

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
    // Validate required fields
    if (!data.organizationId || data.organizationId.trim() === '') {
      throw new Error('Invalid organization ID: organizationId cannot be empty');
    }

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
    console.log('Successfully created printer settings with ID:', docRef.id);
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
    // Validate input
    if (!printerSettingsId || printerSettingsId.trim() === '') {
      throw new Error('Invalid printer settings ID: ID cannot be empty');
    }

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

    console.log('Updating printer settings:', printerSettingsId, 'with data:', updateData);

    const docRef = doc(printerSettingsRef, printerSettingsId);
    await setDoc(docRef, updateData, { merge: true });

    console.log('Successfully updated printer settings:', printerSettingsId);
  } catch (error) {
    console.error('Error updating printer settings:', error);
    console.error('Printer settings ID:', printerSettingsId);
    console.error('Update data that caused error:', updates);
    throw error;
  }
}

// =====================
// ORDER TYPES
// =====================

/**
 * Get all order types for an organization
 */
export async function getOrderTypes(organizationId: string): Promise<OrderType[]> {
  try {
    const orderTypesQuery = query(
      orderTypesRef,
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(orderTypesQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as OrderType[];
  } catch (error) {
    console.error('Error fetching order types:', error);
    throw error;
  }
}

/**
 * Create a new order type
 */
export async function createOrderType(data: Omit<OrderType, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(orderTypesRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating order type:', error);
    throw error;
  }
}

/**
 * Update an order type
 */
export async function updateOrderType(orderTypeId: string, updates: Partial<Omit<OrderType, 'id' | 'organizationId' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(orderTypesRef, orderTypeId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating order type:', error);
    throw error;
  }
}

/**
 * Delete an order type
 */
export async function deleteOrderType(orderTypeId: string): Promise<void> {
  try {
    const docRef = doc(orderTypesRef, orderTypeId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting order type:', error);
    throw error;
  }
}

// =====================
// PAYMENT TYPES
// =====================

/**
 * Get all payment types for an organization
 */
export async function getPaymentTypes(organizationId: string): Promise<PaymentType[]> {
  try {
    const paymentTypesQuery = query(
      paymentTypesRef,
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(paymentTypesQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as PaymentType[];
  } catch (error) {
    console.error('Error fetching payment types:', error);
    throw error;
  }
}

/**
 * Create a new payment type
 */
export async function createPaymentType(data: Omit<PaymentType, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(paymentTypesRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating payment type:', error);
    throw error;
  }
}

/**
 * Update a payment type
 */
export async function updatePaymentType(paymentTypeId: string, updates: Partial<Omit<PaymentType, 'id' | 'organizationId' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(paymentTypesRef, paymentTypeId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating payment type:', error);
    throw error;
  }
}

/**
 * Delete a payment type
 */
export async function deletePaymentType(paymentTypeId: string): Promise<void> {
  try {
    const docRef = doc(paymentTypesRef, paymentTypeId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting payment type:', error);
    throw error;
  }
}