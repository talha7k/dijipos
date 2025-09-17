'use client';

import { useState } from 'react';
import { useInvoices } from '@/lib/hooks/useInvoices';
import { useOrganization } from '@/lib/hooks/useOrganization';
import { Invoice, PurchaseInvoice, Organization, InvoiceStatus } from '@/types';
import { InvoiceTemplateType, PurchaseInvoiceStatus } from '@/types/enums';

// Type guard to check if invoice is a PurchaseInvoice
function isPurchaseInvoice(invoice: Invoice): invoice is PurchaseInvoice {
  return invoice.type === 'purchase';
}
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Printer } from 'lucide-react';

import { defaultInvoiceEnglish } from '@/components/templates/invoice/default-invoice-english';
import { defaultInvoiceArabic } from '@/components/templates/invoice/default-invoice-arabic';
import InvoiceForm from '@/components/invoices_quotes/InvoiceForm';
import { Receipt } from 'lucide-react';

function InvoicesContent() {
  const { selectedOrganization: organization } = useOrganization();
  const organizationId = organization?.id;
  const { purchaseInvoices: invoices, loading, createPurchaseInvoice, updateExistingInvoice } = useInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);



  const updateInvoiceStatus = async (invoiceId: string, status: PurchaseInvoice['status']) => {
    try {
      await updateExistingInvoice(invoiceId, { status });
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  };

  const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const invoiceWithType = {
        ...invoiceData,
        type: 'purchase' as const
      };
      const invoiceId = await createPurchaseInvoice(invoiceWithType as Omit<PurchaseInvoice, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>);
      return invoiceId;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  };

  const handleStatusChange = async (invoiceId: string, status: PurchaseInvoiceStatus) => {
    try {
      await updateInvoiceStatus(invoiceId, status);
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  };

  const handleCreateInvoice = async (invoiceData: Omit<Invoice, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createInvoice(invoiceData);
      setDialogOpen(false);
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const generatePurchaseInvoiceHTML = (invoice: Invoice, org: Organization) => {
    // Prepare template data for purchase invoice
    const templateData = {
      invoiceId: isPurchaseInvoice(invoice) ? invoice.invoiceNumber || invoice.id.slice(-8) : invoice.id.slice(-8),
      companyName: org?.name || '',
      companyNameAr: org?.nameAr || '',
      companyAddress: org?.address || '',
      companyEmail: org?.email || '',
      companyPhone: org?.phone || '',
      companyVat: org?.vatNumber || '',
      companyLogo: org?.logoUrl || '',
      companyStamp: org?.stampUrl || '',
      clientName: isPurchaseInvoice(invoice) ? invoice.supplierName || '' : '',
      customerNameAr: '', // Purchase invoices typically don't have Arabic names for suppliers
      clientAddress: isPurchaseInvoice(invoice) ? invoice.supplierAddress || '' : '',
      clientEmail: isPurchaseInvoice(invoice) ? invoice.supplierEmail || '' : '',
      clientVat: isPurchaseInvoice(invoice) ? invoice.supplierVAT || '' : '',
      customerLogo: '', // Purchase invoices typically don't have supplier logos
      supplierName: '', // For purchase invoices, the company is the buyer
      supplierNameAr: '',
      supplierAddress: '',
      supplierEmail: '',
      supplierVat: '',
      supplierLogo: '',
      invoiceDate: invoice.createdAt.toLocaleDateString(),
      template: InvoiceTemplateType.ENGLISH,
      dueDate: invoice.dueDate.toLocaleDateString(),
      status: invoice.status,
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
      includeQR: isPurchaseInvoice(invoice) ? (invoice.includeQR ? 'true' : '') : ''
    };

    // Choose template based on invoice template type
    const template = defaultInvoiceEnglish;

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

    // Replace "INVOICE" with "PURCHASE INVOICE" in the title
    htmlContent = htmlContent.replace(/INVOICE/g, 'PURCHASE INVOICE');
    htmlContent = htmlContent.replace(/فاتورة/g, 'فاتورة شراء');

    return htmlContent;
  };

  const handlePrintInvoice = (invoice: Invoice, organizationData: Organization) => {
    if (!organizationData) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate invoice HTML using templates
    const invoiceHtml = generatePurchaseInvoiceHTML(invoice, organizationData);

    // Write the HTML to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${invoice.id.slice(-8)}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 40px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .mb-4 { margin-bottom: 16px; }
            .mb-8 { margin-bottom: 32px; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: 1fr 1fr; }
            .gap-4 { gap: 16px; }
            .gap-8 { gap: 32px; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .justify-end { justify-content: flex-end; }
            .justify-start { justify-content: flex-start; }
            .items-start { align-items: flex-start; }
            .w-64 { width: 256px; }
            .text-3xl { font-size: 1.875rem; }
            .text-xl { font-size: 1.25rem; }
            .text-lg { font-size: 1.125rem; }
            .text-sm { font-size: 0.875rem; }
            .text-gray-600 { color: #666; }
            .text-gray-800 { color: #333; }
            .border-t { border-top: 1px solid #ddd; }
            .pt-2 { padding-top: 8px; }
            .py-2 { padding-top: 8px; padding-bottom: 8px; }
            @media print {
              body { margin: 0; padding: 0; }
              .invoice-container { padding: 20px; }
            }
          </style>
        </head>
        <body>
          ${invoiceHtml}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for the content to load before printing
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };




  

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Purchase Invoices</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Purchase Invoice</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Purchase Invoice</DialogTitle>
            </DialogHeader>
            <InvoiceForm onSubmit={handleCreateInvoice} defaultType="purchase" />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Purchase Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{isPurchaseInvoice(invoice) ? invoice.supplierName : ''}</TableCell>
                  <TableCell>${invoice.total.toFixed(2)}</TableCell>
                   <TableCell>
                     <Badge variant={
                       invoice.status === PurchaseInvoiceStatus.PAID ? 'default' :
                       invoice.status === PurchaseInvoiceStatus.CANCELLED ? 'destructive' :
                       'secondary'
                     }>
                       {invoice.status}
                     </Badge>
                   </TableCell>
                  <TableCell>{invoice.dueDate?.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(invoice)}>
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Purchase Invoice Preview</DialogTitle>
                          </DialogHeader>
                          {selectedInvoice && organization && (
                            <div>
                              <div className="flex gap-4 mb-4 items-center">
                                <Button
                                  variant={InvoiceTemplateType.ENGLISH === InvoiceTemplateType.ENGLISH ? 'default' : 'outline'}
                                  onClick={() => {
                                    const updatedInvoice = { ...selectedInvoice, template: InvoiceTemplateType.ENGLISH };
                                    setSelectedInvoice(updatedInvoice);
                                  }}
                                >
                                  English Template
                                </Button>
                                <Button
                                  variant={InvoiceTemplateType.ARABIC === InvoiceTemplateType.ARABIC ? 'outline' : 'outline'}
                                  onClick={async () => {
                                    const updatedInvoice = { ...selectedInvoice, template: InvoiceTemplateType.ARABIC };
                                    setSelectedInvoice(updatedInvoice);
                                    try {
                                      await updateInvoiceStatus(selectedInvoice.id, selectedInvoice.status);
                                    } catch (error) {
                                      console.error('Error updating invoice template:', error);
                                    }
                                  }}
                                >
                                  Arabic Template
                                </Button>
                                <Button variant="outline" onClick={() => handlePrintInvoice(selectedInvoice, organization)}>
                                  <Printer className="h-4 w-4 mr-2" />
                                  Print
                                </Button>
                                <div className="flex items-center gap-2">
                                  <Label htmlFor="qr-toggle">Show ZATCA QR</Label>
                                  <Switch
                                    id="qr-toggle"
                                    checked={isPurchaseInvoice(selectedInvoice) ? selectedInvoice.includeQR : false}
                                    onCheckedChange={async (checked) => {
                                      const updatedInvoice = { ...selectedInvoice, includeQR: checked };
                                      setSelectedInvoice(updatedInvoice);
                                      try {
                                        await updateInvoiceStatus(selectedInvoice.id, selectedInvoice.status);
                                      } catch (error) {
                                        console.error('Error updating invoice QR:', error);
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              <div 
                                dangerouslySetInnerHTML={{ 
                                  __html: generatePurchaseInvoiceHTML(selectedInvoice, organization) 
                                }} 
                              />
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                        {invoice.status === PurchaseInvoiceStatus.DRAFT && (
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleStatusChange(invoice.id, PurchaseInvoiceStatus.SENT)}
                         >
                           Mark as Sent
                         </Button>
                       )}
                        {invoice.status === PurchaseInvoiceStatus.SENT && (
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleStatusChange(invoice.id, PurchaseInvoiceStatus.PAID)}
                         >
                           Mark as Paid
                         </Button>
                       )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Receipt className="h-8 w-8" />
                      <p>No invoices found. Click Create Invoice to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function InvoicesPage() {
  return <InvoicesContent />;
}