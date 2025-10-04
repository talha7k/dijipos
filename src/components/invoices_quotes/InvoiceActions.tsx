'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Invoice, Payment, Organization, InvoiceTemplate, Customer, Supplier, DocumentPrintSettings, SalesInvoice } from '@/types';
import { Printer, Eye, MoreHorizontal, Trash2, Mail, Edit } from 'lucide-react';
import { InvoiceActionsDialog } from './InvoiceActionsDialog';
import { InvoicePrintDialog } from './InvoicePrintDialog';

interface InvoiceActionsProps {
   invoice: Invoice;
   payments: Payment[];
    onViewDetails: (invoice: Invoice) => void;
    onEdit?: (invoice: Invoice) => void;
   onDuplicate?: (invoice: Invoice) => void;
   onSend?: (invoice: Invoice) => void;
   onEmail?: (invoice: Invoice, templateId: string) => void;
   onDownloadPDF?: (invoice: Invoice) => void;
   onDelete?: (invoice: Invoice) => void;
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
  const [showActionsDialog, setShowActionsDialog] = useState(false);

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(invoice);
  };



  const handleActionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActionsDialog(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(invoice);
  };

  const customer = invoice.type === 'sales' ? customers.find(c => c.id === (invoice as SalesInvoice).clientName) : undefined;
  const supplier = invoice.type === 'purchase' ? suppliers.find(s => s.id === invoice.supplierId) : undefined;

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleActionsClick}
          title="More Actions"
        >
          <MoreHorizontal className="h-4 w-4 mr-1" />
          Actions
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
            title="Preview Invoice"
          >
            <Eye className="h-4 w-4" />
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
          onClick={handleViewDetails}
          title="View Details"
        >
          <Edit className="h-4 w-4" />
        </Button>

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

      <InvoiceActionsDialog
        invoice={invoice}
        payments={payments}
        open={showActionsDialog}
        onOpenChange={setShowActionsDialog}
        onViewDetails={() => onViewDetails(invoice)}
        onEdit={() => onEdit?.(invoice)}
        onDuplicate={() => onDuplicate?.(invoice)}
        onSend={() => onSend?.(invoice)}

        onDownloadPDF={() => onDownloadPDF?.(invoice)}
      />
    </>
  );
}