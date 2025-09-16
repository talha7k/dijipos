import { useEffect, useState, useMemo } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PrinterSettings } from '@/types';

// Global singleton state for printer settings
const globalPrinterSettingsState = {
  listeners: new Map<string, {
    unsubscribe: () => void;
    refCount: number;
    data: PrinterSettings | null;
    loading: boolean;
    error: string | null;
  }>()
};

function getCacheKey(organizationId: string | undefined): string {
  return `printer-settings-${organizationId || 'none'}`;
}

export function usePrinterSettingsData(organizationId: string | undefined) {
  const [printerSettings, setPrinterSettings] = useState<PrinterSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = useMemo(() => getCacheKey(organizationId), [organizationId]);

  useEffect(() => {
    if (!organizationId) {
      setPrinterSettings(null);
      setLoading(false);
      return;
    }

    const existingListener = globalPrinterSettingsState.listeners.get(cacheKey);

    if (existingListener) {
      // Reuse existing listener
      existingListener.refCount++;
      setPrinterSettings(existingListener.data);
      setLoading(existingListener.loading);
      setError(existingListener.error);

      return () => {
        existingListener.refCount--;
        if (existingListener.refCount === 0) {
          existingListener.unsubscribe();
          globalPrinterSettingsState.listeners.delete(cacheKey);
        }
      };
    }

    // Create new listener
    setLoading(true);
    setError(null);

    const printerSettingsDoc = doc(db, 'organizations', organizationId, 'settings', 'printer');

    const unsubscribe = onSnapshot(
      printerSettingsDoc,
      (docSnapshot) => {
        let settingsData = null;
        if (docSnapshot.exists()) {
          settingsData = {
            ...docSnapshot.data(),
            createdAt: docSnapshot.data().createdAt?.toDate(),
            updatedAt: docSnapshot.data().updatedAt?.toDate(),
          } as PrinterSettings;
        }

        const listener = globalPrinterSettingsState.listeners.get(cacheKey);
        if (listener) {
          listener.data = settingsData;
          listener.loading = false;
          listener.error = null;
        }
        setPrinterSettings(settingsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching printer settings:', error);
        const listener = globalPrinterSettingsState.listeners.get(cacheKey);
        if (listener) {
          listener.loading = false;
          listener.error = error.message;
        }
        setError(error.message);
        setLoading(false);
      }
    );

    // Store the listener
    globalPrinterSettingsState.listeners.set(cacheKey, {
      unsubscribe,
      refCount: 1,
      data: null,
      loading: true,
      error: null,
    });

    return () => {
      const listener = globalPrinterSettingsState.listeners.get(cacheKey);
      if (listener) {
        listener.refCount--;
        if (listener.refCount === 0) {
          listener.unsubscribe();
          globalPrinterSettingsState.listeners.delete(cacheKey);
        }
      }
    };
  }, [organizationId, cacheKey]);

  return { printerSettings, loading, error };
}