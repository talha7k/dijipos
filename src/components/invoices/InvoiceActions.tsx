'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Invoice, Payment, InvoiceStatus } from '@/types';
import { Printer, Eye, MoreHorizontal } from 'lucide-react';
import { InvoiceActionsDialog } from './InvoiceActionsDialog';

interface InvoiceActionsProps {
  invoice: Invoice;
  payments: Payment[];
  onPrint: (invoice: Invoice) => void;
  onViewDetails: (invoice: Invoice) => void;
  onStatusChange: (invoiceId: string, status: Invoice['status']) => void;
  onEdit?: (invoice: Invoice) => void;
  onDuplicate?: (invoice: Invoice) => void;
  onSend?: (invoice: Invoice) => void;
  onDownloadPDF?: (invoice: Invoice) => void;
}

export function InvoiceActions({
  invoice,
  payments,
  onPrint,
  onViewDetails,
  onStatusChange,
  onEdit,
  onDuplicate,
  onSend,
  onDownloadPDF
}: InvoiceActionsProps) {
  const [showActionsDialog, setShowActionsDialog] = useState(false);

  const handlePrintPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPrint(invoice);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(invoice);
  };

  const handleStatusChange = (e: React.MouseEvent, newStatus: Invoice['status']) => {
    e.stopPropagation();
    onStatusChange(invoice.id, newStatus);
  };

  const handleActionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActionsDialog(true);
  };

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

        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrintPreview}
          title="Print Preview"
        >
          <Printer className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewDetails}
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </Button>

        {invoice.status === 'draft' && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handleStatusChange(e, InvoiceStatus.SENT)}
          >
            Send
          </Button>
        )}

        {invoice.status === 'sent' && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handleStatusChange(e, InvoiceStatus.PAID)}
          >
            Mark Paid
          </Button>
        )}

        {invoice.status === 'overdue' && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handleStatusChange(e, InvoiceStatus.PAID)}
          >
            Mark Paid
          </Button>
        )}
      </div>

      <InvoiceActionsDialog
        invoice={invoice}
        payments={payments}
        open={showActionsDialog}
        onOpenChange={setShowActionsDialog}
        onViewDetails={() => onViewDetails(invoice)}
        onPrint={() => onPrint(invoice)}
        onEdit={() => onEdit?.(invoice)}
        onDuplicate={() => onDuplicate?.(invoice)}
        onSend={() => onSend?.(invoice)}
        onMarkAsPaid={() => onStatusChange(invoice.id, InvoiceStatus.PAID)}
        onMarkAsSent={() => onStatusChange(invoice.id, InvoiceStatus.SENT)}
        onDownloadPDF={() => onDownloadPDF?.(invoice)}
      />
    </>
  );
}