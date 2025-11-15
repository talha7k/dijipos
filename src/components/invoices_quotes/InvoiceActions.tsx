'use client';

import { Button } from '@/components/ui/button';
import { Organization, InvoiceTemplate, Customer, Supplier, DocumentPrintSettings, SalesInvoice, PurchaseInvoice, InvoiceType, Payment } from '@/types';
import { Printer, Eye, Trash2, Mail } from 'lucide-react';

import { InvoicePrintDialog } from './InvoicePrintDialog';

interface InvoiceActionsProps {
    invoice: SalesInvoice | PurchaseInvoice;
    payments: Payment[];
    onViewDetails: (invoice: SalesInvoice | PurchaseInvoice) => void;
    onEmail?: (invoice: SalesInvoice | PurchaseInvoice, templateId: string) => void;
    onDelete?: (invoice: SalesInvoice | PurchaseInvoice) => void;
    organization: Organization | null;
    invoiceTemplates: InvoiceTemplate[];
    customers: Customer[];
    suppliers: Supplier[];
    settings?: DocumentPrintSettings | null;
  }

export function InvoiceActions({
     invoice,
     onViewDetails,
     onEmail,
     onDelete,
     organization,
     invoiceTemplates,
     customers,
     suppliers,
     settings,
    }: InvoiceActionsProps) {
  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(invoice);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(invoice);
  };

  const customer = invoice.type === InvoiceType.SALES ? customers.find(c => c.name === (invoice as SalesInvoice).clientName) : undefined;
  const supplier = invoice.type === 'purchase' ? suppliers.find(s => s.id === (invoice as PurchaseInvoice).supplierId) : undefined;

  return (
    <>
      <div className="flex items-center gap-2">
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
    </>
  );
}