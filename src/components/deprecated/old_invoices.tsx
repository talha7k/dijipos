'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, doc, getDoc, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Invoice, Organization, Customer, Supplier, Payment, TemplateType, InvoiceStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Printer, Eye, CreditCard } from 'lucide-react';
import EnglishInvoice from '@/components/templates/EnglishInvoice';
import ArabicInvoice from '@/components/templates/ArabicInvoice';
import InvoiceForm from '@/components/InvoiceForm';
import { Receipt } from 'lucide-react';

function InvoicesContent() {
  const { user, organizationId } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [payments, setPayments] = useState<{ [invoiceId: string]: Payment[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

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

    // Fetch customers
    const fetchCustomers = async () => {
      const customersSnapshot = await getDocs(collection(db, 'organizations', organizationId, 'customers'));
      const customersData = customersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Customer[];
      setCustomers(customersData);
    };
    fetchCustomers();

    // Fetch suppliers
    const fetchSuppliers = async () => {
      const suppliersSnapshot = await getDocs(collection(db, 'organizations', organizationId, 'suppliers'));
      const suppliersData = suppliersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Supplier[];
      setSuppliers(suppliersData);
    };
    fetchSuppliers();

    // Fetch payments
    const paymentsQ = query(collection(db, 'organizations', organizationId, 'payments'));
    const paymentsUnsubscribe = onSnapshot(paymentsQ, (querySnapshot) => {
      const paymentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        paymentDate: doc.data().paymentDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Payment[];

      // Group payments by invoiceId
      const paymentsByInvoice: { [invoiceId: string]: Payment[] } = {};
      paymentsData.forEach(payment => {
        if (!paymentsByInvoice[payment.invoiceId]) {
          paymentsByInvoice[payment.invoiceId] = [];
        }
        paymentsByInvoice[payment.invoiceId].push(payment);
      });
      setPayments(paymentsByInvoice);
    });

    const q = query(collection(db, 'organizations', organizationId, 'invoices'));
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

    return () => {
      unsubscribe();
      paymentsUnsubscribe();
    };
  }, [organizationId]);

  const handleStatusChange = async (invoiceId: string, status: Invoice['status']) => {
    if (!organizationId) return;

    setUpdatingStatus(invoiceId);
    try {
      const invoiceRef = doc(db, 'organizations', organizationId, 'invoices', invoiceId);
      await updateDoc(invoiceRef, { status, updatedAt: new Date() });
    } finally {
      setUpdatingStatus(null);
    }
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

    await addDoc(collection(db, 'organizations', organizationId, 'invoices'), cleanedData);
    setDialogOpen(false);
  };

  const handlePrintInvoice = (invoice: Invoice, organizationData: Organization) => {
    if (!organizationData) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Create the invoice HTML content
    const invoiceContent = invoice.template === TemplateType.ARABIC 
      ? createArabicInvoiceHTML(invoice, organizationData)
      : createEnglishInvoiceHTML(invoice, organizationData);

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
          ${invoiceContent}
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
    // Find customer and supplier if available
    const customer = customers.find(c => c.name === invoice.clientName);
    const supplier = suppliers.find(s => s.id === invoice.supplierId);
    
    return `
      <div class="invoice-container">
        <div class="flex justify-between items-start mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">INVOICE</h1>
            <p class="text-gray-600">Invoice #${invoice.id.slice(-8)}</p>
          </div>
          <div class="text-right">
            ${organizationData.logoUrl ? `<img src="${organizationData.logoUrl}" alt="Company Logo" class="max-h-20 object-contain ml-auto mb-4">` : ''}
            <h2 class="text-xl font-semibold">${organizationData.name}</h2>
            ${organizationData.nameAr ? `<p class="text-lg">${organizationData.nameAr}</p>` : ''}
            <p>${organizationData.address}</p>
            <p>${organizationData.email}</p>
            <p>${organizationData.phone}</p>
            ${organizationData.vatNumber ? `<p>VAT: ${organizationData.vatNumber}</p>` : ''}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 class="font-semibold mb-2">Bill To:</h3>
            ${customer?.logoUrl ? `<img src="${customer.logoUrl}" alt="Customer Logo" class="max-h-16 object-contain mb-2">` : ''}
            <p class="font-medium">${invoice.clientName}</p>
            ${customer?.nameAr ? `<p class="text-md">${customer.nameAr}</p>` : ''}
            <p>${invoice.clientAddress}</p>
            <p>${invoice.clientEmail}</p>
            ${invoice.clientVAT ? `<p>VAT: ${invoice.clientVAT}</p>` : ''}
          </div>
          <div>
            <h3 class="font-semibold mb-2">Supplier:</h3>
            ${supplier?.logoUrl ? `<img src="${supplier.logoUrl}" alt="Supplier Logo" class="max-h-16 object-contain mb-2">` : ''}
            <p class="font-medium">${supplier?.name || 'N/A'}</p>
            ${supplier?.nameAr ? `<p class="text-md">${supplier.nameAr}</p>` : ''}
            <p>${supplier?.address || 'N/A'}</p>
            <p>${supplier?.email || 'N/A'}</p>
            ${supplier?.vatNumber ? `<p>VAT: ${supplier.vatNumber}</p>` : ''}
          </div>
          <div>
            <div class="grid grid-cols-2 gap-4">
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

        ${organizationData.stampUrl ? `
          <div class="flex justify-end mt-8">
            <div class="text-center">
              <img src="${organizationData.stampUrl}" alt="Company Stamp" class="max-h-32 object-contain">
              <p class="text-sm text-gray-600 mt-2">Company Stamp</p>
            </div>
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
    // Find customer and supplier if available
    const customer = customers.find(c => c.name === invoice.clientName);
    const supplier = suppliers.find(s => s.id === invoice.supplierId);
    
    return `
      <div class="invoice-container" dir="rtl" style="font-family: Arial, sans-serif;">
        <div class="flex justify-between items-start mb-8 flex-row-reverse">
          <div class="text-right">
            <h1 class="text-3xl font-bold text-gray-800">فاتورة</h1>
            <p class="text-gray-600">رقم الفاتورة #${invoice.id.slice(-8)}</p>
          </div>
          <div class="text-left">
            ${organizationData.logoUrl ? `<img src="${organizationData.logoUrl}" alt="شعار الشركة" class="max-h-20 object-contain mr-auto mb-4">` : ''}
            <h2 class="text-xl font-semibold">${organizationData.nameAr || organizationData.name}</h2>
            ${organizationData.nameAr && organizationData.name ? `<p class="text-lg">${organizationData.name}</p>` : ''}
            <p>${organizationData.address}</p>
            <p>${organizationData.email}</p>
            <p>${organizationData.phone}</p>
            ${organizationData.vatNumber ? `<p>الرقم الضريبي: ${organizationData.vatNumber}</p>` : ''}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-8 mb-8">
          <div class="text-right">
            <h3 class="font-semibold mb-2">:إلى</h3>
            ${customer?.logoUrl ? `<img src="${customer.logoUrl}" alt="شعار العميل" class="max-h-16 object-contain ml-auto mb-2">` : ''}
            <p class="font-medium">${invoice.clientName}</p>
            ${customer?.nameAr ? `<p class="text-md">${customer.nameAr}</p>` : ''}
            <p>${invoice.clientAddress}</p>
            <p>${invoice.clientEmail}</p>
            ${invoice.clientVAT ? `<p>الرقم الضريبي: ${invoice.clientVAT}</p>` : ''}
          </div>
          <div class="text-left">
            <h3 class="font-semibold mb-2">:المورد</h3>
            ${supplier?.logoUrl ? `<img src="${supplier.logoUrl}" alt="شعار المورد" class="max-h-16 object-contain mb-2">` : ''}
            <p class="font-medium">${supplier?.nameAr || supplier?.name || 'غير متوفر'}</p>
            ${supplier?.nameAr && supplier?.name ? `<p class="text-md">${supplier.name}</p>` : ''}
            <p>${supplier?.address || 'غير متوفر'}</p>
            <p>${supplier?.email || 'غير متوفر'}</p>
            ${supplier?.vatNumber ? `<p>الرقم الضريبي: ${supplier.vatNumber}</p>` : ''}
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

        ${organizationData.stampUrl ? `
          <div class="flex justify-start mt-8">
            <div class="text-center">
              <img src="${organizationData.stampUrl}" alt="ختم الشركة" class="max-h-32 object-contain">
              <p class="text-sm text-gray-600 mt-2">ختم الشركة</p>
            </div>
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
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Invoice</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <InvoiceForm onSubmit={handleCreateInvoice} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.clientName}</TableCell>
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
                            <Printer className="h-4 w-4 mr-2" />
                            Print Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Invoice Details - {selectedInvoice?.id.slice(-8)}</DialogTitle>
                          </DialogHeader>
                          {selectedInvoice && organization && (
                            <div className="space-y-6">
                              {/* Invoice Header Information */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h3 className="font-semibold mb-2">Invoice Information</h3>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Status:</span>
                                      <Badge variant={
                                        selectedInvoice.status === 'paid' ? 'default' :
                                        selectedInvoice.status === 'overdue' ? 'destructive' :
                                        'secondary'
                                      } className="capitalize">
                                        {selectedInvoice.status}
                                      </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Invoice Date:</span>
                                      <span>{selectedInvoice.createdAt.toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Due Date:</span>
                                      <span>{selectedInvoice.dueDate?.toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-semibold mb-2">Client Information</h3>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Client:</span>
                                      <span>{selectedInvoice.clientName}</span>
                                    </div>
                                    {selectedInvoice.clientEmail && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Email:</span>
                                        <span>{selectedInvoice.clientEmail}</span>
                                      </div>
                                    )}
                                    {selectedInvoice.clientAddress && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Address:</span>
                                        <span>{selectedInvoice.clientAddress}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Invoice Items Table */}
                              <div>
                                <h3 className="font-semibold mb-3">Invoice Items</h3>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Item</TableHead>
                                      <TableHead className="text-right">Qty</TableHead>
                                      <TableHead className="text-right">Unit Price</TableHead>
                                      <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {selectedInvoice.items.map((item, index) => (
                                      <TableRow key={index}>
                                        <TableCell>
                                          <div>
                                            <p className="font-medium">{item.name}</p>
                                            {item.description && (
                                              <p className="text-sm text-gray-600">{item.description}</p>
                                            )}
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-medium">${item.total.toFixed(2)}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>

                              {/* Invoice Summary */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h3 className="font-semibold mb-3">Invoice Summary</h3>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span>Subtotal:</span>
                                      <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                                    </div>
                                    {selectedInvoice.taxAmount > 0 && (
                                      <div className="flex justify-between">
                                        <span>Tax ({selectedInvoice.taxRate}%):</span>
                                        <span>${selectedInvoice.taxAmount.toFixed(2)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                                      <span>Total:</span>
                                      <span>${selectedInvoice.total.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Payment Information Accordion */}
                                <div>
                                  <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="payments">
                                      <AccordionTrigger className="font-semibold">
                                        <div className="flex items-center gap-2">
                                          <CreditCard className="h-4 w-4" />
                                          Payments Made
                                        </div>
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        {payments[selectedInvoice.id] && payments[selectedInvoice.id].length > 0 ? (
                                          <div className="space-y-2">
                                            {payments[selectedInvoice.id].map((payment, index) => (
                                              <div key={index} className="flex justify-between text-sm border-b pb-2">
                                                <div>
                                                  <p className="font-medium">{payment.paymentMethod}</p>
                                                  <p className="text-gray-600">{payment.paymentDate.toLocaleDateString()}</p>
                                                  {payment.reference && (
                                                    <p className="text-gray-500 text-xs">Ref: {payment.reference}</p>
                                                  )}
                                                </div>
                                                <div className="text-right">
                                                  <p className="font-medium">${payment.amount.toFixed(2)}</p>
                                                  {payment.notes && (
                                                    <p className="text-gray-500 text-xs">{payment.notes}</p>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                            <div className="flex justify-between font-medium border-t pt-2">
                                              <span>Total Paid:</span>
                                              <span>${payments[selectedInvoice.id].reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</span>
                                            </div>
                                            {payments[selectedInvoice.id].reduce((sum, p) => sum + p.amount, 0) < selectedInvoice.total && (
                                              <div className="flex justify-between text-orange-600">
                                                <span>Remaining Balance:</span>
                                                <span>${(selectedInvoice.total - payments[selectedInvoice.id].reduce((sum, p) => sum + p.amount, 0)).toFixed(2)}</span>
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <p className="text-gray-500 text-sm">No payments recorded for this invoice</p>
                                        )}
                                      </AccordionContent>
                                    </AccordionItem>
                                  </Accordion>
                                </div>
                              </div>

                              {/* Print Preview Section */}
                              <div>
                                <div className="flex gap-4 mb-4 items-center">
                                  <Button
                                    variant={selectedInvoice.template === TemplateType.ENGLISH ? 'default' : 'outline'}
                                    onClick={() => {
                                      const updatedInvoice = { ...selectedInvoice, template: TemplateType.ENGLISH };
                                      setSelectedInvoice(updatedInvoice);
                                      updateDoc(doc(db, 'organizations', organizationId!, 'invoices', selectedInvoice.id), {
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
                                      updateDoc(doc(db, 'organizations', organizationId!, 'invoices', selectedInvoice.id), {
                                        template: TemplateType.ARABIC
                                      });
                                    }}
                                  >
                                    Arabic Template
                                  </Button>
                                  <Button variant="outline" onClick={() => handlePrintInvoice(selectedInvoice, organization)}>
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print Invoice
                                  </Button>
                                  <div className="flex items-center gap-2">
                                    <Label htmlFor="qr-toggle">Show ZATCA QR</Label>
                                    <Switch
                                      id="qr-toggle"
                                      checked={selectedInvoice.includeQR}
                                      onCheckedChange={(checked) => {
                                        const updatedInvoice = { ...selectedInvoice, includeQR: checked };
                                        setSelectedInvoice(updatedInvoice);
                                        updateDoc(doc(db, 'organizations', organizationId!, 'invoices', selectedInvoice.id), {
                                          includeQR: checked
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="border rounded-lg p-4 bg-white">
                                  {selectedInvoice.template === TemplateType.ENGLISH ? (
                                    <EnglishInvoice
                                      invoice={selectedInvoice}
                                      organization={organization}
                                      customer={customers.find(c => c.name === selectedInvoice.clientName)}
                                      supplier={suppliers.find(s => s.id === selectedInvoice.supplierId)}
                                    />
                                  ) : (
                                    <ArabicInvoice
                                      invoice={selectedInvoice}
                                      organization={organization}
                                      customer={customers.find(c => c.name === selectedInvoice.clientName)}
                                      supplier={suppliers.find(s => s.id === selectedInvoice.supplierId)}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      {invoice.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          loading={updatingStatus === invoice.id}
                          onClick={() => handleStatusChange(invoice.id, InvoiceStatus.SENT)}
                        >
                          Mark as Sent
                        </Button>
                      )}
                      {invoice.status === InvoiceStatus.SENT && (
                        <Button
                          variant="outline"
                          size="sm"
                          loading={updatingStatus === invoice.id}
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
                    <div className="flex flex-col items-center">
                      <Receipt className="h-12 w-12 mb-4 text-gray-400" />
                      <p>No invoices found. Create your first invoice to get started.</p>
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