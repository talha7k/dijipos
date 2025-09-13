'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, doc, getDoc, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Invoice, Organization, Customer, Supplier, Payment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { InvoiceList } from './InvoiceList';
import { InvoiceDetails } from './InvoiceDetails';
import { InvoicePrint } from './InvoicePrint';
import InvoiceForm from '@/components/InvoiceForm';
import { Receipt } from 'lucide-react';

export function InvoicesManager() {
  const { user, organizationId } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [payments, setPayments] = useState<{ [invoiceId: string]: Payment[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    if (!organizationId) return;

    // Fetch organization data
    const fetchOrganization = async () => {
      const orgDoc = await getDoc(doc(db, 'organizations', organizationId));
      if (orgDoc.exists()) {
        setOrganization({
          id: orgDoc.id,
          ...orgDoc.data(),
          createdAt: orgDoc.data().createdAt?.toDate(),
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

  const handleCreateInvoice = async (invoiceData: Omit<Invoice, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) return;

    const cleanedData = {
      ...invoiceData,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await addDoc(collection(db, 'organizations', organizationId, 'invoices'), cleanedData);
    setFormOpen(false);
  };

  const handleStatusChange = (invoiceId: string, newStatus: Invoice['status']) => {
    // The status change is already handled by Firestore real-time listener
    // This function is just a placeholder for the callback
    console.log('Invoice status changed:', invoiceId, newStatus);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailsOpen(true);
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    if (organization) {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const customer = customers.find(c => c.name === invoice.clientName);
      const supplier = suppliers.find(s => s.id === invoice.supplierId);

      const invoiceContent = invoice.template === 'arabic' 
        ? createArabicInvoiceHTML(invoice, organization, customer, supplier)
        : createEnglishInvoiceHTML(invoice, organization, customer, supplier);

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
      
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    }
  };

  const createEnglishInvoiceHTML = (invoice: Invoice, organization: Organization, customer?: Customer, supplier?: Supplier) => {
    return `
      <div class="invoice-container">
        <div class="flex justify-between items-start mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">INVOICE</h1>
            <p class="text-gray-600">Invoice #${invoice.id.slice(-8)}</p>
          </div>
          <div class="text-right">
            ${organization.logoUrl ? `<img src="${organization.logoUrl}" alt="Company Logo" class="max-h-20 object-contain ml-auto mb-4">` : ''}
            <h2 class="text-xl font-semibold">${organization.name}</h2>
            ${organization.nameAr ? `<p class="text-lg">${organization.nameAr}</p>` : ''}
            <p>${organization.address}</p>
            <p>${organization.email}</p>
            <p>${organization.phone}</p>
            ${organization.vatNumber ? `<p>VAT: ${organization.vatNumber}</p>` : ''}
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

        ${organization.stampUrl ? `
          <div class="flex justify-end mt-8">
            <div class="text-center">
              <img src="${organization.stampUrl}" alt="Company Stamp" class="max-h-32 object-contain">
              <p class="text-sm text-gray-600 mt-2">Company Stamp</p>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  };

  const createArabicInvoiceHTML = (invoice: Invoice, organization: Organization, customer?: Customer, supplier?: Supplier) => {
    return `
      <div class="invoice-container" dir="rtl" style="font-family: Arial, sans-serif;">
        <div class="flex justify-between items-start mb-8 flex-row-reverse">
          <div class="text-right">
            <h1 class="text-3xl font-bold text-gray-800">فاتورة</h1>
            <p class="text-gray-600">رقم الفاتورة #${invoice.id.slice(-8)}</p>
          </div>
          <div class="text-left">
            ${organization.logoUrl ? `<img src="${organization.logoUrl}" alt="شعار الشركة" class="max-h-20 object-contain mr-auto mb-4">` : ''}
            <h2 class="text-xl font-semibold">${organization.nameAr || organization.name}</h2>
            ${organization.nameAr && organization.name ? `<p class="text-lg">${organization.name}</p>` : ''}
            <p>${organization.address}</p>
            <p>${organization.email}</p>
            <p>${organization.phone}</p>
            ${organization.vatNumber ? `<p>الرقم الضريبي: ${organization.vatNumber}</p>` : ''}
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

        ${organization.stampUrl ? `
          <div class="flex justify-start mt-8">
            <div class="text-center">
              <img src="${organization.stampUrl}" alt="ختم الشركة" class="max-h-32 object-contain">
              <p class="text-sm text-gray-600 mt-2">ختم الشركة</p>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Receipt className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <InvoiceForm
            open={formOpen}
            onOpenChange={setFormOpen}
            onSubmit={handleCreateInvoice}
          />
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>          <InvoiceList
            invoices={invoices}
            loading={loading}
            onViewInvoice={handleViewInvoice}
            onPrintInvoice={handlePrintInvoice}
            onStatusChange={handleStatusChange}
          />
        </CardContent>
      </Card>

      <InvoiceDetails
        invoice={selectedInvoice}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        organization={organization}
        customers={customers}
        suppliers={suppliers}
        payments={payments}
      />
    </div>
  );
}