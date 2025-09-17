import { useState, useEffect } from 'react';
import { StoreSettings } from '@/types';
import { getStoreSettings, createDefaultStoreSettings } from '../firebase/firestore/settings/store';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';

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

  // Real-time store settings
  const {
    data: storeSettingsList,
    loading: realtimeLoading,
    error: realtimeError
  } = useRealtimeCollection<StoreSettings>(
    'storeSettings',
    selectedOrganization?.id || null,
    [],
    null // Disable orderBy to prevent index errors
  );

  // Get the first (and should be only) store settings document
  const storeSettings = storeSettingsList.length > 0 ? storeSettingsList[0] : null;

  // Load store settings when selected organization changes (for initial setup)
  useEffect(() => {
    if (selectedOrganization?.id && !storeSettings) {
      // Only try to create default settings if we don't have any
      getStoreSettings(selectedOrganization.id).then(existing => {
        if (!existing) {
          createDefaultStoreSettings(selectedOrganization.id).catch(err => {
            console.error('Error creating default store settings:', err);
          });
        }
      }).catch(err => {
        console.error('Error checking for existing store settings:', err);
      });
    }
  }, [selectedOrganization?.id, storeSettings]);

  const createDefaultSettings = async () => {
    if (!selectedOrganization?.id) return;

    setLoading(true);
    setError(null);

    try {
      await createDefaultStoreSettings(selectedOrganization.id);
      // Real-time listener will automatically update the storeSettings
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