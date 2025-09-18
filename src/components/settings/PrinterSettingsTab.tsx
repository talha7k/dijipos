'use client';

import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { selectedOrganizationAtom, selectedOrganizationIdAtom } from '@/atoms';
import { useStoreSettings } from '@/lib/hooks/useStoreSettings';
import { PrinterSettings } from '@/types';
import { useReceiptTemplatesData } from '@/lib/hooks/useReceiptTemplatesData';
import { useInvoicesTemplatesData } from '@/lib/hooks/useInvoicesTemplatesData';
import { useQuotesTemplatesData } from '@/lib/hooks/useQuotesTemplatesData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditableSetting } from '@/components/ui/editable-setting';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Settings, Receipt, FileText, Quote } from 'lucide-react';
import { toast } from 'sonner';
import { FontSize } from '@/types/enums';

interface PrinterSettingsTabProps {
  printerSettings?: PrinterSettings | null;
  onPrinterSettingsUpdate?: (settings: PrinterSettings) => void;
}

export function PrinterSettingsTab({ printerSettings: propPrinterSettings, onPrinterSettingsUpdate }: PrinterSettingsTabProps) {
  const selectedOrganization = useAtomValue(selectedOrganizationAtom);
  const organizationId = useAtomValue(selectedOrganizationIdAtom);
  const [selectedTab, setSelectedTab] = useState('general');



  const { receiptTemplates, loading: templatesLoading } = useReceiptTemplatesData(organizationId || undefined);
  const { templates: invoiceTemplates } = useInvoicesTemplatesData(organizationId || undefined);
  const { templates: quoteTemplates } = useQuotesTemplatesData(organizationId || undefined);
  const { storeSettings, loading: storeSettingsLoading, refreshStoreSettings } = useStoreSettings();

  console.log('[PrinterSettingsTab] Templates loaded:', {
    receiptTemplates: receiptTemplates.length,
    invoiceTemplates: invoiceTemplates.length,
    quoteTemplates: quoteTemplates.length,
    templatesLoading,
    organizationId,
    storeSettings: !!storeSettings,
    storeSettingsLoading
  });



  // Use store settings printer settings, fallback to prop
  const printerSettings = storeSettings?.printerSettings || propPrinterSettings;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateSettings = async (field: string, value: string | number | boolean) => {
    console.log('[PrinterSettingsTab] handleUpdateSettings called:', { field, value, organizationId: !!organizationId, storeSettings: !!storeSettings, storeSettingsLoading });

    if (!organizationId) {
      console.error('[PrinterSettingsTab] Missing organizationId');
      return;
    }

    if (storeSettingsLoading) {
      console.log('[PrinterSettingsTab] Store settings still loading, waiting...');
      return;
    }

    if (!storeSettings) {
      console.error('[PrinterSettingsTab] Store settings not available');
      return;
    }

    try {
      let updatedSettings: PrinterSettings;

      if (printerSettings) {
        // Update existing settings
        updatedSettings = {
          ...printerSettings,
          updatedAt: new Date(),
        };

        // Handle nested document-specific settings
        if (field.includes('.')) {
          const [documentType, settingField] = field.split('.');
          if (documentType === 'receipts' && !updatedSettings.receipts) {
            updatedSettings.receipts = {};
          } else if (documentType === 'invoices' && !updatedSettings.invoices) {
            updatedSettings.invoices = {};
          } else if (documentType === 'quotes' && !updatedSettings.quotes) {
            updatedSettings.quotes = {};
          }

          if (documentType === 'receipts') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (updatedSettings.receipts as Record<string, any>)[settingField] = value;
          } else if (documentType === 'invoices') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (updatedSettings.invoices as Record<string, any>)[settingField] = value;
          } else if (documentType === 'quotes') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (updatedSettings.quotes as Record<string, any>)[settingField] = value;
          }
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (updatedSettings as any)[field] = value;
        }
      } else {
        // Create new settings
        updatedSettings = {
          id: '',
          organizationId,
          receipts: {
            includeQRCode: true,
            paperWidth: 80,
            fontSize: FontSize.MEDIUM,
            headingFont: 'Arial',
            bodyFont: 'Helvetica',
            lineSpacing: 1.2,
            autoPrint: false,
          },
          invoices: {
            paperWidth: 210, // A4 width
            fontSize: FontSize.MEDIUM,
            headingFont: 'Arial',
            bodyFont: 'Helvetica',
          },
          quotes: {
            paperWidth: 210, // A4 width
            fontSize: FontSize.MEDIUM,
            headingFont: 'Arial',
            bodyFont: 'Helvetica',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Handle nested document-specific settings
        if (field.includes('.')) {
          const [documentType, settingField] = field.split('.');
          if (documentType === 'receipts') {
            updatedSettings.receipts = { [settingField]: value };
          } else if (documentType === 'invoices') {
            updatedSettings.invoices = { [settingField]: value };
          } else if (documentType === 'quotes') {
            updatedSettings.quotes = { [settingField]: value };
          }
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (updatedSettings as Record<string, any>)[field] = value;
        }
      }

      // Update or create the printer settings in Firestore
      const { updatePrinterSettings, createPrinterSettings } = await import('@/lib/firebase/firestore/settings/storeSettings');

      if (printerSettings && printerSettings.id) {
        // Update existing printer settings
        const { id, organizationId: _, createdAt, ...updateData } = updatedSettings;
        await updatePrinterSettings(printerSettings.id, updateData);
        console.log('Updated existing printer settings with ID:', printerSettings.id);
      } else {
        // Create new printer settings if they don't exist or ID is missing
        const { id, createdAt, updatedAt, ...createData } = updatedSettings;
        const newId = await createPrinterSettings(createData);
        updatedSettings.id = newId;
        console.log('Created new printer settings with ID:', newId);
      }

      // Refresh store settings to ensure UI updates
      await refreshStoreSettings();

      onPrinterSettingsUpdate?.(updatedSettings);
      toast.success('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating printer settings:', error);
      console.error('Field:', field, 'Value:', value);
      console.error('Printer settings state:', printerSettings);
      console.error('Store settings state:', storeSettings);
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
        {(storeSettingsLoading || !printerSettings) && (
          <p className="text-sm text-muted-foreground mt-2">
            {storeSettingsLoading ? 'Loading settings...' : 'Settings will be created automatically when you make your first change.'}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ToggleGroup
            type="single"
            value={selectedTab}
            onValueChange={(value) => value && setSelectedTab(value)}
            variant="secondary"
            className="w-full justify-start"
          >
            <ToggleGroupItem value="general">General</ToggleGroupItem>
            <ToggleGroupItem value="receipts">
              <Receipt className="h-4 w-4 mr-2" />
              Receipts
            </ToggleGroupItem>
            <ToggleGroupItem value="invoices">
              <FileText className="h-4 w-4 mr-2" />
              Invoices
            </ToggleGroupItem>
            <ToggleGroupItem value="quotes">
              <Quote className="h-4 w-4 mr-2" />
              Quotes
            </ToggleGroupItem>
          </ToggleGroup>

          {selectedTab === 'general' && (
            <div className="space-y-4">
              {!templatesLoading && (
               <>
                    <EditableSetting
                      label="Default Receipt Template"
                      value={printerSettings?.receipts?.defaultTemplateId || ''}
                      type="select"
                      options={receiptTemplates.map(t => ({
                        value: t.id,
                        label: t.name
                      }))}
                      onSave={(value) => handleUpdateSettings('receipts.defaultTemplateId', value)}
                      placeholder="Select template"
                      disabled={storeSettingsLoading}
                    />
                    <div className="text-xs text-muted-foreground">
                      Current: {printerSettings?.receipts?.defaultTemplateId || 'None'} |
                      Available: {receiptTemplates.map(t => t.name).join(', ')}
                    </div>

                   <EditableSetting
                      label="Default Invoice Template"
                      value={printerSettings?.invoices?.defaultTemplateId || ''}
                      type="select"
                      options={invoiceTemplates.map(t => ({
                        value: t.id,
                        label: t.name
                      }))}
                       onSave={(value) => handleUpdateSettings('invoices.defaultTemplateId', value)}
                      placeholder="Select template"
                      disabled={storeSettingsLoading}
                    />

                    <EditableSetting
                      label="Default Quote Template"
                      value={printerSettings?.quotes?.defaultTemplateId || ''}
                      type="select"
                      options={quoteTemplates.map(t => ({
                        value: t.id,
                        label: t.name
                      }))}
                       onSave={(value) => handleUpdateSettings('quotes.defaultTemplateId', value)}
                      placeholder="Select template"
                      disabled={storeSettingsLoading}
                    />

                </>
              )}



 </div>
          )}

          {selectedTab === 'receipts' && (
            <div className="space-y-4">
             <div className="space-y-6">
               <div>
                 <h4 className="text-sm font-medium mb-3">Margins (mm)</h4>
                 <div className="grid grid-cols-2 gap-4">
                   <EditableSetting
                     label="Top Margin"
                     value={printerSettings?.receipts?.marginTop?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('receipts.marginTop', parseInt(value))}
                     placeholder="Enter top margin in mm"
                   />
                   <EditableSetting
                     label="Bottom Margin"
                     value={printerSettings?.receipts?.marginBottom?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('receipts.marginBottom', parseInt(value))}
                     placeholder="Enter bottom margin in mm"
                   />
                   <EditableSetting
                     label="Left Margin"
                     value={printerSettings?.receipts?.marginLeft?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('receipts.marginLeft', parseInt(value))}
                     placeholder="Enter left margin in mm"
                   />
                   <EditableSetting
                     label="Right Margin"
                     value={printerSettings?.receipts?.marginRight?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('receipts.marginRight', parseInt(value))}
                     placeholder="Enter right margin in mm"
                   />
                 </div>
               </div>
               <div>
                 <h4 className="text-sm font-medium mb-3">Padding (mm)</h4>
                 <div className="grid grid-cols-2 gap-4">
                   <EditableSetting
                     label="Top Padding"
                     value={printerSettings?.receipts?.paddingTop?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('receipts.paddingTop', parseInt(value))}
                     placeholder="Enter top padding in mm"
                   />
                   <EditableSetting
                     label="Bottom Padding"
                     value={printerSettings?.receipts?.paddingBottom?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('receipts.paddingBottom', parseInt(value))}
                     placeholder="Enter bottom padding in mm"
                   />
                   <EditableSetting
                     label="Left Padding"
                     value={printerSettings?.receipts?.paddingLeft?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('receipts.paddingLeft', parseInt(value))}
                     placeholder="Enter left padding in mm"
                   />
                   <EditableSetting
                     label="Right Padding"
                     value={printerSettings?.receipts?.paddingRight?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('receipts.paddingRight', parseInt(value))}
                     placeholder="Enter right padding in mm"
                   />
                 </div>
               </div>
               <div>
                 <h4 className="text-sm font-medium mb-3">Printer Settings</h4>
                 <div className="grid grid-cols-2 gap-4">
                   <EditableSetting
                     label="Include ZATCA QR Code"
                     value={printerSettings?.receipts?.includeQRCode ?? true}
                     type="switch"
                     onSave={(value) => handleUpdateSettings('receipts.includeQRCode', value)}
                   />
                   <EditableSetting
                     label="Paper Width (mm)"
                     value={printerSettings?.receipts?.paperWidth?.toString() || '80'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('receipts.paperWidth', parseInt(value))}
                     placeholder="Enter width in mm"
                   />
                   <EditableSetting
                     label="Font Size"
                     value={printerSettings?.receipts?.fontSize || FontSize.MEDIUM}
                     type="select"
                     options={[
                       { value: FontSize.SMALL, label: 'Small' },
                       { value: FontSize.MEDIUM, label: 'Medium' },
                       { value: FontSize.LARGE, label: 'Large' },
                     ]}
                     onSave={(value) => handleUpdateSettings('receipts.fontSize', value)}
                   />
                   <EditableSetting
                     label="Heading Font"
                     value={printerSettings?.receipts?.headingFont || 'Arial'}
                     type="select"
                     options={[
                       { value: 'Arial', label: 'Arial' },
                       { value: 'Helvetica', label: 'Helvetica' },
                       { value: 'Times New Roman', label: 'Times New Roman' },
                       { value: 'Georgia', label: 'Georgia' },
                       { value: 'Verdana', label: 'Verdana' },
                       { value: 'Courier New', label: 'Courier New' },
                     ]}
                     onSave={(value) => handleUpdateSettings('receipts.headingFont', value)}
                   />
                   <EditableSetting
                     label="Body Font"
                     value={printerSettings?.receipts?.bodyFont || 'Helvetica'}
                     type="select"
                     options={[
                       { value: 'Arial', label: 'Arial' },
                       { value: 'Helvetica', label: 'Helvetica' },
                       { value: 'Times New Roman', label: 'Times New Roman' },
                       { value: 'Georgia', label: 'Georgia' },
                       { value: 'Verdana', label: 'Verdana' },
                       { value: 'Courier New', label: 'Courier New' },
                     ]}
                     onSave={(value) => handleUpdateSettings('receipts.bodyFont', value)}
                   />
                   <EditableSetting
                     label="Line Spacing"
                     value={printerSettings?.receipts?.lineSpacing?.toString() || '1.2'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('receipts.lineSpacing', parseFloat(value))}
                     placeholder="Enter line spacing (e.g., 1.2)"
                   />
                   <EditableSetting
                     label="Auto Print"
                     value={printerSettings?.receipts?.autoPrint ?? false}
                     type="switch"
                     onSave={(value) => handleUpdateSettings('receipts.autoPrint', value)}
                   />
                 </div>
               </div>
             </div>
</div>
          )}

          {selectedTab === 'invoices' && (
            <div className="space-y-4">
             <div className="space-y-6">
               <div>
                 <h4 className="text-sm font-medium mb-3">Margins (mm)</h4>
                 <div className="grid grid-cols-2 gap-4">
                   <EditableSetting
                     label="Top Margin"
                     value={printerSettings?.invoices?.marginTop?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('invoices.marginTop', parseInt(value))}
                     placeholder="Enter top margin in mm"
                   />
                   <EditableSetting
                     label="Bottom Margin"
                     value={printerSettings?.invoices?.marginBottom?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('invoices.marginBottom', parseInt(value))}
                     placeholder="Enter bottom margin in mm"
                   />
                   <EditableSetting
                     label="Left Margin"
                     value={printerSettings?.invoices?.marginLeft?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('invoices.marginLeft', parseInt(value))}
                     placeholder="Enter left margin in mm"
                   />
                   <EditableSetting
                     label="Right Margin"
                     value={printerSettings?.invoices?.marginRight?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('invoices.marginRight', parseInt(value))}
                     placeholder="Enter right margin in mm"
                   />
                 </div>
               </div>
               <div>
                 <h4 className="text-sm font-medium mb-3">Padding (mm)</h4>
                 <div className="grid grid-cols-2 gap-4">
                   <EditableSetting
                     label="Top Padding"
                     value={printerSettings?.invoices?.paddingTop?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('invoices.paddingTop', parseInt(value))}
                     placeholder="Enter top padding in mm"
                   />
                   <EditableSetting
                     label="Bottom Padding"
                     value={printerSettings?.invoices?.paddingBottom?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('invoices.paddingBottom', parseInt(value))}
                     placeholder="Enter bottom padding in mm"
                   />
                   <EditableSetting
                     label="Left Padding"
                     value={printerSettings?.invoices?.paddingLeft?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('invoices.paddingLeft', parseInt(value))}
                     placeholder="Enter left padding in mm"
                   />
                   <EditableSetting
                     label="Right Padding"
                     value={printerSettings?.invoices?.paddingRight?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('invoices.paddingRight', parseInt(value))}
                     placeholder="Enter right padding in mm"
                   />
                 </div>
               </div>
               <div>
                 <h4 className="text-sm font-medium mb-3">Printer Settings</h4>
                 <div className="grid grid-cols-2 gap-4">
                   <EditableSetting
                     label="Paper Width (mm)"
                     value={printerSettings?.invoices?.paperWidth?.toString() || '210'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('invoices.paperWidth', parseInt(value))}
                     placeholder="Enter width in mm"
                   />
                   <EditableSetting
                     label="Font Size"
                     value={printerSettings?.invoices?.fontSize || FontSize.MEDIUM}
                     type="select"
                     options={[
                       { value: FontSize.SMALL, label: 'Small' },
                       { value: FontSize.MEDIUM, label: 'Medium' },
                       { value: FontSize.LARGE, label: 'Large' },
                     ]}
                     onSave={(value) => handleUpdateSettings('invoices.fontSize', value)}
                   />
                   <EditableSetting
                     label="Heading Font"
                     value={printerSettings?.invoices?.headingFont || 'Arial'}
                     type="select"
                     options={[
                       { value: 'Arial', label: 'Arial' },
                       { value: 'Helvetica', label: 'Helvetica' },
                       { value: 'Times New Roman', label: 'Times New Roman' },
                       { value: 'Georgia', label: 'Georgia' },
                       { value: 'Verdana', label: 'Verdana' },
                       { value: 'Courier New', label: 'Courier New' },
                     ]}
                     onSave={(value) => handleUpdateSettings('invoices.headingFont', value)}
                   />
                   <EditableSetting
                     label="Body Font"
                     value={printerSettings?.invoices?.bodyFont || 'Helvetica'}
                     type="select"
                     options={[
                       { value: 'Arial', label: 'Arial' },
                       { value: 'Helvetica', label: 'Helvetica' },
                       { value: 'Times New Roman', label: 'Times New Roman' },
                       { value: 'Georgia', label: 'Georgia' },
                       { value: 'Verdana', label: 'Verdana' },
                       { value: 'Courier New', label: 'Courier New' },
                     ]}
                     onSave={(value) => handleUpdateSettings('invoices.bodyFont', value)}
                   />
                 </div>
               </div>
             </div>
</div>
          )}

          {selectedTab === 'quotes' && (
            <div className="space-y-4">
             <div className="space-y-6">
               <div>
                 <h4 className="text-sm font-medium mb-3">Margins (mm)</h4>
                 <div className="grid grid-cols-2 gap-4">
                   <EditableSetting
                     label="Top Margin"
                     value={printerSettings?.quotes?.marginTop?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('quotes.marginTop', parseInt(value))}
                     placeholder="Enter top margin in mm"
                   />
                   <EditableSetting
                     label="Bottom Margin"
                     value={printerSettings?.quotes?.marginBottom?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('quotes.marginBottom', parseInt(value))}
                     placeholder="Enter bottom margin in mm"
                   />
                   <EditableSetting
                     label="Left Margin"
                     value={printerSettings?.quotes?.marginLeft?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('quotes.marginLeft', parseInt(value))}
                     placeholder="Enter left margin in mm"
                   />
                   <EditableSetting
                     label="Right Margin"
                     value={printerSettings?.quotes?.marginRight?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('quotes.marginRight', parseInt(value))}
                     placeholder="Enter right margin in mm"
                   />
                 </div>
               </div>
               <div>
                 <h4 className="text-sm font-medium mb-3">Padding (mm)</h4>
                 <div className="grid grid-cols-2 gap-4">
                   <EditableSetting
                     label="Top Padding"
                     value={printerSettings?.quotes?.paddingTop?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('quotes.paddingTop', parseInt(value))}
                     placeholder="Enter top padding in mm"
                   />
                   <EditableSetting
                     label="Bottom Padding"
                     value={printerSettings?.quotes?.paddingBottom?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('quotes.paddingBottom', parseInt(value))}
                     placeholder="Enter bottom padding in mm"
                   />
                   <EditableSetting
                     label="Left Padding"
                     value={printerSettings?.quotes?.paddingLeft?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('quotes.paddingLeft', parseInt(value))}
                     placeholder="Enter left padding in mm"
                   />
                   <EditableSetting
                     label="Right Padding"
                     value={printerSettings?.quotes?.paddingRight?.toString() || '0'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('quotes.paddingRight', parseInt(value))}
                     placeholder="Enter right padding in mm"
                   />
                 </div>
               </div>
               <div>
                 <h4 className="text-sm font-medium mb-3">Printer Settings</h4>
                 <div className="grid grid-cols-2 gap-4">
                   <EditableSetting
                     label="Paper Width (mm)"
                     value={printerSettings?.quotes?.paperWidth?.toString() || '210'}
                     type="number"
                     onSave={(value) => handleUpdateSettings('quotes.paperWidth', parseInt(value))}
                     placeholder="Enter width in mm"
                   />
                   <EditableSetting
                     label="Font Size"
                     value={printerSettings?.quotes?.fontSize || FontSize.MEDIUM}
                     type="select"
                     options={[
                       { value: FontSize.SMALL, label: 'Small' },
                       { value: FontSize.MEDIUM, label: 'Medium' },
                       { value: FontSize.LARGE, label: 'Large' },
                     ]}
                     onSave={(value) => handleUpdateSettings('quotes.fontSize', value)}
                   />
                   <EditableSetting
                     label="Heading Font"
                     value={printerSettings?.quotes?.headingFont || 'Arial'}
                     type="select"
                     options={[
                       { value: 'Arial', label: 'Arial' },
                       { value: 'Helvetica', label: 'Helvetica' },
                       { value: 'Times New Roman', label: 'Times New Roman' },
                       { value: 'Georgia', label: 'Georgia' },
                       { value: 'Verdana', label: 'Verdana' },
                       { value: 'Courier New', label: 'Courier New' },
                     ]}
                     onSave={(value) => handleUpdateSettings('quotes.headingFont', value)}
                   />
                   <EditableSetting
                     label="Body Font"
                     value={printerSettings?.quotes?.bodyFont || 'Helvetica'}
                     type="select"
                     options={[
                       { value: 'Arial', label: 'Arial' },
                       { value: 'Helvetica', label: 'Helvetica' },
                       { value: 'Times New Roman', label: 'Times New Roman' },
                       { value: 'Georgia', label: 'Georgia' },
                       { value: 'Verdana', label: 'Verdana' },
                       { value: 'Courier New', label: 'Courier New' },
                     ]}
                     onSave={(value) => handleUpdateSettings('quotes.bodyFont', value)}
                   />
                 </div>
               </div>
             </div>
</div>
          )}
         </div>
      </CardContent>
    </Card>
  );
}