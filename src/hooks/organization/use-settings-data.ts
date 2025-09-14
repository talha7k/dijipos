import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { VATSettings, PrinterSettings, FontSize, PrinterType } from '@/types';

export function useSettingsData(organizationId: string | undefined) {
  const [vatSettings, setVatSettings] = useState<VATSettings | null>(null);
  const [printerSettings, setPrinterSettings] = useState<PrinterSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) return;

    const fetchVatSettings = async () => {
      const vatDoc = await getDoc(doc(db, 'organizations', organizationId, 'settings', 'vat'));
      if (vatDoc.exists()) {
        const vatData = vatDoc.data() as VATSettings;
        setVatSettings({
          ...vatData,
          createdAt: vatData.createdAt,
          updatedAt: vatData.updatedAt,
        });
      } else {
        // Create default VAT settings
        const defaultVat: VATSettings = {
          id: 'vat',
          rate: 15,
          isEnabled: true,
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await setDoc(doc(db, 'organizations', organizationId, 'settings', 'vat'), defaultVat);
        setVatSettings(defaultVat);
      }
    };

    const fetchPrinterSettings = async () => {
      const printerDoc = await getDoc(doc(db, 'organizations', organizationId, 'settings', 'printer'));
      if (printerDoc.exists()) {
        const printerData = printerDoc.data() as PrinterSettings;
        setPrinterSettings({
          ...printerData,
          createdAt: printerData.createdAt,
          updatedAt: printerData.updatedAt,
        });
      } else {
        // Create default printer settings
        const defaultPrinter: PrinterSettings = {
          id: 'printer',
          paperWidth: 80,
          fontSize: FontSize.MEDIUM,
          characterPerLine: 48,
          characterSet: 'multilingual',
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await setDoc(doc(db, 'organizations', organizationId, 'settings', 'printer'), defaultPrinter);
        setPrinterSettings(defaultPrinter);
      }
    };

    const loadData = async () => {
      await Promise.all([fetchVatSettings(), fetchPrinterSettings()]);
      setLoading(false);
    };

    loadData();
  }, [organizationId]);

  const handleVatSettingsUpdate = (settings: VATSettings) => {
    setVatSettings(settings);
  };

  const handlePrinterSettingsUpdate = (settings: PrinterSettings) => {
    setPrinterSettings(settings);
  };

  return {
    vatSettings,
    printerSettings,
    loading,
    handleVatSettingsUpdate,
    handlePrinterSettingsUpdate,
  };
}