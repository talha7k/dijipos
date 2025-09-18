'use client';

import { useState } from 'react';
import { useAtom } from 'jotai';
import { selectedOrganizationAtom } from '@/atoms';
import { useMemo } from 'react';
import { Invoice, Payment } from '@/types';
import { InvoiceList } from '@/components/invoices_quotes/InvoiceList';
import InvoiceForm from '@/components/invoices_quotes/InvoiceForm';
import { InvoiceDetails } from '@/components/invoices_quotes/InvoiceDetails';
import { InvoicePrintDialog } from '@/components/invoices_quotes/InvoicePrintDialog';
import { Button } from '@/components/ui/button';
import { Plus, Printer } from 'lucide-react';
import { useSeparatedTemplates } from '@/lib/hooks/useSeparatedTemplates';
import { useStoreSettings } from '@/lib/hooks/useStoreSettings';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInvoices } from '@/lib/hooks/useInvoices';
import { useCustomers } from '@/lib/hooks/useCustomers';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { useRealtimeCollection } from '@/lib/hooks/useRealtimeCollection';

export default function InvoicesPage() {
  const [selectedOrganization] = useAtom(selectedOrganizationAtom);
  const organizationId = selectedOrganization?.id;
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Use custom hooks for data fetching
  const { salesInvoices, purchaseInvoices, loading: invoicesLoading, updateExistingInvoice } = useInvoices();
  const invoices = [...salesInvoices, ...purchaseInvoices];
  const { customers, loading: customersLoading } = useCustomers();
  const { suppliers, loading: suppliersLoading } = useSuppliers();
  const { data: payments, loading: paymentsLoading } = useRealtimeCollection<Payment>('payments', organizationId || null);
  const { allInvoiceTemplates: invoiceTemplates, loading: templatesLoading } = useSeparatedTemplates();
  const { storeSettings } = useStoreSettings();
  const printerSettings = storeSettings?.printerSettings;
  const loading = invoicesLoading || customersLoading || suppliersLoading || paymentsLoading || templatesLoading;

  const groupedPayments = useMemo(() => {
    return payments.reduce((acc, payment) => {
      if (!acc[payment.invoiceId]) {
        acc[payment.invoiceId] = [];
      }
      acc[payment.invoiceId].push(payment);
      return acc;
    }, {} as { [invoiceId: string]: Payment[] });
  }, [payments]);

  const handleStatusChange = async (invoiceId: string, newStatus: Invoice['status']) => {
    try {
      await updateExistingInvoice(invoiceId, { status: newStatus });
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  };

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetails(true);
  };

  const handlePrint = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPrint(true);
  };

  const getFilteredInvoices = () => {
    switch (activeTab) {
      case 'draft':
        return invoices.filter(inv => inv.status === 'draft');
      case 'sent':
        return invoices.filter(inv => inv.status === 'sent');
      case 'paid':
        return invoices.filter(inv => inv.status === 'paid');
      case 'overdue':
        return invoices.filter(inv => inv.status === 'overdue');
      default:
        return invoices;
    }
  };



  const getPaymentsForInvoice = (invoiceId: string) => {
    return groupedPayments[invoiceId] || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All ({invoices.length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({invoices.filter(i => i.status === 'draft').length})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({invoices.filter(i => i.status === 'sent').length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({invoices.filter(i => i.status === 'paid').length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({invoices.filter(i => i.status === 'overdue').length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <InvoiceList
        invoices={getFilteredInvoices()}
        customers={customers}
        suppliers={suppliers}
        payments={groupedPayments}
        onInvoiceClick={handleInvoiceClick}
        onViewDetails={handleInvoiceClick}
        onStatusChange={handleStatusChange}
        onPrint={handlePrint}
        onEdit={(invoice) => {
          // Handle edit - could open edit form
          console.log('Edit invoice:', invoice.id);
        }}
        onDuplicate={(invoice) => {
          // Handle duplicate - could create copy
          console.log('Duplicate invoice:', invoice.id);
        }}
        onSend={(invoice) => {
          // Handle send - could send via email
          console.log('Send invoice:', invoice.id);
        }}
        onDownloadPDF={(invoice) => {
          // Handle PDF download
          console.log('Download PDF for invoice:', invoice.id);
        }}
      />

      {/* Create Invoice Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>
          <InvoiceForm
            onSubmit={(invoiceData) => {
              // Handle invoice creation here
              console.log('Creating invoice:', invoiceData);
              setShowForm(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Invoice Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePrint(selectedInvoice)}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          )}
          {selectedInvoice && (
            <InvoiceDetails
              invoice={selectedInvoice}
              organization={selectedOrganization}
              customer={selectedInvoice.type === 'sales' && selectedInvoice.clientName ? customers.find(c => c.name === selectedInvoice.clientName) : undefined}
              supplier={selectedInvoice.type === 'purchase' && selectedInvoice.supplierId ? suppliers.find(s => s.id === selectedInvoice.supplierId) : undefined}
              payments={getPaymentsForInvoice(selectedInvoice.id)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Print Dialog */}
      {selectedInvoice && (
        <InvoicePrintDialog
          invoice={selectedInvoice}
          organization={selectedOrganization}
          invoiceTemplates={invoiceTemplates}
          customer={selectedInvoice.type === 'sales' && selectedInvoice.clientName ? customers.find(c => c.name === selectedInvoice.clientName) : undefined}
          supplier={selectedInvoice.type === 'purchase' && selectedInvoice.supplierId ? suppliers.find(s => s.id === selectedInvoice.supplierId) : undefined}
          printerSettings={printerSettings}
          open={showPrint}
          onOpenChange={setShowPrint}
        >
          <div>Print Preview</div>
        </InvoicePrintDialog>
      )}
    </div>
  );
}
