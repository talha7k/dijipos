import React from 'react';
import { PrinterSettings } from '@/types';
import {
  getPrinterSettings,
  createPrinterSettings,
  updatePrinterSettings
} from '../firebase/firestore/settings/printer';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';

import { useAtom } from 'jotai';
import { printerSettingsAtom, printerSettingsLoadingAtom, printerSettingsErrorAtom } from '@/atoms/uiAtoms';

interface PrinterSettingsState {
  printerSettings: PrinterSettings | null;
  loading: boolean;
  error: string | null;
}

interface PrinterSettingsActions {
  handlePrinterSettingsUpdate: (settings: PrinterSettings | Partial<PrinterSettings>) => Promise<void>;
}

/**
 * Hook that provides printer settings for the selected organization
 */
export function usePrinterSettings(): PrinterSettingsState & PrinterSettingsActions {
  const { selectedOrganization } = useOrganization();
  const [printerSettings, setPrinterSettings] = useAtom(printerSettingsAtom);
  const [loading, setLoading] = useAtom(printerSettingsLoadingAtom);
  const [error, setError] = useAtom(printerSettingsErrorAtom);

  // Use realtime collection to sync with database
  const {
    data: printerSettingsList,
    loading: realtimeLoading,
    error: realtimeError
  } = useRealtimeCollection<PrinterSettings>(
    'printerSettings',
    selectedOrganization?.id || null,
    [],
    null // Disable orderBy to prevent index errors
  );

  // Update global state when realtime data changes
  React.useEffect(() => {
    const newSettings = printerSettingsList.length > 0 ? printerSettingsList[0] : null;
    setPrinterSettings(newSettings);
    setLoading(realtimeLoading);
    setError(realtimeError);
  }, [printerSettingsList, realtimeLoading, realtimeError, setPrinterSettings, setLoading, setError]);

  const handlePrinterSettingsUpdate = async (settings: PrinterSettings | Partial<PrinterSettings>): Promise<void> => {
    try {
      if (!selectedOrganization?.id) {
        throw new Error('No organization selected');
      }

      // Check if this is a partial update or full settings
      const isPartial = !('id' in settings) || !('organizationId' in settings);

      if (isPartial) {
        // This is a partial update - merge with existing settings
        if (!printerSettings) {
          // No existing settings, create new ones with the partial data
          const newSettings: Omit<PrinterSettings, 'id' | 'createdAt' | 'updatedAt'> = {
            organizationId: selectedOrganization.id,
            includeQRCode: true, // default value
            defaultReceiptTemplateId: undefined,
            defaultInvoiceTemplateId: undefined,
            defaultQuoteTemplateId: undefined,
            ...settings,
          };

          const createdId = await createPrinterSettings(newSettings);
          // Fetch the created settings to update global state
          const createdSettings = await getPrinterSettings(selectedOrganization.id);
          if (createdSettings) {
            setPrinterSettings(createdSettings);
          } else {
            console.error('Failed to fetch created printer settings');
          }
          return;
        }

        // Merge with existing settings and update
        const mergedSettings: PrinterSettings = {
          ...printerSettings,
          ...settings,
          updatedAt: new Date(),
        };

        // Update using the existing document ID, but exclude the id field from the update data
        const { id, ...updateData } = mergedSettings;

        // Safety check: ensure the document still exists before updating
        try {
          await updatePrinterSettings(printerSettings.id, updateData);
          // Update global state immediately
          setPrinterSettings(mergedSettings);
        } catch (updateError: unknown) {
          console.warn('Update failed, document might not exist. Refetching settings...', updateError);
          // If update fails, refetch settings to get the current state
          const currentSettings = await getPrinterSettings(selectedOrganization.id);
          if (currentSettings) {
            setPrinterSettings(currentSettings);
          } else {
            // If no settings exist, clear the state
            setPrinterSettings(null);
          }
          throw updateError;
        }
        return;
      }

      // Full settings object - proceed with create/update logic
      const fullSettings = settings as PrinterSettings;

      // If we have existing settings, update them
      if (printerSettings) {
        // Exclude the id field from the update data
        const { id, ...updateData } = fullSettings;

        try {
          await updatePrinterSettings(printerSettings.id, updateData);
          // Update global state immediately
          setPrinterSettings(fullSettings);
        } catch (updateError: unknown) {
          console.warn('Full update failed, document might not exist. Refetching settings...', updateError);
          // If update fails, refetch settings to get the current state
          const currentSettings = await getPrinterSettings(selectedOrganization.id);
          if (currentSettings) {
            setPrinterSettings(currentSettings);
          } else {
            // If no settings exist, create new ones with the provided data
            console.log('No existing settings found, creating new ones...');
            const { id: _, createdAt: __, updatedAt: ___, ...createData } = fullSettings;
            const createdId = await createPrinterSettings({
              ...createData,
              organizationId: selectedOrganization.id,
            });
            // Fetch the created settings to update global state
            const createdSettings = await getPrinterSettings(selectedOrganization.id);
            setPrinterSettings(createdSettings);
          }
          return; // Don't throw error, we've handled it
        }
        return;
      }

      // No existing settings, create new ones
      const { id, createdAt, updatedAt, ...createData } = fullSettings;
      const createdId = await createPrinterSettings({
        ...createData,
        organizationId: selectedOrganization.id,
      });
      // Fetch the created settings to update global state
      const createdSettings = await getPrinterSettings(selectedOrganization.id);
      setPrinterSettings(createdSettings);
    } catch (err) {
      console.error('Error updating printer settings:', err);
      throw err;
    }
  };

  return {
    printerSettings,
    loading,
    error,
    handlePrinterSettingsUpdate,
  };
}