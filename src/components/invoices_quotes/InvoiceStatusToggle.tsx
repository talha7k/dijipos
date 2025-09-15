'use client';

import { Button } from '@/components/ui/button';
import { Invoice, InvoiceStatus } from '@/types';

interface InvoiceStatusToggleProps {
  invoice: Invoice;
  onStatusChange: (invoiceId: string, status: Invoice['status']) => void;
  updatingStatus: string | null;
}

export function InvoiceStatusToggle({ 
  invoice, 
  onStatusChange, 
  updatingStatus 
}: InvoiceStatusToggleProps) {
  const getNextStatus = (currentStatus: Invoice['status']): Invoice['status'] | null => {
    switch (currentStatus) {
      case InvoiceStatus.DRAFT:
        return InvoiceStatus.SENT;
      case InvoiceStatus.SENT:
        return InvoiceStatus.PAID;
      case InvoiceStatus.OVERDUE:
        return InvoiceStatus.PAID;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: Invoice['status']) => {
    const labels: Record<Invoice['status'], { current: string; next: string }> = {
      draft: { current: 'Draft', next: 'Send' },
      sent: { current: 'Sent', next: 'Mark Paid' },
      paid: { current: 'Paid', next: '' },
      overdue: { current: 'Overdue', next: 'Mark Paid' },
      cancelled: { current: 'Cancelled', next: '' },
      received: { current: 'Received', next: 'Mark Paid' },
      partially_paid: { current: 'Partially Paid', next: 'Mark Paid' },
    };
    return labels[status];
  };

  const nextStatus = getNextStatus(invoice.status);
  
  if (!nextStatus) {
    return (
      <span className="text-sm font-medium text-green-600">
        {invoice.status}
      </span>
    );
  }

  const statusLabel = getStatusLabel(invoice.status);

  return (
    <Button
      variant="outline"
      size="sm"
      loading={updatingStatus === invoice.id}
      onClick={(e) => {
        e.stopPropagation();
        onStatusChange(invoice.id, nextStatus);
      }}
    >
      {statusLabel.next}
    </Button>
  );
}