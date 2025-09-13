'use client';

import { Button } from '@/components/ui/button';
import { Invoice } from '@/types';
import { Printer, Eye } from 'lucide-react';

interface InvoiceActionsProps {
  invoice: Invoice;
  onPrint: (invoice: Invoice) => void;
  onStatusChange: (invoiceId: string, status: Invoice['status']) => void;
}

export function InvoiceActions({ invoice, onPrint, onStatusChange }: InvoiceActionsProps) {
  const handlePrintPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPrint(invoice);
  };

  const handleStatusChange = (e: React.MouseEvent, newStatus: Invoice['status']) => {
    e.stopPropagation();
    onStatusChange(invoice.id, newStatus);
  };

  return (
    <div className="flex items-center gap-2">
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
        onClick={(e) => {
          e.stopPropagation();
          // This would open the details view
        }}
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </Button>

      {invoice.status === 'draft' && (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => handleStatusChange(e, 'sent')}
        >
          Send
        </Button>
      )}
      
      {invoice.status === 'sent' && (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => handleStatusChange(e, 'paid')}
        >
          Mark Paid
        </Button>
      )}
      
      {invoice.status === 'overdue' && (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => handleStatusChange(e, 'paid')}
        >
          Mark Paid
        </Button>
      )}
    </div>
  );
}