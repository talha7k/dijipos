import { useState, useEffect } from 'react';
import { StoreSettings, OrderType, PaymentType } from '@/types';
import {
  getStoreSettings,
  createDefaultStoreSettings,
  createOrderType,
  updateOrderType,
  deleteOrderType,
  createPaymentType,
  updatePaymentType,
  deletePaymentType
} from '../firebase/firestore/settings/storeSettings';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface RawStoreSettings {
  id: string;
  organizationId: string;
  vatSettingsId: string;
  currencySettingsId: string;
  printerSettingsId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface StoreSettingsState {
  storeSettings: StoreSettings | null;
  loading: boolean;
  error: string | null;
}

interface StoreSettingsActions {
  createDefaultSettings: () => Promise<void>;
  refreshStoreSettings: () => Promise<void>;
  // Order Types CRUD
  createNewOrderType: (orderTypeData: Omit<OrderType, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateExistingOrderType: (orderTypeId: string, updates: Partial<Omit<OrderType, 'id' | 'createdAt'>>) => Promise<void>;
  deleteExistingOrderType: (orderTypeId: string) => Promise<void>;
  // Payment Types CRUD
  createNewPaymentType: (paymentTypeData: Omit<PaymentType, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateExistingPaymentType: (paymentTypeId: string, updates: Partial<Omit<PaymentType, 'id' | 'createdAt'>>) => Promise<void>;
  deleteExistingPaymentType: (paymentTypeId: string) => Promise<void>;
}

/**
 * Hook that fetches the main StoreSettings and all related settings for the active organization
 */
export function useStoreSettings(): StoreSettingsState & StoreSettingsActions {
  const { selectedOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

  // Real-time store settings (base document with reference IDs)
  const {
    data: storeSettingsList,
    loading: realtimeLoading,
    error: realtimeError
  } = useRealtimeCollection<RawStoreSettings>(
    'storeSettings',
    selectedOrganization?.id || null,
    [],
    null // Disable orderBy to prevent index errors
  );

  // Effect to load and refresh complete store settings
  useEffect(() => {
    if (!selectedOrganization?.id) {
      setStoreSettings(null);
      return;
    }

    const loadCompleteStoreSettings = async () => {
      try {
        setLoading(true);
        const completeSettings = await getStoreSettings(selectedOrganization.id);
        setStoreSettings(completeSettings);
      } catch (err) {
        console.error('Error loading store settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load store settings');
      } finally {
        setLoading(false);
      }
    };

    loadCompleteStoreSettings();
  }, [selectedOrganization?.id]);

  // Effect to set up real-time listeners for related collections
  useEffect(() => {
    if (!selectedOrganization?.id || storeSettingsList.length === 0) return;

    const baseStoreSettings = storeSettingsList[0];
    if (!baseStoreSettings.vatSettingsId || !baseStoreSettings.currencySettingsId || !baseStoreSettings.printerSettingsId) return;

    // Set up listeners for VAT and currency settings changes
    const vatUnsubscribe = onSnapshot(
      doc(db, 'vatSettings', baseStoreSettings.vatSettingsId),
      async () => {
        // Refresh complete store settings when VAT settings change
        try {
          const updatedSettings = await getStoreSettings(selectedOrganization.id);
          setStoreSettings(updatedSettings);
        } catch (err) {
          console.error('Error refreshing store settings after VAT change:', err);
        }
      }
    );

    const currencyUnsubscribe = onSnapshot(
      doc(db, 'currencySettings', baseStoreSettings.currencySettingsId),
      async () => {
        // Refresh complete store settings when currency settings change
        try {
          const updatedSettings = await getStoreSettings(selectedOrganization.id);
          setStoreSettings(updatedSettings);
        } catch (err) {
          console.error('Error refreshing store settings after currency change:', err);
        }
      }
    );

    const printerUnsubscribe = onSnapshot(
      doc(db, 'printerSettings', baseStoreSettings.printerSettingsId),
      async () => {
        console.log('[useStoreSettings] Printer settings realtime listener triggered');
        // Refresh complete store settings when printer settings change
        try {
          const updatedSettings = await getStoreSettings(selectedOrganization.id);
          console.log('[useStoreSettings] Realtime update - new printer settings:', updatedSettings?.printerSettings);
          setStoreSettings(updatedSettings ? { ...updatedSettings } : null);
        } catch (err) {
          console.error('Error refreshing store settings after printer change:', err);
        }
      }
    );

    return () => {
      vatUnsubscribe();
      currencyUnsubscribe();
      printerUnsubscribe();
    };
  }, [selectedOrganization?.id, storeSettingsList]);

  const createDefaultSettings = async () => {
    if (!selectedOrganization?.id) return;

    setLoading(true);
    setError(null);

    try {
      await createDefaultStoreSettings(selectedOrganization.id);
      // Load the complete settings after creation
      const completeSettings = await getStoreSettings(selectedOrganization.id);
      setStoreSettings(completeSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create default settings');
      console.error('Error creating default settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshStoreSettings = async () => {
    if (!selectedOrganization?.id) return;

    try {
      console.log('[useStoreSettings] Refreshing store settings...');
      const completeSettings = await getStoreSettings(selectedOrganization.id);
      console.log('[useStoreSettings] Retrieved store settings:', completeSettings);
      console.log('[useStoreSettings] Printer settings:', completeSettings?.printerSettings);
      // Ensure we create a new object reference to trigger re-renders
      setStoreSettings(completeSettings ? { ...completeSettings } : null);
      console.log('[useStoreSettings] Store settings updated');
    } catch (err) {
      console.error('Error refreshing store settings:', err);
    }
  };

  // Order Types CRUD operations
  const createNewOrderType = async (orderTypeData: Omit<OrderType, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!selectedOrganization?.id) {
      throw new Error('No organization selected');
    }

    try {
      return await createOrderType({
        ...orderTypeData,
        organizationId: selectedOrganization.id,
      });
    } catch (err) {
      console.error('Error creating order type:', err);
      throw err;
    }
  };

  const updateExistingOrderType = async (
    orderTypeId: string,
    updates: Partial<Omit<OrderType, 'id' | 'createdAt'>>
  ): Promise<void> => {
    try {
      await updateOrderType(orderTypeId, updates);
    } catch (err) {
      console.error('Error updating order type:', err);
      throw err;
    }
  };

  const deleteExistingOrderType = async (orderTypeId: string): Promise<void> => {
    try {
      await deleteOrderType(orderTypeId);
    } catch (err) {
      console.error('Error deleting order type:', err);
      throw err;
    }
  };

  // Payment Types CRUD operations
  const createNewPaymentType = async (paymentTypeData: Omit<PaymentType, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!selectedOrganization?.id) {
      throw new Error('No organization selected');
    }

    try {
      return await createPaymentType({
        ...paymentTypeData,
        organizationId: selectedOrganization.id,
      });
    } catch (err) {
      console.error('Error creating payment type:', err);
      throw err;
    }
  };

  const updateExistingPaymentType = async (
    paymentTypeId: string,
    updates: Partial<Omit<PaymentType, 'id' | 'createdAt'>>
  ): Promise<void> => {
    try {
      await updatePaymentType(paymentTypeId, updates);
    } catch (err) {
      console.error('Error updating payment type:', err);
      throw err;
    }
  };

  const deleteExistingPaymentType = async (paymentTypeId: string): Promise<void> => {
    try {
      await deletePaymentType(paymentTypeId);
    } catch (err) {
      console.error('Error deleting payment type:', err);
      throw err;
    }
  };

  const combinedLoading = loading || realtimeLoading;
  const combinedError = error || realtimeError;

  return {
    storeSettings,
    loading: combinedLoading,
    error: combinedError,
    createDefaultSettings,
    refreshStoreSettings,
    createNewOrderType,
    updateExistingOrderType,
    deleteExistingOrderType,
    createNewPaymentType,
    updateExistingPaymentType,
    deleteExistingPaymentType,
  };
}