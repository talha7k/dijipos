'use client';

import { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { selectedOrganizationAtom } from '@/atoms';
import { ReceiptTemplate, InvoiceTemplate, QuoteTemplate, TemplateCategory, UnifiedTemplate, PrinterSettings } from '@/types';
import { ReceiptTemplateType, InvoiceTemplateType, QuoteTemplateType } from '@/types/enums';
import { useTemplates } from '@/lib/hooks/useTemplates';
import { usePrinterSettings } from '@/lib/hooks/usePrinterSettings';
import { useSeparatedTemplates, STATIC_RECEIPT_TEMPLATE_IDS, STATIC_INVOICE_TEMPLATE_IDS, STATIC_QUOTE_TEMPLATE_IDS } from '@/lib/hooks/useSeparatedTemplates';
import {
  createReceiptTemplate,
  createInvoiceTemplate,
  createQuoteTemplate,
  updateReceiptTemplate,
  updateInvoiceTemplate,
  updateQuoteTemplate,
  deleteReceiptTemplate,
  deleteInvoiceTemplate,
  deleteQuoteTemplate
} from '@/lib/firebase/firestore/templates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { defaultEnglishReceiptTemplate } from '@/components/templates/receipt/default-receipt-thermal-english';

// Static template IDs are imported from useSeparatedTemplates

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface TemplatesTabProps {
  // No longer need receiptTemplates prop since we use the hook
}

export function TemplatesTab({}: TemplatesTabProps) {
  const selectedOrganization = useAtomValue(selectedOrganizationAtom);
  const organizationId = selectedOrganization?.id;
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>(TemplateCategory.RECEIPT);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    content: '',
    type: 'thermal' as 'thermal' | 'a4',
    customHeader: '',
    customFooter: ''
  });

  const { receiptTemplates, invoiceTemplates, quoteTemplates, loading } = useTemplates();
  const { printerSettings, handlePrinterSettingsUpdate } = usePrinterSettings();
  const { allReceiptTemplates, allInvoiceTemplates, allQuoteTemplates } = useSeparatedTemplates();

  // Local state for default template IDs to ensure immediate UI updates
  const [localDefaults, setLocalDefaults] = useState({
    receipt: printerSettings?.defaultReceiptTemplateId,
    invoice: printerSettings?.defaultInvoiceTemplateId,
    quote: printerSettings?.defaultQuoteTemplateId,
  });

  // Update local defaults when printer settings change
  useEffect(() => {
    setLocalDefaults({
      receipt: printerSettings?.defaultReceiptTemplateId,
      invoice: printerSettings?.defaultInvoiceTemplateId,
      quote: printerSettings?.defaultQuoteTemplateId,
    });
  }, [printerSettings]);

  // Helper function to check if a template is the current default
  const isTemplateDefault = (templateId: string): boolean => {
    switch (selectedCategory) {
      case TemplateCategory.RECEIPT:
        return localDefaults.receipt === templateId;
      case TemplateCategory.INVOICE:
        return localDefaults.invoice === templateId;
      case TemplateCategory.QUOTE:
        return localDefaults.quote === templateId;
      default:
        return false;
    }
  };



  // Get templates based on selected category
  const getTemplates = () => {
    switch (selectedCategory) {
      case TemplateCategory.RECEIPT:
        return allReceiptTemplates || receiptTemplates;
      case TemplateCategory.INVOICE:
        return allInvoiceTemplates || invoiceTemplates;
      case TemplateCategory.QUOTE:
        return allQuoteTemplates || quoteTemplates;
      default:
        return [];
    }
  };

  const templates = getTemplates();

  const handleAddTemplate = async () => {
    if (!organizationId || !newTemplate.name.trim()) return;

    try {
      const templateData = {
        name: newTemplate.name,
        description: newTemplate.description,
        type: newTemplate.type as unknown as ReceiptTemplateType,
        content: newTemplate.content || defaultEnglishReceiptTemplate,
        customHeader: newTemplate.customHeader,
        customFooter: newTemplate.customFooter,
        isDefault: templates.length === 0,
        organizationId,
      };

      switch (selectedCategory) {
        case TemplateCategory.RECEIPT:
          await createReceiptTemplate(templateData as Omit<ReceiptTemplate, 'id' | 'createdAt' | 'updatedAt'>);
          break;
        case TemplateCategory.INVOICE:
          await createInvoiceTemplate(templateData as unknown as Omit<InvoiceTemplate, 'id' | 'createdAt' | 'updatedAt'>);
          break;
        case TemplateCategory.QUOTE:
          await createQuoteTemplate(templateData as unknown as Omit<QuoteTemplate, 'id' | 'createdAt' | 'updatedAt'>);
          break;
      }

      setNewTemplate({ name: '', description: '', content: '', type: 'thermal', customHeader: '', customFooter: '' });
      setTemplateDialogOpen(false);
      toast.success(`${selectedCategory} template added successfully`);
    } catch (error) {
      console.error('Error adding template:', error);
      toast.error(`Failed to add ${selectedCategory.toLowerCase()} template`);
    }
  };

  const handleSetDefaultTemplate = async (templateId: string) => {
    if (!organizationId) return;

    try {
      // Check if this is a static template
      const isStaticTemplate = 
        (selectedCategory === TemplateCategory.RECEIPT && STATIC_RECEIPT_TEMPLATE_IDS.includes(templateId)) ||
        (selectedCategory === TemplateCategory.INVOICE && STATIC_INVOICE_TEMPLATE_IDS.includes(templateId)) ||
        (selectedCategory === TemplateCategory.QUOTE && STATIC_QUOTE_TEMPLATE_IDS.includes(templateId));

      // Only update Firestore templates (not static templates)
      if (!isStaticTemplate) {
        // First, unset all other custom templates as default
        const allTemplates = getTemplates();
        for (const template of allTemplates) {
          if (template.id !== templateId && template.isDefault) {
            // Skip static templates when updating defaults
            const isTemplateStatic = 
              (selectedCategory === TemplateCategory.RECEIPT && STATIC_RECEIPT_TEMPLATE_IDS.includes(template.id)) ||
              (selectedCategory === TemplateCategory.INVOICE && STATIC_INVOICE_TEMPLATE_IDS.includes(template.id)) ||
              (selectedCategory === TemplateCategory.QUOTE && STATIC_QUOTE_TEMPLATE_IDS.includes(template.id));
            
            if (!isTemplateStatic) {
              const updateData = { isDefault: false };
              switch (selectedCategory) {
                case TemplateCategory.RECEIPT:
                  await updateReceiptTemplate(template.id, updateData);
                  break;
                case TemplateCategory.INVOICE:
                  await updateInvoiceTemplate(template.id, updateData);
                  break;
                case TemplateCategory.QUOTE:
                  await updateQuoteTemplate(template.id, updateData);
                  break;
              }
            }
          }
        }

        // Set the selected custom template as default
        const updateData = { isDefault: true };
        switch (selectedCategory) {
          case TemplateCategory.RECEIPT:
            await updateReceiptTemplate(templateId, updateData);
            break;
          case TemplateCategory.INVOICE:
            await updateInvoiceTemplate(templateId, updateData);
            break;
          case TemplateCategory.QUOTE:
            await updateQuoteTemplate(templateId, updateData);
            break;
        }
      }

      // Update local state immediately for instant UI feedback
      setLocalDefaults(prev => ({
        ...prev,
        [selectedCategory === TemplateCategory.RECEIPT ? 'receipt' :
         selectedCategory === TemplateCategory.INVOICE ? 'invoice' : 'quote']: templateId
      }));

      // Update printer settings to persist the default template choice
      // For updates, we only send the fields that can actually change
      const settingsToUpdate: Partial<PrinterSettings> = {
        includeQRCode: printerSettings?.includeQRCode ?? true,
      };

      // Set the appropriate template ID based on category
      switch (selectedCategory) {
        case TemplateCategory.RECEIPT:
          settingsToUpdate.defaultReceiptTemplateId = templateId;
          break;
        case TemplateCategory.INVOICE:
          settingsToUpdate.defaultInvoiceTemplateId = templateId;
          break;
        case TemplateCategory.QUOTE:
          settingsToUpdate.defaultQuoteTemplateId = templateId;
          break;
      }

      // Preserve existing template IDs for other categories
      if (printerSettings) {
        if (selectedCategory !== TemplateCategory.RECEIPT && printerSettings.defaultReceiptTemplateId) {
          settingsToUpdate.defaultReceiptTemplateId = printerSettings.defaultReceiptTemplateId;
        }
        if (selectedCategory !== TemplateCategory.INVOICE && printerSettings.defaultInvoiceTemplateId) {
          settingsToUpdate.defaultInvoiceTemplateId = printerSettings.defaultInvoiceTemplateId;
        }
        if (selectedCategory !== TemplateCategory.QUOTE && printerSettings.defaultQuoteTemplateId) {
          settingsToUpdate.defaultQuoteTemplateId = printerSettings.defaultQuoteTemplateId;
        }
      }

      console.log('Sending printer settings to update:', settingsToUpdate);
      await handlePrinterSettingsUpdate(settingsToUpdate);

      toast.success(`${selectedCategory} template set as default`);
    } catch (error) {
      console.error('Error setting default template:', error);
      toast.error(`Failed to set default ${selectedCategory.toLowerCase()} template`);
    }
  };

  const handleDeleteTemplate = (id: string) => {
    setDeleteTemplateId(id);
  };

  const confirmDeleteTemplate = async () => {
    if (!organizationId || !deleteTemplateId) return;

    // Check if trying to delete a static template
    let isStaticTemplate = false;
    switch (selectedCategory) {
      case TemplateCategory.RECEIPT:
        isStaticTemplate = STATIC_RECEIPT_TEMPLATE_IDS.includes(deleteTemplateId);
        break;
      case TemplateCategory.INVOICE:
        isStaticTemplate = STATIC_INVOICE_TEMPLATE_IDS.includes(deleteTemplateId);
        break;
      case TemplateCategory.QUOTE:
        isStaticTemplate = STATIC_QUOTE_TEMPLATE_IDS.includes(deleteTemplateId);
        break;
    }

    if (isStaticTemplate) {
      toast.info('Default templates cannot be deleted. Create a custom template if needed.');
      setDeleteTemplateId(null);
      return;
    }

    try {
      switch (selectedCategory) {
        case TemplateCategory.RECEIPT:
          await deleteReceiptTemplate(deleteTemplateId);
          break;
        case TemplateCategory.INVOICE:
          await deleteInvoiceTemplate(deleteTemplateId);
          break;
        case TemplateCategory.QUOTE:
          await deleteQuoteTemplate(deleteTemplateId);
          break;
      }
      toast.success(`${selectedCategory} template deleted successfully`);
    } catch (error) {
      console.error(`Error deleting ${selectedCategory.toLowerCase()} template:`, error);
      toast.error(`Failed to delete ${selectedCategory.toLowerCase()} template`);
    } finally {
      setDeleteTemplateId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Templates
          </div>
          <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Template Category</Label>
                  <ToggleGroup
                    type="single"
                    value={selectedCategory}
                    onValueChange={(value) => value && setSelectedCategory(value as TemplateCategory)}
                    className="justify-start"
                  >
                    <ToggleGroupItem value={TemplateCategory.RECEIPT}>Receipt</ToggleGroupItem>
                    <ToggleGroupItem value={TemplateCategory.INVOICE}>Invoice</ToggleGroupItem>
                    <ToggleGroupItem value={TemplateCategory.QUOTE}>Quote</ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    placeholder={`e.g., Thermal ${selectedCategory}, A4 ${selectedCategory}`}
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="template-description">Description (Optional)</Label>
                  <Input
                    id="template-description"
                    placeholder="Description for this template"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="custom-header">Custom Header (Optional)</Label>
                  <Input
                    id="custom-header"
                    placeholder="Custom header text (will appear at the top of receipts)"
                    value={newTemplate.customHeader}
                    onChange={(e) => setNewTemplate({ ...newTemplate, customHeader: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="custom-footer">Custom Footer (Optional)</Label>
                  <Input
                    id="custom-footer"
                    placeholder="Custom footer text (will appear before final footer)"
                    value={newTemplate.customFooter}
                    onChange={(e) => setNewTemplate({ ...newTemplate, customFooter: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="template-type">Template Type</Label>
                  <select
                    id="template-type"
                    className="w-full p-2 border rounded"
                    value={newTemplate.type}
                    onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value as 'thermal' | 'a4' })}
                  >
                    <option value="thermal">Thermal Printer</option>
                    <option value="a4">A4 Printer</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="template-content">HTML Template Content</Label>
                  <textarea
                    id="template-content"
                    className="w-full h-64 p-2 border rounded font-mono text-sm"
                    placeholder="Enter HTML template with placeholders like {{companyName}}, {{orderNumber}}, etc."
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Available placeholders: {'{{companyName}}'}, {'{{companyAddress}}'}, {'{{companyPhone}}'}, {'{{companyVat}}'}, {'{{orderNumber}}'}, {'{{queueNumber}}'}, {'{{orderType}}'}, {'{{orderDate}}'}, {'{{tableName}}'}, {'{{customerName}}'}, {'{{#each items}}...{{/each}}'}, {'{{subtotal}}'}, {'{{vatRate}}'}, {'{{vatAmount}}'}, {'{{total}}'}, {'{{totalQty}}'}, {'{{customHeader}}'}, {'{{customFooter}}'}, {'{{#each payments}}...{{/each}}'}, {'{{paymentMethod}}'}
                  </p>
                </div>
                <Button onClick={handleAddTemplate} className="w-full">
                  Add Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <p className="text-muted-foreground">No {selectedCategory.toLowerCase()} templates added yet.</p>
        ) : (
          <div className="grid gap-2">
            {templates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex-1">
                   <div className="flex items-center gap-2">
                     <h3 className="font-medium">{template.name}</h3>
                     {isTemplateDefault(template.id) && <Badge variant="default">Default</Badge>}
                     <Badge variant="outline">{template.type}</Badge>
                   </div>
                  {template.description && (
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  )}
                </div>
                  <div className="flex items-center gap-2">
                    {!isTemplateDefault(template.id) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefaultTemplate(template.id)}
                      >
                        Set Default
                      </Button>
                    )}
                   <AlertDialog open={deleteTemplateId === template.id} onOpenChange={(open) => !open && setDeleteTemplateId(null)}>
                     <AlertDialogTrigger asChild>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => handleDeleteTemplate(template.id)}
                         disabled={
                           selectedCategory === TemplateCategory.RECEIPT && STATIC_RECEIPT_TEMPLATE_IDS.includes(template.id) ||
                           selectedCategory === TemplateCategory.INVOICE && STATIC_INVOICE_TEMPLATE_IDS.includes(template.id) ||
                           selectedCategory === TemplateCategory.QUOTE && STATIC_QUOTE_TEMPLATE_IDS.includes(template.id)
                         }
                         className="text-destructive hover:text-destructive disabled:opacity-50"
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                     </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the {selectedCategory.toLowerCase()} template &ldquo;{template.name}&rdquo;. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteTemplateId(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteTemplate} className="bg-destructive text-destructive-foreground">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}