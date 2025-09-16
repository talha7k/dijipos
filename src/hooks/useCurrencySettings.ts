'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CurrencySettings } from '@/types';
import { Currency, CurrencyLocale } from '@/types/enums';
import { useOrganizationId } from '@/hooks/useAuthState';

export function useCurrencySettings() {
  const organizationId = useOrganizationId();
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setCurrencySettings(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const currencySettingsQuery = query(
      collection(db, 'organizations', organizationId, 'settings')
    );

    const unsubscribe = onSnapshot(
      currencySettingsQuery,
      (querySnapshot) => {
        const settings = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }) as CurrencySettings)
          .find(setting => setting.id === 'currency');

        if (!settings) {
          // Create default currency settings
          const defaultSettings: CurrencySettings = {
            id: 'currency',
            locale: CurrencyLocale.AR_SA,
            currency: Currency.SAR,
            organizationId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setCurrencySettings(defaultSettings);
        } else {
          setCurrencySettings(settings);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching currency settings:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [organizationId]);

  const updateCurrencySettings = async (updates: Partial<CurrencySettings>) => {
    if (!organizationId || !currencySettings) {
      throw new Error('Organization not found or settings not loaded');
    }

    const updatedSettings: CurrencySettings = {
      ...currencySettings,
      ...updates,
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'organizations', organizationId, 'settings', 'currency'), updatedSettings);
    setCurrencySettings(updatedSettings);
  };

  return {
    currencySettings,
    loading,
    error,
    updateCurrencySettings,
  };
}