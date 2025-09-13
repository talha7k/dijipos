'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, doc, getDoc, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Invoice, Organization, Customer, Supplier, Payment } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import InvoiceForm from '@/components/InvoiceForm';
import { InvoiceTable } from '@/components/invoices/InvoiceTable';
import { InvoiceDetailsDialog } from '@/components/invoices/InvoiceDetailsDialog';
import { PrintPreviewDialog } from '@/components/invoices/PrintPreviewDialog';

function InvoicesContent() {
  const { organizationId } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [payments, setPayments] = useState<{ [invoiceId: string]: Payment[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [printPreviewInvoice, setPrintPreviewInvoice] = useState<Invoice | null>(null);
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

    // Clean data to remove undefined values that Firebase doesn't accept
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

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handlePrintPreview = (invoice: Invoice) => {
    setPrintPreviewInvoice(invoice);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
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
          <InvoiceTable
            invoices={invoices}
            onInvoiceClick={handleInvoiceClick}
            onPrintPreview={handlePrintPreview}
            onStatusChange={handleStatusChange}
            updatingStatus={updatingStatus}
          />
        </CardContent>
      </Card>

      {/* Invoice Details Dialog */}
      <InvoiceDetailsDialog
        invoice={selectedInvoice}
        organization={organization}
        customers={customers}
        suppliers={suppliers}
        payments={payments}
        open={!!selectedInvoice}
        onOpenChange={(open) => !open && setSelectedInvoice(null)}
      />

      {/* Print Preview Dialog */}
      <PrintPreviewDialog
        invoice={printPreviewInvoice}
        organization={organization}
        customers={customers}
        suppliers={suppliers}
        open={!!printPreviewInvoice}
        onOpenChange={(open) => !open && setPrintPreviewInvoice(null)}
        organizationId={organizationId!}
      />
    </div>
  );
}

export default function InvoicesPage() {
  return <InvoicesContent />;
}