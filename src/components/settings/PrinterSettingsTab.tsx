'use client';

import { useAtomValue } from 'jotai';
import { selectedOrganizationAtom } from '@/atoms';
import { usePrinterSettings } from '@/lib/hooks/usePrinterSettings';
import { PrinterSettings } from '@/types';
import { useReceiptTemplatesData } from '@/lib/hooks/useReceiptTemplatesData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditableSetting } from '@/components/ui/editable-setting';
import { Settings, FileText, File } from 'lucide-react';
import { toast } from 'sonner';

interface PrinterSettingsTabProps {
  printerSettings: PrinterSettings | null;
  onPrinterSettingsUpdate: (settings: PrinterSettings) => void;
}

export function PrinterSettingsTab({ printerSettings, onPrinterSettingsUpdate }: PrinterSettingsTabProps) {
  const selectedOrganization = useAtomValue(selectedOrganizationAtom);
  const organizationId = selectedOrganization?.id;
  const { receiptTemplates, loading: templatesLoading } = useReceiptTemplatesData(organizationId || undefined);
  const { handlePrinterSettingsUpdate } = usePrinterSettings();

  const handleUpdateSettings = async (field: keyof PrinterSettings, value: string | number | boolean) => {
    if (!organizationId || !printerSettings) return;

    const updatedSettings: PrinterSettings = {
      ...printerSettings,
      [field]: value,
      updatedAt: new Date(),
    };

    try {
      handlePrinterSettingsUpdate(updatedSettings);
      onPrinterSettingsUpdate(updatedSettings);
      toast.success('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating printer settings:', error);
      toast.error('Failed to update settings. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Template & Print Settings
          <span className="text-sm text-muted-foreground">(Double-click to edit)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {printerSettings ? (
          <div className="space-y-4">
            {!templatesLoading && receiptTemplates.length > 0 && (
              <>
                <EditableSetting
                  label="Default Receipt Template"
                  value={printerSettings.defaultReceiptTemplateId || ''}
                  type="select"
                  options={receiptTemplates.filter(t => t.type.toString().includes('thermal')).map(t => ({
                    value: t.id,
                    label: t.name
                  }))}
                  onSave={(value) => handleUpdateSettings('defaultReceiptTemplateId', value)}
                  placeholder="Select template"
                />
                <EditableSetting
                  label="Default Invoice Template"
                  value={printerSettings.defaultInvoiceTemplateId || ''}
                  type="select"
                  options={receiptTemplates.filter(t => t.type.toString().includes('a4')).map(t => ({
                    value: t.id,
                    label: t.name
                  }))}
                  onSave={(value) => handleUpdateSettings('defaultInvoiceTemplateId', value)}
                  placeholder="Select template"
                />
                <EditableSetting
                  label="Default Quote Template"
                  value={printerSettings.defaultQuoteTemplateId || ''}
                  type="select"
                  options={receiptTemplates.filter(t => t.type.toString().includes('a4')).map(t => ({
                    value: t.id,
                    label: t.name
                  }))}
                  onSave={(value) => handleUpdateSettings('defaultQuoteTemplateId', value)}
                  placeholder="Select template"
                />
              </>
            )}
            <EditableSetting
              label="Include ZATCA QR Code"
              value={printerSettings.includeQRCode ?? true}
              type="switch"
              onSave={(value) => handleUpdateSettings('includeQRCode', value)}
            />
          </div>
        ) : (
          <p className="text-muted-foreground">Print settings not configured.</p>
        )}
      </CardContent>
    </Card>
  );
}