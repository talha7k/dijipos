'use client';

import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useOrganizationId, useUser, useSelectedOrganization } from '@/hooks/useAuthState';
import { PrinterSettings } from '@/types';
import { useReceiptTemplatesData } from '@/hooks/use-receipt-templates-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, FileText, File } from 'lucide-react';
import { toast } from 'sonner';

interface PrinterSettingsTabProps {
  printerSettings: PrinterSettings | null;
  onPrinterSettingsUpdate: (settings: PrinterSettings) => void;
}

export function PrinterSettingsTab({ printerSettings, onPrinterSettingsUpdate }: PrinterSettingsTabProps) {
  const organizationId = useOrganizationId();
  const { receiptTemplates, loading: templatesLoading } = useReceiptTemplatesData(organizationId || undefined);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newSettings, setNewSettings] = useState({
    defaultReceiptTemplateId: printerSettings?.defaultReceiptTemplateId || '',
    defaultInvoiceTemplateId: printerSettings?.defaultInvoiceTemplateId || '',
    defaultQuoteTemplateId: printerSettings?.defaultQuoteTemplateId || '',
    includeQRCode: printerSettings?.includeQRCode ?? true,
  });

  const handleUpdateSettings = async () => {
    if (!organizationId) return;

    setIsSaving(true);
    try {
      const updatedSettings: PrinterSettings = {
        id: 'printer',
        ...newSettings,
        ...(newSettings.defaultReceiptTemplateId && { defaultReceiptTemplateId: newSettings.defaultReceiptTemplateId }),
        ...(newSettings.defaultInvoiceTemplateId && { defaultInvoiceTemplateId: newSettings.defaultInvoiceTemplateId }),
        ...(newSettings.defaultQuoteTemplateId && { defaultQuoteTemplateId: newSettings.defaultQuoteTemplateId }),
        organizationId,
        createdAt: printerSettings?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'organizations', organizationId, 'settings', 'printer'), updatedSettings);
      onPrinterSettingsUpdate(updatedSettings);
      setSettingsDialogOpen(false);
      toast.success('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating printer settings:', error);
      toast.error('Failed to update settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
                       <Select
                         value={newSettings.defaultReceiptTemplateId}
                         onValueChange={(value) => setNewSettings({ ...newSettings, defaultReceiptTemplateId: value })}
                       >
                         <SelectTrigger>
                           <SelectValue placeholder="Select a template" />
                         </SelectTrigger>
                         <SelectContent>
                           {receiptTemplates.filter(t => t.type.toString().includes('thermal')).map((template) => (
                             <SelectItem key={template.id} value={template.id}>
                               {template.name}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                     <div>
                       <Label htmlFor="default-invoice-template">Default Invoice Template</Label>
                       <Select
                         value={newSettings.defaultInvoiceTemplateId}
                         onValueChange={(value) => setNewSettings({ ...newSettings, defaultInvoiceTemplateId: value })}
                       >
                         <SelectTrigger>
                           <SelectValue placeholder="Select a template" />
                         </SelectTrigger>
                         <SelectContent>
                           {receiptTemplates.filter(t => t.type.toString().includes('a4')).map((template) => (
                             <SelectItem key={template.id} value={template.id}>
                               {template.name}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                     <div>
                       <Label htmlFor="default-quote-template">Default Quote Template</Label>
                       <Select
                         value={newSettings.defaultQuoteTemplateId}
                         onValueChange={(value) => setNewSettings({ ...newSettings, defaultQuoteTemplateId: value })}
                       >
                         <SelectTrigger>
                           <SelectValue placeholder="Select a template" />
                         </SelectTrigger>
                         <SelectContent>
                           {receiptTemplates.filter(t => t.type.toString().includes('a4')).map((template) => (
                             <SelectItem key={template.id} value={template.id}>
                               {template.name}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                  </>
                )}
                 <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                   <div className="space-y-0.5 flex-1">
                     <Label htmlFor="include-qr" className="text-sm font-medium">Include ZATCA QR Code</Label>
                     <p className="text-sm text-muted-foreground">
                       Add QR code to receipts for tax compliance
                     </p>
                   </div>
                   <Switch
                     id="include-qr"
                     checked={newSettings.includeQRCode}
                     onCheckedChange={(checked) => setNewSettings({ ...newSettings, includeQRCode: checked })}
                     className="ml-4"
                   />
                 </div>
                 <Button onClick={handleUpdateSettings} disabled={isSaving} className="w-full">
                   {isSaving ? 'Saving...' : 'Update Settings'}
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
               <span className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${printerSettings.includeQRCode ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                 Include ZATCA QR Code:
               </span>
               <span className={`font-medium px-2 py-1 rounded text-xs ${printerSettings.includeQRCode ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                 {printerSettings.includeQRCode ? 'Enabled' : 'Disabled'}
               </span>
             </div>


          </div>
        ) : (
          <p className="text-muted-foreground">Print settings not configured.</p>
        )}
      </CardContent>
    </Card>
  );
}