'use client';

import { useState, useMemo } from 'react';
import { collection, doc } from 'firebase/firestore';
import { useCollectionQuery, useSetDocumentMutation } from '@tanstack-query-firebase/react/firestore';
import { db } from '@/lib/firebase';
import { CurrencySettings } from '@/types';
import { Currency, CurrencyLocale } from '@/types/enums';
import { useOrganizationId } from '@/hooks/useAuthState';

export function useCurrencySettings() {
  const organizationId = useOrganizationId();
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Always call the hook, but conditionally enable it
  const currencySettingsQuery = useCollectionQuery(
    collection(db, 'organizations', organizationId || 'dummy', 'settings'),
    {
      queryKey: ['currencySettings', organizationId],
      enabled: !!organizationId,
    }
  );

  const processedSettings = useMemo(() => {
    if (!currencySettingsQuery.data) return null;
    
    const settings = currencySettingsQuery.data.docs
      .map(doc => ({ id: doc.id, ...doc.data() }) as CurrencySettings)
      .find(setting => setting.id === 'currency');

    if (!settings) {
      // Create default currency settings
      const defaultSettings: CurrencySettings = {
        id: 'currency',
        locale: CurrencyLocale.AR_SA,
        currency: Currency.SAR,
        organizationId: organizationId || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return defaultSettings;
    }
    
    return settings;
  }, [currencySettingsQuery.data, organizationId]);

  // Update state
  useMemo(() => {
    setCurrencySettings(processedSettings);
    setLoading(currencySettingsQuery.isLoading);
    setError(currencySettingsQuery.error?.message || null);
  }, [processedSettings, currencySettingsQuery.isLoading, currencySettingsQuery.error]);

  const setCurrencySettingsMutation = useSetDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'settings', 'currency')
  );

  const updateCurrencySettings = async (updates: Partial<CurrencySettings>) => {
    if (!organizationId || !currencySettings) {
      throw new Error('Organization not found or settings not loaded');
    }

    const updatedSettings: CurrencySettings = {
      ...currencySettings,
      ...updates,
      updatedAt: new Date(),
    };

    await setCurrencySettingsMutation.mutateAsync(updatedSettings);
    setCurrencySettings(updatedSettings);
  };

  // Return empty data when no organizationId
  if (!organizationId) {
    return {
      currencySettings: null,
      loading: false,
      error: null,
      updateCurrencySettings: async () => { throw new Error('Organization not found or settings not loaded'); },
    };
  }

  return {
    currencySettings,
    loading,
    error,
    updateCurrencySettings,
  };
}