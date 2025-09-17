import { PrinterSettings } from '@/types';
import {
  getPrinterSettings,
  createPrinterSettings,
  updatePrinterSettings
} from '../firebase/firestore/settings/printer';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';
import { STATIC_RECEIPT_TEMPLATE_IDS, STATIC_INVOICE_TEMPLATE_IDS, STATIC_QUOTE_TEMPLATE_IDS } from './useSeparatedTemplates';

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

  const {
    data: printerSettingsList,
    loading,
    error
  } = useRealtimeCollection<PrinterSettings>(
    'printerSettings',
    selectedOrganization?.id || null,
    [],
    null // Disable orderBy to prevent index errors
  );

  const printerSettings = printerSettingsList.length > 0 ? printerSettingsList[0] : null;

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
          
          await createPrinterSettings(newSettings);
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
        await updatePrinterSettings(printerSettings.id, updateData);
        return;
      }

      // Full settings object - proceed with create/update logic
      const fullSettings = settings as PrinterSettings;

      // If we have existing settings, update them
      if (printerSettings) {
        // Exclude the id field from the update data
        const { id, ...updateData } = fullSettings;
        await updatePrinterSettings(printerSettings.id, updateData);
        return;
      }

      // No existing settings, create new ones
      const { id, createdAt, updatedAt, ...createData } = fullSettings;
      await createPrinterSettings({
        ...createData,
        organizationId: selectedOrganization.id,
      });
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