import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../config';
import { StoreSettings, VATSettings, CurrencySettings, OrderType, PaymentType, PrinterSettings } from '@/types';
import { FontSize } from '@/types/enums';

// Collection references
const storeSettingsRef = collection(db, 'storeSettings');
const vatSettingsRef = collection(db, 'vatSettings');
const currencySettingsRef = collection(db, 'currencySettings');
const orderTypesRef = collection(db, 'orderTypes');
const paymentTypesRef = collection(db, 'paymentTypes');
const printerSettingsRef = collection(db, 'printerSettings');

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
        },
        invoices: {
          paperWidth: 210,
          fontSize: FontSize.MEDIUM,
          headingFont: 'Arial',
          bodyFont: 'Helvetica',
        },
        quotes: {
          paperWidth: 210,
          fontSize: FontSize.MEDIUM,
          headingFont: 'Arial',
          bodyFont: 'Helvetica',
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
      printerSettings = {
        id: printerDoc.id,
        ...printerData,
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
    const storeSettingsDocRef = await addDoc(storeSettingsRef, storeSettingsData);

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

/**
 * Create VAT settings
 */
export async function createVATSettings(organizationId: string, vatSettingsData: Omit<VATSettings, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(vatSettingsRef, {
      ...vatSettingsData,
      organizationId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating VAT settings:', error);
    throw error;
  }
}

/**
 * Create currency settings
 */
export async function createCurrencySettings(organizationId: string, currencySettingsData: Omit<CurrencySettings, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(currencySettingsRef, {
      ...currencySettingsData,
      organizationId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating currency settings:', error);
    throw error;
  }
}

// Order Types CRUD operations
export async function createOrderType(organizationId: string, orderTypeData: Omit<OrderType, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(orderTypesRef, {
      ...orderTypeData,
      organizationId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating order type:', error);
    throw error;
  }
}

export async function updateOrderType(orderTypeId: string, updates: Partial<Omit<OrderType, 'id' | 'createdAt'>>): Promise<void> {
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

export async function deleteOrderType(orderTypeId: string): Promise<void> {
  try {
    const docRef = doc(orderTypesRef, orderTypeId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting order type:', error);
    throw error;
  }
}

// Payment Types CRUD operations
export async function createPaymentType(organizationId: string, paymentTypeData: Omit<PaymentType, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(paymentTypesRef, {
      ...paymentTypeData,
      organizationId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating payment type:', error);
    throw error;
  }
}

export async function updatePaymentType(paymentTypeId: string, updates: Partial<Omit<PaymentType, 'id' | 'createdAt'>>): Promise<void> {
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

export async function deletePaymentType(paymentTypeId: string): Promise<void> {
  try {
    const docRef = doc(paymentTypesRef, paymentTypeId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting payment type:', error);
    throw error;
  }
}
