'use client';

import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { PrinterSettings } from '@/types';
import { useReceiptTemplatesData } from '@/hooks/use-receipt-templates-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, FileText, File } from 'lucide-react';
import { toast } from 'sonner';

interface PrinterSettingsTabProps {
  printerSettings: PrinterSettings | null;
  onPrinterSettingsUpdate: (settings: PrinterSettings) => void;
}

export function PrinterSettingsTab({ printerSettings, onPrinterSettingsUpdate }: PrinterSettingsTabProps) {
  const { organizationId } = useAuth();
  const { receiptTemplates, loading: templatesLoading } = useReceiptTemplatesData(organizationId || undefined);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [newSettings, setNewSettings] = useState({
    defaultReceiptTemplateId: printerSettings?.defaultReceiptTemplateId || '',
    defaultInvoiceTemplateId: printerSettings?.defaultInvoiceTemplateId || '',
    defaultQuoteTemplateId: printerSettings?.defaultQuoteTemplateId || '',
    includeQRCode: printerSettings?.includeQRCode ?? true,
  });

  const handleUpdateSettings = async () => {
    if (!organizationId) return;

    const updatedSettings: PrinterSettings = {
      id: 'printer',
      ...newSettings,
      defaultReceiptTemplateId: newSettings.defaultReceiptTemplateId || undefined,
      defaultInvoiceTemplateId: newSettings.defaultInvoiceTemplateId || undefined,
      defaultQuoteTemplateId: newSettings.defaultQuoteTemplateId || undefined,
      organizationId,
      createdAt: printerSettings?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'organizations', organizationId, 'settings', 'printer'), updatedSettings);
    onPrinterSettingsUpdate(updatedSettings);
    setSettingsDialogOpen(false);
    toast.success('Settings updated successfully!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Template & Print Settings
          </div>
          <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Configure Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Template & Print Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {!templatesLoading && receiptTemplates.length > 0 && (
                  <>
                    <div>
                      <Label htmlFor="default-receipt-template">Default Receipt Template</Label>
                      <select
                        id="default-receipt-template"
                        className="w-full p-2 border rounded"
                        value={newSettings.defaultReceiptTemplateId}
                        onChange={(e) => setNewSettings({ ...newSettings, defaultReceiptTemplateId: e.target.value })}
                      >
                        <option value="">Select a template</option>
                        {receiptTemplates.filter(t => t.type === 'thermal').map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="default-invoice-template">Default Invoice Template</Label>
                      <select
                        id="default-invoice-template"
                        className="w-full p-2 border rounded"
                        value={newSettings.defaultInvoiceTemplateId}
                        onChange={(e) => setNewSettings({ ...newSettings, defaultInvoiceTemplateId: e.target.value })}
                      >
                        <option value="">Select a template</option>
                        {receiptTemplates.filter(t => t.type === 'a4').map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="default-quote-template">Default Quote Template</Label>
                      <select
                        id="default-quote-template"
                        className="w-full p-2 border rounded"
                        value={newSettings.defaultQuoteTemplateId}
                        onChange={(e) => setNewSettings({ ...newSettings, defaultQuoteTemplateId: e.target.value })}
                      >
                        <option value="">Select a template</option>
                        {receiptTemplates.filter(t => t.type === 'a4').map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="include-qr">Include ZATCA QR Code</Label>
                    <p className="text-sm text-muted-foreground">
                      Add QR code to receipts for tax compliance
                    </p>
                  </div>
                  <Switch
                    id="include-qr"
                    checked={newSettings.includeQRCode}
                    onCheckedChange={(checked) => setNewSettings({ ...newSettings, includeQRCode: checked })}
                  />
                </div>
                <Button onClick={handleUpdateSettings} className="w-full">
                  Update Settings
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {printerSettings ? (
          <div className="space-y-4">
            {printerSettings.defaultReceiptTemplateId && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Default Receipt Template:
                </span>
                <span className="font-medium">
                  {receiptTemplates.find(t => t.id === printerSettings.defaultReceiptTemplateId)?.name || 'Unknown'}
                </span>
              </div>
            )}
            {printerSettings.defaultInvoiceTemplateId && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  Default Invoice Template:
                </span>
                <span className="font-medium">
                  {receiptTemplates.find(t => t.id === printerSettings.defaultInvoiceTemplateId)?.name || 'Unknown'}
                </span>
              </div>
            )}
            {printerSettings.defaultQuoteTemplateId && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  Default Quote Template:
                </span>
                <span className="font-medium">
                  {receiptTemplates.find(t => t.id === printerSettings.defaultQuoteTemplateId)?.name || 'Unknown'}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span>Include ZATCA QR Code:</span>
              <span className="font-medium">
                {printerSettings.includeQRCode ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {/* Print Method Info */}
            <div className="border-t pt-4 mb-4">
              <h4 className="text-sm font-medium mb-3">Print Method:</h4>
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Browser Print (Active)</span>
                </div>
                <p className="text-sm text-blue-600">
                  Receipts will open in your browser&apos;s print dialog, optimized for thermal printers.
                  Includes QR codes containing order details for easy scanning.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Print settings not configured.</p>
        )}
      </CardContent>
    </Card>
  );
}