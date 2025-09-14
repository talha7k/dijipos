'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Invoice, Organization, Customer, Supplier, TemplateType } from '@/types';
import { Printer } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import EnglishInvoice from '@/components/templates/EnglishInvoice';
import ArabicInvoice from '@/components/templates/ArabicInvoice';
import { defaultEnglishInvoiceTemplate } from '@/components/templates/default-invoice-english';
import { defaultArabicInvoiceTemplate } from '@/components/templates/default-invoice-arabic';

interface PrintPreviewDialogProps {
  invoice: Invoice | null;
  organization: Organization | null;
  customers: Customer[];
  suppliers: Supplier[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
}

export function PrintPreviewDialog({ 
  invoice, 
  organization, 
  customers, 
  suppliers, 
  open, 
  onOpenChange,
  organizationId 
}: PrintPreviewDialogProps) {
  if (!invoice || !organization) return null;

  const customer = customers.find(c => c.name === invoice.clientName);
  const supplier = suppliers.find(s => s.id === invoice.supplierId);

  const generateInvoiceHTML = (invoice: Invoice, org: Organization, cust?: Customer, supp?: Supplier) => {
    // Prepare template data
    const templateData = {
      invoiceId: invoice.invoiceNumber || invoice.id.slice(-8),
      companyName: org?.name || '',
      companyNameAr: org?.nameAr || '',
      companyAddress: org?.address || '',
      companyEmail: org?.email || '',
      companyPhone: org?.phone || '',
      companyVat: org?.vatNumber || '',
      companyLogo: org?.logoUrl || '',
      companyStamp: org?.stampUrl || '',
      clientName: invoice.clientName || '',
      customerNameAr: cust?.nameAr || '',
      clientAddress: invoice.clientAddress || '',
      clientEmail: invoice.clientEmail || '',
      clientVat: invoice.clientVAT || '',
      customerLogo: cust?.logoUrl || '',
      supplierName: supp?.name || '',
      supplierNameAr: supp?.nameAr || '',
      supplierAddress: supp?.address || '',
      supplierEmail: supp?.email || '',
      supplierVat: supp?.vatNumber || '',
      supplierLogo: supp?.logoUrl || '',
      invoiceDate: invoice.template === TemplateType.ARABIC
        ? invoice.createdAt.toLocaleDateString('ar-SA')
        : invoice.createdAt.toLocaleDateString(),
      dueDate: invoice.template === TemplateType.ARABIC
        ? invoice.dueDate.toLocaleDateString('ar-SA')
        : invoice.dueDate.toLocaleDateString(),
      status: invoice.template === TemplateType.ARABIC
        ? (invoice.status === 'paid' ? 'مدفوع' : invoice.status === 'sent' ? 'مرسل' : invoice.status === 'draft' ? 'مسودة' : invoice.status)
        : invoice.status,
      items: invoice.items.map(item => ({
        name: item.name,
        description: item.description || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice.toFixed(2),
        total: item.total.toFixed(2)
      })),
      subtotal: invoice.subtotal.toFixed(2),
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount.toFixed(2),
      total: invoice.total.toFixed(2),
      notes: invoice.notes || '',
      includeQR: invoice.includeQR ? 'true' : ''
    };

    // Choose template based on invoice template type
    const template = invoice.template === TemplateType.ARABIC
      ? defaultArabicInvoiceTemplate
      : defaultEnglishInvoiceTemplate;

    // Replace placeholders in template
    let htmlContent = template;

    // Replace simple placeholders
    Object.entries(templateData).forEach(([key, value]) => {
      if (key !== 'items' && key !== 'includeQR') {
        const regex = new RegExp(`{{${key}}}`, 'g');
        htmlContent = htmlContent.replace(regex, String(value));
      }
    });

    // Handle conditional sections
    if (templateData.includeQR) {
      htmlContent = htmlContent.replace(/{{#includeQR}}/g, '');
      htmlContent = htmlContent.replace(/{{\/includeQR}}/g, '');
    } else {
      const qrRegex = /{{#includeQR}}[\s\S]*?{{\/includeQR}}/g;
      htmlContent = htmlContent.replace(qrRegex, '');
    }

    // Handle other conditional sections
    const conditionals = [
      'companyLogo', 'companyNameAr', 'companyVat', 'customerLogo', 'customerNameAr',
      'clientVat', 'supplierLogo', 'supplierNameAr', 'supplierVat', 'notes', 'companyStamp'
    ];

    conditionals.forEach(field => {
      const value = templateData[field as keyof typeof templateData];
      if (value && value !== '') {
        const regex = new RegExp(`{{#${field}}}(.*?){{\/${field}}}`, 'gs');
        htmlContent = htmlContent.replace(regex, '$1');
      } else {
        const regex = new RegExp(`{{#${field}}}[\s\S]*?{{\/${field}}}`, 'gs');
        htmlContent = htmlContent.replace(regex, '');
      }
    });

    // Handle items loop
    const itemsRegex = /{{#each items}}([\s\S]*?){{\/each}}/;
    const itemsMatch = htmlContent.match(itemsRegex);
    if (itemsMatch && templateData.items) {
      const itemTemplate = itemsMatch[1];
      const itemsHtml = templateData.items.map(item => {
        let itemHtml = itemTemplate;
        Object.entries(item).forEach(([key, value]) => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          itemHtml = itemHtml.replace(regex, String(value));
        });
        return itemHtml;
      }).join('');
      htmlContent = htmlContent.replace(itemsRegex, itemsHtml);
    }

    return htmlContent;
  };

  const handlePrintInvoice = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate invoice HTML using templates
    const invoiceHtml = generateInvoiceHTML(invoice, organization, customer, supplier);

    // Write to new window
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
    printWindow.print();
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Print Preview - {invoice.id.slice(-8)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Template Selection */}
          <div className="flex gap-4 items-center">
            <Button
              variant={invoice.template === TemplateType.ENGLISH ? 'default' : 'outline'}
              onClick={() => {
                const updatedInvoice = { ...invoice, template: TemplateType.ENGLISH };
                updateDoc(doc(db, 'organizations', organizationId, 'invoices', invoice.id), {
                  template: TemplateType.ENGLISH
                });
              }}
            >
              English Template
            </Button>
            <Button
              variant={invoice.template === TemplateType.ARABIC ? 'default' : 'outline'}
              onClick={() => {
                const updatedInvoice = { ...invoice, template: TemplateType.ARABIC };
                updateDoc(doc(db, 'organizations', organizationId, 'invoices', invoice.id), {
                  template: TemplateType.ARABIC
                });
              }}
            >
              Arabic Template
            </Button>
            <div className="flex items-center gap-2">
              <Label htmlFor="qr-toggle">Include QR Code</Label>
              <Switch
                id="qr-toggle"
                checked={invoice.includeQR}
                onCheckedChange={(checked) => {
                  updateDoc(doc(db, 'organizations', organizationId, 'invoices', invoice.id), {
                    includeQR: checked
                  });
                }}
              />
            </div>
          </div>

          {/* Print Preview */}
          <div className="border rounded-lg p-4 bg-white">
            {invoice.template === TemplateType.ENGLISH ? (
              <EnglishInvoice
                invoice={invoice}
                organization={organization}
                customer={customer}
                supplier={supplier}
              />
            ) : (
              <ArabicInvoice
                invoice={invoice}
                organization={organization}
                customer={customer}
                supplier={supplier}
              />
            )}
          </div>

          {/* Print Button */}
          <div className="flex justify-end">
            <Button onClick={handlePrintInvoice}>
              <Printer className="h-4 w-4 mr-2" />
              Print Invoice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}