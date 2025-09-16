import { useState, useEffect, useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useDocumentQuery, useSetDocumentMutation } from '@tanstack-query-firebase/react/firestore';
import { db } from '@/lib/firebase';
import { VATSettings, PrinterSettings, FontSize, CHARACTER_SETS } from '@/types';

export function useSettingsData(organizationId: string | undefined) {
  const [vatSettings, setVatSettings] = useState<VATSettings | null>(null);
  const [printerSettings, setPrinterSettings] = useState<PrinterSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Always call the hooks, but conditionally enable them
  const vatSettingsQuery = useDocumentQuery(
    doc(db, 'organizations', organizationId || 'dummy', 'settings', 'vat'),
    {
      queryKey: ['vatSettings', organizationId],
      enabled: !!organizationId,
      subscribed: true, // Enable real-time updates
    }
  );

  const printerSettingsQuery = useDocumentQuery(
    doc(db, 'organizations', organizationId || 'dummy', 'settings', 'printer'),
    {
      queryKey: ['printerSettings', organizationId],
      enabled: !!organizationId,
      subscribed: true, // Enable real-time updates
    }
  );

  const setVatSettingsMutation = useSetDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'settings', 'vat')
  );

  const setPrinterSettingsMutation = useSetDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'settings', 'printer')
  );

  const processedVatSettings = useMemo(() => {
    if (!vatSettingsQuery.data?.exists()) return null;
    const vatData = vatSettingsQuery.data.data() as VATSettings;
    return {
      ...vatData,
      createdAt: vatData.createdAt,
      updatedAt: vatData.updatedAt,
    };
  }, [vatSettingsQuery.data]);

  const processedPrinterSettings = useMemo(() => {
    if (!printerSettingsQuery.data?.exists()) return null;
    const printerData = printerSettingsQuery.data.data() as PrinterSettings;
    return {
      ...printerData,
      createdAt: printerData.createdAt,
      updatedAt: printerData.updatedAt,
    };
  }, [printerSettingsQuery.data]);

  // Update state
  useMemo(() => {
    setVatSettings(processedVatSettings);
    setPrinterSettings(processedPrinterSettings);
    setLoading(vatSettingsQuery.isLoading || printerSettingsQuery.isLoading);
  }, [processedVatSettings, processedPrinterSettings, vatSettingsQuery.isLoading, printerSettingsQuery.isLoading]);

  useEffect(() => {
    if (!organizationId) return;

    const initializeSettings = async () => {
      try {
        // Check if VAT settings exist, create default if not
        if (!processedVatSettings) {
          const defaultVat: VATSettings = {
            id: 'vat',
            rate: 15,
            isEnabled: true,
            organizationId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          await setVatSettingsMutation.mutateAsync(defaultVat);
          setVatSettings(defaultVat);
        }

        // Check if printer settings exist, create default if not
        if (!processedPrinterSettings) {
          const defaultPrinter: PrinterSettings = {
            id: 'printer',
            paperWidth: 80,
            fontSize: FontSize.MEDIUM,
            characterPerLine: 48,
            characterSet: CHARACTER_SETS.MULTILINGUAL,
            organizationId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          await setPrinterSettingsMutation.mutateAsync(defaultPrinter);
          setPrinterSettings(defaultPrinter);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error initializing settings:', error);
        setLoading(false);
      }
    };

    initializeSettings();
  }, [organizationId, processedVatSettings, processedPrinterSettings, setVatSettingsMutation, setPrinterSettingsMutation]);

  const handleVatSettingsUpdate = (settings: VATSettings) => {
    setVatSettings(settings);
  };

  const handlePrinterSettingsUpdate = (settings: PrinterSettings) => {
    setPrinterSettings(settings);
  };

  // Return empty data when no organizationId
  if (!organizationId) {
    return {
      vatSettings: null,
      printerSettings: null,
      loading: false,
      handleVatSettingsUpdate: () => {},
      handlePrinterSettingsUpdate: () => {},
    };
  }

  return {
    vatSettings,
    printerSettings,
    loading,
    handleVatSettingsUpdate,
    handlePrinterSettingsUpdate,
  };
}