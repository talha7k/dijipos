import { useState, useEffect } from 'react';
import { StoreSettings } from '@/types';
import { getStoreSettings, createDefaultStoreSettings } from '../firebase/firestore/settings/store';
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
        // Refresh complete store settings when printer settings change
        try {
          const updatedSettings = await getStoreSettings(selectedOrganization.id);
          setStoreSettings(updatedSettings);
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

  const combinedLoading = loading || realtimeLoading;
  const combinedError = error || realtimeError;

  return {
    storeSettings,
    loading: combinedLoading,
    error: combinedError,
    createDefaultSettings,
  };
}