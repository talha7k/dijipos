'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TemplateSelector } from '@/components/ui/TemplateSelector';
import { PrinterSettingsPreview } from '@/components/ui/printer-settings-preview';
import { Printer } from 'lucide-react';
import { Invoice, Payment, Organization, Customer, Supplier, InvoiceTemplate, PrinterSettings } from '@/types';
import { renderInvoiceTemplate } from '@/lib/template-renderer';
import { toast } from 'sonner';

// Type guard to check if invoice is a PurchaseInvoice
function isPurchaseInvoice(invoice: Invoice): invoice is Invoice & { type: 'purchase' } {
  return invoice.type === 'purchase';
}

interface InvoicePrintDialogProps {
  invoice: Invoice;
  organization: Organization | null;
  invoiceTemplates: InvoiceTemplate[];
  customer?: Customer;
  supplier?: Supplier;
  printerSettings?: PrinterSettings | null;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function InvoicePrintDialog({
  invoice,
  organization,
  invoiceTemplates,
  customer,
  supplier,
  printerSettings,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: InvoicePrintDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  // Set default template on open
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      console.log(`[InvoicePrintDialog] Opening dialog with:`, {
        templatesCount: invoiceTemplates.length,
        printerSettings: printerSettings ? {
          receipts: printerSettings.receipts?.defaultTemplateId,
          invoices: printerSettings.invoices?.defaultTemplateId,
          quotes: printerSettings.quotes?.defaultTemplateId,
        } : null,
        templates: invoiceTemplates.map(t => ({ id: t.id, name: t.name }))
      });

      // First try to get default template from printer settings
      const printerDefaultId = printerSettings?.invoices?.defaultTemplateId;
      let selectedId = "";
      
      if (printerDefaultId) {
        const printerDefaultTemplate = invoiceTemplates.find((t) => t.id === printerDefaultId);
        if (printerDefaultTemplate) {
          selectedId = printerDefaultTemplate.id;
          console.log(`[InvoicePrintDialog] Using printer default template: ${printerDefaultTemplate.name}`);
        } else {
          console.log(`[InvoicePrintDialog] Printer default template not found: ${printerDefaultId}`);
        }
      }
      
      // No fallback to template's isDefault flag - rely only on printer settings
      
      // Final fallback to first template
      if (!selectedId && invoiceTemplates.length > 0) {
        selectedId = invoiceTemplates[0].id;
        console.log(`[InvoicePrintDialog] Using first template as fallback: ${invoiceTemplates[0].name}`);
      }
      
      setSelectedTemplate(selectedId);
    }
    setOpen(newOpen);
  };

  const generateInvoice = async () => {
    const template = invoiceTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    setIsGenerating(true);

    try {
      // Render the invoice using template
      const renderedContent = await renderInvoiceTemplate(template, invoice, organization, customer, supplier, printerSettings || undefined);

      // Create a new window for printing (safer than manipulating current DOM)
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        throw new Error('Unable to open print window. Please check your popup blocker.');
      }

      // Write the invoice content to the new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice - ${invoice.id}</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            ${renderedContent}
          </body>
        </html>
      `);

      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        // Close the window after printing (with a delay to allow print dialog)
        setTimeout(() => {
          printWindow.close();
          setIsGenerating(false);
          setOpen(false);
          toast.success('Invoice sent to printer!');
        }, 1000);
      };

    } catch (error) {
      console.error('Error generating invoice:', error);
      setIsGenerating(false);
      toast.error(error instanceof Error ? error.message : 'Error generating invoice. Please try again.');
    }
  };



  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Print Invoice
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={generateInvoice}
                disabled={!selectedTemplate || invoiceTemplates.length === 0 || isGenerating}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Print Invoice'}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Invoice & Settings */}
          <div className="space-y-6">
            {/* Invoice Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="font-medium py-1">Invoice #:</td>
                      <td className="py-1">{invoice.id}</td>
                    </tr>
                    <tr>
                      <td className="font-medium py-1">Date:</td>
                      <td className="py-1">{new Date(invoice.createdAt).toLocaleString()}</td>
                    </tr>
                    {isPurchaseInvoice(invoice) && invoice.invoiceDate && (
                      <tr>
                        <td className="font-medium py-1">Invoice Date:</td>
                        <td className="py-1">{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                      </tr>
                    )}
                    {invoice.dueDate && (
                      <tr>
                        <td className="font-medium py-1">Due Date:</td>
                        <td className="py-1">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                      </tr>
                    )}
                    {(customer || supplier) && (
                      <tr>
                        <td className="font-medium py-1">{customer ? 'Customer:' : 'Supplier:'}</td>
                        <td className="py-1">{customer?.name || supplier?.name}</td>
                      </tr>
                    )}
                    {(customer?.email || supplier?.email) && (
                      <tr>
                        <td className="font-medium py-1">Email:</td>
                        <td className="py-1">{customer?.email || supplier?.email}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="font-medium py-1">Total:</td>
                      <td className="py-1 font-bold">${(invoice.total || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="font-medium py-1">Status:</td>
                      <td className="py-1">
                        <Badge variant="outline" className="ml-0">{invoice.status}</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
               </CardContent>
             </Card>

             {/* Printer Settings Preview */}
             <PrinterSettingsPreview
               printerSettings={printerSettings}
               documentType="invoices"
             />
           </div>

          {/* Right Column - Template Selection & Actions */}
          <div className="space-y-6">
            {/* Template Selection */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Select Invoice Template</CardTitle>
              </CardHeader>
              <CardContent>
                {invoiceTemplates.length === 0 ? (
                  <p className="text-muted-foreground">No invoice templates available. Please create templates in Settings.</p>
                ) : (
                  <TemplateSelector
                    templates={invoiceTemplates}
                    selectedTemplate={selectedTemplate}
                    onTemplateChange={setSelectedTemplate}
                    label="Select Invoice Template"
                    variant="radio"
                    printerSettings={printerSettings}
                    templateType="invoices"
                  />
                )}
              </CardContent>
            </Card>


          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}