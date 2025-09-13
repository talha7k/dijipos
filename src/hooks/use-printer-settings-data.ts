import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PrinterSettings } from '@/types';

export function usePrinterSettingsData(organizationId: string | undefined) {
  const [printerSettings, setPrinterSettings] = useState<PrinterSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setPrinterSettings(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const printerSettingsDoc = doc(db, 'organizations', organizationId, 'settings', 'printer');

    const unsubscribe = onSnapshot(
      printerSettingsDoc,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const settings = {
            ...docSnapshot.data(),
            createdAt: docSnapshot.data().createdAt?.toDate(),
            updatedAt: docSnapshot.data().updatedAt?.toDate(),
          } as PrinterSettings;
          
          setPrinterSettings(settings);
        } else {
          setPrinterSettings(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching printer settings:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [organizationId]);

  return { printerSettings, loading, error };
}