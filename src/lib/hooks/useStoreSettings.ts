import { useState, useEffect } from 'react';
import { StoreSettings } from '@/types';
import { getStoreSettings, createDefaultStoreSettings } from '../firebase/firestore/settings/store';
import { useOrganization } from './useOrganization';

interface StoreSettingsState {
  storeSettings: StoreSettings | null;
  loading: boolean;
  error: string | null;
}

interface StoreSettingsActions {
  refreshStoreSettings: () => Promise<void>;
  createDefaultSettings: () => Promise<void>;
}

/**
 * Hook that fetches the main StoreSettings and all related settings for the active organization
 */
export function useStoreSettings(): StoreSettingsState & StoreSettingsActions {
  const { selectedOrganization } = useOrganization();
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load store settings when selected organization changes
  useEffect(() => {
    if (selectedOrganization?.id) {
      refreshStoreSettings();
    } else {
      setStoreSettings(null);
    }
  }, [selectedOrganization?.id]);

  const refreshStoreSettings = async () => {
    if (!selectedOrganization?.id) return;

    setLoading(true);
    setError(null);

    try {
      let settings = await getStoreSettings(selectedOrganization.id);

      // If no settings exist, create default ones
      if (!settings) {
        settings = await createDefaultStoreSettings(selectedOrganization.id);
      }

      setStoreSettings(settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load store settings');
      console.error('Error loading store settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    if (!selectedOrganization?.id) return;

    setLoading(true);
    setError(null);

    try {
      const settings = await createDefaultStoreSettings(selectedOrganization.id);
      setStoreSettings(settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create default settings');
      console.error('Error creating default settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    storeSettings,
    loading,
    error,
    refreshStoreSettings,
    createDefaultSettings,
  };
}