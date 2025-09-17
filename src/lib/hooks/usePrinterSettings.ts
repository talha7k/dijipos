import { PrinterSettings } from '@/types';
import {
  getPrinterSettings,
  createPrinterSettings,
  updatePrinterSettings
} from '../firebase/firestore/settings/printer';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';

interface PrinterSettingsState {
  printerSettings: PrinterSettings | null;
  loading: boolean;
  error: string | null;
}

interface PrinterSettingsActions {
  handlePrinterSettingsUpdate: (settings: PrinterSettings) => Promise<void>;
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
    selectedOrganization?.id || null
  );

  const printerSettings = printerSettingsList.length > 0 ? printerSettingsList[0] : null;

  const handlePrinterSettingsUpdate = async (settings: PrinterSettings): Promise<void> => {
    try {
      if (!selectedOrganization?.id) {
        throw new Error('No organization selected');
      }

      if (printerSettings) {
        // Update existing settings
        await updatePrinterSettings(printerSettings.id, settings);
      } else {
        // Create new settings
        await createPrinterSettings({
          ...settings,
          organizationId: selectedOrganization.id,
        });
      }
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