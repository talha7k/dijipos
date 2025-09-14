'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, doc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Invoice, Organization, TemplateType, InvoiceStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Printer } from 'lucide-react';
import EnglishInvoice from '@/components/templates/EnglishInvoice';
import ArabicInvoice from '@/components/templates/ArabicInvoice';
import { defaultEnglishInvoiceTemplate } from '@/components/templates/default-invoice-english';
import { defaultArabicInvoiceTemplate } from '@/components/templates/default-invoice-arabic';
import InvoiceForm from '@/components/invoices_quotes/InvoiceForm';
import { Receipt } from 'lucide-react';

function InvoicesContent() {
  const { user, organizationId } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!organizationId) return;

    // Fetch organization data
    const fetchOrganization = async () => {
      const organizationDoc = await getDoc(doc(db, 'organizations', organizationId));
      if (organizationDoc.exists()) {
        setOrganization({
          id: organizationDoc.id,
          ...organizationDoc.data(),
          createdAt: organizationDoc.data().createdAt?.toDate(),
        } as Organization);
      }
    };
    fetchOrganization();

    const q = query(collection(db, 'organizations', organizationId, 'purchase-invoices'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const invoicesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        dueDate: doc.data().dueDate?.toDate(),
      })) as Invoice[];
      setInvoices(invoicesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [organizationId]);

  const handleStatusChange = async (invoiceId: string, status: Invoice['status']) => {
    if (!organizationId) return;

    const invoiceRef = doc(db, 'organizations', organizationId, 'purchase-invoices', invoiceId);
    await updateDoc(invoiceRef, { status, updatedAt: new Date() });
  };

  const handleCreateInvoice = async (invoiceData: Omit<Invoice, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) return;

    // Clean the data to remove undefined values that Firebase doesn't accept
    const cleanedData = {
      ...invoiceData,
      clientVAT: invoiceData.clientVAT || null,
      clientAddress: invoiceData.clientAddress || null,
      notes: invoiceData.notes || null,
      items: invoiceData.items.map(item => ({
        ...item,
        description: item.description || null,
        productId: item.productId || null,
        serviceId: item.serviceId || null,
      })),
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await addDoc(collection(db, 'organizations', organizationId, 'purchase-invoices'), cleanedData);
    setDialogOpen(false);
  };

  const generatePurchaseInvoiceHTML = (invoice: Invoice, org: Organization) => {
    // Prepare template data for purchase invoice
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
      clientName: invoice.supplierName || invoice.clientName || '',
      customerNameAr: '', // Purchase invoices typically don't have Arabic names for suppliers
      clientAddress: invoice.supplierAddress || invoice.clientAddress || '',
      clientEmail: invoice.supplierEmail || invoice.clientEmail || '',
      clientVat: invoice.supplierVAT || invoice.clientVAT || '',
      customerLogo: '', // Purchase invoices typically don't have supplier logos
      supplierName: '', // For purchase invoices, the company is the buyer
      supplierNameAr: '',
      supplierAddress: '',
      supplierEmail: '',
      supplierVat: '',
      supplierLogo: '',
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


  const createEnglishInvoiceHTML = (invoice: Invoice, organizationData: Organization) => {
    return `
      <div class="invoice-container">
        <div class="flex justify-between items-start mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">PURCHASE INVOICE</h1>
            <p class="text-gray-600">Purchase Invoice #${invoice.id.slice(-8)}</p>
          </div>
          <div class="text-right">
            <h2 class="text-xl font-semibold">${organizationData.name}</h2>
            <p>${organizationData.address}</p>
            <p>${organizationData.email}</p>
            <p>${organizationData.phone}</p>
            ${organizationData.vatNumber ? `<p>VAT: ${organizationData.vatNumber}</p>` : ''}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 class="font-semibold mb-2">Supplier:</h3>
            <p class="font-medium">${invoice.supplierName || invoice.clientName}</p>
            <p>${invoice.supplierAddress || invoice.clientAddress}</p>
            <p>${invoice.supplierEmail || invoice.clientEmail}</p>
            ${invoice.supplierVAT || invoice.clientVAT ? `<p>VAT: ${invoice.supplierVAT || invoice.clientVAT}</p>` : ''}
          </div>
          <div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-gray-600">Purchase Invoice Date:</p>
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

        ${invoice.includeQR && organizationData.vatNumber ? `
          <div class="flex justify-end">
            <div class="text-center">
              <p class="text-sm text-gray-600 mb-2">ZATCA Compliant QR Code</p>
              <div id="qr-code-placeholder" style="width: 150px; height: 150px; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                QR Code will be generated here
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  };

  const createArabicInvoiceHTML = (invoice: Invoice, organizationData: Organization) => {
    return `
      <div class="invoice-container" dir="rtl" style="font-family: Arial, sans-serif;">
        <div class="flex justify-between items-start mb-8 flex-row-reverse">
          <div class="text-right">
            <h1 class="text-3xl font-bold text-gray-800">فاتورة شراء</h1>
            <p class="text-gray-600">رقم فاتورة الشراء #${invoice.id.slice(-8)}</p>
          </div>
          <div class="text-left">
            <h2 class="text-xl font-semibold">${organizationData.name}</h2>
            <p>${organizationData.address}</p>
            <p>${organizationData.email}</p>
            <p>${organizationData.phone}</p>
            ${organizationData.vatNumber ? `<p>الرقم الضريبي: ${organizationData.vatNumber}</p>` : ''}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-8 mb-8">
          <div class="text-right">
            <h3 class="font-semibold mb-2">:المورد</h3>
            <p class="font-medium">${invoice.supplierName || invoice.clientName}</p>
            <p>${invoice.supplierAddress || invoice.clientAddress}</p>
            <p>${invoice.supplierEmail || invoice.clientEmail}</p>
            ${invoice.supplierVAT || invoice.clientVAT ? `<p>الرقم الضريبي: ${invoice.supplierVAT || invoice.clientVAT}</p>` : ''}
          </div>
          <div class="text-left">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-gray-600">:تاريخ فاتورة الشراء</p>
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
                <td class="text-center">${item.unitPrice.toFixed(2)} ريال</td>
                <td class="text-center">${item.total.toFixed(2)} ريال</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="flex justify-start mb-8">
          <div class="w-64">
            <div class="flex justify-between py-2 flex-row-reverse">
              <span>:المجموع الفرعي</span>
              <span>${invoice.subtotal.toFixed(2)} ريال</span>
            </div>
            <div class="flex justify-between py-2 flex-row-reverse">
              <span>:الضريبة (${invoice.taxRate}%)</span>
              <span>${invoice.taxAmount.toFixed(2)} ريال</span>
            </div>
            <div class="flex justify-between py-2 font-bold text-lg border-t pt-2 flex-row-reverse">
              <span>:المجموع الكلي</span>
              <span>${invoice.total.toFixed(2)} ريال</span>
            </div>
          </div>
        </div>

        ${invoice.notes ? `
          <div class="mb-8 text-right">
            <h3 class="font-semibold mb-2">:ملاحظات</h3>
            <p class="text-gray-600">${invoice.notes}</p>
          </div>
        ` : ''}

        ${invoice.includeQR && organizationData.vatNumber ? `
          <div class="flex justify-start">
            <div class="text-center">
              <p class="text-sm text-gray-600 mb-2">رمز QR متوافق مع زاتكا</p>
              <div id="qr-code-placeholder" style="width: 150px; height: 150px; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                سيتم إنشاء رمز QR هنا
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
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
                  <TableCell>{invoice.supplierName || invoice.clientName}</TableCell>
                  <TableCell>${invoice.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      invoice.status === 'paid' ? 'default' :
                      invoice.status === 'overdue' ? 'destructive' :
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
                                  variant={selectedInvoice.template === TemplateType.ENGLISH ? 'default' : 'outline'}
                                  onClick={() => {
                                    const updatedInvoice = { ...selectedInvoice, template: TemplateType.ENGLISH };
                                    setSelectedInvoice(updatedInvoice);
                                     updateDoc(doc(db, 'organizations', organizationId!, 'purchase-invoices', selectedInvoice.id), {
                                       template: TemplateType.ENGLISH
                                     });
                                  }}
                                >
                                  English Template
                                </Button>
                                <Button
                                  variant={selectedInvoice.template === TemplateType.ARABIC ? 'default' : 'outline'}
                                  onClick={() => {
                                    const updatedInvoice = { ...selectedInvoice, template: TemplateType.ARABIC };
                                    setSelectedInvoice(updatedInvoice);
                                    updateDoc(doc(db, 'organizations', organizationId!, 'purchase-invoices', selectedInvoice.id), {
                                      template: TemplateType.ARABIC
                                    });
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
                                    checked={selectedInvoice.includeQR}
                                    onCheckedChange={(checked) => {
                                      const updatedInvoice = { ...selectedInvoice, includeQR: checked };
                                      setSelectedInvoice(updatedInvoice);
                                      updateDoc(doc(db, 'organizations', organizationId!, 'purchase-invoices', selectedInvoice.id), {
                                        includeQR: checked
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                              {selectedInvoice.template === TemplateType.ARABIC ? (
                                <ArabicInvoice invoice={selectedInvoice} organization={organization} />
                              ) : (
                                <EnglishInvoice invoice={selectedInvoice} organization={organization} />
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                       {invoice.status === InvoiceStatus.DRAFT && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(invoice.id, InvoiceStatus.SENT)}
                        >
                          Mark as Sent
                        </Button>
                      )}
                       {invoice.status === InvoiceStatus.SENT && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(invoice.id, InvoiceStatus.PAID)}
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