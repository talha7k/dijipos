'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Invoice, Organization, Customer, Supplier } from '@/types';
import { Printer } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import EnglishInvoice from '@/components/templates/EnglishInvoice';
import ArabicInvoice from '@/components/templates/ArabicInvoice';

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

  const handlePrintInvoice = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Create invoice HTML content
    const invoiceContent = invoice.template === 'arabic' 
      ? createArabicInvoiceHTML(invoice, organization, customer, supplier)
      : createEnglishInvoiceHTML(invoice, organization, customer, supplier);

    // Write to new window
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
            .border-t { border-top: 1px solid #ddd; }
            .pt-2 { padding-top: 8px; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .gap-8 { gap: 32px; }
            .gap-4 { gap: 16px; }
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .items-center { align-items: center; }
            .justify-between { justify-content: space-between; }
            .justify-end { justify-content: flex-end; }
            .w-64 { width: 256px; }
            .max-h-32 { max-height: 128px; }
            .max-h-20 { max-height: 80px; }
            .object-contain { object-fit: contain; }
            .ml-auto { margin-left: auto; }
            .mr-auto { margin-right: auto; }
            .mb-2 { margin-bottom: 8px; }
            .mb-8 { margin-bottom: 32px; }
            .mt-8 { margin-top: 32px; }
            .text-2xl { font-size: 24px; }
            .text-3xl { font-size: 30px; }
            .text-lg { font-size: 18px; }
            .text-gray-600 { color: #666; }
            .text-gray-800 { color: #333; }
            .border { border: 1px solid #ddd; }
            .p-2 { padding: 8px; }
            .py-2 { padding-top: 8px; padding-bottom: 8px; }
            .space-y-2 > * + * { margin-top: 8px; }
            .space-y-1 > * + * { margin-top: 4px; }
            @media print {
              body { background: white; }
              .invoice-container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          ${invoiceContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const createEnglishInvoiceHTML = (invoice: Invoice, org: Organization, cust?: Customer, supp?: Supplier) => {
    return `
      <div class="invoice-container">
        <div class="flex justify-between items-start mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">INVOICE</h1>
            <p class="text-gray-600">Invoice #${invoice.id.slice(-8)}</p>
          </div>
          <div class="text-right">
            ${org.logoUrl ? `<img src="${org.logoUrl}" alt="Company Logo" class="max-h-20 object-contain ml-auto mb-4">` : ''}
            <h2 class="text-xl font-semibold">${org.name}</h2>
            ${org.nameAr ? `<p class="text-lg">${org.nameAr}</p>` : ''}
            <p>${org.address}</p>
            <p>${org.email}</p>
            <p>${org.phone}</p>
            ${org.vatNumber ? `<p>VAT: ${org.vatNumber}</p>` : ''}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 class="font-semibold mb-2">Bill To:</h3>
            ${cust?.logoUrl ? `<img src="${cust.logoUrl}" alt="Customer Logo" class="max-h-16 object-contain mb-2">` : ''}
            <p class="font-medium">${invoice.clientName}</p>
            ${cust?.nameAr ? `<p class="text-md">${cust.nameAr}</p>` : ''}
            <p>${invoice.clientAddress}</p>
            <p>${invoice.clientEmail}</p>
            ${invoice.clientVAT ? `<p>VAT: ${invoice.clientVAT}</p>` : ''}
          </div>
          <div>
            <h3 class="font-semibold mb-2">Supplier:</h3>
            ${supp?.logoUrl ? `<img src="${supp.logoUrl}" alt="Supplier Logo" class="max-h-16 object-contain mb-2">` : ''}
            <p class="font-medium">${supp?.name || 'N/A'}</p>
            ${supp?.nameAr ? `<p class="text-md">${supp.nameAr}</p>` : ''}
            <p>${supp?.address || 'N/A'}</p>
            <p>${supp?.email || 'N/A'}</p>
            ${supp?.vatNumber ? `<p>VAT: ${supp.vatNumber}</p>` : ''}
          </div>
          <div class="grid-cols-2 gap-4">
            <div>
              <p class="text-gray-600">Invoice Date:</p>
              <p class="font-medium">${invoice.createdAt.toLocaleDateString()}</p>
            </div>
            <div>
              <p class="text-gray-600">Due Date:</p>
              <p class="font-medium">${invoice.dueDate.toLocaleDateString()}</p>
            </div>
            <div>
              <p class="text-gray-600">Status:</p>
              <p class="font-medium capitalize">${invoice.status}</p>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>
                  <div>
                    <p class="font-medium">${item.name}</p>
                    ${item.description ? `<p class="text-gray-600 text-sm">${item.description}</p>` : ''}
                  </div>
                </td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">$${item.unitPrice.toFixed(2)}</td>
                <td class="text-right">$${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="flex justify-end mb-8">
          <div class="w-64">
            <div class="flex justify-between py-2">
              <span>Subtotal:</span>
              <span>$${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div class="flex justify-between py-2">
              <span>Tax (${invoice.taxRate}%):</span>
              <span>$${invoice.taxAmount.toFixed(2)}</span>
            </div>
            <div class="flex justify-between py-2 font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>$${invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        ${invoice.notes ? `
          <div class="mb-8">
            <h3 class="font-semibold mb-2">Notes:</h3>
            <p class="text-gray-600">${invoice.notes}</p>
          </div>
        ` : ''}

        ${org.stampUrl ? `
          <div class="flex justify-end mt-8">
            <div class="text-center">
              <img src="${org.stampUrl}" alt="Company Stamp" class="max-h-32 object-contain">
              <p class="text-sm text-gray-600 mt-2">Company Stamp</p>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  };

  const createArabicInvoiceHTML = (invoice: Invoice, org: Organization, cust?: Customer, supp?: Supplier) => {
    return `
      <div class="invoice-container" dir="rtl">
        <div class="flex justify-between items-start mb-8 flex-row-reverse">
          <div class="text-right">
            <h1 class="text-3xl font-bold text-gray-800">فاتورة</h1>
            <p class="text-gray-600">رقم الفاتورة #${invoice.id.slice(-8)}</p>
          </div>
          <div class="text-left">
            ${org.logoUrl ? `<img src="${org.logoUrl}" alt="شعار الشركة" class="max-h-20 object-contain mr-auto mb-4">` : ''}
            <h2 class="text-xl font-semibold">${org.nameAr || org.name}</h2>
            ${org.nameAr && org.name ? `<p class="text-lg">${org.name}</p>` : ''}
            <p>${org.address}</p>
            <p>${org.email}</p>
            <p>${org.phone}</p>
            ${org.vatNumber ? `<p>الرقم الضريبي: ${org.vatNumber}</p>` : ''}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-8 mb-8">
          <div class="text-right">
            <h3 class="font-semibold mb-2">:إلى</h3>
            ${cust?.logoUrl ? `<img src="${cust.logoUrl}" alt="شعار العميل" class="max-h-16 object-contain ml-auto mb-2">` : ''}
            <p class="font-medium">${invoice.clientName}</p>
            ${cust?.nameAr ? `<p class="text-md">${cust.nameAr}</p>` : ''}
            <p>${invoice.clientAddress}</p>
            <p>${invoice.clientEmail}</p>
            ${invoice.clientVAT ? `<p>الرقم الضريبي: ${invoice.clientVAT}</p>` : ''}
          </div>
          <div class="text-left">
            <h3 class="font-semibold mb-2">:المورد</h3>
            ${supp?.logoUrl ? `<img src="${supp.logoUrl}" alt="شعار المورد" class="max-h-16 object-contain mb-2">` : ''}
            <p class="font-medium">${supp?.nameAr || supp?.name || 'غير متوفر'}</p>
            ${supp?.nameAr && supp?.name ? `<p class="text-md">${supp.name}</p>` : ''}
            <p>${supp?.address || 'غير متوفر'}</p>
            <p>${supp?.email || 'غير متوفر'}</p>
            ${supp?.vatNumber ? `<p>الرقم الضريبي: ${supp.vatNumber}</p>` : ''}
          </div>
          <div class="text-left">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-gray-600">:تاريخ الفاتورة</p>
                <p class="font-medium">${invoice.createdAt.toLocaleDateString('ar-SA')}</p>
              </div>
              <div>
                <p class="text-gray-600">:تاريخ الاستحقاق</p>
                <p class="font-medium">${invoice.dueDate.toLocaleDateString('ar-SA')}</p>
              </div>
              <div>
                <p class="text-gray-600">:الحالة</p>
                <p class="font-medium capitalize">${invoice.status === 'paid' ? 'مدفوع' : invoice.status === 'sent' ? 'مرسل' : invoice.status === 'draft' ? 'مسودة' : invoice.status}</p>
              </div>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th class="text-right">الوصف</th>
              <th class="text-center">الكمية</th>
              <th class="text-center">سعر الوحدة</th>
              <th class="text-center">المجموع</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td class="text-right">
                  <div>
                    <p class="font-medium">${item.name}</p>
                    ${item.description ? `<p class="text-gray-600 text-sm">${item.description}</p>` : ''}
                  </div>
                </td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-center">$${item.unitPrice.toFixed(2)}</td>
                <td class="text-center">$${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="flex justify-start mb-8 flex-row-reverse">
          <div class="w-64">
            <div class="flex justify-between py-2 flex-row-reverse">
              <span>المجموع الفرعي:</span>
              <span>$${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div class="flex justify-between py-2 flex-row-reverse">
              <span>الضريبة (${invoice.taxRate}%):</span>
              <span>$${invoice.taxAmount.toFixed(2)}</span>
            </div>
            <div class="flex justify-between py-2 font-bold text-lg border-t pt-2 flex-row-reverse">
              <span>الإجمالي:</span>
              <span>$${invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        ${invoice.notes ? `
          <div class="mb-8">
            <h3 class="font-semibold mb-2">:ملاحظات</h3>
            <p class="text-gray-600">${invoice.notes}</p>
          </div>
        ` : ''}

        ${org.stampUrl ? `
          <div class="flex justify-start mt-8 flex-row-reverse">
            <div class="text-center">
              <img src="${org.stampUrl}" alt="ختم الشركة" class="max-h-32 object-contain">
              <p class="text-sm text-gray-600 mt-2">ختم الشركة</p>
            </div>
          </div>
        ` : ''}
      </div>
    `;
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
              variant={invoice.template === 'english' ? 'default' : 'outline'}
              onClick={() => {
                const updatedInvoice = { ...invoice, template: 'english' as const };
                updateDoc(doc(db, 'organizations', organizationId, 'invoices', invoice.id), {
                  template: 'english'
                });
              }}
            >
              English Template
            </Button>
            <Button
              variant={invoice.template === 'arabic' ? 'default' : 'outline'}
              onClick={() => {
                const updatedInvoice = { ...invoice, template: 'arabic' as const };
                updateDoc(doc(db, 'organizations', organizationId, 'invoices', invoice.id), {
                  template: 'arabic'
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
            {invoice.template === 'english' ? (
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