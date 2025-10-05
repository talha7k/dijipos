'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Payment, Organization, InvoiceTemplate, Customer, Supplier, DocumentPrintSettings, SalesInvoice, PurchaseInvoice, InvoiceType, PaymentType } from '@/types';
import { Printer, Eye, Trash2, Mail, Edit } from 'lucide-react';

import { InvoicePrintDialog } from './InvoicePrintDialog';
import { EditCustomerDialog } from './EditCustomerDialog';

interface InvoiceActionsProps {
    invoice: SalesInvoice | PurchaseInvoice;
    payments: Payment[];
     onViewDetails: (invoice: SalesInvoice | PurchaseInvoice) => void;
     onStatusChange?: (invoiceId: string, status: (SalesInvoice | PurchaseInvoice)['status']) => void;
     onEdit?: (invoice: SalesInvoice | PurchaseInvoice) => void;
    onDuplicate?: (invoice: SalesInvoice | PurchaseInvoice) => void;
    onSend?: (invoice: SalesInvoice | PurchaseInvoice) => void;
    onEmail?: (invoice: SalesInvoice | PurchaseInvoice, templateId: string) => void;
    onDownloadPDF?: (invoice: SalesInvoice | PurchaseInvoice) => void;
    onDelete?: (invoice: SalesInvoice | PurchaseInvoice) => void;
    organization: Organization | null;
    invoiceTemplates: InvoiceTemplate[];
    customers: Customer[];
    suppliers: Supplier[];
    settings?: DocumentPrintSettings | null;
  }

export function InvoiceActions({
     invoice,
     payments,
     onViewDetails,
     onStatusChange,
     onEdit,
    onDuplicate,
    onSend,
    onEmail,
    onDownloadPDF,
    onDelete,
    organization,
    invoiceTemplates,
    customers,
    suppliers,
    settings,
    }: InvoiceActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(invoice);
  };

  const handleEditCustomer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(invoice);
  };

  const customer = invoice.type === InvoiceType.SALES ? customers.find(c => c.name === (invoice as SalesInvoice).clientName) : undefined;
  const supplier = invoice.type === 'purchase' ? suppliers.find(s => s.id === (invoice as PurchaseInvoice).supplierId) : undefined;

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = invoice.total - totalPaid;

  return (
    <>
      <div className="flex items-center gap-2">
         <Button
           variant="ghost"
           size="sm"
           onClick={handleEditCustomer}
           title="Edit Customer Info"
         >
           <Edit className="h-4 w-4" />
         </Button>

         <Button
           variant="ghost"
           size="sm"
           onClick={handleViewDetails}
           title="View Details"
         >
           <Eye className="h-4 w-4" />
         </Button>

         <InvoicePrintDialog
           invoice={invoice}
           organization={organization}
           invoiceTemplates={invoiceTemplates}
           customer={customer}
           supplier={supplier}
           settings={settings}
           previewMode={true}
           onEmail={onEmail}
         >
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => e.stopPropagation()}
              title="Send Email"
            >
              <Mail className="h-4 w-4" />
            </Button>
         </InvoicePrintDialog>

         <InvoicePrintDialog
           invoice={invoice}
           organization={organization}
           invoiceTemplates={invoiceTemplates}
           customer={customer}
           supplier={supplier}
           settings={settings}
         >
           <Button
             variant="ghost"
             size="sm"
             onClick={(e) => e.stopPropagation()}
             title="Print Preview"
           >
             <Printer className="h-4 w-4" />
           </Button>
         </InvoicePrintDialog>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          title="Delete Invoice"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <EditCustomerDialog
        invoice={invoice}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onUpdate={(updatedInvoice) => {
          // For now, we'll just log the update. In a real implementation,
          // this would call an update function passed from the parent
          console.log('Updated invoice:', updatedInvoice);
          // You might want to call onEdit(updatedInvoice) or a specific update function
        }}
      />
    </>
  );
}